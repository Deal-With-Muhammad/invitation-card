import type { Resolved } from "../../resolve";
import { bez, bezAngle, type Curve, ellipse, type Layer, leaf, orchid, polar, stem, vein } from "../stationery/flora";
import { CardText, Paint } from "../stationery/kit";

// Midnight Orchid: one arching spray of moth orchids up the left of a dark card.
// Drawn in the card's 280 × 392 box.

const SPIKE: Curve = [[62, 404], [34, 300], [40, 178], [104, 64]];

const flowers: Layer[] = [];
const twigs: string[] = [];
const spots: [number, number, number, number][] = [
  // t along the spike, size, side offset, tilt
  [0.48, 30, 22, 0.25],
  [0.62, 29, -12, -0.15],
  [0.75, 26, 24, 0.35],
  [0.86, 22, 4, 0.1],
];
for (const [i, [t, R, off, tilt]] of spots.entries()) {
  const p = bez(SPIKE, t);
  const a = bezAngle(SPIKE, t) + Math.PI / 2;
  const c = polar(p, a, off);
  twigs.push(`M${p[0].toFixed(1)} ${p[1].toFixed(1)}Q${((p[0] + c[0]) / 2).toFixed(1)} ${(c[1] - 6).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`);
  flowers.push(...orchid(c, R, tilt, 5 + i));
}
const buds = [0.93, 0.97, 1].map((t, i) => ellipse(polar(bez(SPIKE, t), bezAngle(SPIKE, t) + Math.PI / 2, 5 - i), 5.5 - i * 1.2, 4 - i * 0.8, bezAngle(SPIKE, t))).join("");

const LEAVES: [number, number, number, number, number][] = [
  [58, 392, -2.6, 96, 30],
  [66, 394, -0.55, 86, 26],
  [60, 396, -1.9, 70, 22],
];

const ART: Layer[] = [
  { d: LEAVES.map(([x, y, a, l, w]) => leaf([x, y], a, l, w, 0.12)).join(""), c: "la" },
  { d: LEAVES.map(([x, y, a, l, w]) => vein([x, y], a, l, w, 0.12)).join(""), c: "lv" },
  { d: stem(SPIKE, 3, 1.4), c: "sm" },
  { d: stem([[62, 404], [80, 360], [74, 330], [92, 300]], 2, 1) , c: "sm" },
  { d: twigs.join(""), c: "st-twig" },
  { d: buds, c: "fb" },
  ...flowers,
];

const VB = "0 0 280 392";

export function Card({ r }: { r: Resolved }) {
  return (
    <>
      <Paint vb={VB} layers={ART} className="mo-art" />
      <CardText r={r} className="mo-text" rule={<span className="mo-rule" />} />
    </>
  );
}

export function Liner() {
  return <span className="st-foil mo-liner" />;
}
