import { fall, PINK_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./peony.css";

// Peony Arch: a painted mehrab of peonies, garden roses and ranunculus, hidden under
// a sheer blush dupatta that lifts away. The "With the couple" colourway swaps in the
// same arch with the bride and groom seen from behind.

export const peony = makePainted("peony", {
  cover: { kind: "film", art: "fclosed", hint: "dark" },
  variants: { couple: { hero: "couple", film: "open-couple" } },
  text: { top: "25%", width: 236 },
  stripY: "97%",
  celebrate: (root) => {
    fall(root, { pieces: PINK_PETALS, count: 16, spread: 2.4, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: PINK_PETALS });
  },
});
