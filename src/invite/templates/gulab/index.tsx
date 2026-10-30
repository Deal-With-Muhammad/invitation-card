import { fall, RED_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./gulab.css";

// Gulab: a red rosebud blooms open. A filmed opening (public/art/gulab/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const gulab = makePainted("gulab", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "14%", width: 300 },
  stripY: null,
  celebrate: (root) => {
    fall(root, { pieces: RED_PETALS, count: 14, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: RED_PETALS });
  },
});
