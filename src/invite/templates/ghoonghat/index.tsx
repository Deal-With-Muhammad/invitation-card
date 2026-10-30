import { fall, RED_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./ghoonghat.css";

// Ghoonghat: a red bridal dupatta lifts off a rose and motia arch. A filmed opening (public/art/ghoonghat/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const ghoonghat = makePainted("ghoonghat", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "24%", width: 232 },
  stripY: "96%",
  celebrate: (root) => {
    fall(root, { pieces: RED_PETALS, count: 14, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: RED_PETALS });
  },
});
