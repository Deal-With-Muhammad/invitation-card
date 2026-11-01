import { NextResponse } from "next/server";

import { parseInvite } from "@/invite/schema";
import { getStore, tokenMatches } from "@/lib/server/store";
import { currentUser } from "@/lib/supabase/server";

// Reading an invitation for editing, saving changes, deleting it and choosing
// who can edit. These need either the private edit token from publishing
// (header x-edit-token) or the signed-in account the invitation is saved to.
// When the invitation is open for editing, anyone may read and save it, but only
// the token holder or account may delete it or change that setting.

type Ctx = { params: Promise<{ slug: string }> };

async function authorised(req: Request, slug: string, need: "edit" | "manage") {
  const store = getStore();
  if (!store) return { error: NextResponse.json({ error: "Sharing is not available right now." }, { status: 503 }) };
  const rec = await store.get(slug);
  if (!rec) return { error: NextResponse.json({ error: "This invitation doesn't exist any more." }, { status: 404 }) };
  if (tokenMatches(req.headers.get("x-edit-token"), rec.tokenHash)) return { store, rec, manage: true };
  if (rec.ownerId) {
    const user = await currentUser();
    if (user?.id === rec.ownerId) return { store, rec, manage: true };
  }
  if (need === "edit" && rec.openEdit) return { store, rec, manage: false };
  return { error: NextResponse.json({ error: "This edit link isn't valid." }, { status: 403 }) };
}

export async function GET(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const a = await authorised(req, slug, "edit");
  if ("error" in a) return a.error;
  const { rec } = a;
  return NextResponse.json({
    openEdit: Boolean(rec.openEdit),
    canManage: a.manage,
    data: rec.data,
    createdAt: rec.createdAt,
    updatedAt: rec.updatedAt,
    views: rec.views,
    maxViews: rec.maxViews,
    saved: Boolean(rec.ownerId),
  });
}

export async function PUT(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const a = await authorised(req, slug, "edit");
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

// Body { openEdit: boolean }: who can edit it.
export async function PATCH(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const a = await authorised(req, slug, "manage");
  if ("error" in a) return a.error;
  let body: { openEdit?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.openEdit !== "boolean") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  try {
    await a.store.setOpenEdit(slug, body.openEdit);
  } catch {
    return NextResponse.json({ error: "Couldn't change who can edit. Please try again later." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, openEdit: body.openEdit });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const a = await authorised(req, slug, "manage");
  if ("error" in a) return a.error;
  await a.store.remove(slug);
  return NextResponse.json({ ok: true });
}
