import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Two ways into Supabase, both server-side only:
// - db(): the service-role client. It bypasses row-level security, so it's only
//   ever used in route handlers, server components and server actions.
// - auth(): the signed-in visitor's session, read from (and refreshed into)
//   cookies, using the public key. Used for sign-in and "who is this?".

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const publicKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/** Is the database (service role) configured? */
export const hasDb = () => Boolean(url() && serviceKey());
/** Are accounts (sign-in with an email code) configured? */
export const hasAuth = () => Boolean(url() && publicKey() && serviceKey());

let service: SupabaseClient | undefined;

export function db() {
  service ??= createClient(url(), serviceKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return service;
}

export async function auth() {
  const jar = await cookies();
  return createServerClient(url(), publicKey(), {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) jar.set(name, value, options);
        } catch {
          // Server components can't set cookies; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** The signed-in user, checked with Supabase (not just read from the cookie). */
export async function currentUser(): Promise<User | null> {
  if (!hasAuth()) return null;
  const jar = await cookies();
  if (!jar.getAll().some((c) => c.name.startsWith("sb-"))) return null;
  const { data } = await (await auth()).auth.getUser();
  return data.user ?? null;
}

const admins = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email: string | null | undefined) => Boolean(email && admins().includes(email.toLowerCase()));
