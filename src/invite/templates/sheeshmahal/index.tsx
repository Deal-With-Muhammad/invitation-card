import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./sheeshmahal.css";

// Sheesh Mahal: mirror-mosaic doors open into a hall of light. A filmed opening (public/art/sheeshmahal/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const sheeshmahal = makePainted("sheeshmahal", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "27%", width: 262 },
  stripY: "8%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 14 });
  },
});
