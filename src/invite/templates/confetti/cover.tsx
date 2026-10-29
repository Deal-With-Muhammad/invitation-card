import type { CoverProps } from "../types";

// A wrapped gift on the doorstep. It gives a little wiggle while it waits; on tap
// it squashes, the lid pops off and spins away, the box drops out of frame and
// the cover fades to the party underneath (confetti fires right after).

const DOTS = [
  [44, 64],
  [76, 112],
  [62, 146],
  [150, 76],
  [168, 122],
  [184, 150],
  [40, 98],
];

export function Cover({ r, onOpen }: CoverProps) {
  return (
    <div
      className="cf-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <div className="cf-dots" />
      <div className="cf-dots cf-dots-2" />
      <div className="cf-cover-in">
        <p className="cf-hello">{r.t.youAreInvited}</p>
        <div className="cf-gift">
          <span className="cf-ground" />
          <svg className="cf-box" viewBox="0 0 220 170" aria-hidden>
            <rect x="27" y="37" width="180" height="128" rx="10" className="cf-shadow" />
            <rect x="20" y="30" width="180" height="128" rx="10" className="cf-o cf-a" />
            {DOTS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="5.5" className="cf-gift-dot" />
            ))}
            <rect x="95" y="30" width="30" height="128" className="cf-o cf-s" />
            <path d="M22 44H198" className="cf-lid-shade" />
          </svg>
          <svg className="cf-lid" viewBox="0 0 240 120" aria-hidden>
            <rect x="16" y="76" width="220" height="40" rx="9" className="cf-shadow" />
            <rect x="10" y="70" width="220" height="40" rx="9" className="cf-o cf-a" />
            <rect x="105" y="70" width="30" height="40" className="cf-o cf-s" />
            <path d="M118 72C92 30 56 40 66 64C74 82 104 78 118 72Z" className="cf-o cf-s" />
            <path d="M122 72C148 30 184 40 174 64C166 82 136 78 122 72Z" className="cf-o cf-s" />
            <path d="M114 70C100 52 84 50 80 58M126 70C140 52 156 50 160 58" className="cf-fold" />
            <path d="M112 78l-14 24 10-2 5 9 10-26M128 78l14 24-10-2-5 9-10-26" className="cf-o cf-s" />
            <ellipse cx="120" cy="72" rx="13" ry="10" className="cf-o cf-s" />
          </svg>
          <svg className="cf-pop" viewBox="0 0 240 120" fill="none" aria-hidden>
            <path d="M120 40V12M78 52 62 32M162 52l16-20M48 82H24M192 82h24M92 30l-6-14M148 30l6-14" />
          </svg>
        </div>
        <span className="cf-tap">{r.t.tapToOpen}</span>
      </div>
    </div>
  );
}
