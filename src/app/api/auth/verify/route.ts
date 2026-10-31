import { NextResponse } from "next/server";

import { EMAIL_RE, logAdmin, safeNext } from "@/lib/server/auth-helpers";
import { clientIp } from "@/lib/server/store";
import { auth, hasAuth, isAdminEmail } from "@/lib/supabase/server";

// Step 2 of signing in: check the emailed code and start the session (cookies).
export async function POST(req: Request) {
  if (!hasAuth()) return NextResponse.json({ error: "Accounts aren't switched on yet." }, { status: 503 });
  let body: { email?: unknown; code?: unknown; next?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code.replace(/\s/g, "") : "";
  if (!EMAIL_RE.test(email) || !/^\d{6,10}$/.test(code)) return NextResponse.json({ error: "Enter the code from the email." }, { status: 400 });

  const { data, error } = await (await auth()).auth.verifyOtp({ email, token: code, type: "email" });
  if (error || !data.user) return NextResponse.json({ error: "That code isn't right or has expired. Ask for a new one." }, { status: 400 });
  if (isAdminEmail(data.user.email)) await logAdmin(data.user.email!, "sign-in", "email code", clientIp(req.headers));
  return NextResponse.json({ ok: true, next: safeNext(body.next) });
}
