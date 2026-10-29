import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";
import { BANDHANI, DIVIDER, LADIS, MANDALA, ORN, TORAN, type Blooms } from "./geo";

// Marigold: a genda-phool toran across the top, ladis down both sides and a mehndi
// mandala behind the names. Flowers come in two tones: orange (.mg-fo) and yellow (.mg-fy).

export function Flowers({ b, tone }: { b: Blooms; tone: "o" | "y" }) {
  return (
    <g className={tone === "o" ? "mg-fo" : "mg-fy"}>
      <path d={b.r1} className="mg-r1" />
      <path d={b.r2} className="mg-r2" />
      <path d={b.r3} className="mg-r1" />
      <path d={b.folds} className="mg-fold" />
      <path d={b.c} className="mg-c" />
    </g>
  );
}

export function Leaves({ l }: { l: { leaf: string; rib: string } }) {
  return (
    <g>
      <path d={l.leaf} className="mg-leaf" />
      <path d={l.rib} className="mg-rib" />
    </g>
  );
}

/** The toran: a rope of mango leaves, four marigold swags and a flower at every knot. */
export function Toran({ className = "" }: { className?: string }) {
  const t = TORAN;
  return (
    <svg className={`mg-toran ${className}`} viewBox="0 -8 390 112" fill="none" aria-hidden>
      <path d="M-4 4H394" className="mg-thread" />
      <Leaves l={t.rope} />
      <Flowers b={t.orange} tone="o" />
      <Flowers b={t.yellow} tone="y" />
      <Leaves l={t.clusters} />
      <Flowers b={t.big} tone="y" />
    </svg>
  );
}

function Ladi({ side }: { side: "l" | "r" }) {
  const { outer, inner } = LADIS;
  return (
    <svg className={`mg-ladi mg-ladi-${side}`} viewBox="0 0 52 1120" fill="none" aria-hidden>
      <path d="M13 0V1120" className="mg-thread" />
      <path d={`M38 30V${inner.end + 4}`} className="mg-thread" />
      <Leaves l={outer.leaves} />
      <Flowers b={outer.flowers} tone="y" />
      <Leaves l={inner.leaves} />
      <Flowers b={inner.flowers} tone="o" />
      {/* a little tassel under the short string */}
      <circle cx="38" cy={+(inner.end + 4).toFixed(2)} r="2.2" className="mg-bead" />
      <path d={`M36 ${inner.end + 6}l-1.6 9M38 ${inner.end + 6.5}v10M40 ${inner.end + 6}l1.6 9`} className="mg-tassel" />
    </svg>
  );
}

export function Mandala({ className = "" }: { className?: string }) {
  const m = MANDALA;
  return (
    <svg className={`mg-mandala ${className}`} viewBox="-175 -175 350 350" fill="none" aria-hidden>
      <path d={m.petals} className="mg-ml" />
      <path d={m.veins} className="mg-mt" />
      <path d={m.lace} className="mg-mt" />
      {m.rings.map((r) => (
        <circle key={r} r={+(r).toFixed(2)} className="mg-mt" />
      ))}
      <path d={m.scallops} className="mg-ml" />
      <path d={m.drops} className="mg-mf" />
      {m.dots.map(([x, y], i) => (
        <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r="1.25" className="mg-mf" />
      ))}
      {m.inDots.map(([x, y], i) => (
        <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r="1.6" className="mg-mf" />
      ))}
    </svg>
  );
}

export function Divider({ index }: { index: number }) {
  const d = DIVIDER;
  return (
    <svg className="mg-divider" viewBox="40 0 140 34" fill="none" aria-hidden>
      <path d="M60 14C90 22 130 22 160 14" className="mg-thread" />
      <Leaves l={d.leaves} />
      <Flowers b={index % 2 ? d.y : d.o} tone="o" />
      <Flowers b={index % 2 ? d.o : d.y} tone="y" />
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="mg-orn" viewBox="0 0 90 18" fill="none" aria-hidden>
      <path d="M0 9H28M62 9H90" className="mg-thread mg-thread-strong" />
      <Leaves l={ORN.leaves} />
      <Flowers b={ORN.bloom} tone="o" />
    </svg>
  );
}

export function Hero({ r }: HeroProps) {
  const bism = r.data.bismillah !== "none";
  return (
    <div className="mg-hero">
      <Toran className="mg-toran-top" />
      <Ladi side="l" />
      <Ladi side="r" />
      <div className="mg-in">
        {bism && <Blessing r={r} className="mg-a1" />}
        <div className="mg-namewrap">
          <Mandala className="mg-a-ring" />
          <p className="mg-title mg-a1">{r.title}</p>
          <Names r={r} className="mg-names mg-a2" />
        </div>
        {r.milestone && <p className="mg-milestone mg-a3">{r.milestone}</p>}
        <span className="mg-rule mg-a3" aria-hidden>
          <Ornament />
        </span>
        {r.when.date && (
          <div className="mg-when mg-a4">
            {r.when.weekday && <span>{r.when.weekday}</span>}
            <strong>{r.when.date}</strong>
            {r.when.time && <span>{r.when.time}</span>}
          </div>
        )}
        {r.main?.venue && r.oneVenue && <p className="mg-venue mg-a5">{r.main.venue}</p>}
      </div>
      <span className="mg-cue" aria-hidden>
        {r.t.scroll}
        <i />
      </span>
    </div>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="mg-bandhani" style={{ ["--bandhani" as string]: BANDHANI.url }} />
      <div className="mg-vignette" />
    </>
  );
}
