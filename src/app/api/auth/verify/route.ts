import { NextResponse } from "next/server";

import { EMAIL_RE, logAdmin, safeNext } from "@/lib/server/auth-helpers";
import { checkCode, startSession } from "@/lib/server/session";
import { clientIp, getStore } from "@/lib/server/store";
import { accountFor, hasAuth, isAdminEmail } from "@/lib/supabase/server";

// Step 2 of signing in: check the emailed code and start the session (a signed cookie).
export async function POST(req: Request) {
  const store = getStore();
  if (!hasAuth() || !store) return NextResponse.json({ error: "Accounts aren't switched on yet." }, { status: 503 });
  let body: { email?: unknown; code?: unknown; next?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code.replace(/\s/g, "") : "";
  if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter the 6-digit code from the email." }, { status: 400 });

  // A few tries per email, so a code can't be guessed.
  if ((await store.hit(`inv:rl:verify:${email}`, 600)) > 6)
    return NextResponse.json({ error: "Too many tries. Ask for a new code in a few minutes." }, { status: 429 });
  const nonce = await checkCode(email, code);
  if (!nonce || (await store.hit(`inv:used:code:${nonce}`, 900)) > 1)
    return NextResponse.json({ error: "That code isn't right or has expired. Ask for a new one." }, { status: 400 });

  const user = await accountFor(email);
  await startSession(user.id, email);
  if (isAdminEmail(email)) await logAdmin(email, "sign-in", "email code", clientIp(req.headers));
  return NextResponse.json({ ok: true, next: safeNext(body.next) });
}
