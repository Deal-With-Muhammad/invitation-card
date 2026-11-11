import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./emerald.css";

// Emerald Deco: emerald velvet curtains and brass lamps. On the film (public/art/emerald/open.*)
// the curtains part on a gold art-deco arch drawn on a deep green wall; the names sit inside it in
// gold.

export const emerald = makePainted("emerald", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "30%", width: 176, tone: "light", glow: false },
  stripY: "97%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
