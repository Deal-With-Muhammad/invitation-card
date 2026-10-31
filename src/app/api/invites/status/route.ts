import { NextResponse } from "next/server";

import { clientIp, getStore, tokenMatches } from "@/lib/server/store";
import { SLUG_RE } from "@/lib/slug";

// Visits used and left for the invitations saved on this device. Each one needs
// its edit token, so nobody can look up someone else's numbers.
export async function POST(req: Request) {
  const store = getStore();
  if (!store) return NextResponse.json({ error: "Sharing is not available right now." }, { status: 503 });
  if ((await store.hit(`inv:rl:status:${clientIp(req.headers)}`, 60)) > 30) return NextResponse.json({ error: "Slow down." }, { status: 429 });
  let items: { slug?: unknown; token?: unknown }[];
  try {
    const body = await req.json();
    items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const statuses: Record<string, { views: number; maxViews: number; saved: boolean } | null> = {};
  await Promise.all(
    items.map(async ({ slug, token }) => {
      if (typeof slug !== "string" || typeof token !== "string" || !SLUG_RE.test(slug)) return;
      const rec = await store.get(slug);
      statuses[slug] = rec && tokenMatches(token, rec.tokenHash) ? { views: rec.views, maxViews: rec.maxViews, saved: Boolean(rec.ownerId) } : null;
    }),
  );
  return NextResponse.json({ statuses });
}
