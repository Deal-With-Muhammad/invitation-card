import { fall, PINK_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./sakura.css";

// Sakura: shoji paper screens in a tea room. On the film (public/art/sakura/open.*) they slide
// apart on a cherry-blossom garden with a pond and a red bridge; the names sit in the mist.

export const sakura = makePainted("sakura", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  text: { top: "24%", width: 224 },
  stripY: "6%",
  body: { bands: ["rsvp"], countdown: "round", window: "circle", heading: "caps", date: "stack", buttons: "line", timeline: "line", trimY: "5%", art: { trim: false, motif: false, frame: false } },
  celebrate: (root) => {
    fall(root, { pieces: PINK_PETALS, count: 7, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: PINK_PETALS });
  },
});
