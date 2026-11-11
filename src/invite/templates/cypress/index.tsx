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
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
