import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./lanterns.css";

// Lantern Mehrab: brass lanterns light up a marble mehrab. A filmed opening (public/art/lanterns/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const lanterns = makePainted("lanterns", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "30%", width: 212 },
  stripY: "93%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 14 });
  },
});
