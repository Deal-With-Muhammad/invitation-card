import type { CSSProperties } from "react";

import type { Resolved } from "../../resolve";
import { sparkles } from "../../runtime/effects";
import { Art, makePainted } from "../painted/kit";

import "./deco.css";

// Gatsby: brass lift doors under a floor dial. The dial is printed live with one mark
// per event day; on the tap its needle swings to the main day, then the doors slide
// into the wall (the frame stays put) onto a navy and brass sunburst.

/** The event days for the dial, at most five, and the main day's angle. */
function dialMarks(r: Resolved) {
  const seen = new Set<string>();
  const days = r.events.filter((e) => {
    const k = e.raw.date || e.day;
    if (!e.day || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const marks = days.slice(0, 5);
  const n = marks.length;
  const angle = (i: number) => (n < 2 ? 0 : -58 + (116 * i) / (n - 1));
  const mainIdx = Math.max(0, marks.findIndex((e) => r.main && (e.raw.date || e.day) === (r.main.raw.date || r.main.day)));
  return { marks: marks.map((e, i) => ({ label: e.day, a: angle(i) })), target: n ? angle(mainIdx) : 0 };
}

/** The lift frame (which stays while the doors slide) and the live floor dial. */
function Lift({ r }: { r: Resolved }) {
  const { marks, target } = dialMarks(r);
  return (
    <>
      <span className="dc-frame" aria-hidden>
        <Art id="deco" name="closed" />
      </span>
      <span className="dc-dial" style={{ "--to": `${target}deg` } as CSSProperties} aria-hidden>
        <span className="dc-face">
          {marks.map((m, i) => (
            <b key={i} style={{ "--a": `${m.a}deg` } as CSSProperties}>
              {m.label}
            </b>
          ))}
        </span>
        <i className="dc-needle" />
        <i className="dc-pin" />
      </span>
    </>
  );
}

export const deco = makePainted("deco", {
  cover: { kind: "slide", art: "closed", hint: "light", Extra: Lift },
  text: { top: "35%", width: 262, tone: "light" },
  stripY: "4%",
  stripH: 104,
  celebrate: (root) => sparkles(root, { count: 30, color: "#f3d48a" }),
});
