import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Velvet: opening night. The hero is always 390 phone px wide, so the valance and
// the marquee are drawn in fixed boxes (390 wide, 270 × 290) and scale with --u.
// Curtain folds are CSS gradients from the palette; the curtain shapes are masks.

type Pt = [number, number];

const f = (n: number) => Math.round(n * 10) / 10;
const P = (p: Pt) => `${f(p[0])} ${f(p[1])}`;

const quad = (a: Pt, c: Pt, b: Pt, t: number): Pt => {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
};

const quadTan = (a: Pt, c: Pt, b: Pt, t: number): Pt => {
  const dx = 2 * (1 - t) * (c[0] - a[0]) + 2 * t * (b[0] - c[0]);
  const dy = 2 * (1 - t) * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
  const l = Math.hypot(dx, dy) || 1;
  return [dx / l, dy / l];
};

/** A twisted cord along a quadratic curve: the cord itself plus slanted twist lines. */
export function rope(a: Pt, c: Pt, b: Pt, width: number, step: number) {
  const base = `M${P(a)}Q${P(c)} ${P(b)}`;
  let twist = "";
  const len = Math.hypot(c[0] - a[0], c[1] - a[1]) + Math.hypot(b[0] - c[0], b[1] - c[1]);
  const n = Math.max(4, Math.round(len / step));
  const h = width / 2;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const p = quad(a, c, b, t);
    const [tx, ty] = quadTan(a, c, b, t);
    const nx = -ty;
    const ny = tx;
    twist += `M${P([p[0] + nx * h - tx * h * 0.9, p[1] + ny * h - ty * h * 0.9])}L${P([p[0] - nx * h + tx * h * 0.9, p[1] - ny * h + ty * h * 0.9])}`;
  }
  return { base, twist };
}

/** A tassel hanging from (x, y): a turned head, a collar and a skirt of threads. */
export function tassel(x: number, y: number, s: number) {
  const head = `M${f(x)} ${f(y)}C${f(x + 4.2 * s)} ${f(y + 1 * s)} ${f(x + 5 * s)} ${f(y + 7 * s)} ${f(x + 2.6 * s)} ${f(y + 9 * s)}H${f(x - 2.6 * s)}C${f(x - 5 * s)} ${f(y + 7 * s)} ${f(x - 4.2 * s)} ${f(y + 1 * s)} ${f(x)} ${f(y)}Z`;
  const collar = `M${f(x - 3.4 * s)} ${f(y + 9 * s)}H${f(x + 3.4 * s)}V${f(y + 11.4 * s)}H${f(x - 3.4 * s)}Z`;
  const skirt = `M${f(x - 3.4 * s)} ${f(y + 11.4 * s)}C${f(x - 4.4 * s)} ${f(y + 18 * s)} ${f(x - 6.4 * s)} ${f(y + 24 * s)} ${f(x - 7 * s)} ${f(y + 30 * s)}H${f(x + 7 * s)}C${f(x + 6.4 * s)} ${f(y + 24 * s)} ${f(x + 4.4 * s)} ${f(y + 18 * s)} ${f(x + 3.4 * s)} ${f(y + 11.4 * s)}Z`;
  let threads = "";
  for (let i = -5; i <= 5; i++) {
    const k = i / 5;
    threads += `M${f(x + k * 3 * s)} ${f(y + 12.5 * s)}L${f(x + k * 6.4 * s)} ${f(y + 29.4 * s)}`;
  }
  return { head, collar, skirt, threads };
}

export function TasselArt({ t }: { t: ReturnType<typeof tassel> }) {
  return (
    <>
      <path d={t.skirt} className="vv-gold" />
      <path d={t.threads} className="vv-thread" />
      <path d={t.head} className="vv-gold" />
      <path d={t.head} className="vv-gold-hi" />
      <path d={t.collar} className="vv-gold-dk" />
    </>
  );
}

// ── the valance: three swags, a braid and champagne fringe, in a 390 × 120 box ──

const SWAG_W = 130;

const VALANCE = (() => {
  let braid = "";
  let fringe = "";
  let folds = "";
  for (let i = 0; i < 3; i++) {
    const x0 = i * SWAG_W;
    const a: Pt = [x0, 52];
    const c: Pt = [x0 + SWAG_W / 2, 112];
    const b: Pt = [x0 + SWAG_W, 52];
    braid += `M${P(a)}Q${P(c)} ${P(b)}`;
    for (let k = 1; k <= 3; k++) {
      const ca: Pt = [x0 + 10 * k, 52 - k * 2];
      const cc: Pt = [x0 + SWAG_W / 2, 112 - k * 17];
      const cb: Pt = [x0 + SWAG_W - 10 * k, 52 - k * 2];
      folds += `M${P(ca)}Q${P(cc)} ${P(cb)}`;
    }
    for (let t = 0.015; t < 1; t += 0.022) {
      const p = quad(a, c, b, t);
      const len = 9 + Math.sin(t * 40) * 0.8;
      fringe += `M${P([p[0], p[1] + 1.5])}V${f(p[1] + 1.5 + len)}`;
    }
  }
  return { braid, fringe, folds };
})();

const JABOTS = [130, 260].map((x) => tassel(x, 52, 0.62));

export function Valance() {
  return (
    <div className="vv-valance">
      <div className="vv-valance-cloth" />
      <svg className="vv-valance-trim" viewBox="0 0 390 124" preserveAspectRatio="xMidYMin slice" fill="none" aria-hidden>
        <path d={VALANCE.folds} className="vv-fold-line" />
        <path d="M0 8H390" className="vv-braid-thin" />
        <path d="M0 12.5H390" className="vv-braid-thin" />
        <path d={VALANCE.fringe} className="vv-fringe" />
        <path d={VALANCE.braid} className="vv-braid" />
        <path d={VALANCE.braid} className="vv-braid-dots" />
        {JABOTS.map((t, i) => (
          <g key={i}>
            <TasselArt t={t} />
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── tiebacks ──

const TIE = rope([-4, 6], [22, 22], [40, 8], 5.5, 2.6);
const TIE_DROP = rope([36, 10], [42, 22], [38, 34], 3, 2.2);
const TIE_TASSEL = tassel(38, 34, 1.15);

function Tieback({ side }: { side: "l" | "r" }) {
  return (
    <svg className={`vv-tie vv-tie-${side}`} viewBox="0 0 64 80" fill="none" aria-hidden>
      <path d={TIE.base} className="vv-cord" />
      <path d={TIE.twist} className="vv-cord-twist" />
      <path d={TIE_DROP.base} className="vv-cord vv-cord-thin" />
      <path d={TIE_DROP.twist} className="vv-cord-twist" />
      <TasselArt t={TIE_TASSEL} />
    </svg>
  );
}

// ── the marquee frame, 270 × 290, with bulbs set in four groups for the chase ──

const MQ_W = 270;
const MQ_H = 290;
const MQ_R = 18;

const MARQUEE = (() => {
  const frame = (i: number) => {
    const r = MQ_R + i * 0.4;
    return `M${MQ_R + i} ${i}H${MQ_W - MQ_R - i}A${r} ${r} 0 0 0 ${MQ_W - i} ${MQ_R + i}V${MQ_H - MQ_R - i}A${r} ${r} 0 0 0 ${MQ_W - MQ_R - i} ${MQ_H - i}H${MQ_R + i}A${r} ${r} 0 0 0 ${i} ${MQ_H - MQ_R - i}V${MQ_R + i}A${r} ${r} 0 0 0 ${MQ_R + i} ${i}Z`;
  };
  const bulbs: Pt[] = [];
  const inset = 10;
  const top = (n: number) => {
    for (let k = 0; k < n; k++) bulbs.push([30 + (k * (MQ_W - 60)) / (n - 1), inset]);
  };
  const side = (n: number, x: number) => {
    for (let k = 0; k < n; k++) bulbs.push([x, 32 + (k * (MQ_H - 64)) / (n - 1)]);
  };
  top(14);
  side(15, MQ_W - inset);
  for (let k = 13; k >= 0; k--) bulbs.push([30 + (k * (MQ_W - 60)) / 13, MQ_H - inset]);
  side(15, inset);
  return { outer: frame(0), inner: frame(20), bulbs };
})();

function Marquee() {
  return (
    <svg className="vv-mq-art" viewBox={`-4 -4 ${MQ_W + 8} ${MQ_H + 8}`} fill="none" aria-hidden>
      <path d={MARQUEE.outer} className="vv-mq-plate" />
      <path d={MARQUEE.outer} className="vv-mq-line" />
      <path d={MARQUEE.inner} className="vv-mq-thin" />
      {MARQUEE.bulbs.map(([x, y], i) => (
        <g key={i} className={`vv-bulb vv-b${i % 4}`}>
          <circle cx={f(x)} cy={f(y)} r="6.2" className="vv-bulb-glow" />
          <circle cx={f(x)} cy={f(y)} r="3" className="vv-bulb-glass" />
          <circle cx={f(x - 0.8)} cy={f(y - 0.8)} r="1.1" className="vv-bulb-hot" />
        </g>
      ))}
    </svg>
  );
}

const STAR = "M0 -10C1 -2 2 -1 10 0C2 1 1 2 0 10C-1 2 -2 1 -10 0C-2 -1 -1 -2 0 -10Z";

export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg className={`vv-star ${className}`} viewBox="-10 -10 20 20" aria-hidden>
      <path d={STAR} />
    </svg>
  );
}

/** The curtains as tied-back swags with their tiebacks, shared by hero and cover. */
export function Swags() {
  return (
    <>
      <div className="vv-swag vv-swag-l" />
      <div className="vv-swag vv-swag-r" />
      <Tieback side="l" />
      <Tieback side="r" />
    </>
  );
}

export function Hero({ r }: HeroProps) {
  const bism = r.data.bismillah !== "none";
  return (
    <div className="vv-hero">
      <div className="vv-spot" />
      <div className="vv-floor" />
      <Swags />
      <Valance />
      <div className="vv-stage">
        {bism && <Blessing r={r} className="vv-bless vv-a1" />}
        <div className="vv-mq vv-a2">
          <Marquee />
          <Sparkle className="vv-s1" />
          <Sparkle className="vv-s2" />
          <Sparkle className="vv-s3" />
          <div className="vv-mq-in">
            <p className="vv-title">{r.title}</p>
            <Names r={r} className="vv-names" />
            {r.milestone && <p className="vv-milestone">{r.milestone}</p>}
          </div>
        </div>
        {r.when.date && (
          <div className="vv-when vv-a3">
            {r.when.weekday && <span>{r.when.weekday}</span>}
            <strong>{r.when.date}</strong>
            {r.when.time && <span>{r.when.time}</span>}
          </div>
        )}
        {r.main?.venue && r.oneVenue && <p className="vv-venue vv-a4">{r.main.venue}</p>}
      </div>
      <span className="vv-cue" aria-hidden>
        {r.t.scroll}
        <i />
      </span>
    </div>
  );
}

const DIV_ROPE = rope([10, 9], [110, 36], [210, 9], 4.2, 2.4);
const DIV_TASSEL = tassel(110, 22.5, 0.62);

export function Divider({ index }: { index: number }) {
  return (
    <svg className="vv-divider" viewBox="0 0 220 46" fill="none" aria-hidden>
      <path d={DIV_ROPE.base} className="vv-cord" />
      <path d={DIV_ROPE.twist} className="vv-cord-twist" />
      <circle cx="9" cy="9" r="3.2" className="vv-gold" />
      <circle cx="211" cy="9" r="3.2" className="vv-gold" />
      {index % 2 === 0 ? (
        <TasselArt t={DIV_TASSEL} />
      ) : (
        <path d="M110 18.5l3 4-3 4-3-4z" className="vv-gold" />
      )}
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="vv-orn" viewBox="0 0 96 14" fill="none" aria-hidden>
      <path d="M0 7H36M60 7H96" className="vv-orn-line" />
      <path d="M48 0C48.6 4.6 49.4 6.4 54 7C49.4 7.6 48.6 9.4 48 14C47.4 9.4 46.6 7.6 42 7C46.6 6.4 47.4 4.6 48 0Z" className="vv-gold" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="vv-back" />
      <div className="vv-back-shade" />
    </>
  );
}
