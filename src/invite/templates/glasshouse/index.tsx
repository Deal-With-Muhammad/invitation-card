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
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 10 });
  },
});
