// Every invitation includes this many guest visits (one per phone). The server
// keeps its own copy in lib/server/store.ts.
export const VISIT_LIMIT = 100;

export function visitsLeft(views: number, maxViews: number) {
  const left = Math.max(0, maxViews - views);
  return left === 0 ? "No visits left" : `${left} of ${maxViews} visits left`;
}
