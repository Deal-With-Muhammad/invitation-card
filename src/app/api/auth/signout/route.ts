import { NextResponse } from "next/server";

import { auth, hasAuth } from "@/lib/supabase/server";

export async function POST() {
  if (hasAuth()) await (await auth()).auth.signOut();
  return NextResponse.json({ ok: true });
}
