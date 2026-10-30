import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./chandelier.css";

// Chandelier: a dark ballroom lights up for the reception. A filmed opening (public/art/chandelier/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const chandelier = makePainted("chandelier", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "32%", width: 282 },
  stripY: "93%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 14 });
  },
});
