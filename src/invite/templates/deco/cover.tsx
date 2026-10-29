import type { CoverProps } from "../types";

// Two deco gates, like the doors of a 1920s lift, meet in the middle under a diamond
// medallion. Tapping unlatches them with a small mechanical jolt, then they slide
// apart while their half-sunbursts turn like wheels; the hero's own sunburst grows
// into place behind them.

const f = (n: number) => Math.round(n * 10) / 10;

/** Half a sunburst, drawn with its centre at (0, 0) on the seam and the rays to the left. */
const BURST = (() => {
  const N = 20;
  let long = "";
  let short = "";
  for (let k = 1; k < N; k++) {
    const t = Math.PI / 2 + (k / N) * Math.PI;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const L = k % 2 === 0 ? 188 : 160;
    const d = `M${f(c * 92)} ${f(s * 92)}L${f(c * L)} ${f(s * L)}`;
    if (k % 2 === 0) long += d;
    else short += d;
  }
  const arc = (r: number) => `M0 ${-r}A${r} ${r} 0 0 0 0 ${r}`;
  return { long, short, arcs: arc(80) + arc(88) + arc(196) };
})();

// A staircase climbing towards the seam (x = 200), with a parallel shadow line.
const STEPS =
  "M20 86H56V70H92V54H128V38H164V22H200M20 94H62V78H98V62H134V46H170V30H200M20 102H200";

const MEDAL = "M0 -72L-72 0L0 72M0 -63L-63 0L0 63";

const initials = (names: string[]) => names.map((n) => n.trim().charAt(0).toUpperCase()).filter(Boolean);

function GateArt() {
  return (
    <div className="dc-gate-art">
      <span className="dc-gate-stripes" />
      <svg className="dc-gate-steps dc-gate-steps-t" viewBox="0 0 200 110" preserveAspectRatio="xMaxYMid meet" fill="none" aria-hidden>
        <path d={STEPS} className="dc-line" />
      </svg>
      <svg className="dc-gate-steps dc-gate-steps-b" viewBox="0 0 200 110" preserveAspectRatio="xMaxYMid meet" fill="none" aria-hidden>
        <path d={STEPS} className="dc-line" />
      </svg>
      <svg className="dc-gate-burst" viewBox="-200 -200 200 400" fill="none" aria-hidden>
        <path d={BURST.short} className="dc-thin" />
        <path d={BURST.long} className="dc-line" />
        <path d={BURST.arcs} className="dc-thin" />
      </svg>
      <svg className="dc-gate-medal" viewBox="-74 -74 74 148" fill="none" aria-hidden>
        <path d="M0 -72L-72 0L0 72Z" className="dc-medal-fill" />
        <path d={MEDAL} className="dc-line" />
        <path d="M0 -50L-50 0L0 50Z" className="dc-medal-core" />
        <path d="M0 -50L-50 0L0 50" className="dc-thin" />
        <path d="M-63 0H-50M-58 -5V5" className="dc-thin" />
      </svg>
    </div>
  );
}

export function Cover({ r, onOpen }: CoverProps) {
  const ini = initials(r.people.map((p) => p.name));
  return (
    <div
      className="dc-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <div className="dc-stage">
        <span className="dc-seam-light" />
        <div className="dc-gate dc-gate-l">
          <GateArt />
        </div>
        <div className="dc-gate dc-gate-r">
          <GateArt />
        </div>
        <span className="dc-gate-ini">
          {ini.length > 1 ? (
            <>
              {ini[0]}
              <i>&amp;</i>
              {ini[1]}
            </>
          ) : (
            (ini[0] ?? "")
          )}
        </span>
        <span className="dc-tap">
          <i />
          {r.t.tapToOpen}
          <i />
        </span>
      </div>
    </div>
  );
}
