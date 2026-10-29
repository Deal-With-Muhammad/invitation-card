import type { CSSProperties } from "react";

import type { CoverProps } from "../types";
import { cloud, FeltMoon, Puff } from "./art";

// Seven rows of thick cloud, stacked from the top of the screen to the bottom,
// each torn into a left and a right half that overlap in the middle. The felt
// moon hangs in front on its thread. On tap the moon lifts away and every half
// drifts off its own side, the far rows slower than the near ones.

type Half = { side: "l" | "r"; w: number; d: string };
type Row = { top: number; tone: 1 | 2 | 3; ms: number; delay: number; halves: [Half, Half] };

const TOPS = [-5, 9, 23, 37, 51, 65, 79];
const TONES: (1 | 2 | 3)[] = [3, 3, 2, 2, 1, 2, 1];
const BUMPS = [
  [[40, 54, 46], [48, 60, 42]],
  [[52, 44, 58], [44, 56, 50]],
  [[46, 60, 50], [56, 46, 52]],
  [[54, 48, 56], [42, 58, 48]],
  [[44, 58, 52], [52, 44, 60]],
  [[56, 50, 44], [46, 60, 52]],
  [[48, 60, 50], [54, 48, 58]],
];

const ROWS: Row[] = TOPS.map((top, i) => {
  const wl = i % 2 ? 62 : 78;
  const half = (side: "l" | "r", w: number, radii: number[]): Half => ({ side, w, d: cloud(-60, 120, 330, radii, 540) });
  // the front half alternates, so the seams never line up
  const l = half("l", wl, BUMPS[i][0]);
  const r = half("r", 142 - wl, BUMPS[i][1]);
  return { top, tone: TONES[i], ms: 1700 - i * 75, delay: i * 28, halves: i % 2 ? [r, l] : [l, r] };
});

export function Cover({ r, onOpen }: CoverProps) {
  return (
    <div
      className="cn-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <div className="cn-cv-sky" />
      <div className="cn-cv-stage">
        {ROWS.map((row, i) =>
          row.halves.map((h, j) => (
            <svg
              key={`${i}${h.side}`}
              className={`cn-mass cn-mass-${h.side}`}
              viewBox="0 0 300 700"
              style={{ top: `${row.top}%`, width: `${h.w}%`, "--ms": `${row.ms}ms`, "--delay": `${row.delay}ms` } as CSSProperties}
              aria-hidden
            >
              <Puff d={h.d} tone={j === 0 ? (Math.min(3, row.tone + 1) as 1 | 2 | 3) : row.tone} shade="translate(0 3.5)" />
            </svg>
          )),
        )}
        <div className="cn-cv-hang">
          <i className="cn-cv-thread" />
          <svg className="cn-cv-moon" viewBox="-34 -30 68 64" aria-hidden>
            <FeltMoon x={-5.8} y={2} />
          </svg>
          <span className="cn-tap">{r.t.tapToOpen}</span>
        </div>
      </div>
    </div>
  );
}
