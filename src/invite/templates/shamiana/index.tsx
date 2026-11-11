import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./shamiana.css";

// Shamiana: fairy lights switch on across a wedding marquee. A filmed opening (public/art/shamiana/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const shamiana = makePainted("shamiana", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "26%", width: 262 },
  stripY: "4%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 14 });
  },
});
