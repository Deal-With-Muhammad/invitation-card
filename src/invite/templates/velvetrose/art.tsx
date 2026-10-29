import type { Resolved } from "../../resolve";
import { circle, fill, leaf, leafLine, line, mapPath, place, type Pt, roseLine, svgUrl } from "../stationery/flora";
import { CardText, Masked } from "../stationery/kit";

// Red Velvet: an ivory card with a gold-foil rose crest and a fine gold border, sent
// in a velvet envelope sealed with wax. Drawn in the card's 280 × 392 box.

/** A crest of three engraved roses with leaves, drawn around (0, 0). */
function crest() {
  let lines = roseLine([0, -2], 19, 0.3, 3) + roseLine([-31, 10], 13, 1.4, 5) + roseLine([31, 10], 13, -0.9, 7);
  let solid = "";
  const leaves: [Pt, number, number][] = [
    [[-44, 18], 2.75, 22],
    [[-40, 4], 3.5, 18],
    [[44, 18], 0.4, 22],
    [[40, 4], -0.35, 18],
    [[-14, 22], 1.95, 16],
    [[14, 22], 1.2, 16],
    [[-18, -16], 3.9, 13],
    [[18, -16], -0.75, 13],
  ];
  for (const [p, a, l] of leaves) {
    solid += leaf(p, a, l, l * 0.32, 0.2);
    lines += leafLine(p, a, l, l * 0.32, 0.2);
  }
  const berries: Pt[] = [[-56, 24], [56, 24], [-50, 30], [50, 30], [0, 30]];
  return { lines, solid, berries };
}

const C = crest();
const TOP = place([140, 64], 0, 1, 1);
const BOTTOM = place([140, 346], Math.PI, 1, 0.62);
const both = (d: string) => mapPath(d, TOP) + mapPath(d, BOTTOM);
const berries = C.berries.map((p) => circle(TOP(p), 1.8) + circle(BOTTOM(p), 1.2)).join("");

const VB = "0 0 280 392";
const FOIL = svgUrl(VB, line(both(C.lines), 1) + fill(both(C.solid) + berries));

export function Card({ r }: { r: Resolved }) {
  return (
    <>
      <span className="vr-border" />
      <Masked url={FOIL} className="st-foil vr-art" />
      <CardText r={r} className="vr-text" rule={<span className="vr-rule" />} />
    </>
  );
}

export function Liner() {
  return <span className="st-foil vr-liner" />;
}
