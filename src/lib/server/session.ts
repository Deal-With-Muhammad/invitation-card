import "server-only";

import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { clean } from "@/lib/supabase/server";

// Our own email-code sign-in (Supabase Auth no longer sends emails or runs sessions; it only
// keeps the list of accounts). Nothing here is stored: the code and the session are signed
// with a key derived from SUPABASE_SERVICE_ROLE, which only the server knows.
//
// - Asking for a code sets a short cookie holding the email, expiry and a signature over
//   the 6-digit code, so only this browser, with the code from the email, can finish.
// - The emailed link carries its own signature, so it works on any device.
// - Both are single-use (store.hit on their nonce) and the code has an attempts limit.

export const CODE_MINUTES = 10;
const SESSION_DAYS = 30;
const CODE_COOKIE = "inv_code";
export const SESSION_COOKIE = "inv_session";

let key: Buffer | undefined;
function secret() {
  const base = clean(process.env.SUPABASE_SERVICE_ROLE) || clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!base) throw new Error("SUPABASE_SERVICE_ROLE is not set");
  key ??= createHmac("sha256", base).update("dwm-invite sign-in v1").digest();
  return key;
}

const sign = (text: string) => createHmac("sha256", secret()).update(text).digest("base64url");

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
function unb64<T>(s: string): T | null {
  try {
    return JSON.parse(Buffer.from(s, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

/** A new 6-digit code for this email, remembered (signed) in a cookie, plus the sign-in link's query string. */
export async function issueCode(email: string, next: string) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const exp = Date.now() + CODE_MINUTES * 60_000;
  const nonce = randomBytes(12).toString("base64url");
  const payload = b64({ e: email, x: exp, n: nonce });
  (await cookies()).set(CODE_COOKIE, `${payload}.${sign(`code|${payload}|${code}`)}`, cookieOptions(CODE_MINUTES * 60));
  const link = new URLSearchParams({ t: `${payload}.${sign(`link|${payload}`)}`, next });
  return { code, link: link.toString() };
}

type Pending = { e: string; x: number; n: string };

/** Checks a typed code against this browser's cookie. Returns the nonce (for single use) or null. */
export async function checkCode(email: string, code: string) {
  const jar = await cookies();
  const [payload, sig] = (jar.get(CODE_COOKIE)?.value ?? "").split(".");
  const p = payload && sig ? unb64<Pending>(payload) : null;
  if (!p || p.e !== email || p.x < Date.now() || !same(sig, sign(`code|${payload}|${code}`))) return null;
  return p.n;
}

/** Checks the token from the emailed link. Returns its email and nonce, or null. */
export function checkLink(token: string) {
  const [payload, sig] = token.split(".");
  const p = payload && sig ? unb64<Pending>(payload) : null;
  if (!p || p.x < Date.now() || !same(sig, sign(`link|${payload}`))) return null;
  return { email: p.e, nonce: p.n };
}

type Session = { u: string; e: string; t: number };

/** Signs this browser in as the account (id + email). `t` is when, used by the admin 12-hour rule. */
export async function startSession(id: string, email: string) {
  const jar = await cookies();
  const payload = b64({ u: id, e: email, t: Date.now() } satisfies Session);
  jar.set(SESSION_COOKIE, `${payload}.${sign(`session|${payload}`)}`, cookieOptions(SESSION_DAYS * 86_400));
  jar.delete(CODE_COOKIE);
}

/** The signed-in account from the cookie, or null. */
export async function readSession(): Promise<Session | null> {
  const [payload, sig] = ((await cookies()).get(SESSION_COOKIE)?.value ?? "").split(".");
  if (!payload || !sig || !same(sig, sign(`session|${payload}`))) return null;
  const s = unb64<Session>(payload);
  if (!s || typeof s.u !== "string" || typeof s.e !== "string" || !Number.isFinite(s.t)) return null;
  if (Date.now() - s.t > SESSION_DAYS * 86_400_000) return null;
  return s;
}

/** Signs out: our cookie, plus any Supabase cookies left from before the switch. */
export async function endSession() {
  const jar = await cookies();
  for (const c of jar.getAll()) if (c.name === SESSION_COOKIE || c.name === CODE_COOKIE || c.name.startsWith("sb-")) jar.delete(c.name);
}
