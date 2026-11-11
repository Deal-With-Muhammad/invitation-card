import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./atelier.css";

// Atelier Blanc: white on white. A cotton envelope embossed with an olive wreath, a dove-grey
// ribbon and a wax seal with the couple's initials; on the film (public/art/atelier/open.*) the
// ribbon unties and the blind-embossed card rises out.

export const atelier = makePainted("atelier", {
  cover: {
    kind: "film", art: "closed", hint: "dark",
    // measured on the closed art: the plain face of the wax seal
    seal: { x: "50%", y: "48.1%", size: 96, look: "emboss" },
  },
  text: { top: "23%", width: 224, glow: false },
  stripY: "5%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
