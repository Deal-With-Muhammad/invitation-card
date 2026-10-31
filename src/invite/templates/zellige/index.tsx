import { makePainted } from "../painted/kit";

import "./zellige.css";

// Zellige: a riad courtyard wall. Closed, a glazed eight-point star rosette with the
// initials in gold at its heart; it spins half a turn and lifts away to reveal a
// carved plaster arch framed in teal and ochre zellige, with water light from the
// courtyard fountain rippling slowly across the plaster.

function WaterLight() {
  return (
    <span className="zl-water" aria-hidden>
      <i />
      <i />
    </span>
  );
}

export const zellige = makePainted("zellige", {
  cover: { kind: "film", art: "fclosed", hint: "light", seal: { x: "50%", y: "48.4%", size: 124, look: "foil" } },
  text: { top: "24.5%", width: 224 },
  HeroArt: WaterLight,
  stripY: "2%",
  stripH: 70,
});
