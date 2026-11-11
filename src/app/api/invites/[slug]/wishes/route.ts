import { NextResponse } from "next/server";

import { getGuestbook, parseWish } from "@/lib/server/guestbook";
import { isHost } from "@/lib/server/host";
import { clientIp, getStore } from "@/lib/server/store";
import { SLUG_RE } from "@/lib/slug";

// Wishes for the couple: anyone with the link reads (GET) and writes (POST) them;
// the host hides one (DELETE ?id=).

type Ctx = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const store = getStore();
  const book = getGuestbook();
  if (!store || !book || !SLUG_RE.test(slug)) return null;
  const rec = await store.get(slug);
  return rec ? { store, book, rec } : null;
}

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const l = await load(slug);
  if (!l) return NextResponse.json({ wishes: [] }, { status: 404 });
  return NextResponse.json({ wishes: await l.book.wishes(slug, 60) }, { headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const l = await load(slug);
  if (!l) return NextResponse.json({ error: "This invitation doesn't exist any more." }, { status: 404 });
  if ((await l.store.hit(`inv:rl:wish:${clientIp(req.headers)}`, 3600)) > 20)
    return NextResponse.json({ error: "Too many wishes from here. Please try again later." }, { status: 429 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = parseWish(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const wish = await l.book.addWish(slug, parsed.wish);
  return NextResponse.json({ ok: true, wish });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const l = await load(slug);
  if (!l) return NextResponse.json({ error: "This invitation doesn't exist any more." }, { status: 404 });
  if (!(await isHost(req, l.rec))) return NextResponse.json({ error: "This link isn't valid." }, { status: 403 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await l.book.removeWish(slug, id);
  return NextResponse.json({ ok: true });
}
