import { fall, PINK_PETALS, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./hacienda.css";

// Hacienda: wrought-iron gates under a bougainvillea arch. On the film (public/art/hacienda/open.*)
// they swing open on a sunlit courtyard with a tiled fountain; the names sit on the white wall.

export const hacienda = makePainted("hacienda", {
  cover: { kind: "film", art: "closed", hint: "light" },
  text: { top: "25%", width: 168 },
  stripY: "4%",
  celebrate: (root) => {
    fall(root, { pieces: PINK_PETALS, count: 7, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: PINK_PETALS });
  },
});
