import type { CSSProperties } from "react";

import type { Resolved } from "../../resolve";
import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Open House: a mid-century house front, drawn flat in four palette tones.
// The house is one SVG (viewBox 0 68 390 352); the date plaque and the house
// number are HTML laid over it, so they follow the guest's language and font.

const f = (n: number) => Math.round(n * 100) / 100;

// ── plants (shared with the cover and the divider)

/** Snake plant in a cylinder planter on hairpin legs. Origin: bottom centre of the legs. */
export function SnakePlant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-11-8L-14 0M11-8L14 0M-4-8L-5 0M4-8L5 0" className="oh-leg" />
      <path d="M-1-38C-4-54-6-70-3-88C1-72 2-55 2-38Z" className="oh-leaf" />
      <path d="M-6-38C-12-50-17-62-17-78C-11-66-6-54-2-38Z" className="oh-leaf-2" />
      <path d="M4-38C9-52 13-63 13-74C7-63 3-52 0-38Z" className="oh-leaf-2" />
      <path d="M-9-38C-17-44-22-50-25-60C-18-54-12-48-5-38Z" className="oh-leaf" />
      <path d="M7-38C14-46 19-51 23-58C16-55 10-49 3-38Z" className="oh-leaf" />
      <path d="M-2.4-50C-3.6-60-4-70-3-80M-10-50C-13-58-15-64-15.6-72" className="oh-vein" />
      <rect x="-13" y="-39" width="26" height="31" rx="2" className="oh-pot" />
      <path d="M-13-30H13M-13-27H13" className="oh-pot-band" />
    </g>
  );
}

/** A round leafy plant in a tapered pot. Origin: bottom centre. */
export function BushPlant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-2-30C-14-34-24-46-22-60C-10-58-2-46-2-30Z" className="oh-leaf-2" />
      <path d="M2-30C14-36 26-44 28-58C14-60 4-48 2-30Z" className="oh-leaf" />
      <path d="M0-30C-6-44-6-60 2-74C10-60 8-44 0-30Z" className="oh-leaf" />
      <path d="M-3-30C-16-30-28-36-32-46C-20-48-9-42-3-30Z" className="oh-leaf" />
      <path d="M3-30C14-28 26-30 32-38C22-44 10-40 3-30Z" className="oh-leaf-2" />
      <path d="M1-32C1-46 2-58 2-70M-3-32C-9-40-15-48-19-56M3-32C10-40 17-48 23-55" className="oh-vein" />
      <path d="M-16-32H16L12 0H-12Z" className="oh-pot-2" />
      <path d="M-17.5-36H17.5V-30H-17.5Z" className="oh-pot-2 oh-rim" />
    </g>
  );
}

/** A hanging pothos in a macramé hanger. Origin: the hook. */
function HangingPlant({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0L-9 22M0 0L9 22M0 0V22M-9 22L-4 28M9 22L4 28" className="oh-cord" />
      <path d="M-11 22C-11 32-6 37 0 37C6 37 11 32 11 22Z" className="oh-pot" />
      <path d="M-11 22H11" className="oh-pot-band" />
      <path d="M-8 30C-12 38-12 46-8 54M7 31C11 40 12 48 9 58" className="oh-vine" />
      {[
        [-10, 36, -30], [-12, 44, 20], [-9, 52, -20], [9, 37, 30], [11.5, 46, -20], [10, 55, 20], [0, 39, 0],
      ].map(([lx, ly, a], i) => (
        <ellipse key={i} cx={lx} cy={ly} rx="3.4" ry="2.3" transform={`rotate(${a} ${lx} ${ly})`} className={i % 2 ? "oh-leaf-2" : "oh-leaf"} />
      ))}
    </g>
  );
}

// ── the house

function House() {
  return (
    <svg className="oh-house-art" viewBox="0 68 390 352" aria-hidden>
      {/* sky: a big low sun and two birds */}
      <circle cx="316" cy="132" r="42" className="oh-sun" />
      <path d="M112 112q5-4 9 0q4-4 9 0M136 100q4-3 7 0q3-3 7 0" className="oh-bird" />

      {/* chimney, behind the roof */}
      <path d="M90 196V142H114V196Z" className="oh-chimney" />
      <path d="M86 134H118V143H86Z" className="oh-roof-dark" />

      {/* walls, with a vertical-board panel on the right */}
      <path d="M44 380V226L236 99L346 221V380Z" className="oh-wall" />
      <path d="M282 380V150.5L346 221V380Z" className="oh-panel" />
      <path
        d={Array.from({ length: 8 }, (_, i) => {
          const x = 290 + i * 8;
          const top = 99 + ((x - 236) / 110) * 122;
          return `M${x} ${f(top + 2)}V380`;
        }).join("")}
        className="oh-boards"
      />
      <path d="M44 300H282" className="oh-boards" />

      {/* roof: an asymmetric gable with a white fascia */}
      <path d="M20 228L236 80L368 228L360 236L236 98L28 236Z" className="oh-roof" />
      <path d="M28 236L236 98L360 236" className="oh-fascia" />

      {/* round window in the gable */}
      <circle cx="236" cy="162" r="19" className="oh-trim" />
      <circle cx="236" cy="162" r="14.5" className="oh-glass" />
      <path d="M236 147.5V176.5M221.5 162H250.5" className="oh-mullion" />

      {/* picture window: lamp, plant and curtains inside */}
      <rect x="61" y="257" width="112" height="80" rx="2" className="oh-trim" />
      <rect x="66" y="262" width="102" height="70" className="oh-glass" />
      <circle cx="88" cy="292" r="18" className="oh-glow" />
      <path d="M78 332V300M78 300C78 286 92 280 100 286M95 284L105 284L102 292L98 292Z" className="oh-inside" />
      <path d="M140 332V318C140 310 152 310 152 318V332Z" className="oh-inside-fill" />
      <path d="M146 312C140 304 140 296 146 290C152 296 152 304 146 312Z" className="oh-inside-fill" />
      <path d="M66 262H80C78 284 76 308 72 332H66Z" className="oh-curtain" />
      <path d="M168 262H154C156 284 158 308 162 332H168Z" className="oh-curtain" />
      <path d="M100 262V332M134 262V332" className="oh-mullion" />
      <path d="M56 336H178V342H56Z" className="oh-sill" />
      {/* window box with flowers */}
      <path d="M68 342H166L163 357H71Z" className="oh-box" />
      {[78, 92, 106, 120, 134, 148, 160].map((x, i) => {
        const h = 9 + (i % 3) * 3;
        return (
          <g key={x}>
            <path d={`M${x} 342V${342 - h}`} className="oh-stem" />
            <path d={`M${x} 340C${x - 6} 338 ${x - 7} 334 ${x - 6} 331C${x - 2} 333 ${x} 336 ${x} 340Z`} className="oh-leaf-2" />
            <path d={`M${x} 339C${x + 5} 337 ${x + 7} 334 ${x + 6} 330C${x + 2} 332 ${x} 335 ${x} 339Z`} className="oh-leaf" />
            <circle cx={x} cy={342 - h - 2} r="3.1" className={i % 2 ? "oh-flower" : "oh-flower-2"} />
            <circle cx={x} cy={342 - h - 2} r="1.1" className={i % 2 ? "oh-flower-2" : "oh-flower"} />
          </g>
        );
      })}

      {/* tall window on the board panel */}
      <rect x="295" y="246" width="38" height="96" rx="2" className="oh-trim" />
      <rect x="300" y="251" width="28" height="86" className="oh-glass" />
      <circle cx="314" cy="282" r="13" className="oh-glow" />
      <path d="M314 264V274M307 274H321L318 282H310Z" className="oh-inside" />
      <path d="M300 300H328" className="oh-mullion" />
      <path d="M291 342H337V347H291Z" className="oh-sill" />

      {/* front door, canopy, sconce */}
      <path d="M189 380V279H249V380Z" className="oh-trim" />
      <path d="M196 380V286H242V380Z" className="oh-door" />
      <path d="M198 288H240V378H198Z" className="oh-door-panel" />
      <rect x="203" y="318" width="9" height="9" className="oh-glass" />
      <rect x="214.5" y="331" width="9" height="9" className="oh-glass" />
      <rect x="226" y="344" width="9" height="9" className="oh-glass" />
      <circle cx="235" cy="340" r="2.6" className="oh-knob" />
      <path d="M176 270H262V278H176Z" className="oh-canopy" />
      <path d="M180 278V281M258 278V281" className="oh-cord" />
      <HangingPlant x={256} y={278} />
      <path d="M177 300H185L183.5 308H178.5Z" className="oh-canopy" />
      <circle cx="181" cy="311" r="6" className="oh-glow" />
      <circle cx="181" cy="309.6" r="2" className="oh-bulb" />

      {/* plants either side of the door */}
      <SnakePlant x={166} y={380} s={0.92} />
      <BushPlant x={276} y={380} s={0.86} />

      {/* a slender tree and a shrub at the corners */}
      <path d="M33 380V352" className="oh-trunk" />
      <path d="M33 356C16 344 14 300 33 252C52 300 50 344 33 356Z" className="oh-leaf-2" />
      <path d="M33 352V286M33 330L24 318M33 312L41 300M33 296L26 288" className="oh-vein" />
      <circle cx="356" cy="370" r="15" className="oh-leaf" />
      <circle cx="372" cy="374" r="11" className="oh-leaf-2" />
      <circle cx="342" cy="375" r="9" className="oh-leaf-2" />

      {/* ground, porch, path and the doormat */}
      <path d="M0 380H390V420H0Z" className="oh-ground" />
      <path d="M176 380H262L270 391H168Z" className="oh-porch" />
      <path d="M182 391H256L272 420H166Z" className="oh-path" />
      <path d="M198 382.4H240L243 389.4H195Z" className="oh-mat" />
      <path d="M200.6 384.4H237.8M199.6 386.4H238.8" className="oh-mat-line" />
      <path d="M0 380H390" className="oh-groundline" />
      <path d="M30 398h6M60 408h8M110 396h5M300 402h7M338 410h6M360 396h5" className="oh-tuft" />
    </svg>
  );
}

/** "26 December 2026" fits a plaque about 18 characters wide; longer dates shrink. */
export function Plaque({ r, className = "" }: { r: Resolved; className?: string }) {
  const meta = [r.when.weekday, r.when.time].filter(Boolean).join(" · ");
  return (
    <div className={`oh-plaque ${className}`} style={{ "--dl": Math.max(14, r.when.date.length) } as CSSProperties}>
      {meta && <span>{meta}</span>}
      <strong>{r.when.date}</strong>
      {r.main?.venue && r.oneVenue && <em>{r.main.venue}</em>}
    </div>
  );
}

/** Pennant bunting strung across the top of the sky. */
const BUNTING = (() => {
  const a = [-6, 26];
  const c = [195, 74];
  const b = [396, 18];
  const at = (t: number) => {
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
  };
  const flags = Array.from({ length: 13 }, (_, i) => {
    const t = 0.06 + i * 0.073;
    const [x, y] = at(t);
    const [x2, y2] = at(t + 0.01);
    const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
    return { x: f(x), y: f(y), ang: f(ang), tone: i % 4 };
  });
  return { string: `M${a[0]} ${a[1]}Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`, flags };
})();

function Bunting() {
  return (
    <svg className="oh-bunting" viewBox="0 0 390 96" preserveAspectRatio="xMidYMin meet" aria-hidden>
      <path d={BUNTING.string} className="oh-string" />
      {BUNTING.flags.map((fl, i) => (
        <path key={i} d="M-8 0H8L0 17Z" transform={`translate(${fl.x} ${fl.y}) rotate(${fl.ang})`} className={`oh-flag oh-flag-${fl.tone}`} />
      ))}
    </svg>
  );
}

export function Scene({ r }: { r: Resolved }) {
  const bism = r.data.bismillah !== "none";
  const num = r.main?.day || "";
  return (
    <div className="oh-hero">
      <Bunting />
      <div className="oh-top">
        {bism && <Blessing r={r} className="oh-a1" />}
        <p className="oh-title oh-a1">{r.title}</p>
        <div className="oh-namebox oh-a2" style={{ "--tl": r.people.map((p) => p.name).join(` ${r.t.and} `).length || 4 } as CSSProperties}>
          <Names r={r} className="oh-names" />
        </div>
        {r.milestone && <p className="oh-milestone oh-a2">{r.milestone}</p>}
      </div>
      <div className="oh-house">
        <House />
        {r.when.date && <Plaque r={r} className="oh-a3" />}
        {num && <span className="oh-num">{num}</span>}
      </div>
      <span className="oh-cue" aria-hidden>
        {r.t.scroll}
        <i />
      </span>
    </div>
  );
}

export function Hero({ r }: HeroProps) {
  return <Scene r={r} />;
}

/** A floating shelf with three little pots. */
export function Divider({ index }: { index: number }) {
  const flip = index % 2 === 1;
  return (
    <svg className="oh-div" viewBox="0 0 200 56" aria-hidden>
      <g transform={flip ? "matrix(-1 0 0 1 200 0)" : undefined}>
        <path d="M30 46H170V50H30Z" className="oh-shelf" />
        <path d="M48 50V55M152 50V55" className="oh-shelf-line" />
        <SnakePlant x={62} y={46} s={0.4} />
        {/* a little cactus in a round pot */}
        <g transform="translate(100 46) scale(.46)">
          <path d="M-5-30V-58C-5-66 5-66 5-58V-30Z" className="oh-leaf" />
          <path d="M-5-44H-11C-15-44-15-48-15-52V-56C-15-60-9-60-9-56V-50H-5Z" className="oh-leaf-2" />
          <path d="M5-38H11C15-38 15-42 15-46V-52C15-56 9-56 9-52V-44H5Z" className="oh-leaf-2" />
          <circle cx="0" cy="-66" r="3.2" className="oh-flower-2" />
          <path d="M-15-30H15C15-12 9 0 0 0C-9 0-15-12-15-30Z" className="oh-pot" />
          <path d="M-14.4-24H14.4" className="oh-pot-band" />
        </g>
        <BushPlant x={138} y={46} s={0.4} />
      </g>
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="oh-orn" viewBox="0 0 64 16" aria-hidden>
      <path d="M0 11H22M42 11H64" className="oh-orn-line" />
      <path d="M24 12L32 4L40 12" className="oh-orn-roof" />
      <rect x="29.5" y="8" width="5" height="5" className="oh-orn-door" />
    </svg>
  );
}

export function Backdrop() {
  return <div className="oh-back" />;
}
