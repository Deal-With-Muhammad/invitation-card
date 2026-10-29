import { NextResponse } from "next/server";

import { clientIp, getStore } from "@/lib/server/store";

// Counts a guest opening an invitation (the page sends this once per device).
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const store = getStore();
  if (!store || !/^[a-z0-9-]{3,48}$/.test(slug)) return NextResponse.json({ ok: false });
  const n = await store.hit(`inv:rl:view:${clientIp(req.headers)}`, 3600);
  if (n > 120 || !(await store.exists(slug))) return NextResponse.json({ ok: false });
  await store.addView(slug);
  return NextResponse.json({ ok: true });
}
