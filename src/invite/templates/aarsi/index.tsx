import { fall, RED_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./aarsi.css";

// Aarsi: a red dupatta slides off a gold mirror. A filmed opening (public/art/aarsi/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const aarsi = makePainted("aarsi", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "15.5%", width: 200 },
  stripY: "96%",
  celebrate: (root) => {
    fall(root, { pieces: RED_PETALS, count: 14, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: RED_PETALS });
  },
});
