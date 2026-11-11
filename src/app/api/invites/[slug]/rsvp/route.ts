import { NextResponse } from "next/server";

import { getGuestbook, parseRsvp } from "@/lib/server/guestbook";
import { isHost } from "@/lib/server/host";
import { clientIp, getStore } from "@/lib/server/store";
import { SLUG_RE } from "@/lib/slug";

// A guest's RSVP (POST, anyone with the link) and the host's list of replies
// (GET, edit key / account / admin).

type Ctx = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const store = getStore();
  const book = getGuestbook();
  if (!store || !book || !SLUG_RE.test(slug)) return null;
  const rec = await store.get(slug);
  return rec ? { store, book, rec } : null;
}

export async function POST(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const l = await load(slug);
  if (!l) return NextResponse.json({ error: "This invitation doesn't exist any more." }, { status: 404 });
  if ((await l.store.hit(`inv:rl:rsvp:${clientIp(req.headers)}`, 3600)) > 30)
    return NextResponse.json({ error: "Too many replies from here. Please try again later." }, { status: 429 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const ids = (l.rec.data.events ?? []).map((e) => e.id).filter(Boolean);
  const parsed = parseRsvp(body, ids.length ? ids : null);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  await l.book.addRsvp(slug, parsed.rsvp);
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const l = await load(slug);
  if (!l) return NextResponse.json({ error: "This invitation doesn't exist any more." }, { status: 404 });
  if (!(await isHost(req, l.rec))) return NextResponse.json({ error: "This link isn't valid." }, { status: 403 });
  const [rsvps, wishes] = await Promise.all([l.book.rsvps(slug), l.book.wishes(slug, 500)]);
  const events = (l.rec.data.events ?? []).map((e) => ({ id: e.id, title: e.title, date: e.date }));
  return NextResponse.json({ events, rsvps, wishes, names: l.rec.data.people.map((p) => p.name.trim()).filter(Boolean) });
}
