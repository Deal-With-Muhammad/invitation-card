import type { Resolved } from "../../resolve";
import { bez, circle, type Curve, cupFlower, type Layer, lavender, leavesAlong, polar, poppy, rand, rayFlower, stem } from "../stationery/flora";
import { CardText, Paint } from "../stationery/kit";

// Wildflower Lane: tiny meadow flowers growing up both sides of a gold-framed
// card. Each flower family has its own hue class (h1 is the palette accent).

type Kind = "cosmos" | "daisy" | "buttercup" | "cornflower" | "poppy" | "forget" | "lavender";
const KINDS: Kind[] = ["cosmos", "daisy", "cornflower", "buttercup", "poppy", "cosmos", "forget", "lavender", "daisy", "cosmos", "buttercup", "cornflower"];

function flower(kind: Kind, c: [number, number], s: number, seed: number): Layer[] {
  const r = rand(seed);
  switch (kind) {
    case "cosmos":
      return [
        { d: rayFlower(c, s, 8, seed, { teeth: 3, w: 0.36, rot: r(), sy: 0.9 }), c: "fa h1" },
        { d: circle(c, s * 0.22), c: "ce h2" },
      ];
    case "daisy":
      return [
        { d: rayFlower(c, s * 0.9, 15, seed, { w: 0.13, round: 0.9, rot: r(), sy: 0.88 }), c: "fa h5" },
        { d: circle(c, s * 0.26), c: "ce h2" },
      ];
    case "buttercup":
      return [
        { d: cupFlower(c, s * 0.7, seed, 5, r() * 6), c: "fa h2" },
        { d: circle(c, s * 0.16), c: "ce h4" },
      ];
    case "cornflower":
      return [
        { d: rayFlower(c, s * 0.85, 9, seed, { teeth: 4, w: 0.2, rot: r(), sy: 0.92 }), c: "fa h3" },
        { d: circle(c, s * 0.2), c: "ce h3" },
      ];
    case "poppy":
      return poppy(c, s * 0.85, seed, r() * 6).map((l) => ({ ...l, c: `${l.c} h4` }));
    case "forget": {
      let d = "";
      let ce = "";
      for (let i = 0; i < 4; i++) {
        const p = polar(c, i * 1.7 + r(), s * (0.2 + r() * 0.4));
        d += cupFlower(p, s * 0.32, seed + i, 5, r() * 6);
        ce += circle(p, s * 0.07);
      }
      return [
        { d, c: "fa h3" },
        { d: ce, c: "ce h2" },
      ];
    }
    case "lavender":
      return [{ d: lavender([[c[0], c[1] + s * 1.6], [c[0] - 1, c[1] + s], [c[0] + 1, c[1] + s * 0.4], [c[0], c[1] - s * 0.8]], 7, s * 0.3, seed), c: "fa h6" }];
  }
}

/** One side of the meadow: stems rising from the bottom edge to staggered heights. */
function meadow(x0: number, x1: number, seed: number): Layer[] {
  const r = rand(seed);
  const stems: string[] = [];
  const leaves: string[] = [];
  const veins: string[] = [];
  const heads: Layer[] = [];
  const n = 13;
  for (let i = 0; i < n; i++) {
    const top = 22 + (i / n) * 330 + (r() - 0.5) * 24;
    const x = x0 + r() * (x1 - x0);
    const base = x0 + (x1 - x0) / 2 + (r() - 0.5) * 30;
    const cv: Curve = [
      [base, 400],
      [base + (r() - 0.5) * 20, 400 - (400 - top) * 0.35],
      [x + (r() - 0.5) * 20, top + (400 - top) * 0.3],
      [x, top],
    ];
    stems.push(stem(cv, 1.5, 0.8));
    const lv = leavesAlong(cv, 3 + Math.floor(r() * 3), 14, seed * 3 + i, { from: 0.15, to: 0.7, w: 0.22 });
    leaves.push(lv.blades);
    veins.push(lv.veins);
    const kind = KINDS[(i + seed) % KINDS.length];
    heads.push(...flower(kind, cv[3], 9 + r() * 4, seed * 11 + i));
    // a side bud now and then
    if (r() > 0.55) {
      const p = bez(cv, 0.55);
      heads.push({ d: circle(polar(p, -1.2 + r() * 2.4, 6), 2.6), c: "fb h1" });
    }
  }
  return [
    { d: stems.join(""), c: "sm" },
    { d: leaves.join(""), c: "la" },
    { d: veins.join(""), c: "lv" },
    ...heads,
  ];
}

const ART: Layer[] = [...meadow(8, 54, 3), ...meadow(226, 272, 7)];
const VB = "0 0 280 392";

export function Card({ r }: { r: Resolved }) {
  return (
    <>
      <span className="wf-frame" />
      <Paint vb={VB} layers={ART} className="wf-art" />
      <CardText r={r} className="wf-text" />
    </>
  );
}

export function Liner() {
  return <span className="wf-liner" />;
}
