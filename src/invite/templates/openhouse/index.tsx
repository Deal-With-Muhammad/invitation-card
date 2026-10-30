import type { Resolved } from "../../resolve";
import { Art, makePainted } from "../painted/kit";

import "./openhouse.css";

// Open House: the painted front door of a family home, with the family's names on the
// brass plate beside it and the day of the month as the house number. Tap and the
// door knocks twice, swings inward on warm light, and you walk through the doorway
// into the living room.

const POS = "100% 50%";
const en = (r: Resolved) => r.lang === "en";

/** The door leaf (a copy of the door from the art, so it can swing), the light
 *  behind it, the house number and the name plate. */
function Door({ r }: { r: Resolved }) {
  return (
    <span className="oh-push" aria-hidden>
      <span className="oh-light" />
      <span className="oh-leaf">
        <Art id="openhouse" name="closed" pos={POS} />
        {r.main?.day && <b className="oh-no">{r.main.day}</b>}
      </span>
      <span className="oh-plate">{r.people.map((p) => p.name).join(` ${r.t.and} `)}</span>
    </span>
  );
}

/** A coir doormat on the threshold. */
function Mat({ r }: { r: Resolved }) {
  return (
    <span className="oh-mat" aria-hidden>
      <span>{en(r) ? "Welcome" : r.t.youAreInvited}</span>
    </span>
  );
}

export const openhouse = makePainted("openhouse", {
  cover: {
    kind: "zoom",
    art: "closed",
    pos: POS,
    hint: "light",
    hintText: (r) => (en(r) ? "Tap to knock" : r.t.tapToOpen),
    Extra: Door,
  },
  text: { top: "11%", width: 262 },
  HeroArt: Mat,
  stripY: "87%",
  stripH: 100,
});
