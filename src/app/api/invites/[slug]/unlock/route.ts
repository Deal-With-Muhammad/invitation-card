import { NextResponse } from "next/server";

import { tierFor } from "@/lib/pricing";
import { createCheckout, paymentsEnabled } from "@/lib/server/lemonsqueezy";
import { clientIp, getStore, UNLIMITED_VISITS } from "@/lib/server/store";
import { siteOrigin } from "@/lib/server/visitor";
import { SLUG_RE } from "@/lib/slug";
import { currentUser } from "@/lib/supabase/server";

// Starts a payment for unlimited visits on one invitation. No account or edit key
// is needed: the payment belongs to the invitation's link, so a host who made it
// as a guest can pay straight from the "this invitation is full" page. The price
// is picked here from the design, never from the browser.
//
// GET  → whether it's already unlimited (the thank-you page waits on this).
// POST → { url } of a Lemon Squeezy checkout.

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const store = getStore();
  if (!store || !SLUG_RE.test(slug)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const rec = await store.get(slug);
  if (!rec) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ unlimited: rec.maxViews >= UNLIMITED_VISITS });
}

export async function POST(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const store = getStore();
  if (!store || !SLUG_RE.test(slug)) return NextResponse.json({ error: "This invitation doesn't exist." }, { status: 404 });
  if (!paymentsEnabled()) return NextResponse.json({ error: "Payments aren't switched on yet. Please message me on WhatsApp instead." }, { status: 503 });
  if ((await store.hit(`inv:rl:unlock:${clientIp(req.headers)}`, 3600)) > 20)
    return NextResponse.json({ error: "Too many tries. Please wait a little and try again." }, { status: 429 });
  const rec = await store.get(slug);
  if (!rec) return NextResponse.json({ error: "This invitation doesn't exist any more." }, { status: 404 });
  if (rec.maxViews >= UNLIMITED_VISITS) return NextResponse.json({ error: "This invitation already has unlimited visits." }, { status: 409 });
  const user = await currentUser().catch(() => null);
  try {
    const url = await createCheckout({
      slug,
      tier: tierFor(rec.data.template),
      names: rec.data.people.map((p) => p.name).filter(Boolean).join(" & ").slice(0, 80),
      returnUrl: `${siteOrigin(req)}/unlocked/${slug}`,
      email: user?.email ?? null,
    });
    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "The payment page couldn't be opened. Please try again, or message me on WhatsApp." }, { status: 502 });
  }
}
