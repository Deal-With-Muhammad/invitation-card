import { fall, PINK_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./aisle.css";

// Clifftop Aisle: a painted ceremony aisle on a cliff above the sea at sunset. The closed screen
// shows the bride and groom from behind; on the film (public/art/aisle/open.*) they walk down the
// aisle to the rose arch and the names rise into the sky.

export const aisle = makePainted("aisle", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "6.5%", width: 290 },
  stripY: null,
  body: { bands: ["countdown", "rsvp"], countdown: "round", window: "oval", heading: "script", date: "stack", buttons: "pill", timeline: "rows", trimY: "97%", art: { trim: false, motif: false, frame: false } },
  celebrate: (root) => {
    fall(root, { pieces: PINK_PETALS, count: 7, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: PINK_PETALS });
  },
});
