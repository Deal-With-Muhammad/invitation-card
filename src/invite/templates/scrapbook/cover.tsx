import type { CoverProps } from "../types";
import { Doodle, Star } from "./art";

// A note folded in half and taped shut. On tap the tape peels away, the note
// unfolds towards you (hinged on the fold) and then slides off the page, leaving
// the scrapbook page underneath, where the polaroid and its tape stick down.

export function Cover({ r, onOpen }: CoverProps) {
  return (
    <div
      className="sb-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <div className="sb-grain" />
      <div className="sb-grain sb-mottle" />
      <div className="sb-cover-in">
        <div className="sb-note">
          <div className="sb-note-inner">
            <p className="sb-note-names">{r.names}</p>
          </div>
          <div className="sb-flap">
            <div className="sb-flap-face">
              <Star className="sb-flap-star" />
              <p className="sb-flap-hello">{r.t.youAreInvited}</p>
              <Doodle occasion={r.occasion} className="sb-flap-doodle" />
            </div>
            <div className="sb-flap-face sb-flap-back" />
          </div>
          <span className="sb-tape sb-tape-seal" />
        </div>
        <p className="sb-tap">
          <svg viewBox="0 0 60 40" fill="none" aria-hidden>
            <path d="M54 34C40 36 22 30 14 16" className="sb-pen" />
            <path d="M10 26 13 14l12 2" className="sb-pen" />
          </svg>
          {r.t.tapToOpen}
        </p>
      </div>
    </div>
  );
}
