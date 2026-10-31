import { makePainted } from "../painted/kit";

import "./kashi.css";

// Kashi: Multani blue pottery. Closed, a hand-painted plate hangs on a wall of white
// glazed tiles with the couple's initials brushed into its plain centre in cobalt; it
// turns a quarter and lifts toward you, revealing an arch of kashi tiles. A slow
// highlight slides across the glaze like daylight on a shrine wall.

function Glaze() {
  return (
    <span className="ks-glaze" aria-hidden>
      <i />
    </span>
  );
}

export const kashi = makePainted("kashi", {
  cover: { kind: "film", art: "fclosed", hint: "dark", seal: { x: "49.6%", y: "49.5%", size: 156, look: "ink" } },
  text: { top: "27%", width: 262 },
  HeroArt: Glaze,
  stripY: "100%",
  stripH: 52,
});
