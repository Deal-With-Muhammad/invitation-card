import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import type { Tier } from "@/lib/pricing";
import { clean } from "@/lib/supabase/server";

// Payments for unlimited visits go through Lemon Squeezy, the merchant of record:
// it takes the payment, charges any sales tax or VAT, sends the receipt and
// handles refunds and chargebacks. The site only:
//  1. creates a checkout for one invitation (POST /v1/checkouts), carrying the
//     invitation's slug as custom data, and sends the buyer there; and
//  2. listens for the order webhook, checks its signature and unlocks the slug.
//
// Settings (wrangler secrets in production, .env.local in development):
//   LEMONSQUEEZY_API_KEY          API key (Settings → API). Test-mode keys make test checkouts.
//   LEMONSQUEEZY_STORE_ID         numeric store id
//   LEMONSQUEEZY_VARIANT_REGULAR  variant id of "Unlimited visits – regular design" (US$6)
//   LEMONSQUEEZY_VARIANT_PREMIUM  variant id of "Unlimited visits – premium design" (US$8)
//   LEMONSQUEEZY_WEBHOOK_SECRET   the signing secret typed into the webhook (Settings → Webhooks)

const env = (name: string) => clean(process.env[name]);

export const paymentsEnabled = () =>
  Boolean(env("LEMONSQUEEZY_API_KEY") && env("LEMONSQUEEZY_STORE_ID") && env("LEMONSQUEEZY_VARIANT_REGULAR") && env("LEMONSQUEEZY_VARIANT_PREMIUM"));

const variantFor = (tier: Tier) => env(tier === "premium" ? "LEMONSQUEEZY_VARIANT_PREMIUM" : "LEMONSQUEEZY_VARIANT_REGULAR");

export type CheckoutInput = { slug: string; tier: Tier; names: string; returnUrl: string; email?: string | null };

/** A Lemon Squeezy checkout for unlimited visits on one invitation. Returns its address. */
export async function createCheckout({ slug, tier, names, returnUrl, email }: CheckoutInput): Promise<string> {
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        product_options: {
          name: "Unlimited visits",
          description: `For the invitation invite.dealwithmuhammad.com/${slug}${names ? ` (${names})` : ""}. A one-time payment: the link opens for everyone, as often as they like.`,
          redirect_url: returnUrl,
          receipt_button_text: "Back to your invitation",
          receipt_link_url: returnUrl,
          receipt_thank_you_note: `Unlimited visits are now on for invite.dealwithmuhammad.com/${slug}.`,
          enabled_variants: [Number(variantFor(tier))],
        },
        checkout_options: { embed: false, media: false, logo: true, button_color: "#1c5652" },
        checkout_data: { ...(email ? { email } : {}), custom: { slug, tier } },
        // A checkout is for this visit; a fresh one is made each time.
        expires_at: new Date(Date.now() + 24 * 3600_000).toISOString(),
      },
      relationships: {
        store: { data: { type: "stores", id: env("LEMONSQUEEZY_STORE_ID") } },
        variant: { data: { type: "variants", id: variantFor(tier) } },
      },
    },
  };
  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${env("LEMONSQUEEZY_API_KEY")}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  const j = (await res.json().catch(() => null)) as { data?: { attributes?: { url?: string } }; errors?: { detail?: string }[] } | null;
  const url = j?.data?.attributes?.url;
  if (!res.ok || !url) throw new Error(`Lemon Squeezy checkout failed (${res.status}): ${j?.errors?.[0]?.detail ?? "no url"}`);
  return url;
}

/** Is this webhook really from Lemon Squeezy? (HMAC-SHA256 of the raw body, hex, in X-Signature.) */
export function verifySignature(raw: string, signature: string | null) {
  const secret = env("LEMONSQUEEZY_WEBHOOK_SECRET");
  if (!secret || !signature || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  const want = createHmac("sha256", secret).update(raw).digest();
  const got = Buffer.from(signature, "hex");
  return got.length === want.length && timingSafeEqual(got, want);
}

/** The parts of an order webhook the site uses. */
export type OrderEvent = {
  event: string;
  orderId: string;
  orderNumber: number | null;
  status: string;
  slug: string | null;
  tier: string | null;
  variantId: string | null;
  totalUsd: number;
  total: number;
  currency: string;
  email: string | null;
  name: string | null;
  testMode: boolean;
  refunded: boolean;
};

export function parseOrder(payload: unknown): OrderEvent | null {
  const p = payload as {
    meta?: { event_name?: string; custom_data?: Record<string, unknown> };
    data?: { type?: string; id?: string; attributes?: Record<string, unknown> };
  };
  if (p?.data?.type !== "orders" || !p.data.id || !p.data.attributes) return null;
  const a = p.data.attributes;
  const custom = p.meta?.custom_data ?? {};
  const item = a.first_order_item as { variant_id?: number } | undefined;
  const str = (v: unknown) => (typeof v === "string" && v ? v : null);
  return {
    event: p.meta?.event_name ?? "",
    orderId: p.data.id,
    orderNumber: typeof a.order_number === "number" ? a.order_number : null,
    status: String(a.status ?? ""),
    slug: str(custom.slug),
    tier: str(custom.tier),
    variantId: item?.variant_id != null ? String(item.variant_id) : null,
    totalUsd: Number(a.total_usd ?? 0),
    total: Number(a.total ?? 0),
    currency: String(a.currency ?? "USD"),
    email: str(a.user_email),
    name: str(a.user_name),
    testMode: a.test_mode === true,
    refunded: a.refunded === true,
  };
}

/** Which tier a paid variant belongs to (null if it's not one of ours). */
export function tierOfVariant(variantId: string | null): Tier | null {
  if (!variantId) return null;
  if (variantId === env("LEMONSQUEEZY_VARIANT_PREMIUM")) return "premium";
  if (variantId === env("LEMONSQUEEZY_VARIANT_REGULAR")) return "regular";
  return null;
}

/** Test-mode orders unlock invitations only where test payments are switched on (development and the test setup). */
export const acceptsTestOrders = () => env("LEMONSQUEEZY_ACCEPT_TEST_ORDERS") === "1" || process.env.NODE_ENV !== "production";
