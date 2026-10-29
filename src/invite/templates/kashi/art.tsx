import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";
import { CARTOUCHE, CORNER, DIVIDER, GRID, ORN, SIDE, SPRAY, type Flower as F, type Leaf } from "./geo";

// Kashi: a painted panel of Multani tiles. Cobalt (ink) outlines and leaves,
// turquoise (accent) petals, on a white glaze (bg). Flowers grow from the corners
// and edges around an ogee cartouche with a cusped edge.

export function Flower({ f }: { f: F }) {
  return (
    <g>
      <path d={f.outer} className="ks-petal" />
      <path d={f.inner} className="ks-cob" />
      <path d={f.core} className="ks-cob" />
      <path d={f.ring} className="ks-tq" />
      {f.dots.map(([x, y], i) => (
        <circle key={i} cx={+(x).toFixed(2)} cy={+(y).toFixed(2)} r={+(Math.max(0.9, f.r * 0.045)).toFixed(2)} className="ks-glaze" />
      ))}
    </g>
  );
}

export function Leaves({ l, tone = "c" }: { l: Leaf; tone?: "c" | "t" }) {
  return tone === "c" ? (
    <g>
      <path d={l.leaf} className="ks-cob" />
      <path d={l.vein} className="ks-vein" />
    </g>
  ) : (
    <path d={l.leaf} className="ks-petal ks-thin" />
  );
}

function Buds({ buds }: { buds: { stalk: string; bud: string }[] }) {
  return (
    <>
      {buds.map((b, i) => (
        <g key={i}>
          <path d={b.stalk} className="ks-vine" />
          <path d={b.bud} className="ks-petal ks-thin" />
        </g>
      ))}
    </>
  );
}

function Corner({ className }: { className: string }) {
  const c = CORNER;
  return (
    <svg className={`ks-corner ${className}`} viewBox="0 0 160 160" fill="none" aria-hidden>
      {c.vines.map((d, i) => (
        <path key={i} d={d} className="ks-vine" />
      ))}
      <Leaves l={c.leaves} />
      <Leaves l={c.leavesT} tone="t" />
      <Buds buds={c.buds} />
      <Flower f={c.fl} />
      {c.small.map((f, i) => (
        <Flower key={i} f={f} />
      ))}
    </svg>
  );
}

function Spray({ className, centre = true }: { className: string; centre?: boolean }) {
  const s = SPRAY;
  return (
    <svg className={`ks-spray ${className}`} viewBox="0 0 220 84" fill="none" aria-hidden>
      {s.vines.map((d, i) => (
        <path key={i} d={d} className="ks-vine" />
      ))}
      <Leaves l={centre ? s.leaves : s.leavesSide} />
      {centre && <Leaves l={s.leavesT} tone="t" />}
      <Buds buds={s.buds} />
      {centre && <Flower f={s.fl} />}
      {s.side.map((f, i) => (
        <Flower key={i} f={f} />
      ))}
    </svg>
  );
}

function Side({ className }: { className: string }) {
  const s = SIDE;
  return (
    <svg className={`ks-side ${className}`} viewBox={`0 0 40 ${s.h}`} preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden>
      <path d={s.d} className="ks-vine" />
      <Leaves l={s.leaves} />
      <Leaves l={s.leavesT} tone="t" />
      <Buds buds={s.buds} />
      {s.flowers.map((f, i) => (
        <Flower key={i} f={f} />
      ))}
    </svg>
  );
}

export function Cartouche() {
  const c = CARTOUCHE;
  return (
    <svg className="ks-cart" viewBox="0 0 260 460" fill="none" aria-hidden>
      <path d={c.outer} className="ks-glazefill ks-cusp" />
      <path d={c.plain} className="ks-line" />
      <path d={c.inner} className="ks-tqline" />
      {c.finials.map((f, i) => (
        <Flower key={i} f={f} />
      ))}
    </svg>
  );
}

export function Hero({ r }: HeroProps) {
  const bism = r.data.bismillah !== "none";
  return (
    <div className="ks-hero">
      <div className="ks-frame" aria-hidden>
        <Side className="ks-side-s" />
        <Side className="ks-side-e" />
        <Spray className="ks-spray-t" />
        <Spray className="ks-spray-b" centre={false} />
        <Corner className="ks-c-tl" />
        <Corner className="ks-c-tr" />
        <Corner className="ks-c-bl" />
        <Corner className="ks-c-br" />
      </div>
      <div className="ks-medal">
        <Cartouche />
        <div className="ks-in">
          {bism && <Blessing r={r} className="ks-a1" />}
          <p className="ks-title ks-a2">{r.title}</p>
          <Names r={r} className="ks-names ks-a3" />
          {r.milestone && <p className="ks-milestone ks-a3">{r.milestone}</p>}
          <span className="ks-rule ks-a4" aria-hidden>
            <Ornament />
          </span>
          {r.when.date && (
            <div className="ks-when ks-a4">
              {r.when.weekday && <span>{r.when.weekday}</span>}
              <strong>{r.when.date}</strong>
              {r.when.time && <span>{r.when.time}</span>}
            </div>
          )}
          {r.main?.venue && r.oneVenue && <p className="ks-venue ks-a5">{r.main.venue}</p>}
        </div>
      </div>
      <span className="ks-cue" aria-hidden>
        {r.t.scroll}
        <i />
      </span>
    </div>
  );
}

export function Divider({ index }: { index: number }) {
  const d = DIVIDER;
  return (
    <svg className="ks-divider" viewBox="0 0 220 34" fill="none" aria-hidden>
      <path d={d.vine} className="ks-vine" />
      {d.curls.map((c, i) => (
        <path key={i} d={c} className="ks-vine" />
      ))}
      <Leaves l={d.leaves} tone={index % 2 ? "c" : "t"} />
      <Flower f={d.fl} />
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="ks-orn" viewBox="0 0 90 18" fill="none" aria-hidden>
      <path d="M0 9.5H28M62 9.5H90" className="ks-tqline" />
      <Leaves l={ORN.leaves} />
      <Flower f={ORN.fl} />
    </svg>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="ks-grid" style={{ ["--grid" as string]: GRID.url }} />
      <div className="ks-vignette" />
    </>
  );
}
