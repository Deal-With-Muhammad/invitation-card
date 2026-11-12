import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./majlis.css";

// Majlis: carved walnut doors inlaid with brass stars, in an arch of white plasterwork. On the film
// (public/art/majlis/open.*) they open on an indigo night with a crescent moon over a tiled
// fountain; the names sit in the sky under the moon.

export const majlis = makePainted("majlis", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "25.5%", width: 168, tone: "light", glow: false },
  stripY: "98%",
  body: { bands: ["rsvp"], countdown: "arch", window: "horseshoe", heading: "script", date: "seal", buttons: "pill", timeline: "line", trimY: "98%", art: { trim: false, motif: false, frame: false } },
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
