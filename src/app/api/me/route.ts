import { NextResponse } from "next/server";

import { getStore } from "@/lib/server/store";
import { currentUser, hasAuth, isAdminEmail } from "@/lib/supabase/server";

// Who is signed in, and (with ?invites=1) the invitations saved to their account.
export async function GET(req: Request) {
  if (!hasAuth()) return NextResponse.json({ accounts: false, user: null });
  const user = await currentUser();
  if (!user) return NextResponse.json({ accounts: true, user: null }, { headers: { "cache-control": "no-store" } });
  const withInvites = new URL(req.url).searchParams.get("invites") === "1";
  const invites = withInvites ? ((await getStore()?.listByOwner(user.id)) ?? []) : undefined;
  return NextResponse.json(
    { accounts: true, user: { email: user.email, admin: isAdminEmail(user.email) }, invites },
    { headers: { "cache-control": "no-store" } },
  );
}
