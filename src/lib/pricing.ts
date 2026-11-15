import { isPremium } from "@/lib/groups";

// What unlimited visits cost for one invitation: a one-time payment, the same in
// US dollars in every country. Lemon Squeezy charges in USD; the buyer's bank or
// card converts it, so the local amount the site shows is an estimate.

export type Tier = "regular" | "premium";

/** Price in US cents. Keep in step with the two variants of the Lemon Squeezy product. */
export const UNLOCK_PRICE_CENTS: Record<Tier, number> = { regular: 600, premium: 800 };

export const tierFor = (template: string): Tier => (isPremium(template) ? "premium" : "regular");

/** "US$6" */
export const usd = (cents: number) => `US$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;

/** One tier's price as the visitor sees it: in US dollars, plus about how much in their own currency. */
export type LocalPrice = { tier: Tier; cents: number; usd: string; local: string | null; currency: string | null };
