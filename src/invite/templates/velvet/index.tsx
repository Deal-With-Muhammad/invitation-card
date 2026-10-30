import type { CSSProperties } from "react";

import type { Resolved } from "../../resolve";
import { Heading } from "../../runtime/sections";
import { sparkles } from "../../runtime/effects";
import { Art, makePainted } from "../painted/kit";
import type { SectionProps } from "../types";

import "./velvet.css";

// Premiere: an old single-screen cinema at night. The cover is an "Admit one" ticket
// that tears along its perforation; the marquee flickers on, its bulbs chase slowly,
// and the names flip onto the blank letter board one letter at a time. The programme
// is a showtimes board.

const en = (r: Resolved) => r.lang === "en";

/** The ticket's printing, in two halves that tear apart with the art. */
function Ticket({ r }: { r: Resolved }) {
  return (
    <>
      <span className="pv-half is-t" aria-hidden>
        <span className="pv-tk is-t">
          <b className="pv-admit">{en(r) ? "Admit one" : r.t.youAreInvited}</b>
          <span className="pv-rule" />
          {r.title && <span className="pv-tk-to">{r.title}</span>}
          <strong className="pv-tk-names">{r.names}</strong>
        </span>
      </span>
      <span className="pv-half is-b" aria-hidden>
        <span className="pv-tk is-b">
          {r.when.weekday && <span className="pv-tk-sc">{r.when.weekday}</span>}
          {r.when.date && <strong className="pv-tk-date">{r.when.date}</strong>}
          {r.when.time && <span className="pv-tk-sc">{r.when.time}</span>}
          {r.main?.venue && r.oneVenue && <em className="pv-tk-venue">{r.main.venue}</em>}
        </span>
      </span>
    </>
  );
}

// Letters joined by a script (Arabic, Urdu, Devanagari…) must stay together to shape.
const latin = (s: string) => /^[\p{Script=Latin}\p{N}\p{P}\s]*$/u.test(s);

/** The names set on the letter board, a letter at a time. */
function Board({ r }: { r: Resolved }) {
  let i = 0;
  const word = (s: string) =>
    latin(s)
      ? Array.from(s).map((ch, k) => (
          <span key={k} className="pv-l" style={{ "--i": i++ } as CSSProperties}>
            {ch === " " ? " " : ch}
          </span>
        ))
      : [
          <span key="w" className="pv-l" style={{ "--i": i++ } as CSSProperties}>
            {s}
          </span>,
        ];
  const len = r.people.reduce((n, p) => n + p.name.length, 0) + (r.people.length > 1 ? 3 : 0);
  return (
    <div className="pv-board" aria-hidden>
      <span className="pv-board-top">{en(r) ? "Now showing" : r.title || r.occasionLabel}</span>
      <span className="pv-board-names" style={{ "--len": Math.max(len, 8) } as CSSProperties}>
        {r.people.map((p, k) => (
          <span key={k} className="pv-w">
            {k > 0 && (
              <span className="pv-l pv-amp" style={{ "--i": i++ } as CSSProperties}>
                {r.t.and}
              </span>
            )}
            {word(p.name)}
          </span>
        ))}
      </span>
    </div>
  );
}

/** The lights coming on, the bulbs chasing slowly, and a shade over the street. */
function Lights() {
  return (
    <>
      <span className="pv-chase is-sign" aria-hidden>
        <Art id="velvet" name="hero" />
      </span>
      <span className="pv-chase is-frame" aria-hidden>
        <Art id="velvet" name="hero" />
      </span>
      <span className="pv-street" aria-hidden />
      <span className="pv-dim" aria-hidden />
    </>
  );
}

/** A strip of film between sections. */
function Film({ index }: { index: number }) {
  return <span className={`pv-film${index % 2 ? " is-flip" : ""}`} />;
}

/** The programme as a showtimes board. */
function Showtimes({ r }: SectionProps) {
  if (!r.show.schedule) return null;
  const rows = r.data.schedule.filter((s) => s.title.trim());
  return (
    <section className="inv-sec inv-schedule pv-shows" data-sec="schedule">
      <Heading eyebrow={r.main?.title} title={en(r) ? "Showtimes" : r.t.schedule} />
      <div className="pv-showboard rv">
        <ol>
          {rows.map((s, k) => (
            <li key={k}>
              <time>{s.time}</time>
              <span>{s.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export const velvet = makePainted("velvet", {
  cover: {
    kind: "tear",
    art: "closed",
    hint: "light",
    hintText: (r) => (en(r) ? "Tap to tear" : r.t.tapToOpen),
    Extra: Ticket,
  },
  text: { top: "0%", width: 390, tone: "light", glow: false },
  heroShow: { title: false },
  HeroArt: Lights,
  HeroAfter: Board,
  Divider: Film,
  sections: { schedule: Showtimes },
  celebrate: (root) => sparkles(root, { count: 26, color: "#ffe2a0" }),
});
