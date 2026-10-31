import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { logAdmin, safeNext } from "@/lib/server/auth-helpers";
import { clientIp } from "@/lib/server/store";
import { auth, hasAuth, isAdminEmail } from "@/lib/supabase/server";

// Where the sign-in link in the email lands. Supports both the token-hash link
// and the PKCE code that Supabase's default email template produces.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get("next"));
  const fail = NextResponse.redirect(new URL(`/login?error=link&next=${encodeURIComponent(next)}`, url.origin));
  if (!hasAuth()) return fail;

  const supabase = await auth();
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const { data, error } = tokenHash && type
    ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    : code
      ? await supabase.auth.exchangeCodeForSession(code)
      : { data: { user: null }, error: new Error("missing") };
  if (error || !data.user) return fail;
  if (isAdminEmail(data.user.email)) await logAdmin(data.user.email!, "sign-in", "email link", clientIp(req.headers));
  return NextResponse.redirect(new URL(next, url.origin));
}
