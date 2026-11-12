import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./glasshouse.css";

// Glasshouse: a white Victorian conservatory. On the film (public/art/glasshouse/open.*) the mist
// clears from its glass doors and they open on an aisle of white flowers; the names sit in the
// light under the glass roof.

export const glasshouse = makePainted("glasshouse", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  text: { top: "24%", width: 196 },
  stripY: "93%",
  body: { bands: ["rsvp"], countdown: "arch", window: "gothic", heading: "script", date: "stack", buttons: "pill", timeline: "line", trimY: "93%", art: { trim: false, motif: false, frame: false } },
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 10 });
  },
});
