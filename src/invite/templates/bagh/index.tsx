import { PINK_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./bagh.css";

// Bagh: a Mughal garden gate opens at golden hour. A filmed opening (public/art/bagh/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const bagh = makePainted("bagh", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "28%", width: 214 },
  stripY: "3%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: PINK_PETALS });
  },
});
