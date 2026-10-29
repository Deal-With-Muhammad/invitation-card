import type { Resolved } from "../../resolve";
import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Scroll: a parchment diploma between two turned rollers, on a dark desk.
// The paper is CSS (grain, mottling, curl shading); the rollers are CSS cylinders
// with SVG finials; laurels, mortarboard, ribbon and seal are flat SVG. No ids.

const f = (n: number) => Math.round(n * 100) / 100;

// ── laurel

type Leaf = { x: number; y: number; a: number; l: number; dark: boolean };

/** One branch of laurel along an elliptical arc (left side; mirror for the right). */
function branch(rx: number, ry: number, from: number, to: number, n: number, size: number) {
  const leaves: Leaf[] = [];
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = ((from + ((to - from) * i) / 40) * Math.PI) / 180;
    pts.push(`${f(rx * Math.cos(t))} ${f(ry * Math.sin(t))}`);
  }
  for (let i = 0; i < n; i++) {
    const deg = from + 4 + ((to - from - 10) * i) / (n - 1);
    const t = (deg * Math.PI) / 180;
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);
    // tangent (towards the tip) and outward normal
    const tx = -rx * Math.sin(t);
    const ty = ry * Math.cos(t);
    const tl = Math.hypot(tx, ty);
    const ux = tx / tl;
    const uy = ty / tl;
    const nx = Math.cos(t);
    const ny = Math.sin(t);
    const l = size * (1 - (i / n) * 0.42);
    for (const side of [1, -1]) {
      const dx = ux + side * 0.95 * nx;
      const dy = uy + side * 0.95 * ny;
      leaves.push({ x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI, l, dark: (i + (side > 0 ? 0 : 1)) % 2 === 0 });
    }
  }
  const t = (to * Math.PI) / 180;
  const tx = -rx * Math.sin(t);
  const ty = ry * Math.cos(t);
  leaves.push({ x: rx * Math.cos(t), y: ry * Math.sin(t), a: (Math.atan2(ty, tx) * 180) / Math.PI, l: size * 0.62, dark: false });
  return { stem: `M${pts.join("L")}`, leaves };
}

const leafPath = (l: number) => `M0 0C${f(l * 0.3)} ${f(-l * 0.3)} ${f(l * 0.75)} ${f(-l * 0.28)} ${f(l)} 0C${f(l * 0.75)} ${f(l * 0.28)} ${f(l * 0.3)} ${f(l * 0.3)} 0 0Z`;

const WREATH = branch(64, 56, 98, 252, 11, 17);

function Branch({ b, mirror = false }: { b: ReturnType<typeof branch>; mirror?: boolean }) {
  return (
    <g transform={mirror ? "scale(-1 1)" : undefined}>
      <path d={b.stem} className="sc-stem" />
      {b.leaves.map((L, i) => (
        <path key={i} d={leafPath(L.l)} transform={`translate(${f(L.x)} ${f(L.y)}) rotate(${f(L.a)})`} className={L.dark ? "sc-leaf is-dark" : "sc-leaf"} />
      ))}
    </g>
  );
}

export function Wreath({ className = "" }: { className?: string }) {
  return (
    <svg className={`sc-wreath ${className}`} viewBox="-82 -66 164 136" aria-hidden>
      <Branch b={WREATH} />
      <Branch b={WREATH} mirror />
      {/* the tie where the branches cross */}
      <path d="M-9 54C-5 51 5 51 9 54M-4 55.5L-11 66M4 55.5L11 66" className="sc-stem" />
      <circle cx="0" cy="54.5" r="2.6" className="sc-fill" />
    </svg>
  );
}

/** A horizontal sprig growing right from (0, 0): a gently rising stem with paired leaves. */
const SPRIG = (() => {
  const L = 58;
  const pt = (t: number): [number, number] => [L * t, -7 * t * t];
  const stem = `M0 0Q${L / 2} 0 ${L} -7`;
  const leaves: Leaf[] = [];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const t = 0.12 + (i / (n - 1)) * 0.78;
    const [x, y] = pt(t);
    const slope = (Math.atan2(-14 * t, L) * 180) / Math.PI;
    const l = 12.5 - i * 0.9;
    leaves.push({ x, y, a: slope - 38, l, dark: i % 2 === 0 });
    leaves.push({ x, y, a: slope + 38, l: l * 0.92, dark: i % 2 === 1 });
  }
  leaves.push({ x: L, y: -7, a: (Math.atan2(-14, L) * 180) / Math.PI, l: 9, dark: false });
  return { stem, leaves };
})();

/** A small pair of sprigs for the divider. */
export function Sprigs({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="-72 -22 144 34" aria-hidden>
      <g transform="translate(6 0)">
        <Branch b={SPRIG} />
      </g>
      <g transform="translate(-6 0)">
        <Branch b={SPRIG} mirror />
      </g>
      <circle cx="0" cy="0" r="2.4" className="sc-fill" />
    </svg>
  );
}

// ── mortarboard, for when there is no milestone

export function Mortarboard({ className = "" }: { className?: string }) {
  return (
    <svg className={`sc-cap ${className}`} viewBox="0 0 120 92" aria-hidden>
      <path d="M31 44V60C31 69 89 69 89 60V44" className="sc-cap-skull" />
      <path d="M31 60C31 51 89 51 89 60" className="sc-line sc-thin" />
      <path d="M60 10L114 30L60 50L6 30Z" className="sc-cap-board" />
      <path d="M60 15.5L99 30L60 44.5L21 30Z" className="sc-line sc-thin" />
      <path d="M60 30C74 31 88 34 98 38V63" className="sc-line" />
      <circle cx="60" cy="30" r="2.6" className="sc-fill" />
      <path d="M95.2 63h5.6l2.2 15.5h-10Z" className="sc-fill" />
      <path d="M94.6 78.5V86M97 78.5V87.5M99 78.5V87.5M101.4 78.5V86" className="sc-line sc-thin" />
      <rect x="94.4" y="61" width="7.2" height="3.4" rx="1.2" className="sc-fill" />
    </svg>
  );
}

// ── ribbon and seal

export function Seal({ r, className = "", bare = false }: { r: Resolved; className?: string; bare?: boolean }) {
  const ini = r.people.map((p) => p.name.trim().charAt(0).toUpperCase()).filter(Boolean).slice(0, 2);
  return (
    <div className={`sc-seal ${className}`}>
      {!bare && (
        <svg className="sc-tails" viewBox="0 0 100 90" aria-hidden>
          <path d="M44 20L20 84L31.5 77L36 89L56 30Z" className="sc-tail" />
          <path d="M56 20L80 84L68.5 77L64 89L44 30Z" className="sc-tail is-back" />
          <path d="M44 20L36 41L45 46L54 30Z" className="sc-tail-fold" />
        </svg>
      )}
      <span className="sc-wax">
        <span className="sc-wax-in">{ini.length > 1 ? `${ini[0]}·${ini[1]}` : ini[0] ?? "✦"}</span>
      </span>
    </div>
  );
}

// ── rollers

function Finial({ side }: { side: "l" | "r" }) {
  return (
    <svg className={`sc-fin sc-fin-${side}`} viewBox="0 0 42 40" aria-hidden>
      <g transform={side === "l" ? "matrix(-1 0 0 1 42 0)" : undefined}>
        <rect x="0" y="12.5" width="3.4" height="15" rx="1" className="sc-knob-lo" />
        <rect x="3" y="6" width="4.4" height="28" rx="2.2" className="sc-knob" />
        <rect x="7.2" y="14.6" width="3.2" height="10.8" rx="1" className="sc-knob-lo" />
        <ellipse cx="14.2" cy="20" rx="4.4" ry="6.8" className="sc-knob" />
        <rect x="18.2" y="16.4" width="2.8" height="7.2" rx="1" className="sc-knob-lo" />
        <path d="M20.6 20C20.6 13.4 25.4 9.6 30.6 9.6C36.6 9.6 40.6 14.4 41.2 20C40.6 25.6 36.6 30.4 30.6 30.4C25.4 30.4 20.6 26.6 20.6 20Z" className="sc-knob" />
        <path d="M4.4 9.4V12.6M12 15.6C12.8 14.4 14.2 13.8 15.6 14M24 14.4C25.8 12.6 28.4 11.8 31 12M33.6 12.4C35.6 13.2 37.4 15 38.4 17.4" className="sc-knob-hi" />
      </g>
    </svg>
  );
}

function Roller({ className }: { className: string }) {
  return (
    <div className={`sc-roller ${className}`}>
      <i className="sc-rod" />
      <i className="sc-wrap" />
      <Finial side="l" />
      <Finial side="r" />
    </div>
  );
}

// ── the first screen

const YEAR = /^(.*?)[\s,]*((?:19|20)\d\d)$/;

function Crest({ r }: { r: Resolved }) {
  const m = r.milestone;
  const year = m.match(YEAR);
  if (m && (year || m.length <= 18)) {
    return (
      <div className="sc-crest">
        <Wreath />
        <p className="sc-mile">
          {year ? (
            <>
              {year[1] && <span>{year[1]}</span>}
              <strong>{year[2]}</strong>
            </>
          ) : (
            <strong className={m.length <= 3 ? "is-short" : m.length <= 5 ? undefined : "is-word"}>{m}</strong>
          )}
        </p>
      </div>
    );
  }
  return (
    <div className="sc-crest is-cap">
      <Mortarboard />
    </div>
  );
}

export function Scene({ r, cover = false }: { r: Resolved; cover?: boolean }) {
  const bism = r.data.bismillah !== "none";
  const m = r.milestone;
  const longMile = m && !m.match(YEAR) && m.length > 18;
  return (
    <div className={`sc-hero${cover ? " sc-hero-cover" : ""}`}>
      <div className="sc-scroll">
        <Roller className="sc-top" />
        <div className="sc-win">
          <div className="sc-sheet">
            <div className="sc-paper">
              <i className="sc-grain" />
              <span className="sc-frame" aria-hidden>
                {(["tl", "tr", "bl", "br"] as const).map((c) => (
                  <svg key={c} className={`sc-corner sc-${c}`} viewBox="-10 -10 20 20">
                    <path d="M0-7.4L7.4 0L0 7.4L-7.4 0Z" className="sc-corner-gem" />
                    <circle r="2" className="sc-fill" />
                  </svg>
                ))}
              </span>
              <div className="sc-in" aria-hidden={cover || undefined}>
                <div className="sc-group">
                  {bism && <Blessing r={r} className="sc-a1" />}
                  <div className="sc-a1">
                    <Crest r={r} />
                  </div>
                  <p className="sc-title sc-a2">{r.title}</p>
                  <Names r={r} className="sc-names sc-a2" />
                  {longMile && <p className="sc-mile-line sc-a2">{m}</p>}
                  <span className="sc-rule sc-a3" aria-hidden>
                    <i />
                  </span>
                  {r.when.date && (
                    <div className="sc-when sc-a3">
                      <strong>{r.when.date}</strong>
                      {(r.when.weekday || r.when.time) && <span>{[r.when.weekday, r.when.time].filter(Boolean).join(" · ")}</span>}
                    </div>
                  )}
                  {r.main?.venue && r.oneVenue && <p className="sc-venue sc-a4">{r.main.venue}</p>}
                </div>
                <Seal r={r} className="sc-a5" />
              </div>
            </div>
            <Roller className="sc-bot" />
          </div>
        </div>
        {cover && (
          <>
            <Ribbon r={r} />
            <span className="sc-tap">
              <i />
              {r.t.tapToOpen}
              <i />
            </span>
          </>
        )}
      </div>
      {!cover && (
        <span className="sc-cue" aria-hidden>
          {r.t.scroll}
          <i />
        </span>
      )}
    </div>
  );
}

/** The ribbon tied round the closed scroll, with a wax seal on the knot (cover only). */
function Ribbon({ r }: { r: Resolved }) {
  return (
    <div className="sc-ribbon">
      <svg viewBox="0 0 140 150" aria-hidden>
        <path d="M62 52L44 132L56 125L60 140L72 66Z" className="sc-tail" />
        <path d="M78 52L96 132L84 125L80 140L68 66Z" className="sc-tail is-back" />
        <rect x="59" y="14" width="22" height="64" rx="1.5" className="sc-band" />
        <path d="M59 29H81M59 63H81" className="sc-band-line" />
        <path d="M66 44C50 22 22 18 20 34C18 50 46 54 66 48Z" className="sc-loop" />
        <path d="M74 44C90 22 118 18 120 34C122 50 94 54 74 48Z" className="sc-loop is-back" />
        <path d="M64 44C52 32 36 29 30 34M76 44C88 32 104 29 110 34" className="sc-band-line" />
      </svg>
      <Seal r={r} className="sc-cover-seal" bare />
    </div>
  );
}

export function Hero({ r }: HeroProps) {
  return <Scene r={r} />;
}

export function Divider() {
  return (
    <span className="sc-div">
      <i />
      <Sprigs className="sc-sprigs" />
      <i />
    </span>
  );
}

export function Ornament() {
  return (
    <svg className="sc-orn" viewBox="0 0 120 14" fill="none" aria-hidden>
      <path d="M0 5.5H46M74 5.5H120M10 8.5H46M74 8.5H110" className="sc-line sc-thin" />
      <path d="M60 1.5L65.5 7L60 12.5L54.5 7Z" className="sc-fill" />
      <circle cx="50" cy="7" r="1.5" className="sc-fill" />
      <circle cx="70" cy="7" r="1.5" className="sc-fill" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <div className="sc-desk">
      <div className="sc-desk-weave" />
      <div className="sc-desk-light" />
    </div>
  );
}
