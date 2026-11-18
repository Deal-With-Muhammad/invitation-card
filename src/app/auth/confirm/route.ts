import { NextResponse } from "next/server";

import { logAdmin, safeNext } from "@/lib/server/auth-helpers";
import { checkLink, startSession } from "@/lib/server/session";
import { clientIp, getStore } from "@/lib/server/store";
import { siteOrigin } from "@/lib/server/visitor";
import { accountFor, hasAuth, isAdminEmail } from "@/lib/supabase/server";

// Where the sign-in link in the email lands. Works on any device, once, for 10 minutes.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const home = siteOrigin(req);
  const next = safeNext(url.searchParams.get("next"));
  const fail = NextResponse.redirect(new URL(`/login?error=link&next=${encodeURIComponent(next)}`, home));
  const store = getStore();
  if (!hasAuth() || !store) return fail;

  const link = checkLink(url.searchParams.get("t") ?? "");
  if (!link || (await store.hit(`inv:used:link:${link.nonce}`, 900)) > 1) return fail;
  const user = await accountFor(link.email);
  await startSession(user.id, link.email);
  if (isAdminEmail(link.email)) await logAdmin(link.email, "sign-in", "email link", clientIp(req.headers));
  return NextResponse.redirect(new URL(next, home));
}
