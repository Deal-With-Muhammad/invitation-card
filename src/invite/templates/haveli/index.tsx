import type { CSSProperties } from "react";

import { makePainted } from "../painted/kit";

import "./haveli.css";

// Haveli: the Jharokha painting with a filmed opening. The carved doors swing open on
// video (public/art/haveli/open.*) and the film lands on the marble window, where the
// names rise in; light still drifts through the jali.

// Dust motes: left %, top %, size (u), seconds, delay (s).
const MOTES: [number, number, number, number, number][] = [
  [30, 62, 3, 13, 0],
  [44, 78, 2.2, 15, 3.5],
  [58, 56, 2.8, 12, 6],
  [70, 72, 2, 16, 1.5],
  [36, 88, 2.4, 14, 8],
  [64, 90, 3.2, 17, 4.5],
  [50, 66, 1.8, 11, 9.5],
];

function WindowLight() {
  return (
    <span className="jk-light" aria-hidden>
      <span className="jk-jali" />
      {MOTES.map(([x, y, s, d, l], i) => (
        <i key={i} style={{ "--x": `${x}%`, "--y": `${y}%`, "--s": s, "--d": `${d}s`, "--l": `${-l}s` } as CSSProperties} />
      ))}
    </span>
  );
}

export const haveli = makePainted("haveli", {
  cover: { kind: "film", art: "doors", hint: "light" },
  text: { top: "36.6%", width: 204 },
  HeroArt: WindowLight,
  stripY: "88%",
  stripH: 74,
});
