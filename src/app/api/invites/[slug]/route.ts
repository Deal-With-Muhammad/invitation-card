import { NextResponse } from "next/server";

import { parseInvite } from "@/invite/schema";
import { getStore, seenCookieName, seenCookieOptions, seenCookieValue, tokenMatches } from "@/lib/server/store";
import { currentUser } from "@/lib/supabase/server";

// Reading an invitation for editing, saving changes and deleting it. All three
// need either the private edit token from publishing (header x-edit-token) or
// the signed-in account the invitation is saved to.

type Ctx = { params: Promise<{ slug: string }> };

async function authorised(req: Request, slug: string) {
  const store = getStore();
  if (!store) return { error: NextResponse.json({ error: "Sharing is not available right now." }, { status: 503 }) };
  const rec = await store.get(slug);
  if (!rec) return { error: NextResponse.json({ error: "This invitation doesn't exist any more." }, { status: 404 }) };
  if (tokenMatches(req.headers.get("x-edit-token"), rec.tokenHash)) return { store, rec };
  if (rec.ownerId) {
    const user = await currentUser();
    if (user?.id === rec.ownerId) return { store, rec };
  }
  return { error: NextResponse.json({ error: "This edit link isn't valid." }, { status: 403 }) };
}

export async function GET(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const a = await authorised(req, slug);
  if ("error" in a) return a.error;
  const { rec } = a;
  const res = NextResponse.json({
    data: rec.data,
    createdAt: rec.createdAt,
    updatedAt: rec.updatedAt,
    views: rec.views,
    maxViews: rec.maxViews,
    saved: Boolean(rec.ownerId),
  });
  // Whoever can edit it can always open it, without using up a visit.
  res.cookies.set(seenCookieName(slug), seenCookieValue(slug), seenCookieOptions);
  return res;
}

export async function PUT(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const a = await authorised(req, slug);
  if ("error" in a) return a.error;
  const raw = await req.text();
  if (raw.length > 40_000) return NextResponse.json({ error: "This invitation is too long." }, { status: 413 });
  let body: { data?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = parseInvite(body.data);
  if (!parsed.ok) return NextResponse.json({ error: `Please check the details (${parsed.error}).` }, { status: 400 });
  await a.store.update(slug, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const a = await authorised(req, slug);
  if ("error" in a) return a.error;
  await a.store.remove(slug);
  return NextResponse.json({ ok: true });
}
