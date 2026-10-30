import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./ringbox.css";

// Ring Box: an emerald velvet ring box opens. A filmed opening (public/art/ringbox/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const ringbox = makePainted("ringbox", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  text: { top: "9%", width: 292 },
  stripY: null,
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 14 });
  },
});
