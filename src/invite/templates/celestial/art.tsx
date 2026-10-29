import type { CSSProperties } from "react";

import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Celestial: a night sky with a crescent moon and two small constellations, one for
// each person, joined by a dotted line. Every star sits at a seeded position, so
// the server thumbnail and the live card share one sky. On opening the stars come
// on in a sweep and the constellation lines draw themselves.

type Pt = [number, number];
const f = (n: number) => Math.round(n * 100) / 100;

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A four-point sparkle with softly concave sides. */
export function sparkle(x: number, y: number, R: number, waist = 0.16) {
  const w = R * waist;
  return (
    `M${f(x)} ${f(y - R)}` +
    `C${f(x + w)} ${f(y - w)} ${f(x + w)} ${f(y - w)} ${f(x + R)} ${f(y)}` +
    `C${f(x + w)} ${f(y + w)} ${f(x + w)} ${f(y + w)} ${f(x)} ${f(y + R)}` +
    `C${f(x - w)} ${f(y + w)} ${f(x - w)} ${f(y + w)} ${f(x - R)} ${f(y)}` +
    `C${f(x - w)} ${f(y - w)} ${f(x - w)} ${f(y - w)} ${f(x)} ${f(y - R)}Z`
  );
}

const delay = (s: number) => ({ "--d": `${Math.round(s * 1000)}ms` }) as CSSProperties;

// ── the star field (390 × 844, the shape of a phone) ──

type Dot = { x: number; y: number; r: number; o: number; d: number; gold: boolean };
type Spark = { d: string; x: number; y: number; R: number; t: number; glow: boolean };

function field(seed: number, count: number, sparks: number, clearText: boolean) {
  const r = rng(seed);
  const dots: Dot[] = [];
  for (let i = 0; i < count; i++) {
    const x = r() * 390;
    const y = r() * 844;
    const inText = clearText && Math.abs(x - 195) < 150 && y > 150 && y < 720;
    const keep = r();
    if (inText && keep < 0.72) continue;
    const size = 0.42 + Math.pow(r(), 3) * 1.25;
    // the sweep: left to right with a little scatter, so they come on in sequence
    dots.push({ x: f(x), y: f(y), r: f(size), o: f(0.28 + r() * 0.62), d: 0.2 + (x / 390) * 0.95 + r() * 0.35, gold: r() < 0.2 });
  }
  const spk: Spark[] = [];
  let tries = 0;
  while (spk.length < sparks && tries++ < 200) {
    const x = 14 + r() * 362;
    const y = 14 + r() * 816;
    if (clearText && Math.abs(x - 195) < 140 && y > 150 && y < 720) continue;
    const R = 2.6 + Math.pow(r(), 2) * 5;
    spk.push({ d: sparkle(x, y, R), x: f(x), y: f(y), R, t: 0.3 + (x / 390) * 0.95 + r() * 0.25, glow: R > 5 });
  }
  return { dots, spk };
}

const SKY = field(1207, 150, 16, true);

function StarField() {
  return (
    <svg className="cl-field" viewBox="0 0 390 844" preserveAspectRatio="xMidYMin slice" aria-hidden>
      {SKY.dots.map((s, i) => (
        <circle key={i} cx={+(s.x).toFixed(2)} cy={+(s.y).toFixed(2)} r={+(s.r).toFixed(2)} fillOpacity={s.o} className={`cl-tw ${s.gold ? "cl-gold" : "cl-dot"}`} style={delay(s.d)} />
      ))}
      {SKY.spk.map((s, i) => (
        <g key={`s${i}`} className="cl-tw cl-sp" style={{ ...delay(s.t), "--g": `${-((i * 1.7) % 5)}s` } as CSSProperties}>
          {s.glow && <circle cx={s.x} cy={s.y} r={f(s.R * 0.9)} className="cl-halo" />}
          <path d={s.d} className="cl-gold" />
        </g>
      ))}
    </svg>
  );
}

// ── crescent moon ──

/** The lit part of a disc of radius R with a shadow disc (radius r) offset by d. */
function crescent(R: number, r: number, d: number) {
  const x = (d * d + R * R - r * r) / (2 * d);
  const y = Math.sqrt(Math.max(0, R * R - x * x));
  return `M${f(x)} ${f(y)}A${R} ${R} 0 ${x > 0 ? 1 : 0} 1 ${f(x)} ${f(-y)}A${r} ${r} 0 ${x > d ? 1 : 0} 0 ${f(x)} ${f(y)}Z`;
}

const MOON = crescent(26, 24, 5.5);

export function Moon({ className = "" }: { className?: string }) {
  return (
    <svg className={`cl-moon ${className}`} viewBox="-36 -36 72 72" aria-hidden>
      <circle r="26" className="cl-moon-ghost" />
      <g transform="rotate(-150)">
        <path d={MOON} className="cl-moon-lit" />
        <path d="M-22.5 -5C-23.4 2 -21.8 9 -17.6 14.5" className="cl-moon-edge" />
      </g>
    </svg>
  );
}

// ── the constellations (320 × 150) ──

type Star = [number, number, number];

const PAIR_A: Star[] = [
  [34, 98, 2.1],
  [56, 72, 1.6],
  [84, 82, 2.8],
  [100, 52, 1.9],
  [74, 34, 1.5],
];
const LINES_A: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 1],
];
const PAIR_B: Star[] = [
  [222, 60, 1.9],
  [244, 36, 2.7],
  [272, 46, 1.6],
  [288, 74, 2.2],
  [266, 100, 1.7],
];
const LINES_B: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
];

/** Dots along a quadratic curve, evenly spaced by arc length. */
function dotted(a: Pt, c: Pt, b: Pt, gap: number) {
  const N = 80;
  const pts: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const u = 1 - t;
    pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  const out: Pt[] = [];
  let acc = gap;
  for (let i = 1; i < pts.length; i++) {
    acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc >= gap) {
      out.push([f(pts[i][0]), f(pts[i][1])]);
      acc = 0;
    }
  }
  // keep clear of the stars at both ends
  return out.filter(([x, y]) => Math.hypot(x - a[0], y - a[1]) > 7 && Math.hypot(x - b[0], y - b[1]) > 7);
}

const BRIDGE = dotted([100, 52], [161, -2], [222, 60], 8.5);
const SOLO_SHIFT = 92;
const SOLO_TAIL = dotted([100 + SOLO_SHIFT, 52], [236, 6], [268, 26], 8.5);

function Asterism({ stars, lines, t0, dx = 0 }: { stars: Star[]; lines: [number, number][]; t0: number; dx?: number }) {
  return (
    <g transform={dx ? `translate(${dx} 0)` : undefined}>
      {lines.map(([a, b], i) => (
        <path
          key={i}
          d={`M${stars[a][0]} ${stars[a][1]}L${stars[b][0]} ${stars[b][1]}`}
          pathLength={1}
          className="cl-ln"
          style={delay(t0 + 0.32 + i * 0.13)}
        />
      ))}
      {stars.map(([x, y, s], i) => (
        <g key={`s${i}`} className="cl-tw" style={delay(t0 + i * 0.09)}>
          <circle cx={+(x).toFixed(2)} cy={+(y).toFixed(2)} r={+(s * 2.6).toFixed(2)} className="cl-halo" />
          <circle cx={+(x).toFixed(2)} cy={+(y).toFixed(2)} r={+(s).toFixed(2)} className="cl-gold" />
        </g>
      ))}
    </g>
  );
}

const initial = (n: string) => n.trim().charAt(0).toUpperCase();

export function Constellation({ names }: { names: string[] }) {
  const two = names.length > 1;
  return (
    <div className={`cl-const${two ? "" : " is-solo"}`} aria-hidden>
      <svg viewBox="0 0 320 150">
        {two ? (
          <>
            <Asterism stars={PAIR_A} lines={LINES_A} t0={0.55} />
            <Asterism stars={PAIR_B} lines={LINES_B} t0={0.75} />
            {BRIDGE.map(([x, y], i) => (
              <circle key={i} cx={+(x).toFixed(2)} cy={+(y).toFixed(2)} r="0.95" className="cl-bridge" style={delay(1.2 + i * 0.032)} />
            ))}
          </>
        ) : (
          <>
            <Asterism stars={PAIR_A} lines={LINES_A} t0={0.6} dx={SOLO_SHIFT} />
            {SOLO_TAIL.map(([x, y], i) => (
              <circle key={i} cx={+(x).toFixed(2)} cy={+(y).toFixed(2)} r="0.95" className="cl-bridge" style={delay(1.2 + i * 0.04)} />
            ))}
            <path d={sparkle(268, 26, 6)} className="cl-tw cl-gold" style={delay(1.45)} />
          </>
        )}
      </svg>
      <span className="cl-ini cl-ini-a">{initial(names[0] ?? "")}</span>
      {two && <span className="cl-ini cl-ini-b">{initial(names[1])}</span>}
    </div>
  );
}

export function Hero({ r }: HeroProps) {
  return (
    <div className="cl-hero">
      <div className="cl-sky" />
      <StarField />
      <Moon />
      <div className="cl-in">
        <Blessing r={r} className="cl-a1" />
        <Constellation names={r.people.map((p) => p.name)} />
        <p className="cl-title cl-a2">{r.title}</p>
        <Names r={r} className="cl-names cl-a3" />
        {r.milestone && <p className="cl-milestone cl-a3">{r.milestone}</p>}
        <span className="cl-rule cl-a4" aria-hidden>
          <Ornament />
        </span>
        {r.when.date && (
          <div className="cl-when cl-a4">
            {r.when.weekday && <span>{r.when.weekday}</span>}
            <strong>{r.when.date}</strong>
            {r.when.time && <span>{r.when.time}</span>}
          </div>
        )}
        {r.main?.venue && r.oneVenue && <p className="cl-venue cl-a5">{r.main.venue}</p>}
      </div>
      <span className="cl-cue" aria-hidden>
        {r.t.scroll}
        <i />
      </span>
    </div>
  );
}

// ── small pieces ──

/** Phase 0 is new, 0.5 full, 1 new again; waxing is lit on the right. */
function phase(cx: number, cy: number, R: number, p: number) {
  const waxing = p <= 0.5;
  const c = waxing ? 1 - 4 * p : 4 * p - 3;
  const rx = f(Math.abs(c) * R);
  const sweepA = waxing ? 1 : 0;
  const sweepB = waxing ? (c > 0 ? 0 : 1) : c > 0 ? 1 : 0;
  return `M${cx} ${cy - R}A${R} ${R} 0 0 ${sweepA} ${cx} ${cy + R}A${rx} ${R} 0 0 ${sweepB} ${cx} ${cy - R}Z`;
}

const PHASES = [0.12, 0.25, 0.37, 0.5, 0.63, 0.75, 0.88].map((p, i) => {
  const R = i === 3 ? 6.2 : 4.6;
  const cx = 18 + i * 19;
  return { cx, R, d: phase(cx, 12, R, p) };
});

export function Divider() {
  return (
    <svg className="cl-divider" viewBox="0 0 150 24" fill="none" aria-hidden>
      {PHASES.map((m, i) => (
        <g key={i}>
          <circle cx={+(m.cx).toFixed(2)} cy="12" r={+(m.R).toFixed(2)} className="cl-ph-ring" />
          <path d={m.d} className="cl-ph-lit" />
        </g>
      ))}
    </svg>
  );
}

const ORN = sparkle(40, 8, 7, 0.14);

export function Ornament() {
  return (
    <svg className="cl-orn" viewBox="0 0 80 16" fill="none" aria-hidden>
      <path d="M0 8H26M54 8H80" className="cl-orn-line" />
      <circle cx="28.5" cy="8" r="1.1" className="cl-gold" />
      <circle cx="51.5" cy="8" r="1.1" className="cl-gold" />
      <path d={ORN} className="cl-gold" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="cl-bd-sky" />
      <div className="cl-bd-stars" />
    </>
  );
}
