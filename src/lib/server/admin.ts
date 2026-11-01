import "server-only";

import type { User } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { clientIp } from "@/lib/server/store";
import { currentUser, hasAuth, isAdminEmail } from "@/lib/supabase/server";

/** An admin session has to have signed in with an email code within this long. */
export const ADMIN_SESSION_HOURS = 12;

/**
 * Lets the request through only for an admin email that signed in with a code
 * recently. Not signed in → the sign-in page. Signed in as anyone else → 404,
 * so the admin area doesn't reveal itself.
 */
export async function requireAdmin(): Promise<User> {
  if (!hasAuth()) notFound();
  const user = await currentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isAdminEmail(user.email) || !user.email_confirmed_at) notFound();
  const signedIn = Date.parse(user.last_sign_in_at ?? "");
  if (!Number.isFinite(signedIn) || Date.now() - signedIn > ADMIN_SESSION_HOURS * 3600_000) redirect("/login?next=/admin&reauth=1");
  return user;
}

export async function requestIp() {
  return clientIp(await headers());
}

/** Is this request from a signed-in admin? (Admins can open full invitations, and their opens aren't counted.) */
export async function isAdminRequest() {
  const user = await currentUser().catch(() => null);
  return Boolean(user?.email_confirmed_at && isAdminEmail(user.email));
}
