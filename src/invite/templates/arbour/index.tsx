import { fall, PINK_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./arbour.css";

// Rose Arbour: a blush embossed envelope with a wax seal opens, a satin bow on a pair of garden gates
// unties and the gates open onto a rose arch over a lake. A filmed opening (public/art/arbour/open.*) plays
// from the closed painting into the opened one; the names rise in once it lands. Made for the Akib & Riza
// custom invitation (src/custom/akib-weds-riza), which shares the art.

export const arbour = makePainted("arbour", {
  cover: {
    kind: "film",
    art: "closed",
    hint: "dark",
    // the seal's plain face sits dead centre of the envelope art
    seal: { x: "50%", y: "50%", size: 104, look: "emboss" },
  },
  text: { top: "16%", width: 250 },
  stripY: "3%",
  celebrate: (root) => {
    fall(root, { pieces: PINK_PETALS, count: 8, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: PINK_PETALS });
  },
});
