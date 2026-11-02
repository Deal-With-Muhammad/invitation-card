import { NextResponse } from "next/server";

import { customFor } from "@/custom";
import { clientIp, getStore } from "@/lib/server/store";
import { validSlug } from "@/lib/slug";

// Is invite.dealwithmuhammad.com/<slug> free?
export async function GET(req: Request) {
  const slug = (new URL(req.url).searchParams.get("slug") ?? "").trim().toLowerCase();
  if (!validSlug(slug)) return NextResponse.json({ available: false, reason: "invalid" });
  if (customFor(slug)) return NextResponse.json({ available: false });
  const store = getStore();
  if (!store) return NextResponse.json({ available: false, reason: "unavailable" });
  if ((await store.hit(`inv:rl:slug:${clientIp(req.headers)}`, 60)) > 60) return NextResponse.json({ available: false, reason: "slow-down" });
  return NextResponse.json({ available: !(await store.exists(slug)) });
}
