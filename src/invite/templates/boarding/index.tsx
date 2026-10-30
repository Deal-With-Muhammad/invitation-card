import type { CSSProperties } from "react";

import type { Resolved } from "../../resolve";
import { initials, makePainted } from "../painted/kit";

import "./boarding.css";

// Boarding Pass: a green wedding passport with a gold crest of two rings, lying on
// an old map. It is lifted up, the cover swings open on its spine, and the visa page
// inside gets a stamp for every event, with its date and venue. A boarding pass
// from one initial to the other sits under the names.

function Cover({ r }: { r: Resolved }) {
  const [a, b] = initials(r);
  return (
    <span className="bp-cover" aria-hidden>
      <span className="bp-c-top">
        <small>Wedding</small>
        Passport
      </span>
      <span className="bp-c-ini">
        {a}
        {b && (
          <>
            <i>&amp;</i>
            {b}
          </>
        )}
      </span>
      <span className="bp-chip" />
    </span>
  );
}

function Ticket({ r }: { r: Resolved }) {
  const [a, b] = initials(r);
  if (!b) return null;
  return (
    <div className="bp-ticket" aria-hidden>
      <span className="bp-t-cell">
        <small>From</small>
        <b>{a}</b>
      </span>
      <span className="bp-t-plane" />
      <span className="bp-t-cell">
        <small>To</small>
        <b>{b}</b>
      </span>
      <span className="bp-t-cell is-seat">
        <small>Seat</small>
        <b>Any</b>
      </span>
    </div>
  );
}

// Stamp spots on the visa page: left %, top %, turn (deg), shape.
const SPOTS: [number, number, number, string][] = [
  [30, 67, -9, "round"],
  [71, 70, 7, "box"],
  [37, 84.5, 4, "oval"],
  [74, 86, -6, "round"],
];
const ONE: [number, number, number, string] = [50, 73, -6, "round"];

function Stamps({ r }: { r: Resolved }) {
  const evs = r.events.filter((e) => e.day).slice(0, 4);
  return (
    <span className="bp-stamps" aria-hidden>
      {evs.map((e, i) => {
        const [x, y, rot, shape] = evs.length === 1 ? ONE : SPOTS[i];
        return (
          <span
            key={e.id}
            className={`bp-stamp is-${shape} c${i % 3}`}
            style={{ "--x": `${x}%`, "--y": `${y}%`, "--r": `${rot}deg`, "--i": i } as CSSProperties}
          >
            <small>{e.title}</small>
            <b>
              {e.day} {e.monthShort}
            </b>
            <em>{e.year}</em>
            {e.venue && <small className="bp-s-venue">{e.venue}</small>}
          </span>
        );
      })}
    </span>
  );
}

export const boarding = makePainted("boarding", {
  cover: { kind: "swing", art: "closed", hint: "light", Extra: Cover },
  text: { top: "17%", width: 310, glow: false },
  HeroArt: Stamps,
  HeroAfter: Ticket,
  heroShow: { venue: false },
  stripY: "2%",
  stripH: 96,
});
