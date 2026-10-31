import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./silkribbon.css";

// Silk Ribbon: a sage silk bow unties and the box opens on an arched card. A filmed opening (public/art/silkribbon/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const silkribbon = makePainted("silkribbon", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  text: { top: "24%", width: 212 },
  stripY: "95%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
