import "server-only";

import { db, hasDb } from "@/lib/supabase/server";

/** A same-site path to go to after signing in; anything else falls back to /my. */
export function safeNext(next: unknown) {
  return typeof next === "string" && /^\/(?![/\\])/.test(next) ? next : "/my";
}

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

/** Records an admin sign-in or action. Never throws. */
export async function logAdmin(email: string, action: string, detail?: string, ip?: string) {
  if (!hasDb()) return;
  try {
    await db().from("admin_log").insert({ email, action, detail: detail ?? null, ip: ip ?? null });
  } catch {}
}
