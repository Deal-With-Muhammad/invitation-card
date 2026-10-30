import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./aatishbazi.css";

// Aatishbazi: gold fireworks bloom over a palace. A filmed opening (public/art/aatishbazi/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const aatishbazi = makePainted("aatishbazi", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "24%", width: 262 },
  stripY: "95%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 14 });
  },
});
