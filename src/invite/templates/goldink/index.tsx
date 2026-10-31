import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./goldink.css";

// Gold Ink: one drop of gold ink blooms into a marbled border. A filmed opening (public/art/goldink/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const goldink = makePainted("goldink", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  text: { top: "25%", width: 236 },
  stripY: "94%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 14 });
  },
});
