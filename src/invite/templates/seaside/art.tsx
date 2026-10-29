import type { ReactNode } from "react";

import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Seaside: warm sand, shells drawn in fine line, and the sea rolling in at the
// bottom in layered bands with a foam line on every crest. Wave crests are summed
// sines sampled at import and smoothed into curves, so thumbnails and the live card
// draw the same water.

type Pt = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;

/** Points along a hand-drawn-looking crest: two sines out of step. */
export function crest(y: number, amp: number, len: number, phase: number, w = 390): Pt[] {
  const pts: Pt[] = [];
  for (let x = -20; x <= w + 20; x += 10) {
    const a = (2 * Math.PI * x) / len + phase;
    pts.push([x, y + amp * Math.sin(a) + amp * 0.32 * Math.sin(a * 2.13 + phase * 1.7)]);
  }
  return pts;
}

/** Catmull-Rom through the points, as cubic Béziers. */
export function smooth(pts: Pt[]) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

export type Band = { fill: string; foam: string; lace: string; bubbles: Pt[] };

export function band(y: number, amp: number, len: number, phase: number, bottom: number, w = 390): Band {
  const top = crest(y, amp, len, phase, w);
  const foam = smooth(top);
  const lace = smooth(top.map(([x, yy]) => [x, yy + 4.5 + Math.sin(x / 23) * 1.2] as Pt));
  const fill = `${foam}L${w + 20} ${bottom}L-20 ${bottom}Z`;
  const bubbles: Pt[] = [];
  for (let i = 2; i < top.length - 2; i += 3) {
    const [x, yy] = top[i];
    bubbles.push([f(x + 3), f(yy + 9 + (i % 2) * 2)]);
  }
  return { fill, foam, lace, bubbles };
}

// ── the hero's sea (390 × 210) ──

const SEA = [
  band(26, 6.5, 168, 0.4, 230),
  band(70, 7.5, 142, 2.2, 230),
  band(116, 8.5, 188, 4.1, 230),
  band(160, 7, 152, 1.1, 230),
];
const SHORE = band(200, 4.5, 176, 2.7, 230);
const TIDE = smooth(crest(10, 3.5, 120, 1.6));

function Sea() {
  return (
    <svg className="ss-sea" viewBox="0 0 390 210" preserveAspectRatio="xMidYMin slice" fill="none" aria-hidden>
      <path d={TIDE} className="ss-tide" />
      {SEA.map((b, i) => (
        <g key={i} className={`ss-band ss-b${i + 1}`}>
          <path d={b.fill} className="ss-water" />
          <path d={b.lace} className="ss-lace" />
          <path d={b.foam} className="ss-foam" />
          {b.bubbles.map(([x, y], j) => (
            <circle key={j} cx={x} cy={y} r={j % 3 === 0 ? 1.4 : 0.9} className="ss-bubble" />
          ))}
        </g>
      ))}
      <g className="ss-band ss-b5">
        <path d={SHORE.fill} className="ss-water" />
        <path d={SHORE.lace} className="ss-wet" />
      </g>
    </svg>
  );
}

// ── shells, each drawn at the size it is shown, so strokes stay even ──

const SCALLOP = (() => {
  const hx = 32;
  const hy = 47;
  const R = 37;
  const n = 11;
  const ends: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((-146 + (112 * i) / (n - 1)) * Math.PI) / 180;
    ends.push([hx + Math.cos(a) * R, hy + Math.sin(a) * R]);
  }
  let edge = `M${hx} ${hy}L${f(ends[0][0])} ${f(ends[0][1])}`;
  for (let i = 1; i < n; i++) edge += `A4.4 4.4 0 0 1 ${f(ends[i][0])} ${f(ends[i][1])}`;
  edge += "Z";
  const ribs = ends
    .slice(1, -1)
    .map(([x, y]) => `M${hx} ${hy - 3}Q${f(hx + (x - hx) * 0.5)} ${f(hy + (y - hy) * 0.52 - 1)} ${f(hx + (x - hx) * 0.93)} ${f(hy + (y - hy) * 0.93)}`)
    .join("");
  const grow = [0.42, 0.68].map((k) => {
    const a = ends[0];
    const b = ends[n - 1];
    return `M${f(hx + (a[0] - hx) * k)} ${f(hy + (a[1] - hy) * k)}Q${hx} ${f(hy - R * k * 1.12)} ${f(hx + (b[0] - hx) * k)} ${f(hy + (b[1] - hy) * k)}`;
  });
  const ears = `M${hx - 2} ${hy - 5}L${hx - 15} ${hy - 7}Q${hx - 17} ${hy - 1} ${hx - 13} ${hy + 3}L${hx} ${hy + 3}ZM${hx + 2} ${hy - 5}L${hx + 15} ${hy - 7}Q${hx + 17} ${hy - 1} ${hx + 13} ${hy + 3}L${hx} ${hy + 3}Z`;
  return { edge, ribs, grow, ears };
})();

function Scallop() {
  return (
    <svg viewBox="0 4 64 52" className="ss-shell" aria-hidden>
      <path d={SCALLOP.ears} className="ss-fill" />
      <path d={SCALLOP.edge} className="ss-fill" />
      <path d={SCALLOP.ribs} />
      <path d={SCALLOP.grow.join("")} className="ss-faint" strokeDasharray="1.5 3" />
    </svg>
  );
}

const STAR = (() => {
  const arms = [0, 1, 2, 3, 4].map((k) => ((-90 + k * 72 + [0, 6, -4, 5, -3][k]) * Math.PI) / 180);
  const R = [27, 25, 28, 24.5, 26.5];
  const r = 9.5;
  const P = (a: number, d: number): Pt => [Math.cos(a) * d, Math.sin(a) * d];
  let d = "";
  arms.forEach((a, k) => {
    const prev = P(a - 0.63, r);
    const tipL = P(a - 0.075, R[k] - 1.2);
    const tipR = P(a + 0.075, R[k] - 1.2);
    const next = P(a + 0.63, r);
    const c1 = P(a - 0.22, R[k] * 0.56);
    const c2 = P(a + 0.22, R[k] * 0.56);
    d += `${k === 0 ? "M" : "L"}${f(prev[0])} ${f(prev[1])}Q${f(c1[0])} ${f(c1[1])} ${f(tipL[0])} ${f(tipL[1])}`;
    d += `A2 2 0 0 1 ${f(tipR[0])} ${f(tipR[1])}Q${f(c2[0])} ${f(c2[1])} ${f(next[0])} ${f(next[1])}`;
  });
  const dots: Pt[] = [];
  arms.forEach((a, k) => {
    for (const t of [0.28, 0.46, 0.63, 0.78]) {
      const [x, y] = P(a, R[k] * t);
      dots.push([f(x), f(y)]);
    }
  });
  return { d: `${d}Z`, dots };
})();

function Starfish() {
  return (
    <svg viewBox="-32 -32 64 64" className="ss-shell" aria-hidden>
      <path d={STAR.d} className="ss-fill" />
      {STAR.dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 1.15 : 0.85} className="ss-dotfill" />
      ))}
      <circle r="2.6" className="ss-faint" />
    </svg>
  );
}

const AUGER = (() => {
  // a tall spire: whorls stacked from the aperture up to the tip
  const whorls: string[] = [];
  let y = 60;
  let w = 9;
  while (w > 1.4) {
    const h = w * 1.25;
    whorls.push(`M${f(15 - w)} ${f(y)}Q15 ${f(y + h * 0.35)} ${f(15 + w)} ${f(y - h * 0.32)}`);
    y -= h;
    w *= 0.8;
  }
  return { whorls: whorls.join(""), tip: f(y) };
})();

function Auger() {
  return (
    <svg viewBox="0 0 30 74" className="ss-shell" aria-hidden>
      <path d={`M15 ${AUGER.tip}L25 58Q26 68 18 71Q11 73 6 66Q3 61 5 56Z`} className="ss-fill" />
      <path d={AUGER.whorls} />
      <path d="M9 63Q12 69 18 68" className="ss-faint" />
    </svg>
  );
}

const SNAIL = (() => {
  let d = "";
  const turns = 2.6;
  const N = 60;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = t * turns * Math.PI * 2 + 0.6;
    const rr = 1.4 + t * 13.5;
    d += `${i ? "L" : "M"}${f(20 + Math.cos(a) * rr)} ${f(20 + Math.sin(a) * rr * 0.92)}`;
  }
  return d;
})();

function Snail() {
  return (
    <svg viewBox="0 0 40 40" className="ss-shell" aria-hidden>
      <ellipse cx="20" cy="20" rx="16.4" ry="15.2" className="ss-fill" />
      <path d={SNAIL} />
      <path d="M33 26Q36 31 31 35" className="ss-faint" />
    </svg>
  );
}

const PETALS = [0, 1, 2, 3, 4].map((k) => {
  const a = -90 + k * 72;
  return `rotate(${a})`;
});

function SandDollar() {
  return (
    <svg viewBox="-22 -22 44 44" className="ss-shell" aria-hidden>
      <circle r="19.5" className="ss-fill" />
      <circle r="17" className="ss-faint" strokeDasharray="0.8 2.6" />
      {PETALS.map((t, i) => (
        <g key={i} transform={t}>
          <path d="M3 0Q8 -3.4 13.2 0Q8 3.4 3 0Z" />
          <path d="M4.5 0H11.5" className="ss-faint" strokeDasharray="0.8 1.6" />
        </g>
      ))}
      <circle r="1.4" className="ss-dotfill" />
    </svg>
  );
}

/** One shell placed on the sand. Position, size and turn come from the class. */
function Lay({ k, children }: { k: string; children: ReactNode }) {
  return <span className={`ss-lay ss-${k}`}>{children}</span>;
}

export function Shells() {
  return (
    <>
      <Lay k="s1">
        <Scallop />
      </Lay>
      <Lay k="s2">
        <Starfish />
      </Lay>
      <Lay k="s3">
        <Auger />
      </Lay>
      <Lay k="s4">
        <SandDollar />
      </Lay>
      <Lay k="s5">
        <Snail />
      </Lay>
      <Lay k="s6">
        <Starfish />
      </Lay>
    </>
  );
}

export function Hero({ r }: HeroProps) {
  return (
    <div className="ss-hero">
      <div className="ss-sand" />
      <Shells />
      <div className="ss-in">
        <Blessing r={r} className="ss-a1" />
        <p className="ss-title ss-a2">{r.title}</p>
        <Names r={r} className="ss-names ss-a3" />
        {r.milestone && <p className="ss-milestone ss-a3">{r.milestone}</p>}
        <span className="ss-rule ss-a4" aria-hidden>
          <Ornament />
        </span>
        {r.when.date && (
          <div className="ss-when ss-a4">
            {r.when.weekday && <span>{r.when.weekday}</span>}
            <strong>{r.when.date}</strong>
            {r.when.time && <span>{r.when.time}</span>}
          </div>
        )}
        {r.main?.venue && r.oneVenue && <p className="ss-venue ss-a5">{r.main.venue}</p>}
      </div>
      <Sea />
    </div>
  );
}

// ── small pieces ──

const SWELL_L = smooth(crest(12, 3, 26, 0, 74).filter(([x]) => x >= 0 && x <= 74));
const SWELL_R = smooth(crest(12, 3, 26, Math.PI, 74).filter(([x]) => x >= 0 && x <= 74).map(([x, y]) => [x + 126, y] as Pt));

export function Divider() {
  return (
    <svg className="ss-divider" viewBox="0 0 200 26" fill="none" aria-hidden>
      <path d={SWELL_L} className="ss-dv-line" />
      <path d={SWELL_R} className="ss-dv-line" />
      <g transform="translate(84 -3) scale(0.5)">
        <path d={SCALLOP.ears} className="ss-fill ss-dv-shell" />
        <path d={SCALLOP.edge} className="ss-fill ss-dv-shell" />
        <path d={SCALLOP.ribs} className="ss-dv-shell" />
      </g>
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="ss-orn" viewBox="0 0 64 14" fill="none" aria-hidden>
      <path d="M2 8C7 3 12 3 17 8S27 13 32 8S42 3 47 8S57 13 62 8" className="ss-dv-line" />
    </svg>
  );
}

export function Backdrop() {
  return <div className="ss-sand ss-sand-page" />;
}
