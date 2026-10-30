import type { CSSProperties } from "react";

import type { Resolved } from "../../resolve";
import { makePainted } from "../painted/kit";

import "./editorial.css";

// Editorial: a bridal fashion magazine. The cover is a watercolour sketch of the couple
// walking away, under a huge masthead with cover lines and a barcode made from the
// date. It turns like a magazine cover to the inside page, where the same sketch sits
// lower and quieter and the names are set huge in Bodoni italic.

// EAN-style bar widths (space, bar, space, bar) for each digit.
const EAN = ["3211", "2221", "2122", "1411", "1132", "1231", "1114", "1312", "1213", "3112"];

function Barcode({ digits }: { digits: string }) {
  const bars: { w: number; on: boolean; tall?: boolean }[] = [];
  const guard = () => bars.push({ w: 1, on: true, tall: true }, { w: 1, on: false }, { w: 1, on: true, tall: true });
  guard();
  [...digits].forEach((d, i) => {
    if (i === digits.length / 2) {
      bars.push({ w: 1, on: false });
      guard();
      bars.push({ w: 1, on: false });
    }
    [...EAN[Number(d) || 0]].forEach((w, j) => bars.push({ w: Number(w), on: j % 2 === 1 }));
  });
  guard();
  return (
    <span className="ed-bars">
      {bars.map((b, i) => (
        <i key={i} className={`${b.on ? "is-on" : ""}${b.tall ? " is-tall" : ""}`} style={{ "--w": b.w } as CSSProperties} />
      ))}
    </span>
  );
}

const issue = (r: Resolved) => [r.main?.month, r.main?.year].filter(Boolean).join(" ");

function CoverPage({ r }: { r: Resolved }) {
  const date = (r.main?.raw.date || "").replace(/\D/g, "").slice(0, 8).padEnd(8, "0");
  const events = r.events.map((e) => e.title).filter(Boolean);
  return (
    <span className="ed-cover" aria-hidden>
      <span className="ed-issue">{issue(r)}</span>
      <span className="ed-mast" style={{ "--n": Math.max(4, [...r.occasionLabel].length) } as CSSProperties}>
        {r.occasionLabel}
      </span>
      <span className="ed-story">
        <b>{r.names}</b>
        {r.when.date && <small>{r.when.date}</small>}
      </span>
      <span className="ed-lines">
        {events.length > 1 && (
          <span>
            <em>{r.t.celebrations}</em>
            {events.join(" · ")}
          </span>
        )}
        {r.show.dress && r.dress.title && (
          <span>
            <em>{r.t.dressCode}</em>
            {r.dress.title}
          </span>
        )}
        {events.length <= 1 && r.main?.venue && (
          <span>
            <em>{r.t.venue}</em>
            {r.main.venue}
          </span>
        )}
      </span>
      <span className="ed-code">
        <Barcode digits={date} />
        <small>{date.replace(/(\d{4})(\d{2})(\d{2})/, "$3 $2 $1")}</small>
      </span>
    </span>
  );
}

/** The inside page: a running head, and a white wash that quiets the sketch. */
function Inside({ r }: { r: Resolved }) {
  return (
    <>
      <span className="ed-wash" aria-hidden />
      <span className="ed-run" aria-hidden>
        <span>{r.occasionLabel}</span>
        <span>{issue(r)}</span>
      </span>
    </>
  );
}

export const editorial = makePainted("editorial", {
  cover: { kind: "swing", hint: "dark", Extra: CoverPage },
  text: { top: "9%", width: 340, glow: false },
  HeroArt: Inside,
  stripY: null,
  panels: "paper",
});
