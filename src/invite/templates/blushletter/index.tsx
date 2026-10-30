import { fall, PINK_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./blushletter.css";

// Blush Letter: a wax-sealed envelope opens into the card. A filmed opening (public/art/blushletter/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const blushletter = makePainted("blushletter", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  text: { top: "26%", width: 282 },
  stripY: "4%",
  celebrate: (root) => {
    fall(root, { pieces: PINK_PETALS, count: 14, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: PINK_PETALS });
  },
});
