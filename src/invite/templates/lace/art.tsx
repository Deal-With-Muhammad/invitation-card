import type { Resolved } from "../../resolve";
import { circle, ellipse, leaf, polar, type Pt, smooth, svgUrl } from "../stationery/flora";
import { CardText, Masked } from "../stationery/kit";

// Ivory Lace: a laser-cut lace border. The paper is one mask with the lace cut out
// of it (even-odd holes), lying over a coloured backing card that shows through.
// Drawn in the card's 280 × 392 box.

const W = 280;
const H = 392;

/** Points every `step` along a rectangle inset by `i`, with the direction of travel. */
function around(i: number, step: number) {
  const pts: { p: Pt; a: number }[] = [];
  const sides: [Pt, Pt][] = [
    [[i, i], [W - i, i]],
    [[W - i, i], [W - i, H - i]],
    [[W - i, H - i], [i, H - i]],
    [[i, H - i], [i, i]],
  ];
  for (const [a, b] of sides) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.round(len / step));
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    for (let k = 0; k < n; k++) {
      const t = k / n;
      pts.push({ p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], a: ang });
    }
  }
  return pts;
}

// the scalloped outer edge of the lace paper
const scallops = around(7, 10.8);
const outline: Pt[] = [];
for (const { p, a } of scallops) {
  const out = a - Math.PI / 2;
  outline.push(polar(p, out, -0.6));
  outline.push(polar(polar(p, a, 2.7), out, 2.6));
  outline.push(polar(polar(p, a, 5.4), out, 3.4));
  outline.push(polar(polar(p, a, 8.1), out, 2.6));
}
const OUTER = smooth(outline, true, 0.9);

let holes = "";

// eyelets just inside the scallops
for (const { p, a } of scallops) holes += circle(polar(polar(p, a, 5.4), a + Math.PI / 2, 5), 1.5);

// the band: flowers and leaf pairs alternating along the middle of the border
function flowerHole(c: Pt, R: number, rot: number) {
  let d = "";
  for (let k = 0; k < 6; k++) {
    const a = rot + (k / 6) * Math.PI * 2;
    d += ellipse(polar(c, a, R * 0.62), R * 0.38, R * 0.2, a);
  }
  for (let k = 0; k < 12; k++) d += circle(polar(c, rot + (k / 12) * Math.PI * 2 + 0.26, R * 1.18), R * 0.07);
  return d;
}

const band = around(25, 26);
for (const [k, { p, a }] of band.entries()) {
  if (k % 2 === 0) holes += flowerHole(p, k % 4 === 0 ? 8.2 : 7.2, a);
  else {
    const m = polar(p, a, 0);
    holes += leaf(polar(m, a, -2), a + Math.PI - 0.5, 8.5, 2.6, 0.2) + leaf(polar(m, a, 2), a + 0.5, 8.5, 2.6, -0.2);
    holes += circle(polar(m, a + Math.PI / 2, -7), 1.3) + circle(polar(m, a + Math.PI / 2, 7), 1.3);
  }
}

// a fine row of pin-pricks along the inner edge
for (const { p } of around(40, 5.2)) holes += circle(p, 0.75);

const VB = `0 0 ${W} ${H}`;
const PAPER = svgUrl(VB, `<path fill-rule="evenodd" d="${OUTER}${holes}"/>`);

export function Card({ r }: { r: Resolved }) {
  return (
    <>
      <span className="lc-backing" />
      <span className="lc-paper">
        <Masked url={PAPER} className="lc-sheet" />
      </span>
      <CardText r={r} className="lc-text" rule={<span className="lc-rule" />} />
    </>
  );
}

export function Liner() {
  return <span className="lc-liner" />;
}
