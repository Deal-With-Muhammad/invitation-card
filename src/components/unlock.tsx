"use client";

import { useEffect, useState } from "react";

import { tierFor, usd, UNLOCK_PRICE_CENTS, type LocalPrice, type Tier } from "@/lib/pricing";

// "Unlimited visits" for one invitation: the price in the visitor's own currency,
// and a button that opens the Lemon Squeezy checkout. Used on the "this
// invitation is full" page, in the editor and on My invitations.

type PriceInfo = { enabled: boolean; prices: Record<Tier, LocalPrice> };

let pricePromise: Promise<PriceInfo | null> | null = null;
const loadPrices = () =>
  (pricePromise ??= fetch("/api/price")
    .then((r) => (r.ok ? (r.json() as Promise<PriceInfo>) : null))
    .catch(() => null));

/** The price for a design, as the visitor sees it. Null while loading. */
export function usePrice(template: string) {
  const [info, setInfo] = useState<PriceInfo | null>(null);
  useEffect(() => {
    let live = true;
    loadPrices().then((p) => live && setInfo(p));
    return () => {
      live = false;
    };
  }, []);
  const tier = tierFor(template);
  return { enabled: info?.enabled ?? false, loaded: info !== null, price: info?.prices[tier] ?? null, fallback: usd(UNLOCK_PRICE_CENTS[tier]) };
}

/** "₹540" with "US$6" after it, or just "US$6". */
export function priceLabel(p: LocalPrice | null, fallback: string) {
  if (!p) return fallback;
  return p.local ? `${p.local} (${p.usd})` : p.usd;
}

async function startCheckout(slug: string): Promise<string | null> {
  const res = await fetch(`/api/invites/${slug}/unlock`, { method: "POST" });
  const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (j.url) {
    window.location.href = j.url;
    return null;
  }
  return j.error ?? "The payment page couldn't be opened. Please try again.";
}

type Props = {
  slug: string;
  template: string;
  /** "dark" on the deep-teal full page, "light" on the paper pages. */
  tone?: "dark" | "light";
  /** Smaller, for lists. */
  compact?: boolean;
};

export function UnlockButton({ slug, template, tone = "light", compact = false }: Props) {
  const { enabled, loaded, price, fallback } = usePrice(template);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (loaded && !enabled) return null;

  const go = async () => {
    setBusy(true);
    setError(null);
    const err = await startCheckout(slug);
    if (err) {
      setError(err);
      setBusy(false);
    }
  };

  const amount = price?.local ?? price?.usd ?? fallback;
  const button =
    tone === "dark"
      ? "bg-gold-light text-deep hover:bg-ivory"
      : "bg-brand text-white hover:bg-brand/90";
  return (
    <div className={compact ? "" : "grid gap-2"}>
      <button
        type="button"
        onClick={go}
        disabled={busy || !loaded}
        className={`rounded-full font-medium transition-colors disabled:opacity-60 ${button} ${compact ? "px-3.5 py-1.5 text-[13px]" : "px-5 py-3 text-[15px]"}`}
      >
        {busy ? "Opening the payment page…" : compact ? `Unlimited visits · ${amount}` : `Get unlimited visits · ${amount}`}
      </button>
      {!compact && (
        <p className={`text-[12.5px] leading-relaxed ${tone === "dark" ? "text-ivory/65" : "text-muted"}`}>
          {price?.local ? `One-time payment of ${price.usd}, about ${price.local}. ` : "One-time payment. "}
          Paid securely through Lemon Squeezy. No account needed.
        </p>
      )}
      {error && <p className={`text-[13px] ${tone === "dark" ? "text-gold-light" : "text-wax"}`}>{error}</p>}
    </div>
  );
}
