import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import { Occasions } from "./occasions";

import "./yaadein.css";

// Yaadein ("memories"), a premium design: a 1990s shaadi-hall stage, all red velvet,
// tinsel streamers and strings of bulbs. A filmed opening (public/art/yaadein/open.*)
// starts on the couple seated on their thrones (faces under the sehra and the dupatta),
// who glow and fade away like a memory, leaving the empty stage; the invitation then
// writes itself over the curtains in gold, in Urdu, Hindi or English. A soft film grain
// and vignette sit over everything. Events are told like an old wedding card
// (./occasions.tsx), followed by "Save as video".

export const yaadein = makePainted("yaadein", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "25%", width: 270, tone: "light", glow: false },
  stripY: null,
  panels: "clear",
  sections: { events: Occasions },
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 14 });
  },
});
