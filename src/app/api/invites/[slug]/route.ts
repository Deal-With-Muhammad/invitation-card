import { NextResponse } from "next/server";

import { parseInvite } from "@/invite/schema";
import { getStore, tokenMatches } from "@/lib/server/store";

// Reading an invitation for editing, saving changes and deleting it. All three
// need the private edit token from publishing (header x-edit-token).

type Ctx = { params: Promise<{ slug: string }> };

async function authorised(req: Request, slug: string) {
  const store = getStore();
  if (!store) return { error: NextResponse.json({ error: "Sharing is not available right now." }, { status: 503 }) };
  const rec = await store.get(slug);
  if (!rec) return { error: NextResponse.json({ error: "This invitation doesn't exist any more." }, { status: 404 }) };
  if (!tokenMatches(req.headers.get("x-edit-token"), rec.tokenHash))
    return { error: NextResponse.json({ error: "This edit link isn't valid." }, { status: 403 }) };
  return { store, rec };
}

export async function GET(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const a = await authorised(req, slug);
  if ("error" in a) return a.error;
  const views = await a.store.views(slug);
  return NextResponse.json({ data: a.rec.data, createdAt: a.rec.createdAt, updatedAt: a.rec.updatedAt, views });
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
  await a.store.put(slug, { ...a.rec, data: parsed.data, updatedAt: Date.now() });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const a = await authorised(req, slug);
  if ("error" in a) return a.error;
  await a.store.remove(slug);
  return NextResponse.json({ ok: true });
}
