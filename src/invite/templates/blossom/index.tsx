import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./blossom.css";

// Blossom: a bare branch bursts into white cherry blossom. A filmed opening (public/art/blossom/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const blossom = makePainted("blossom", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  text: { top: "33%", width: 270 },
  stripY: "95%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
