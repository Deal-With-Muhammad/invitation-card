import { fall, RED_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./mandap.css";

// Mandap: a curtain of marigold and jasmine strings. On the film (public/art/mandap/open.*) it
// parts on a mandap with garlanded pillars and brass lamps; the names sit on the ivory silk behind
// it.

export const mandap = makePainted("mandap", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "33.5%", width: 156, glow: false },
  stripY: "5%",
  celebrate: (root) => {
    fall(root, { pieces: RED_PETALS, count: 7, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: RED_PETALS });
  },
});
