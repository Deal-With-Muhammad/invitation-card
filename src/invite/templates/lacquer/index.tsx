import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./lacquer.css";

// Lacquer Doors: red lacquer doors with gold studs under silk lanterns. On the film
// (public/art/lacquer/open.*) they swing open on a round moon gate wreathed in peonies; the names
// sit inside the circle.

export const lacquer = makePainted("lacquer", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "31%", width: 204, glow: false },
  stripY: null,
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 12 });
  },
});
