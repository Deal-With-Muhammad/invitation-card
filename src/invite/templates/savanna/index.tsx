import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./savanna.css";

// Protea: a terracotta handmade-paper envelope with a woven band, a gold seal carrying the initials
// and a dried king protea. On the film (public/art/savanna/open.*) the band slips away and a warm
// ivory card with protea and pampas rises out.

export const savanna = makePainted("savanna", {
  cover: {
    kind: "film", art: "closed", hint: "light",
    // measured on the closed art: the plain face of the wax seal
    seal: { x: "50%", y: "50%", size: 78, look: "emboss" },
  },
  text: { top: "21%", width: 212, glow: false },
  stripY: "92%",
  body: { bands: ["countdown", "rsvp"], countdown: "line", window: "arch", heading: "serif", date: "stack", buttons: "pill", timeline: "rows", trimY: "91%", art: { trim: false, motif: false, frame: false } },
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
