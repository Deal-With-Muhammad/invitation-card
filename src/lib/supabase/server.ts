import "server-only";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { cache } from "react";

import { readSession } from "@/lib/server/session";

// The database, server-side only. db() is the service-role client: it bypasses row-level
// security, so it's only ever used in route handlers, server components and server actions.
//
// Sign-in is our own (lib/server/session.ts, emails through Cloudflare). Supabase Auth only
// keeps the list of accounts (auth.users, which invites.owner_id points at), read and written
// here with the service role. It never sends an email or holds a session.

// Values pasted into a host's settings often pick up quotes or a trailing
// space or newline, which Supabase rejects as an invalid key.
export const clean = (v: string | undefined) => (v ?? "").trim().replace(/^(["'])(.*)\1$/, "$2").trim();

const url = () => clean(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/+$/, "");
const serviceKey = () => clean(process.env.SUPABASE_SERVICE_ROLE) || clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

/** Is the database (service role) configured? */
export const hasDb = () => Boolean(url() && serviceKey());
/** Are accounts (sign-in with an email code) configured? */
export const hasAuth = hasDb;

let service: SupabaseClient | undefined;

export function db() {
  service ??= createClient(url(), serviceKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return service;
}

/** The account with exactly this email, or null. */
async function findAccount(email: string): Promise<User | null> {
  const res = await fetch(`${url()}/auth/v1/admin/users?per_page=50&filter=${encodeURIComponent(email)}`, {
    headers: { apikey: serviceKey(), Authorization: `Bearer ${serviceKey()}` },
  });
  if (!res.ok) throw new Error(`account lookup failed: ${res.status}`);
  const { users } = (await res.json()) as { users?: User[] };
  return users?.find((u) => u.email?.toLowerCase() === email) ?? null;
}

/**
 * The account for this (lower-case) email, made the first time someone signs in with it.
 * Records the sign-in time in app_metadata, which the admin Users list shows.
 */
export async function accountFor(email: string): Promise<User> {
  let user = await findAccount(email);
  if (!user) {
    const { data, error } = await db().auth.admin.createUser({ email, email_confirm: true });
    user = data.user ?? (await findAccount(email)); // Someone else may have just made it.
    if (!user) throw new Error(error?.message ?? "Couldn't make the account");
  }
  const app_metadata = { ...user.app_metadata, last_sign_in_at: new Date().toISOString() };
  await db().auth.admin.updateUserById(user.id, { app_metadata }).catch(() => {});
  return { ...user, app_metadata };
}

/**
 * The signed-in user: the session cookie checked against the account list (so a deleted
 * account is signed out). last_sign_in_at is when this browser signed in with a code.
 */
export const currentUser = cache(async (): Promise<User | null> => {
  if (!hasAuth()) return null;
  const s = await readSession();
  if (!s) return null;
  const { data } = await db().auth.admin.getUserById(s.u);
  if (!data.user || data.user.email?.toLowerCase() !== s.e) return null;
  return { ...data.user, last_sign_in_at: new Date(s.t).toISOString() };
});

const admins = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email: string | null | undefined) => Boolean(email && admins().includes(email.toLowerCase()));
