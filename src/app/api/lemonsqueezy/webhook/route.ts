import { NextResponse } from "next/server";

import { visitLimitFor } from "@/components/editor/visits";
import { UNLOCK_PRICE_CENTS, tierFor } from "@/lib/pricing";
import { acceptsTestOrders, parseOrder, tierOfVariant, verifySignature } from "@/lib/server/lemonsqueezy";
import { savePayment, toRow } from "@/lib/server/payments";
import { getStore, UNLIMITED_VISITS } from "@/lib/server/store";
import { SLUG_RE } from "@/lib/slug";

// Lemon Squeezy calls this when an order is paid or refunded (Settings → Webhooks,
// events order_created and order_refunded). A paid order turns on unlimited visits
// for the invitation in its custom data; a full refund turns them off again.
// Anything that can't be acted on still answers 200, so Lemon Squeezy doesn't
// keep retrying; it's logged and the payment is recorded for the admin.
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-signature"))) return NextResponse.json({ error: "Bad signature." }, { status: 401 });

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const order = parseOrder(payload);
  if (!order) return NextResponse.json({ ok: true, ignored: "not an order" });
  const log = (msg: string) => console.log(`lemonsqueezy ${order.event} #${order.orderNumber ?? order.orderId} /${order.slug ?? "?"}: ${msg}`);

  if (order.testMode && !acceptsTestOrders()) {
    log("test-mode order ignored");
    return NextResponse.json({ ok: true, ignored: "test mode" });
  }
  await savePayment(toRow(order));

  const store = getStore();
  if (!store || !order.slug || !SLUG_RE.test(order.slug)) {
    log("no invitation in the order");
    return NextResponse.json({ ok: true, ignored: "no slug" });
  }
  const rec = await store.get(order.slug);
  if (!rec) {
    log("invitation not found (deleted?)");
    return NextResponse.json({ ok: true, ignored: "not found" });
  }

  if (order.event === "order_created" && order.status === "paid" && !order.refunded) {
    // The variant decides what was paid for; it must cover the design's price.
    const paid = tierOfVariant(order.variantId);
    const needed = tierFor(rec.data.template);
    if (!paid || UNLOCK_PRICE_CENTS[paid] < UNLOCK_PRICE_CENTS[needed]) {
      log(`paid ${paid ?? `unknown variant ${order.variantId}`} but the design needs ${needed}; left for the admin`);
      return NextResponse.json({ ok: true, ignored: "underpaid" });
    }
    await store.setMaxViews(order.slug, UNLIMITED_VISITS);
    log("unlimited visits on");
    return NextResponse.json({ ok: true, unlocked: order.slug });
  }

  if (order.event === "order_refunded" && order.refunded) {
    if (rec.maxViews >= UNLIMITED_VISITS) await store.setMaxViews(order.slug, visitLimitFor(rec.data.template));
    log("refunded: back to the free visits");
    return NextResponse.json({ ok: true, relocked: order.slug });
  }

  log(`nothing to do (status ${order.status})`);
  return NextResponse.json({ ok: true });
}
