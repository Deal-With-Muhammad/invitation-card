import { NextResponse } from "next/server";

import { getStore, isUnlimitedAccount, tokenMatches, UNLIMITED_VISITS } from "@/lib/server/store";
import { SLUG_RE } from "@/lib/slug";
import { currentUser } from "@/lib/supabase/server";

// Saves guest invitations from this device to the signed-in account. Each one
// needs its edit token, and only invitations without an account can be moved.
export async function POST(req: Request) {
  const store = getStore();
  const user = await currentUser();
  if (!store || !user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  let items: { slug?: unknown; token?: unknown }[];
  try {
    const body = await req.json();
    items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const claimed: string[] = [];
  for (const { slug, token } of items) {
    if (typeof slug !== "string" || typeof token !== "string" || !SLUG_RE.test(slug)) continue;
    const rec = await store.get(slug);
    if (!rec || rec.ownerId || !tokenMatches(token, rec.tokenHash)) continue;
    if (!(await store.claim(slug, user.id))) continue;
    // An unlimited account's invitations have no visit limit.
    if (isUnlimitedAccount(user)) await store.setMaxViews(slug, UNLIMITED_VISITS);
    claimed.push(slug);
  }
  return NextResponse.json({ claimed });
}
