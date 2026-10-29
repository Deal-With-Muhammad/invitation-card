import type { CoverProps } from "../types";
import { Card } from "./art";

// The back of a sealed envelope, drawn in a 352 × 544 box (1.1 × 1.7 card widths)
// so the card inside lines up exactly with the hero card underneath. Tapping cracks
// the wax seal, lifts the flap on its hinge, and the card rises out as the envelope
// drops away. The cover's card ends exactly where the hero's card sits.

type Pt = [number, number];

const f = (n: number) => Math.round(n * 10) / 10;
const P = (p: Pt) => `${f(p[0])} ${f(p[1])}`;

const TOP_FLAP = "M0 0H352C328 66 238 226 195 312Q176 346 157 312C114 226 24 66 0 0Z";
const LEFT_FLAP = "M0 0C38 68 154 232 180 266Q192 281 180 296L194 544H0Z";
const RIGHT_FLAP = "M352 0C314 68 198 232 172 266Q160 281 172 296L158 544H352Z";
const BOTTOM_FLAP = "M0 544C42 482 122 392 160 338Q176 316 192 338C230 392 310 482 352 544Z";
const LINER = "M14 8H338C316 70 232 222 193 302Q176 332 159 302C120 222 36 70 14 8Z";

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** The melted outline of a wax puddle: a wobbly circle with a couple of bulges. */
function wax(R: number, seed: number) {
  const r = rand(seed);
  const n = 44;
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
  const lobes = [r() * 6.28, r() * 6.28, r() * 6.28];
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    let k = 1 + 0.03 * Math.sin(3 * a + ph[0]) + 0.024 * Math.sin(5 * a + ph[1]) + 0.016 * Math.sin(9 * a + ph[2]) + (r() - 0.5) * 0.028;
    for (const [j, l] of lobes.entries()) {
      const d = Math.atan2(Math.sin(a - l), Math.cos(a - l));
      k += (j === 0 ? 0.07 : 0.04) * Math.exp(-(d * d) / 0.05);
    }
    pts.push([Math.cos(a) * R * k, Math.sin(a) * R * k]);
  }
  let d = `M${P(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d += `C${P([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${P([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${P(p2)}`;
  }
  return `${d}Z`;
}

const WAX = wax(47, 23);

// Two small leaves pressed into the seal under the initials.
const SEAL_LEAVES = "M-2 17Q-9 12-16 15Q-9 20-2 17ZM2 17Q9 12 16 15Q9 20 2 17Z";

const initials = (names: string[]) => names.map((n) => n.trim().charAt(0).toUpperCase()).filter(Boolean);

function Seal({ ini }: { ini: string[] }) {
  return (
    <>
      <svg className="lp-seal-art" viewBox="-60 -60 120 120" aria-hidden>
        <path d={WAX} className="lp-wax-shadow" transform="translate(1.5 3.5)" filter="url(#lp-soft)" />
        <path d={WAX} fill="url(#lp-wax)" />
        <path d={WAX} fill="none" stroke="url(#lp-rim)" strokeWidth="1.4" />
        <path d="M-37 -14A40 40 0 0 1-14 -37" className="lp-gloss" filter="url(#lp-soft)" />
        <circle r="35" fill="url(#lp-press)" />
        <circle r="35" fill="none" stroke="url(#lp-rim-in)" strokeWidth="1.4" />
        <circle r="30.5" fill="none" className="lp-ring-lo" transform="translate(.6 .7)" />
        <circle r="30.5" fill="none" className="lp-ring-hi" />
        <path d={SEAL_LEAVES} className="lp-ring-lo" transform="translate(.5 .6)" />
        <path d={SEAL_LEAVES} className="lp-ring-hi lp-seal-leaf" />
      </svg>
      <span className="lp-ini">
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
    </>
  );
}

export function Cover({ r, onOpen }: CoverProps) {
  const ini = initials(r.people.map((p) => p.name));
  return (
    <div
      className="lp-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <radialGradient id="lp-wax" cx="38%" cy="32%" r="75%">
            <stop offset="0" className="lp-s-wax-hi" />
            <stop offset=".55" className="lp-s-wax" />
            <stop offset="1" className="lp-s-wax-lo" />
          </radialGradient>
          <linearGradient id="lp-press" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className="lp-s-wax-lo" />
            <stop offset=".6" className="lp-s-wax" />
            <stop offset="1" className="lp-s-wax-hi" />
          </linearGradient>
          <linearGradient id="lp-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className="lp-s-rim" />
            <stop offset=".5" className="lp-s-clear" />
          </linearGradient>
          <linearGradient id="lp-rim-in" x1="0" y1="0" x2="1" y2="1">
            <stop offset=".45" className="lp-s-clear" />
            <stop offset="1" className="lp-s-rim" />
          </linearGradient>
          <linearGradient id="lp-side-l" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" className="lp-s-light" />
            <stop offset=".5" className="lp-s-paper" />
          </linearGradient>
          <linearGradient id="lp-side-r" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" className="lp-s-shade" />
            <stop offset=".5" className="lp-s-mid" />
          </linearGradient>
          <linearGradient id="lp-bottom" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" className="lp-s-mid" />
            <stop offset=".5" className="lp-s-paper" />
            <stop offset="1" className="lp-s-light" />
          </linearGradient>
          <linearGradient id="lp-top" x1="0" y1="0" x2=".35" y2="1">
            <stop offset="0" className="lp-s-light" />
            <stop offset=".6" className="lp-s-paper" />
            <stop offset="1" className="lp-s-mid" />
          </linearGradient>
          <linearGradient id="lp-inside" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="lp-s-deep" />
            <stop offset=".6" className="lp-s-clear" />
          </linearGradient>
          <pattern id="lp-liner-pat" width="22" height="22" patternUnits="userSpaceOnUse">
            <rect width="22" height="22" className="lp-liner-bg" />
            <path d="M5 6Q7 2.5 11 3Q8.5 6 5 6ZM16 17Q18 13.5 22 14Q19.5 17 16 17ZM-6 17Q-4 13.5 0 14Q-2.5 17-6 17Z" className="lp-liner-leaf" />
            <circle cx="12.5" cy="7.5" r=".9" className="lp-liner-leaf" />
            <circle cx="1.5" cy="18.5" r=".9" className="lp-liner-leaf" />
          </pattern>
          <filter id="lp-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id="lp-soft-lg" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
      </svg>

      <div className="lp-stage">
        <div className="lp-env lp-env-shadow" />
        <div className="lp-env lp-env-back">
          <svg viewBox="0 0 352 544" preserveAspectRatio="none" aria-hidden>
            <rect width="352" height="544" className="lp-inside" />
            <rect x="12" y="8" width="328" height="400" fill="url(#lp-liner-pat)" />
            <rect width="352" height="544" fill="url(#lp-inside)" />
          </svg>
        </div>

        <div className="lp-env lp-flap">
          <div className="lp-flap-in">
            <svg className="lp-face lp-face-out" viewBox="0 0 352 544" aria-hidden>
              <path d={TOP_FLAP} fill="url(#lp-top)" />
              <path d="M10 2.5H342" className="lp-fold" />
            </svg>
            <svg className="lp-face lp-face-in" viewBox="0 0 352 544" aria-hidden>
              <path d={TOP_FLAP} className="lp-inside" />
              <path d={LINER} fill="url(#lp-liner-pat)" />
              <path d={LINER} fill="url(#lp-inside)" opacity=".5" />
            </svg>
          </div>
        </div>

        <div className="lp-card-move" aria-hidden>
          <Card r={r} />
        </div>

        <div className="lp-env lp-pocket">
          <svg viewBox="0 0 352 544" aria-hidden>
            <path d={LEFT_FLAP} fill="url(#lp-side-l)" />
            <path d={RIGHT_FLAP} fill="url(#lp-side-r)" />
            <path d={LEFT_FLAP} className="lp-crease" />
            <path d={RIGHT_FLAP} className="lp-crease" />
            <path d={BOTTOM_FLAP} fill="url(#lp-bottom)" />
            <path d="M3 540C44 480 123 391 160 339Q176 318 192 339C229 391 308 480 349 540" className="lp-edge-hi" />
          </svg>
        </div>

        <div className="lp-env lp-flap-shadow">
          <svg viewBox="0 0 352 544" aria-hidden>
            <path d={TOP_FLAP} transform="translate(0 5)" className="lp-cast" filter="url(#lp-soft-lg)" />
          </svg>
        </div>

        <div className="lp-seal">
          <div className="lp-half lp-half-l">
            <Seal ini={ini} />
          </div>
          <div className="lp-half lp-half-r">
            <Seal ini={ini} />
          </div>
        </div>
      </div>

      <span className="lp-tap">
        <i />
        {r.t.tapToOpen}
        <i />
      </span>
    </div>
  );
}
