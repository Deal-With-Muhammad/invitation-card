import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./cypress.css";

// Cypress Walk: a painted cypress path to an Italian villa at golden hour. The closed screen shows
// the bride and groom from behind; on the film (public/art/cypress/open.*) they walk away down the
// path and the names rise into the sky.

export const cypress = makePainted("cypress", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "8%", width: 290 },
  stripY: null,
  body: { bands: ["rsvp"], countdown: "line", window: "arch", heading: "script", date: "row", buttons: "pill", timeline: "line", trimY: "66%", art: { trim: false, motif: false, frame: false } },
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
