import { GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./mor.css";

// Mor: a peacock fans its jewelled tail. A filmed opening (public/art/mor/open.*) plays from
// the closed painting into the opened one; the names rise in once it lands.

export const mor = makePainted("mor", {
  cover: { kind: "film", art: "closed", hint: "dark" },
  text: { top: "12%", width: 236 },
  stripY: "3%",
  celebrate: (root) => {
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 14 });
  },
});
