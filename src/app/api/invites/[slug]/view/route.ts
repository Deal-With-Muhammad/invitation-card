import { NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/server/admin";
import { clientIp, getStore } from "@/lib/server/store";
import { visitInfo } from "@/lib/server/visitor";
import { SLUG_RE } from "@/lib/slug";

// Counts a visit each time an invitation's link is opened, on any device and
// however often, while it has visits left. An admin checking it isn't counted.
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const store = getStore();
  if (!store || !SLUG_RE.test(slug)) return NextResponse.json({ ok: false });
  if (await isAdminRequest()) return NextResponse.json({ ok: true, counted: false });
  const n = await store.hit(`inv:rl:view:${clientIp(req.headers)}`, 3600);
  if (n > 120) return NextResponse.json({ ok: false });
  let referrer: unknown;
  try {
    referrer = (await req.json()).ref;
  } catch {}
  const r = await store.registerView(slug, visitInfo(req, referrer));
  if (!r) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, counted: r.counted, left: Math.max(0, r.maxViews - r.views) });
}
