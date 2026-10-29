import type { Resolved } from "../../resolve";
import { bud, type Curve, type Layer, rose, roseLeaf, stem, thorns } from "../stationery/flora";
import { CardText, Paint } from "../stationery/kit";

// Rose Study: one painted garden rose on its stem, down the left of an ivory card,
// like a page from a botanical folio. Drawn in the card's 280 × 392 box.

const MAIN: Curve = [[46, 404], [72, 320], [52, 236], [84, 168]];
const SIDE: Curve = [[62, 262], [36, 206], [26, 138], [38, 84]];
const TWIG: Curve = [[60, 300], [86, 278], [106, 268], [128, 262]];

const ART: Layer[] = [
  { d: stem(MAIN, 4.2, 2.6) + stem(SIDE, 2.6, 1.6) + stem(TWIG, 2, 1.1), c: "sm" },
  { d: thorns(MAIN, 6, 3.2, 3) + thorns(SIDE, 4, 2.6, 5), c: "sm" },
  ...roseLeaf([60, 330], -2.5, 70, 11),
  ...roseLeaf([60, 236], -0.25, 64, 13),
  ...roseLeaf([128, 262], -0.2, 50, 17, 1),
  ...roseLeaf([44, 168], -2.2, 52, 19),
  ...bud([38, 86], -1.75, 30, 7),
  ...rose([90, 124], 56, 21, -0.25, 0.8),
];

const VB = "0 0 280 392";

export function Card({ r }: { r: Resolved }) {
  return (
    <>
      <Paint vb={VB} layers={ART} className="rs-art" />
      <CardText r={r} className="rs-text" rule={<span className="rs-rule" />} />
    </>
  );
}

export function Liner() {
  return <span className="st-foil rs-liner" />;
}
