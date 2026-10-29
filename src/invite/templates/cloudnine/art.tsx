import type { CSSProperties } from "react";

import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Cloud Nine: a soft nursery sky. A little mobile of felt stars and a crescent
// moon hangs from the top edge on thread, each piece edged with running stitches,
// and layered paper clouds drift along the bottom. Geometry is computed once at
// import, so thumbnails and the live card match.

type Pt = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;

const circle = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 1 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 1 ${f(cx - r)} ${f(cy)}Z`;

/**
 * A puffy cloud: a flat base with round ends and bumps sitting on it. All parts
 * wind clockwise, so the filled union has no holes. `drop` extends the body down,
 * with billowing sides instead of straight edges.
 */
export function cloud(x0: number, yb: number, w: number, radii: number[], drop = 0) {
  const hb = Math.max(...radii) * 0.78;
  const x1 = x0 + w;
  const re = hb / 2;
  let d = `M${f(x0 + re)} ${f(yb - hb)}H${f(x1 - re)}V${f(yb + drop)}H${f(x0 + re)}Z`;
  d += circle(x0 + re, yb - re, re) + circle(x1 - re, yb - re, re);
  if (drop) {
    // billow down both sides so a cut edge still reads as cloud
    let k = 0;
    for (let y = yb - re + hb * 0.95; y < yb + drop + hb; y += hb * 0.95, k++) {
      const rr = hb * (k % 2 ? 0.62 : 0.72);
      d += circle(x0 + rr, y, rr) + circle(x1 - rr, y, rr);
    }
  }
  const n = radii.length;
  radii.forEach((r, i) => {
    const t = (i + 0.5) / n;
    const cx = x0 + re + (w - 2 * re) * t;
    d += circle(cx, yb - r, r);
  });
  return d;
}

/** One paper cloud: a shadow cut, then the cloud on top. */
export function Puff({ d, tone, shade = "translate(2.5 4.5)" }: { d: string; tone: 1 | 2 | 3; shade?: string }) {
  return (
    <>
      {shade && <path d={d} className="cn-shade" transform={shade} />}
      <path d={d} className={`cn-cloud cn-c${tone}`} />
    </>
  );
}

// ── felt pieces ──

function starPts(cx: number, cy: number, R: number, turn = 0, k = 0.5) {
  const pts: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = ((-90 + turn + i * 36) * Math.PI) / 180;
    const rr = i % 2 ? R * k : R;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}Z`;
}

/** Felt star: rounded by a fat stroke of its own colour, stitched inside. */
export function FeltStar({ x, y, R, tone = 1, turn = 0 }: { x: number; y: number; R: number; tone?: 1 | 2; turn?: number }) {
  return (
    <g>
      <path d={starPts(x, y, R, turn)} className={`cn-felt cn-f${tone}`} strokeWidth={f(R * 0.3)} />
      <path d={starPts(x, y, R * 0.7, turn, 0.46)} className="cn-stitch" />
    </g>
  );
}

/** Crescent from two discs, as in a real moon: lit disc minus a shadow disc. */
function crescentPath(R: number, r: number, d: number) {
  const x = (d * d + R * R - r * r) / (2 * d);
  const y = Math.sqrt(Math.max(0, R * R - x * x));
  return `M${f(x)} ${f(y)}A${R} ${R} 0 ${x > 0 ? 1 : 0} 1 ${f(x)} ${f(-y)}A${r} ${r} 0 ${x > d ? 1 : 0} 0 ${f(x)} ${f(y)}Z`;
}

const MOON = crescentPath(24, 19.5, 10);
const MOON_STITCH = crescentPath(20.5, 21.5, 9);

export function FeltMoon({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(-24)`}>
      <path d={MOON} className="cn-felt cn-fm" strokeWidth="5" />
      <path d={MOON_STITCH} className="cn-stitch" />
    </g>
  );
}

// ── the mobile (390 × 230, hung from the top edge) ──

type Hang = { x: number; len: number; kind: "star" | "moon"; R: number; tone?: 1 | 2; turn?: number; sway: number };

const MOBILE: Hang[] = [
  { x: 40, len: 98, kind: "star", R: 15, tone: 1, turn: 8, sway: 7.2 },
  { x: 84, len: 50, kind: "star", R: 9.5, tone: 2, turn: -12, sway: 6.1 },
  { x: 126, len: 20, kind: "star", R: 6, tone: 1, turn: 4, sway: 5.4 },
  { x: 258, len: 26, kind: "star", R: 7, tone: 2, turn: -6, sway: 5.8 },
  { x: 302, len: 118, kind: "moon", R: 30, sway: 8 },
];

/** Where the thread meets each piece. */
const tie = (h: Hang) => (h.kind === "moon" ? h.len : h.len - h.R * 0.92);

const twinkle = (x: number, y: number, R: number) =>
  `M${x} ${y - R}Q${x} ${y} ${x + R} ${y}Q${x} ${y} ${x} ${y + R}Q${x} ${y} ${x - R} ${y}Q${x} ${y} ${x} ${y - R}Z`;
const TWINKLES = [twinkle(178, 30, 4.2), twinkle(356, 196, 3.4), twinkle(18, 176, 3), twinkle(222, 74, 2.6), twinkle(140, 118, 2.4)].join("");

export function Mobile() {
  return (
    <svg className="cn-mobile" viewBox="0 0 390 230" fill="none" aria-hidden>
      <path d={TWINKLES} className="cn-twinkle" />
      {MOBILE.map((h, i) => {
        const top = tie(h);
        return (
          <g key={i} className="cn-hang" style={{ transformOrigin: `${h.x}px 0px`, "--sway": `${h.sway}s`, "--i": i } as CSSProperties}>
            <path d={`M${h.x} -4V${f(top)}`} className="cn-thread" />
            <circle cx={h.x} cy={f(top)} r="1.5" className="cn-knot" />
            {h.kind === "moon" ? (
              <FeltMoon x={h.x - 4} y={h.len + 22} />
            ) : (
              <FeltStar x={h.x} y={h.len} R={h.R} tone={h.tone} turn={h.turn} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── clouds ──

const BANK = {
  back: [cloud(-34, 150, 220, [30, 44, 36], 90), cloud(170, 140, 250, [34, 48, 40, 30], 90)],
  mid: [cloud(-26, 176, 240, [28, 38, 32, 26], 70), cloud(196, 170, 230, [32, 40, 30], 70)],
  front: [cloud(-40, 204, 480, [24, 32, 28, 36, 26, 30, 24], 40)],
};

function Bank() {
  return (
    <svg className="cn-bank" viewBox="0 0 390 240" preserveAspectRatio="xMidYMax slice" fill="none" aria-hidden>
      <g className="cn-layer cn-l3">
        {BANK.back.map((d, i) => (
          <Puff key={i} d={d} tone={3} />
        ))}
      </g>
      <g className="cn-layer cn-l2">
        {BANK.mid.map((d, i) => (
          <Puff key={i} d={d} tone={2} />
        ))}
      </g>
      <g className="cn-layer cn-l1">
        {BANK.front.map((d, i) => (
          <Puff key={i} d={d} tone={1} />
        ))}
      </g>
    </svg>
  );
}

const DRIFT_L = cloud(0, 44, 110, [16, 22, 15]);
const DRIFT_R = cloud(0, 40, 96, [14, 19, 13]);

export function Hero({ r }: HeroProps) {
  return (
    <div className="cn-hero">
      <svg className="cn-drift cn-drift-l" viewBox="0 0 112 50" aria-hidden>
        <Puff d={DRIFT_L} tone={2} />
      </svg>
      <svg className="cn-drift cn-drift-r" viewBox="0 0 98 46" aria-hidden>
        <Puff d={DRIFT_R} tone={1} />
      </svg>
      <Mobile />
      <div className="cn-in">
        <Blessing r={r} className="cn-a1" />
        <p className="cn-title cn-a2">{r.title}</p>
        <Names r={r} className="cn-names cn-a3" />
        {r.milestone && <p className="cn-milestone cn-a3">{r.milestone}</p>}
        <span className="cn-rule cn-a4" aria-hidden>
          <Ornament />
        </span>
        {r.when.date && (
          <div className="cn-when cn-a4">
            {r.when.weekday && <span>{r.when.weekday}</span>}
            <strong>{r.when.date}</strong>
            {r.when.time && <span>{r.when.time}</span>}
          </div>
        )}
        {r.main?.venue && r.oneVenue && <p className="cn-venue cn-a5">{r.main.venue}</p>}
      </div>
      <Bank />
    </div>
  );
}

// ── small pieces ──

const DIV_CLOUD = cloud(38, 30, 46, [9, 12.5, 8.5]);

export function Divider() {
  return (
    <svg className="cn-divider" viewBox="0 0 122 38" fill="none" aria-hidden>
      <path d="M2 24H26M96 24H120" className="cn-hair" />
      <Puff d={DIV_CLOUD} tone={1} />
      <FeltStar x={30} y={12} R={4.6} tone={2} turn={-10} />
      <FeltStar x={92} y={9} R={6} tone={1} turn={8} />
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="cn-orn" viewBox="0 0 60 18" fill="none" aria-hidden>
      <circle cx="17" cy="10" r="1.6" className="cn-dotfill" />
      <circle cx="43" cy="10" r="1.6" className="cn-dotfill" />
      <FeltStar x={30} y={9.5} R={6.4} tone={1} />
    </svg>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="cn-bd-sky" />
      <div className="cn-bd-stars" />
    </>
  );
}
