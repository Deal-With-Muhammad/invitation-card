import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { clientIp, getStore, hasSeen, seenCookieName, seenCookieOptions, seenCookieValue } from "@/lib/server/store";
import { visitInfo } from "@/lib/server/visitor";
import { SLUG_RE } from "@/lib/slug";

// Counts a guest opening an invitation (the page sends this once per device),
// while it has visits left. A counted device gets a cookie so it can come back.
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const store = getStore();
  if (!store || !SLUG_RE.test(slug)) return NextResponse.json({ ok: false });
  if (hasSeen(slug, (await cookies()).get(seenCookieName(slug))?.value)) return NextResponse.json({ ok: true, counted: false });
  const n = await store.hit(`inv:rl:view:${clientIp(req.headers)}`, 3600);
  if (n > 120) return NextResponse.json({ ok: false });
  let referrer: unknown;
  try {
    referrer = (await req.json()).ref;
  } catch {}
  const r = await store.registerView(slug, visitInfo(req, referrer));
  if (!r) return NextResponse.json({ ok: false });
  const res = NextResponse.json({ ok: true, counted: r.counted, left: Math.max(0, r.maxViews - r.views) });
  if (r.counted) res.cookies.set(seenCookieName(slug), seenCookieValue(slug), seenCookieOptions);
  return res;
}
