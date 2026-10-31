import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./noor.css";

// Noor: geometric white shutters open and morning light fills a plaster arch. A filmed opening (public/art/noor/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const noor = makePainted("noor", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  text: { top: "12.5%", width: 214 },
  stripY: "94%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
