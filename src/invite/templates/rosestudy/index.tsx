import { Fragment } from "react";

import type { Resolved } from "../../resolve";
import { makePainted } from "../painted/kit";

import "./rosestudy.css";

// Rose Study: an antique hand-coloured botanical plate of one garden rose. It comes
// wrapped in frosted vellum tied with a silk ribbon, with the names printed on the
// vellum; the ribbon slips off, the vellum lifts away and the rose comes into focus.
// The plate is numbered with the day of the month, and every event is a figure.

const ROMAN: [number, string][] = [
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

function roman(n: number) {
  let out = "";
  for (const [v, s] of ROMAN)
    while (n >= v) {
      out += s;
      n -= v;
    }
  return out;
}

function PlateNo({ r }: { r: Resolved }) {
  const day = Number(r.main?.day ?? r.events[0]?.day);
  if (!day) return null;
  return (
    <span className="rs-plate" aria-hidden>
      Plate {roman(day)}
    </span>
  );
}

function Vellum({ r }: { r: Resolved }) {
  return (
    <>
      <span className="rs-vellum" aria-hidden>
        <span className="rs-v-names">
          {r.people.map((p, i) => (
            <Fragment key={i}>
              {i > 0 && <i>{r.t.and}</i>}
              <span>{p.name}</span>
            </Fragment>
          ))}
        </span>
        {r.when.date && <span className="rs-v-date">{r.when.date}</span>}
      </span>
      <span className="rs-ribbon" aria-hidden>
        <i />
      </span>
    </>
  );
}

export const rosestudy = makePainted("rosestudy", {
  cover: { kind: "lift", hint: "dark", Extra: Vellum },
  text: { top: "65.5%", width: 310, glow: false },
  HeroArt: PlateNo,
  stripY: null,
});
