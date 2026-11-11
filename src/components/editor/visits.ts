import { isPremium } from "@/lib/groups";

// Every invitation includes this many visits (each opening of the link counts). The server
// keeps its own copy in lib/server/store.ts.
export const VISIT_LIMIT = 100;

/** Premium designs include fewer visits; unlimited is arranged by message. */
export const PREMIUM_VISIT_LIMIT = 80;

export const visitLimitFor = (template: string) => (isPremium(template) ? PREMIUM_VISIT_LIMIT : VISIT_LIMIT);

/** Unlimited invitations have their limit set out of reach (2147483647). */
export const isUnlimited = (maxViews: number) => maxViews >= 1_000_000_000;

export function visitsLeft(views: number, maxViews: number) {
  if (isUnlimited(maxViews)) return "Unlimited visits";
  const left = Math.max(0, maxViews - views);
  return left === 0 ? "No visits left" : `${left} of ${maxViews} visits left`;
}
