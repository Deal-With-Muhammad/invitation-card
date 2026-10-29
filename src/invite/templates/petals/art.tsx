import type { Resolved } from "../../resolve";
import { bud, type Layer, leaf, petal, rand, rose, vein } from "../stationery/flora";
import { CardText, Paint } from "../stationery/kit";

// Rose Shower: roses, buds, leaves and loose petals tossed in from the top of the
// card, thinning out as they fall. Drawn in a W × H box.

function shower(W: number, H: number, n: number, seed: number, reach: number): Layer[] {
  const r = rand(seed);
  const out: Layer[] = [];
  let leaves = "";
  let veins = "";
  let loose = "";
  let loose2 = "";
  for (let i = 0; i < n; i++) {
    const y = -10 + Math.pow(r(), 2.1) * H * reach;
    const x = -6 + r() * (W + 12);
    const depth = 1 - y / (H * reach);
    const kind = r();
    if (kind < 0.24 && depth > 0.35) out.push(...rose([x, y], 9 + r() * 9 * depth, Math.floor(r() * 1e6), r() * 6, 0.8 + r() * 0.15));
    else if (kind < 0.36) out.push(...bud([x, y], r() * 6.28, 9 + r() * 5, Math.floor(r() * 1e6)));
    else if (kind < 0.62) {
      const a = r() * 6.28;
      const l = 9 + r() * 8;
      leaves += leaf([x, y], a, l, l * 0.3, (r() - 0.5) * 0.8);
      veins += vein([x, y], a, l, l * 0.3, 0);
    } else {
      const a = r() * 6.28;
      const l = 4 + r() * 5;
      const p = petal([x, y], a, l, l * 0.55, { round: 1, skew: (r() - 0.5) * 0.6 });
      if (r() > 0.5) loose += p;
      else loose2 += p;
    }
  }
  return [
    { d: leaves, c: "la" },
    { d: veins, c: "lv" },
    { d: loose, c: "fb" },
    { d: loose2, c: "fc" },
    ...out,
  ];
}

const ART = shower(280, 392, 120, 5, 0.62);
const LINER = shower(140, 120, 34, 19, 1.1);

export function Card({ r }: { r: Resolved }) {
  return (
    <>
      <Paint vb="0 0 280 392" layers={ART} className="ps-art" />
      <CardText r={r} className="ps-text" />
    </>
  );
}

export function Liner() {
  return (
    <span className="ps-liner">
      <Paint vb="0 0 140 120" layers={LINER} className="ps-liner-art" />
    </span>
  );
}
