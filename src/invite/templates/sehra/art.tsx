import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";
import { BROCADE, bud, CORNER, DIVIDER, FRINGE, FRINGE_PITCH, KALGI, rose, type Paisley, type Pt } from "./geo";

// Sehra: a crimson field in a gold zari frame, a kalgi pinned at the top and a
// short fringe of jasmine and roses hanging either side of it.

const Dots = ({ pts, r, className = "sh-f" }: { pts: Pt[]; r: number; className?: string }) => (
  <>
    {pts.map(([x, y], i) => (
      <circle key={i} cx={+(x).toFixed(2)} cy={+(y).toFixed(2)} r={+(r).toFixed(2)} className={className} />
    ))}
  </>
);

export function PaisleyArt({ p, dots = true }: { p: Paisley; dots?: boolean }) {
  return (
    <g>
      <path d={p.outline} className="sh-l sh-bgf" />
      <path d={p.inner} className="sh-t" />
      <path d={p.core} className="sh-f sh-soft" />
      <Dots pts={p.seeds} r={0.95} />
      {dots && <Dots pts={p.dots} r={1.05} />}
    </g>
  );
}

function Corner({ className }: { className: string }) {
  const c = CORNER;
  return (
    <svg className={`sh-corner ${className}`} viewBox="0 0 124 124" fill="none" aria-hidden>
      <rect x="0.7" y="0.7" width="12" height="12" className="sh-l sh-bgf" />
      <path d={c.block} className="sh-f" />
      <path d={c.petals} className="sh-l sh-bgf" />
      <path d={c.petalsIn} className="sh-f sh-soft" />
      <path d={c.arc} className="sh-t" />
      <Dots pts={c.arcDots} r={1.15} />
      {c.stems.map((d, i) => (
        <path key={i} d={d} className="sh-t" />
      ))}
      {c.leaves.map((d, i) => (
        <path key={i} d={d} className="sh-f" />
      ))}
      <Dots pts={c.dots} r={1.05} />
      {c.paisleys.map((p, i) => (
        <PaisleyArt key={i} p={p} />
      ))}
    </svg>
  );
}

export function Kalgi({ className = "" }: { className?: string }) {
  const k = KALGI;
  return (
    <svg className={`sh-kalgi ${className}`} viewBox="0 0 120 130" fill="none" aria-hidden>
      <path d={k.plume} className="sh-l sh-plume" />
      <path d={k.barbs} className="sh-t" />
      <path d={k.vein} className="sh-l" />
      <path d={k.curl} className="sh-l" />
      {k.fan.map((d, i) => (
        <path key={i} d={d} className="sh-l sh-bgf" />
      ))}
      {k.sides.map((p, i) => (
        <g key={i}>
          <path d={p.outline} className="sh-l sh-bgf" />
          <path d={p.core} className="sh-f sh-soft" />
        </g>
      ))}
      <Dots pts={k.pearls} r={2.1} className="sh-pearl" />
      <path d={k.stone} className="sh-l sh-gem sh-bold" />
      <path d={k.facet} className="sh-t" />
      <Dots pts={k.chain} r={2.2} className="sh-pearl" />
      <path d={k.drop} className="sh-l sh-gem" />
    </svg>
  );
}

/** One hanging strand: thread, buds, and a rose or gold bead at the tip. */
function FringeStrand({ x, buds, withRose }: { x: number; buds: number; withRose: boolean }) {
  const end = 2 + buds * FRINGE_PITCH;
  const r = rose(x, end + 4.4, 4.4);
  return (
    <g>
      <path d={`M${x} 0V${end + 1}`} className="sh-thread" />
      {Array.from({ length: buds }, (_, i) => (
        <g key={i}>
          <circle cx={x} cy={1.2 + i * FRINGE_PITCH} r={0.85} className="sh-f" />
          <path d={bud(x, 2.2 + i * FRINGE_PITCH, 2.7, 7.4)} className="sh-jas" />
        </g>
      ))}
      {withRose ? (
        <g>
          <path d={r.out} className="sh-rose" />
          <path d={r.spiral} className="sh-rose-s" />
        </g>
      ) : (
        <>
          <circle cx={x} cy={end + 2} r={1.6} className="sh-f" />
          <path d={`M${x} ${end + 3.4}l1.6 3.4-1.6 2.4-1.6-2.4z`} className="sh-f" />
        </>
      )}
    </g>
  );
}

function Fringe() {
  return (
    <svg className="sh-fringe" viewBox="-6 0 252 92" fill="none" aria-hidden>
      {FRINGE.map((s, i) => (
        <FringeStrand key={i} x={s.x} buds={s.buds} withRose={s.rose} />
      ))}
    </svg>
  );
}

function Foot() {
  const { l, r } = DIVIDER;
  return (
    <svg className="sh-foot" viewBox="40 0 140 30" fill="none" aria-hidden>
      <PaisleyArt p={l} dots={false} />
      <PaisleyArt p={r} dots={false} />
      <path d="M110 8l4 7-4 7-4-7z" className="sh-l sh-bgf" />
      <circle cx="110" cy="15" r="1.3" className="sh-f" />
    </svg>
  );
}

/** The gold frame: outer line, a zari band, inner line, corners, kalgi and fringe. */
export function Frame() {
  return (
    <div className="sh-frame" aria-hidden>
      <i className="sh-zari sh-zari-t" />
      <i className="sh-zari sh-zari-b" />
      <i className="sh-zari sh-zari-s" />
      <i className="sh-zari sh-zari-e" />
      <Corner className="sh-c-tl" />
      <Corner className="sh-c-tr" />
      <Corner className="sh-c-bl" />
      <Corner className="sh-c-br" />
      <Fringe />
      <Kalgi className="sh-kalgi-top" />
      <Foot />
    </div>
  );
}

export function Hero({ r }: HeroProps) {
  const bism = r.data.bismillah !== "none";
  return (
    <div className="sh-hero">
      <Frame />
      <div className="sh-in">
        {bism && <Blessing r={r} className="sh-a1" />}
        <p className="sh-title sh-a2">{r.title}</p>
        <Names r={r} className="sh-names sh-a3" />
        {r.milestone && <p className="sh-milestone sh-a3">{r.milestone}</p>}
        <svg className="sh-rule sh-a4" viewBox="0 0 160 14" fill="none" aria-hidden>
          <path d="M0 7H62M98 7H160" className="sh-t" />
          <path d="M80 1l6 6-6 6-6-6z" className="sh-l sh-bgf" />
          <circle cx="80" cy="7" r="1.6" className="sh-f" />
          <circle cx="68" cy="7" r="1.4" className="sh-f" />
          <circle cx="92" cy="7" r="1.4" className="sh-f" />
        </svg>
        {r.when.date && (
          <div className="sh-when sh-a4">
            {r.when.weekday && <span>{r.when.weekday}</span>}
            <strong>{r.when.date}</strong>
            {r.when.time && <span>{r.when.time}</span>}
          </div>
        )}
        {r.main?.venue && r.oneVenue && <p className="sh-venue sh-a5">{r.main.venue}</p>}
      </div>
      <span className="sh-cue" aria-hidden>
        {r.t.scroll}
        <i />
      </span>
    </div>
  );
}

export function Divider({ index }: { index: number }) {
  const { l, r } = DIVIDER;
  return (
    <svg className="sh-divider" viewBox="0 0 220 30" fill="none" aria-hidden>
      <path d="M0 15H66M154 15H220" className="sh-t" />
      <circle cx="4" cy="15" r="1.4" className="sh-f" />
      <circle cx="216" cy="15" r="1.4" className="sh-f" />
      <PaisleyArt p={l} dots={index % 2 === 0} />
      <PaisleyArt p={r} dots={index % 2 === 0} />
      <path d="M110 8l4 7-4 7-4-7z" className="sh-l sh-bgf" />
      <circle cx="110" cy="15" r="1.3" className="sh-f" />
      <circle cx="110" cy="3.5" r="1.1" className="sh-f" />
      <circle cx="110" cy="26.5" r="1.1" className="sh-f" />
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="sh-orn" viewBox="0 0 96 18" fill="none" aria-hidden>
      <path d="M0 9H34M62 9H96" className="sh-t" />
      <circle cx="38" cy="9" r="1.3" className="sh-f" />
      <circle cx="58" cy="9" r="1.3" className="sh-f" />
      <path d={bud(48, 3, 3.4, 11)} className="sh-jas sh-l" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="sh-brocade" style={{ ["--brocade" as string]: BROCADE.url }} />
      <div className="sh-vignette" />
    </>
  );
}
