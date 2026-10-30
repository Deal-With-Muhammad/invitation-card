import { fall, GOLD, tapToThrow } from "../painted/fx";
import { makePainted } from "../painted/kit";

import "./gilded.css";

// Gilded Blossom: a midnight-indigo watercolour on cotton paper with plum blossom
// in hammered gold leaf. It arrives in an indigo envelope with a blush liner and a
// gold seal carrying the initials; the card rises out, a glint runs over the gold
// leaf, and gold petals drift down. Tap the card to shake loose a few more.

function Glint() {
  return <span className="gd-glint" aria-hidden />;
}

export const gilded = makePainted("gilded", {
  cover: { kind: "envelope", art: "closed", hint: "light", seal: { x: "50.1%", y: "54.1%", size: 62, look: "plain" } },
  text: { top: "46.5%", width: 300, tone: "light" },
  HeroArt: Glint,
  stripY: "3%",
  stripH: 112,
  celebrate: (root) => {
    fall(root, { pieces: GOLD, count: 26, spread: 2.2, dur: [5, 8] });
    tapToThrow(root, ".pt-hero", { pieces: GOLD, count: 8, dur: [2.8, 4.2] });
  },
});
