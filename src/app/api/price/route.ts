import { NextResponse } from "next/server";

import { countryOf, localPrices } from "@/lib/server/currency";
import { paymentsEnabled } from "@/lib/server/lemonsqueezy";

// The price of unlimited visits for this visitor: US dollars, plus about how
// much that is in their own currency.
export async function GET(req: Request) {
  const country = countryOf(req.headers);
  const prices = await localPrices(country);
  return NextResponse.json({ enabled: paymentsEnabled(), country, prices }, { headers: { "Cache-Control": "private, max-age=600" } });
}
