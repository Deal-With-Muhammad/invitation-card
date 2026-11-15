import "server-only";

import { usd, UNLOCK_PRICE_CENTS, type LocalPrice, type Tier } from "@/lib/pricing";

// Shows a US-dollar price in the visitor's own currency, from their country
// (Cloudflare's cf-ipcountry header) and a daily exchange rate. The rate comes
// from open.er-api.com (free, no key, updates once a day); if it can't be
// reached, prices show in US dollars only.

/** The currency of each country the site sees most, plus the larger economies. Others show US dollars only. */
const CURRENCY: Record<string, string> = {
  PK: "PKR", IN: "INR", BD: "BDT", LK: "LKR", NP: "NPR", MY: "MYR", SG: "SGD", ID: "IDR", TH: "THB", PH: "PHP", VN: "VND",
  BN: "BND", AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD", BH: "BHD", OM: "OMR", JO: "JOD", EG: "EGP", TR: "TRY", MA: "MAD",
  DZ: "DZD", TN: "TND", NG: "NGN", KE: "KES", ZA: "ZAR", GH: "GHS", GB: "GBP", CA: "CAD", AU: "AUD", NZ: "NZD", JP: "JPY",
  KR: "KRW", CN: "CNY", HK: "HKD", TW: "TWD", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", CZ: "CZK", HU: "HUF",
  RO: "RON", RU: "RUB", UA: "UAH", BR: "BRL", MX: "MXN", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN", IR: "IRR", IQ: "IQD",
  AF: "AFN", MV: "MVR", KZ: "KZT", UZ: "UZS", AZ: "AZN", IL: "ILS",
  // The euro area
  AT: "EUR", BE: "EUR", CY: "EUR", DE: "EUR", EE: "EUR", ES: "EUR", FI: "EUR", FR: "EUR", GR: "EUR", HR: "EUR", IE: "EUR",
  IT: "EUR", LT: "EUR", LU: "EUR", LV: "EUR", MT: "EUR", NL: "EUR", PT: "EUR", SI: "EUR", SK: "EUR",
};

/** The visitor's two-letter country, from Cloudflare (or the old hosts' headers). */
export function countryOf(h: Headers): string | null {
  const c = (h.get("cf-ipcountry") ?? h.get("x-vercel-ip-country") ?? h.get("cloudfront-viewer-country") ?? "").toUpperCase();
  return /^[A-Z]{2}$/.test(c) && c !== "XX" && c !== "T1" ? c : null;
}

let rates: { at: number; usd: Record<string, number> } | null = null;

async function usdRates(): Promise<Record<string, number> | null> {
  if (rates && Date.now() - rates.at < 6 * 3600_000) return rates.usd;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(2500),
      // On Cloudflare, keep the response at the edge for 6 hours.
      ...({ cf: { cacheTtl: 21600, cacheEverything: true } } as object),
    });
    if (!res.ok) throw new Error(String(res.status));
    const j = (await res.json()) as { result?: string; rates?: Record<string, number> };
    if (j.result !== "success" || !j.rates) throw new Error("bad response");
    rates = { at: Date.now(), usd: j.rates };
    return j.rates;
  } catch {
    return rates?.usd ?? null;
  }
}

/** Rounds a converted amount so it reads like a price ("about ₹540", not "₹537.21"). */
function roundish(n: number) {
  if (n >= 1000) return Math.round(n / 10) * 10;
  if (n >= 100) return Math.round(n);
  if (n >= 10) return Math.round(n * 2) / 2;
  return Math.round(n * 10) / 10;
}

function localAmount(cents: number, currency: string, rate: number) {
  const amount = roundish((cents / 100) * rate);
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, currencyDisplay: "narrowSymbol", minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: amount >= 100 ? 0 : 2 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/** Both tiers' prices for a visitor from `country`. */
export async function localPrices(country: string | null): Promise<Record<Tier, LocalPrice>> {
  const currency = country ? (CURRENCY[country] ?? null) : null;
  const rate = currency ? (await usdRates())?.[currency] : undefined;
  const one = (tier: Tier): LocalPrice => {
    const cents = UNLOCK_PRICE_CENTS[tier];
    return { tier, cents, usd: usd(cents), local: currency && rate ? localAmount(cents, currency, rate) : null, currency: rate ? currency : null };
  };
  return { regular: one("regular"), premium: one("premium") };
}
