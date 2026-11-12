import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./amalfi.css";

// Amalfi: sea-blue shutters hung with lemon branches. On the film (public/art/amalfi/open.*) they
// swing open on the sea and a cliffside village; the names sit in the sky between the lemons.

export const amalfi = makePainted("amalfi", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  text: { top: "29%", width: 172 },
  stripY: "99%",
  body: { bands: ["rsvp"], countdown: "tiles", window: "arch", heading: "script", date: "row", buttons: "square", timeline: "rows", trimY: "99.5%", art: { trim: false, motif: false, frame: false } },
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
