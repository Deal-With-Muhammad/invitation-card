import { NextResponse } from "next/server";

import { EMAIL_RE, safeNext } from "@/lib/server/auth-helpers";
import { clientIp, getStore } from "@/lib/server/store";
import { siteOrigin } from "@/lib/server/visitor";
import { MailLimitError, sendCode } from "@/lib/server/mail";
import { issueCode } from "@/lib/server/session";
import { hasAuth } from "@/lib/supabase/server";

// Step 1 of signing in: email a 6-digit code (and a sign-in link) to this address.
// New addresses get an account the first time they sign in.
export async function POST(req: Request) {
  const store = getStore();
  if (!hasAuth() || !store) return NextResponse.json({ error: "Accounts aren't switched on yet." }, { status: 503 });
  let body: { email?: unknown; next?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });

  const ip = clientIp(req.headers);
  if ((await store.hit(`inv:rl:otp:ip:${ip}`, 600)) > 8 || (await store.hit(`inv:rl:otp:email:${email}`, 600)) > 4)
    return NextResponse.json({ error: "Too many codes asked for. Wait a few minutes and try again." }, { status: 429 });

  const next = safeNext(body.next);
  try {
    const { code, link } = await issueCode(email, next);
    await sendCode(email, code, `${siteOrigin(req)}/auth/confirm?${link}`);
  } catch (e) {
    // Shows in the Worker's logs (Cloudflare → Workers → dwm-invite → Logs).
    console.error("sign-in email failed", e);
    const limited = e instanceof MailLimitError;
    return NextResponse.json(
      { error: limited ? "Too many emails sent just now. Wait a minute and try again." : "Couldn't send the code. Please try again." },
      { status: limited ? 429 : 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
