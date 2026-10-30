import { fall, RED_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./doli.css";

// Doli: the curtains of a bridal doli part. A filmed opening (public/art/doli/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const doli = makePainted("doli", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "21%", width: 236 },
  stripY: "4%",
  celebrate: (root) => {
    fall(root, { pieces: RED_PETALS, count: 14, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: RED_PETALS });
  },
});
