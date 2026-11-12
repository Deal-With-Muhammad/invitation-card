import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./porcelain.css";

// Porcelain: blue-and-white porcelain painting. An envelope of cobalt peonies and birds with a
// cobalt wax seal carrying the initials; on the film (public/art/porcelain/open.*) the seal lifts
// and the card rises, the names inside its gold arch.

export const porcelain = makePainted("porcelain", {
  cover: {
    kind: "film", art: "closed", hint: "light",
    // measured on the closed art: the plain face of the wax seal
    seal: { x: "50.2%", y: "50.2%", size: 100, look: "wax" },
  },
  text: { top: "22%", width: 226, glow: false },
  stripY: "98%",
  body: { bands: ["countdown", "rsvp"], countdown: "arch", window: "arch", heading: "serif", date: "seal", buttons: "pill", timeline: "line", trimY: "98%", art: { trim: false, motif: false, frame: false } },
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
