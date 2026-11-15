import "server-only";

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { db, hasDb } from "@/lib/supabase/server";

import type { OrderEvent } from "./lemonsqueezy";

// A record of each Lemon Squeezy order (public.payments, see supabase/schema.sql),
// so the admin can see who paid for which invitation. Lemon Squeezy keeps the
// full order, with the card details, on its side; this only keeps what's needed
// to match a payment to an invitation. In development: .data/payments.json.

export type PaymentRow = {
  order_id: string;
  order_number: number | null;
  slug: string | null;
  tier: string | null;
  status: string;
  total_usd: number;
  total: number;
  currency: string;
  email: string | null;
  name: string | null;
  test_mode: boolean;
  updated_at: string;
};

export const toRow = (o: OrderEvent): PaymentRow => ({
  order_id: o.orderId,
  order_number: o.orderNumber,
  slug: o.slug,
  tier: o.tier,
  status: o.refunded ? "refunded" : o.status,
  total_usd: o.totalUsd,
  total: o.total,
  currency: o.currency,
  email: o.email,
  name: o.name,
  test_mode: o.testMode,
  updated_at: new Date().toISOString(),
});

/** Saves (or updates) one order. A missing table is logged, not fatal: the unlock matters more than the record. */
export async function savePayment(row: PaymentRow) {
  if (hasDb()) {
    const { error } = await db().from("payments").upsert(row, { onConflict: "order_id" });
    if (error) console.error(`payments upsert failed for order ${row.order_id}: ${error.message}`);
    return;
  }
  const file = join(process.cwd(), ".data", "payments.json");
  let all: Record<string, PaymentRow> = {};
  try {
    all = JSON.parse(readFileSync(file, "utf8"));
  } catch {}
  all[row.order_id] = row;
  mkdirSync(join(process.cwd(), ".data"), { recursive: true });
  writeFileSync(file, JSON.stringify(all, null, 1));
}
