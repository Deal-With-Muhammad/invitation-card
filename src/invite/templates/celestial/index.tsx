import type { CSSProperties } from "react";

import { Art, makePainted } from "../painted/kit";
import { shootingStars } from "./sky";

import "./celestial.css";

// Celestial: a brass astrolabe, the instrument Muslim astronomers perfected, on
// midnight velvet. Its star rete and plate turn against each other, then it grows
// and dissolves into a painted night sky over the dunes. Stars twinkle, and a tap
// on the sky sends a shooting star across it.

/** The plate and the star rete: round cut-outs of the astrolabe that turn against each other. */
function Rete() {
  return (
    <>
      <span className="cl-ring is-plate" aria-hidden>
        <Art id="celestial" name="closed" />
      </span>
      <span className="cl-ring is-rete" aria-hidden>
        <Art id="celestial" name="closed" />
      </span>
    </>
  );
}

// left %, top %, size (u), seconds, delay (s)
const STARS: [number, number, number, number, number][] = [
  [12, 9, 3, 6, 0],
  [27, 18, 2, 7.5, 2.1],
  [71, 6, 2.4, 5.5, 1.2],
  [86, 22, 3.2, 8, 3.4],
  [8, 31, 2, 6.5, 4.4],
  [93, 38, 2.2, 7, 0.8],
  [18, 47, 2.6, 9, 5.2],
  [82, 54, 2, 6, 2.7],
  [6, 63, 2.4, 8.5, 1.6],
  [91, 70, 2.8, 7, 4],
  [38, 4, 2, 6.8, 3],
  [60, 26, 1.8, 7.8, 5.8],
];

function Stars() {
  return (
    <span className="cl-stars" aria-hidden>
      {STARS.map(([x, y, s, d, l], i) => (
        <i key={i} style={{ "--x": `${x}%`, "--y": `${y}%`, "--s": s, "--d": `${d}s`, "--l": `${-l}s` } as CSSProperties} />
      ))}
    </span>
  );
}

export const celestial = makePainted("celestial", {
  cover: { kind: "zoom", art: "closed", hint: "light", Extra: Rete },
  text: { top: "24%", width: 290, tone: "light" },
  HeroArt: Stars,
  stripY: "99%",
  stripH: 120,
  celebrate: shootingStars,
});
