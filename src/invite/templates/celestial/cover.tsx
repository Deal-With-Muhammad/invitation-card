import type { CoverProps } from "../types";
import { rng, sparkle } from "./art";

// A dark, quiet sky: a handful of faint stars and one bright one to tap. On tap the
// sky fades away and the hero's stars come on one by one underneath.

const FAINT = (() => {
  const r = rng(77);
  return Array.from({ length: 22 }, () => ({
    x: Math.round(r() * 3900) / 10,
    y: Math.round(r() * 8440) / 10,
    r: Math.round((0.4 + Math.pow(r(), 3) * 1.1) * 100) / 100,
    o: Math.round((0.18 + r() * 0.35) * 100) / 100,
  }));
})();

const BRIGHT = sparkle(30, 30, 18, 0.13);
const SMALL = [sparkle(62, 214, 3.2), sparkle(318, 132, 4), sparkle(286, 690, 2.8), sparkle(96, 604, 3.4)];

export function Cover({ r, onOpen }: CoverProps) {
  return (
    <div
      className="cl-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <svg className="cl-cv-stars" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {FAINT.map((s, i) => (
          <circle key={i} cx={+(s.x).toFixed(2)} cy={+(s.y).toFixed(2)} r={+(s.r).toFixed(2)} fillOpacity={s.o} className="cl-dot" />
        ))}
        {SMALL.map((d, i) => (
          <path key={`s${i}`} d={d} className="cl-gold cl-cv-faint" />
        ))}
      </svg>
      <div className="cl-cv-mid">
        <svg className="cl-cv-star" viewBox="0 0 60 60" aria-hidden>
          <circle cx="30" cy="30" r="27" className="cl-cv-ring" />
          <circle cx="30" cy="30" r="13" className="cl-halo" />
          <path d={BRIGHT} className="cl-gold" />
        </svg>
        <span className="cl-tap">
          <i />
          {r.t.tapToOpen}
          <i />
        </span>
      </div>
    </div>
  );
}
