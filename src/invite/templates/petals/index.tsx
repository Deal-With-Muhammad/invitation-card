import { fall, RED_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./petals.css";

// Rose Shower: gul-pashi. The names sit on white marble inside a ring of rose petals
// and motia; the cover is a heap of petals that bursts when tapped, and guests can
// keep throwing petals by tapping anywhere on the card.

export const petals = makePainted("petals", {
  cover: {
    kind: "zoom",
    art: "heap",
    hint: "light",
    onTap: (root) =>
      fall(root, { pieces: RED_PETALS, count: 46, spread: 0.25, dur: [1.8, 3.2], from: { x: window.innerWidth / 2, y: window.innerHeight * 0.48 } }),
  },
  text: { top: "26%", width: 262 },
  stripY: "99%",
  celebrate: (root) => tapToThrow(root, ".pt-hero, .inv-closing", { pieces: RED_PETALS, count: 12 }),
});
