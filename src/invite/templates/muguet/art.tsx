import type { Resolved } from "../../resolve";
import { bell, bez, type Curve, type Layer, leaf, mapPath, place, type Pt, rand, stem, vein } from "../stationery/flora";
import { CardText, Paint } from "../stationery/kit";

// Lily of the Valley: arching sprays of little white bells with their long leaves,
// curling in from the corners of a fine gold frame. Drawn in the card's 280 × 392 box.

/** One spray drawn upright from (0, 0): the stem rises and bows over, bells hang below. */
function spray(seed: number): Layer[] {
  const r = rand(seed);
  const cv: Curve = [[0, 0], [-3, -70], [8, -130], [46, -156]];
  let bells = "";
  let shades = "";
  let pedicels = "";
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = 0.42 + (i / n) * 0.58;
    const p = bez(cv, t);
    const size = 11.5 - i * 0.75;
    const end: Pt = [p[0] + 3 + i * 0.4, p[1] + size * 0.95];
    pedicels += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}Q${(p[0] + 4).toFixed(1)} ${(p[1] + 1).toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
    const tilt = (r() - 0.5) * 0.25;
    bells += bell(end, size, tilt);
    shades += mapPath(bell([0, 0], 1, 0), (q) => place(end, tilt, 1, size)([q[0] * 0.5 - 0.17, q[1] * 0.96 + 0.04]));
  }
  // two broad leaves sheltering the stem
  const L: [Pt, number, number, number, number][] = [
    [[-2, 8], -1.86, 128, 24, 0.3],
    [[3, 8], -1.28, 104, 21, -0.4],
  ];
  return [
    { d: L.map(([b, a, l, w, bd]) => leaf(b, a, l, w, bd)).join(""), c: "la" },
    { d: L.map(([b, a, l, w, bd]) => vein(b, a, l, w, bd)).join(""), c: "lv" },
    { d: stem(cv, 2.6, 1.2), c: "sm" },
    { d: pedicels, c: "mg-ped" },
    { d: bells, c: "fa" },
    { d: shades, c: "fb" },
  ];
}

const base = spray(3);
const put = (c: Pt, rot: number, s: number, flip = false): Layer[] =>
  base.map((l) => ({ ...l, d: mapPath(l.d, (q) => place(c, rot, 1, s)([flip ? -q[0] : q[0], q[1]])) }));

const ART: Layer[] = [...put([34, 382], -0.04, 0.98), ...put([246, 384], 0.04, 0.88, true)];

const VB = "0 0 280 392";

export function Card({ r }: { r: Resolved }) {
  return (
    <>
      <span className="mg-frame" />
      <Paint vb={VB} layers={ART} className="mg-art" />
      <CardText r={r} className="mg-text" />
    </>
  );
}

export function Liner() {
  return <span className="st-foil mg-liner" />;
}
