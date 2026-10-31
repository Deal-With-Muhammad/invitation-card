import { fall, GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./velvetrose.css";

// Red Velvet: a shaadi box in crushed oxblood velvet, embroidered in gold zardozi.
// The lid hinges up and the ivory silk card inside, with its zardozi borders, is
// the invitation. Gold flakes fall when it opens.

export const velvetrose = makePainted("velvetrose", {
  cover: { kind: "film", art: "fclosed", hint: "light", seal: { x: "50%", y: "48.5%", size: 112, look: "thread" } },
  text: { top: "24%", width: 286 },
  stripY: "2%",
  stripH: 104,
  celebrate: (root) => {
    fall(root, { pieces: GOLD, count: 30, spread: 1.6 });
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 14 });
  },
});
