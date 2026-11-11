import { fall, RED_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./mangni.css";

// Mangni: an embroidered cloth slides off two rings. A filmed opening (public/art/mangni/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const mangni = makePainted("mangni", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  text: { top: "5.5%", width: 292 },
  stripY: null,
  celebrate: (root) => {
    fall(root, { pieces: RED_PETALS, count: 14, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: RED_PETALS });
  },
});
