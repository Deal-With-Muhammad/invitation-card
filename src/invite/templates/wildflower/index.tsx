import type { CSSProperties } from "react";

import type { Resolved } from "../../resolve";
import { Art, makePainted } from "../painted/kit";

import "./wildflower.css";

// Wildflower Lane: a herbarium page of pressed meadow flowers on handmade paper. The
// seed-paper envelope taped shut over a cornflower drops away, the page rises, and
// a few of the pressed flowers settle onto it one by one. Each section heading has
// one pressed flower; tapping it shows what the flower means on a little tag.

/** Pressed flowers on the hero art (centre and size as fractions of the art). */
const SETTLE = [
  { x: 0.17, y: 0.14, s: 0.2 },
  { x: 0.11, y: 0.45, s: 0.17 },
  { x: 0.21, y: 0.63, s: 0.27 },
  { x: 0.29, y: 0.89, s: 0.2 },
  { x: 0.635, y: 0.885, s: 0.17 },
];

/** Copies of single flowers from the art that settle onto the page as it opens. */
function Settle() {
  return (
    <>
      {SETTLE.map((f, i) => (
        <span key={i} className="wf-settle" style={{ "--fx": f.x, "--fy": f.y, "--fs": f.s, "--k": i } as CSSProperties} aria-hidden>
          <Art id="wildflower" name="hero" />
        </span>
      ))}
    </>
  );
}

/** A handwritten line above the names. */
function Note({ r }: { r: Resolved }) {
  return <p className="wf-note">{r.t.youAreInvited}</p>;
}

/** One pressed flower under each heading, taped down, with its meaning on a tag. */
function Specimen() {
  return (
    <span className="wf-spec" tabIndex={-1}>
      <i className="wf-flower" />
      <i className="wf-tape" />
      <span className="wf-tag" />
    </span>
  );
}

export const wildflower = makePainted("wildflower", {
  cover: { kind: "film", art: "fclosed", hint: "dark" },
  text: { top: "19%", width: 256 },
  HeroArt: Settle,
  HeroAfter: Note,
  Ornament: Specimen,
  stripY: "91%",
  stripH: 116,
});
