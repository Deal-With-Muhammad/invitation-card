import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./songket.css";

// Songket: a maroon songket folder woven with gold, tied with a gold cord and sealed with the
// initials. On the film (public/art/songket/open.*) the cord unties and the flaps open on an ivory
// card bordered in songket with orchids and jasmine.

export const songket = makePainted("songket", {
  cover: {
    kind: "film", art: "closed", hint: "light",
    // measured on the closed art: the plain face of the wax seal
    seal: { x: "50%", y: "49.5%", size: 82, look: "emboss" },
  },
  text: { top: "29%", width: 236, glow: false },
  stripY: "99%",
  body: { bands: ["rsvp"], countdown: "tiles", window: "rect", heading: "caps", date: "row", buttons: "square", timeline: "line", trimY: "99%", art: { trim: false, motif: false, frame: false } },
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
