// Every invitation includes this many visits (each opening of the link counts). The server
// keeps its own copy in lib/server/store.ts.
export const VISIT_LIMIT = 100;

/** Unlimited invitations have their limit set out of reach (2147483647). */
export const isUnlimited = (maxViews: number) => maxViews >= 1_000_000_000;

export function visitsLeft(views: number, maxViews: number) {
  if (isUnlimited(maxViews)) return "Unlimited visits";
  const left = Math.max(0, maxViews - views);
  return left === 0 ? "No visits left" : `${left} of ${maxViews} visits left`;
}
