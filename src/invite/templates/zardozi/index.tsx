import { fall, GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./zardozi.css";

// Zardozi Box: the Red Velvet painting with a filmed opening. The embroidered lid
// lifts on video (public/art/zardozi/open.*), light spills out, and the film lands on
// the ivory silk card where the names rise in. Gold flakes fall once it's open.

export const zardozi = makePainted("zardozi", {
  cover: { kind: "film", art: "lid", hint: "light", seal: { x: "50%", y: "48.5%", size: 112, look: "thread" } },
  text: { top: "24%", width: 286 },
  stripY: "2%",
  stripH: 104,
  celebrate: (root) => {
    fall(root, { pieces: GOLD, count: 30, spread: 1.6 });
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 14 });
  },
});
