import type { CSSProperties } from "react";

import type { CoverProps } from "../types";
import { issueOf } from "./art";

// A plain accent wrapper, like the paper band around a collector's issue. The same
// panel is printed into six horizontal strips; on tap they slide away alternately
// left and right while the masthead rises into place on the cover underneath.

const STRIPS = 6;

export function Cover({ r, onOpen }: CoverProps) {
  const ini = r.people.map((p) => [...p.name.trim()][0]?.toUpperCase()).filter(Boolean);
  const panel = (
    <div className="ed-panel-in">
      <div className="ed-p-top">
        <span>{r.t.youAreInvited}</span>
        <span>{r.occasionLabel}</span>
      </div>
      <p className={`ed-p-mono${ini.length > 1 ? " is-two" : ""}`}>
        {ini.length > 1 ? (
          <>
            <span>{ini[0]}</span>
            <i>&amp;</i>
            <span>{ini[1]}</span>
          </>
        ) : (
          <span>{ini[0] ?? "&"}</span>
        )}
      </p>
      <div className="ed-p-issue">
        <span>{issueOf(r)}</span>
        <strong>{r.names}</strong>
      </div>
      <div className="ed-p-tap">
        <span>{r.t.tapToOpen}</span>
        <svg viewBox="0 0 44 12" fill="none" aria-hidden>
          <path d="M0 6H42M36 1l6 5-6 5" />
        </svg>
      </div>
    </div>
  );
  return (
    <div
      className="ed-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      {Array.from({ length: STRIPS }, (_, i) => (
        <div key={i} className="ed-strip" style={{ "--i": i, "--n": STRIPS } as CSSProperties} aria-hidden>
          <div className="ed-panel">{panel}</div>
        </div>
      ))}
    </div>
  );
}
