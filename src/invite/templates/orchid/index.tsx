import { makePainted } from "../painted/kit";

import "./orchid.css";

// Midnight Orchid: a dark still life of white moth orchids in candlelight. The
// aubergine envelope with its copper seal is burned away by a widening ring of warm
// light from the seal; on the painting the candlelight keeps flickering, slowly.

/** A candle glow flickering at the top right of the closed envelope, and the ring of
 *  warm light at the edge of the burn when it opens. */
function Candle() {
  return (
    <>
      <span className="or-candle" aria-hidden />
      <span className="or-burn" aria-hidden />
    </>
  );
}

/** The candlelight on the painting, and the blacks lifted to aubergine. */
function Light() {
  return (
    <>
      <span className="or-lift" aria-hidden />
      <span className="or-flicker" aria-hidden />
    </>
  );
}

export const orchid = makePainted("orchid", {
  cover: {
    kind: "glow",
    art: "closed",
    hint: "light",
    seal: { x: "50.1%", y: "53.4%", size: 56, look: "foil" },
    Extra: Candle,
  },
  text: { top: "47%", width: 320, tone: "light" },
  HeroArt: Light,
  stripY: "15%",
  stripH: 120,
  panels: "paper",
});
