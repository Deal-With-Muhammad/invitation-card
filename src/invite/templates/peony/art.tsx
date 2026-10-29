import type { Resolved } from "../../resolve";
import { bud, circle, type Layer, leaf, peony, polar, type Pt, rand, rose, vein } from "../stationery/flora";
import { CardText, Paint } from "../stationery/kit";

// Peony Arch: watercolour peonies, garden roses, buds and greenery climbing into an
// arch over the names. Drawn in the card's 280 × 392 box.

const W = 280;

/** A point on the arch, t from 0 (bottom left) through 0.5 (top) to 1 (bottom right). */
const arch = (t: number): Pt => {
  const a = Math.PI * (1 - t);
  return [140 + Math.cos(a) * 112, 330 - Math.sin(a) * 270];
};

function greenery(seed: number): Layer[] {
  const r = rand(seed);
  let blades = "";
  let veins = "";
  let round = "";
  for (let i = 0; i < 96; i++) {
    const t = r();
    const p = arch(t);
    const out = Math.atan2(p[1] - 250, p[0] - 140) + (r() - 0.5) * 1.6;
    const len = 16 + r() * 18;
    if (r() < 0.62) {
      blades += leaf(p, out, len, len * 0.28, (r() - 0.5) * 0.8);
      veins += vein(p, out, len, len * 0.28, 0);
    } else {
      // eucalyptus: little round leaves along a twig
      for (let k = 0; k < 4; k++) round += circle(polar(p, out, 6 + k * 6), 4.2 - k * 0.6);
    }
  }
  return [
    { d: blades, c: "la" },
    { d: round, c: "lb pa-euc" },
    { d: veins, c: "lv" },
  ];
}

const FLOWERS: Layer[] = [
  ...greenery(7),
  ...rose(arch(0.03), 19, 3, 0.4),
  ...bud(polar(arch(0.08), -2.4, 12), -2.4, 17, 2),
  ...rose(arch(0.11), 15, 23, 1.1),
  ...peony(arch(0.19), 34, 5, 0.2),
  ...rose(arch(0.3), 25, 9, -0.6, 0.84),
  ...bud(polar(arch(0.36), -2.2, 20), -2.0, 15, 4),
  ...rose(arch(0.4), 17, 25, 0.3),
  ...peony(arch(0.5), 42, 11, 0),
  ...rose(arch(0.61), 24, 13, 0.8, 0.84),
  ...bud(polar(arch(0.66), -1, 20), -0.9, 16, 6),
  ...peony(arch(0.8), 33, 15, -0.3),
  ...rose(arch(0.9), 15, 27, -0.5),
  ...rose(arch(0.97), 18, 17, 0.6),
];

const VB = `0 0 ${W} 392`;

// a looser scatter for the liner
const LINER: Layer[] = [
  ...peony([30, 30], 26, 31, 0),
  ...rose([110, 78], 17, 33, 1),
  ...peony([90, 16], 18, 35, 2),
  ...rose([20, 104], 13, 37, 0.3),
];

export function Card({ r }: { r: Resolved }) {
  return (
    <>
      <Paint vb={VB} layers={FLOWERS} className="pa-art" />
      <CardText r={r} className="pa-text" />
    </>
  );
}

export function Liner() {
  return (
    <span className="pa-liner">
      <Paint vb="0 0 140 120" layers={LINER} className="pa-liner-art" />
      <Paint vb="0 0 140 120" layers={LINER} className="pa-liner-art is-2" />
    </span>
  );
}
