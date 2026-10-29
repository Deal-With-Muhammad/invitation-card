import type { Resolved } from "../../resolve";
import { bez, bezAngle, blossom, circle, type Curve, curve, ellipse, fill, leaf, line, polar, rand, svgUrl } from "../stationery/flora";
import { CardText, Masked } from "../stationery/kit";

// Gilded Blossom: gold-foil blossom branches trailing in from the top of a
// watercolour-washed card. The art is drawn in the card's 280 × 392 box.

type Art = { stems: string; twigs: string; petals: string; leaves: string; dots: string };

/** Flowering branch: blossoms on short twigs, buds and narrow leaves. */
function branch(cv: Curve, seed: number, o: { flowers: number; size: number; from?: number }): Art {
  const r = rand(seed);
  const a: Art = { stems: curve(cv), twigs: "", petals: "", leaves: "", dots: "" };
  const from = o.from ?? 0.12;
  for (let i = 0; i < o.flowers; i++) {
    const t = from + ((i + r() * 0.6) / o.flowers) * (1 - from);
    const p = bez(cv, t);
    const ang = bezAngle(cv, t) + (i % 2 ? 1 : -1) * (0.7 + r() * 0.6);
    const tw = o.size * (0.9 + r() * 1.3);
    const end = polar(p, ang, tw);
    a.twigs += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}Q${polar(p, ang + 0.3, tw * 0.55).map((n) => n.toFixed(1)).join(" ")} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
    const kind = r();
    if (kind < 0.62) {
      const R = o.size * (0.75 + r() * 0.45);
      const b = blossom(end, R, r() * 6.28, seed * 7 + i);
      a.petals += b.petals;
      a.dots += b.center + b.dots;
    } else if (kind < 0.82) {
      a.petals += ellipse(end, o.size * 0.32, o.size * 0.45, ang + Math.PI / 2);
      a.leaves += leaf(end, ang + Math.PI, o.size * 0.42, o.size * 0.16, 0.3);
    } else {
      a.leaves += leaf(p, ang, o.size * (1.3 + r() * 0.6), o.size * 0.3, (r() - 0.5) * 0.8);
    }
  }
  // a terminal bud on the tip
  const tip = cv[3];
  a.petals += circle(tip, o.size * 0.3);
  return a;
}

const merge = (...xs: Art[]): Art => ({
  stems: xs.map((x) => x.stems).join(""),
  twigs: xs.map((x) => x.twigs).join(""),
  petals: xs.map((x) => x.petals).join(""),
  leaves: xs.map((x) => x.leaves).join(""),
  dots: xs.map((x) => x.dots).join(""),
});

const CARD = merge(
  branch([[-12, 18], [60, 4], [140, 40], [196, 112]], 3, { flowers: 13, size: 9 }),
  branch([[292, 4], [236, 30], [176, 70], [138, 150]], 11, { flowers: 11, size: 8.5 }),
  branch([[150, -6], [176, 40], [232, 70], [262, 190]], 17, { flowers: 10, size: 8 }),
  branch([[60, -6], [30, 40], [14, 120], [30, 214]], 23, { flowers: 10, size: 8.4 }),
  branch([[230, -8], [268, 30], [280, 90], [268, 140]], 29, { flowers: 6, size: 8 }),
  branch([[96, 2], [104, 44], [84, 82], [70, 112]], 31, { flowers: 6, size: 7.5 }),
);

const VB = "0 0 280 392";
const FOIL = svgUrl(VB, line(CARD.stems, 1.5) + line(CARD.twigs, 0.9) + fill(CARD.petals) + fill(CARD.leaves));
const DOTS = svgUrl(VB, fill(CARD.dots));

// The liner: a looser repeat of blossoms, drawn on a 120 × 120 tile.
const TILE = merge(
  branch([[-8, 30], [30, 20], [70, 46], [92, 88]], 41, { flowers: 7, size: 6 }),
  branch([[60, -6], [86, 8], [116, 20], [128, 52]], 43, { flowers: 4, size: 5.5 }),
);
const TILE_FOIL = svgUrl("0 0 120 120", line(TILE.stems, 1.1) + line(TILE.twigs, 0.7) + fill(TILE.petals) + fill(TILE.leaves));

export function Card({ r }: { r: Resolved }) {
  return (
    <>
      <span className="gb-wash" />
      <span className="gb-wash gb-wash-2" />
      <Masked url={FOIL} className="st-foil gb-art" />
      <Masked url={DOTS} className="gb-art gb-dots" />
      <CardText r={r} className="gb-text" />
    </>
  );
}

export function Liner() {
  return (
    <div className="gb-liner">
      <span className="gb-wash" />
      <span className="st-foil gb-liner-foil" style={{ WebkitMaskImage: TILE_FOIL, maskImage: TILE_FOIL }} />
    </div>
  );
}
