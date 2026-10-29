import type { Resolved } from "../../resolve";
import { bez, bezAngle, circle, type Curve, curve, fill, leafLine, line, polar, rand, roseLine, svgUrl } from "../stationery/flora";
import { CardText, Masked, Monogram } from "../stationery/kit";

// Gilded Wreath: a fine gold-foil wreath of engraved roses, leaves, berries and
// tendrils around the names, with the couple's initials at the top. Line art only,
// so it reads like foil-stamped stationery. Drawn in the card's 280 × 392 box.

const LEFT: Curve = [[136, 366], [22, 352], [10, 92], [112, 40]];
const RIGHT: Curve = [[144, 366], [258, 352], [270, 92], [168, 40]];

let lines = "";
let solid = "";

function wreathSide(cv: Curve, seed: number, flip: number) {
  const r = rand(seed);
  lines += curve(cv);
  const n = 26;
  for (let i = 0; i < n; i++) {
    const t = 0.04 + (i / n) * 0.94;
    const p = bez(cv, t);
    const a = bezAngle(cv, t);
    const side = i % 2 ? 1 : -1;
    const len = 13 + r() * 6;
    lines += leafLine(p, a + side * (0.7 + r() * 0.25), len, len * 0.3, side * 0.25);
    if (i % 5 === 2) {
      // a sprig of berries
      const bp = polar(p, a - side * 1.1, 9);
      lines += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${bp[0].toFixed(1)} ${bp[1].toFixed(1)}`;
      for (let k = 0; k < 3; k++) solid += circle(polar(bp, a + k * 2.1, 3), 1.7);
    }
    if (i % 6 === 4) {
      // a curling tendril
      const tp: [number, number][] = [];
      for (let k = 0; k <= 8; k++) tp.push(polar(polar(p, a + side * 1.4, 6), a + side * (1.4 + k * 0.55), 7 - k * 0.7));
      lines += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}` + tp.map((q) => `L${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("");
    }
  }
  for (const [t, R] of [
    [0.1, 15],
    [0.5, 13],
    [0.84, 11],
  ]) {
    const p = polar(bez(cv, t), bezAngle(cv, t) - flip * 1.5, 2);
    lines += roseLine(p, R, r() * 6, seed + t * 10);
  }
}

wreathSide(LEFT, 3, 1);
wreathSide(RIGHT, 9, -1);
// the crossing at the bottom: a larger rose over the meeting stems
lines += roseLine([140, 362], 17, 0.4, 21);

const VB = "0 0 280 392";
const FOIL = svgUrl(VB, line(lines, 1.05) + fill(solid));

export function Card({ r }: { r: Resolved }) {
  return (
    <>
      <span className="fg-border" />
      <Masked url={FOIL} className="st-foil fg-art" />
      <Monogram r={r} className="fg-mono" />
      <CardText r={r} className="fg-text" rule={<span className="fg-rule" />} />
    </>
  );
}

export function Liner() {
  return <span className="st-foil fg-liner" />;
}
