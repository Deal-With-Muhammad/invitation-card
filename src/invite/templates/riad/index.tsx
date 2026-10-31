import { PINK_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./riad.css";

// Riad: linen curtains part on a sunlit courtyard with a reflecting pool. A filmed opening (public/art/riad/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const riad = makePainted("riad", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  text: { top: "7.5%", width: 206 },
  stripY: "95%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: PINK_PETALS, count: 10 });
  },
});
