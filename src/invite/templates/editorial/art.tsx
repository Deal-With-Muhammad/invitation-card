import type { CSSProperties } from "react";

import type { Resolved, ResolvedEvent } from "../../resolve";
import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Editorial: a fashion-magazine cover set entirely in type. A masthead fitted to
// the full column, an issue line, cover lines down the side, the names as the
// cover story, the date in big numerals and a barcode in the corner.

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* ── data → cover copy ── */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Every dated event's YYYY-MM-DD, earliest first. */
const datesOf = (r: Resolved) =>
  r.events
    .map((e) => e.raw.date)
    .filter((d) => ISO.test(d))
    .sort();

/** "26.12.26", or "25–27.12.26" for a celebration over several days. */
export function numeralsOf(r: Resolved) {
  const ds = datesOf(r);
  if (!ds.length) return "";
  const [y1, m1, d1] = ds[0].split("-");
  const [y2, m2, d2] = ds[ds.length - 1].split("-");
  const yy = (y: string) => y.slice(2);
  if (ds[0] === ds[ds.length - 1]) return `${d1}.${m1}.${yy(y1)}`;
  if (y1 === y2 && m1 === m2) return `${d1}–${d2}.${m1}.${yy(y1)}`;
  if (y1 === y2) return `${d1}.${m1}–${d2}.${m2}.${yy(y1)}`;
  return `${d1}.${m1}.${yy(y1)}–${d2}.${m2}.${yy(y2)}`;
}

/** The town from an address: the part carrying a postcode, else the last part, else the venue. */
function placeOf(e: ResolvedEvent | null) {
  if (!e) return "";
  const parts = e.address
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const coded = [...parts].reverse().find((p) => /\b\d{4,6}\b/.test(p) && p.replace(/[\d\s]+/g, "").length > 1);
  const pick = coded ? coded.replace(/\b\d{4,6}\b/g, "").replace(/\s+/g, " ").trim() : (parts[parts.length - 1] ?? "");
  return pick || e.venue;
}

/** "Vol. 26 · No. 12 · Kuala Lumpur": volume is the year, number the month. */
export function issueOf(r: Resolved) {
  const d = datesOf(r)[0];
  const bits: string[] = [];
  if (d) {
    const [y, m] = d.split("-");
    bits.push(`Vol. ${y.slice(2)}`, `No. ${Number(m)}`);
  }
  const place = placeOf(r.main);
  if (place) bits.push(place);
  return bits.join(" · ");
}

/** "Friday – Sunday" for a celebration over several days. */
function spanOfDays(r: Resolved) {
  const dated = r.events.filter((e) => e.start != null).sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
  if (!dated.length) return "";
  const a = dated[0].weekday;
  const b = dated[dated.length - 1].weekday;
  return a === b ? a : `${a} – ${b}`;
}

function coverLines(r: Resolved) {
  const out: { k: string; v: string }[] = [];
  if (r.events.length > 1) out.push({ k: r.t.celebrations, v: r.events.map((e) => e.title).join(" · ") });
  else if (r.main?.time) out.push({ k: r.t.time, v: r.main.time });
  if (r.main?.venue && r.oneVenue) out.push({ k: r.t.venue, v: r.main.venue });
  if (r.show.dress && r.dress.title) out.push({ k: r.t.dressCode, v: r.dress.title });
  return out.slice(0, 3);
}

/* ── masthead fitting ── */

// Advance widths of Bodoni Moda 500 capitals, in em, measured in the browser. The
// masthead is sized so the word spans the column exactly, like a real masthead.
const CAPS: Record<string, number> = {
  A: 0.78, B: 0.67, C: 0.72, D: 0.74, E: 0.63, F: 0.6, G: 0.75, H: 0.77, I: 0.4, J: 0.48, K: 0.73, L: 0.61, M: 0.88,
  N: 0.78, O: 0.76, P: 0.65, Q: 0.76, R: 0.73, S: 0.58, T: 0.68, U: 0.73, V: 0.78, W: 1.04, X: 0.78, Y: 0.74, Z: 0.59,
  "&": 0.82, "'": 0.22, " ": 0.25, "-": 0.36, ".": 0.22,
};
const TRACK = -0.02;
const LATIN = /^[\p{Script=Latin}\p{Zs}\p{P}\d]+$/u;

export function mastOf(label: string) {
  const text = label.trim();
  if (!LATIN.test(text)) return { split: false as const, k: Math.max(2.4, text.length * 0.62), chars: [text] };
  const chars = [...text.toUpperCase()];
  const k = chars.reduce((s, c) => s + (CAPS[c.normalize("NFD")[0]] ?? 0.72) + TRACK, 0) * 1.02;
  return { split: true as const, k, chars };
}

export function Masthead({ label, className = "" }: { label: string; className?: string }) {
  const m = mastOf(label);
  return (
    <p className={`ed-mast ${className}`} style={{ "--mk": m.k.toFixed(3) } as Vars} aria-label={label}>
      <span className="ed-mast-in" dir={m.split ? "ltr" : undefined} aria-hidden>
        {m.chars.map((c, i) => (
          <span key={i} className="ed-ch" style={{ "--i": i } as Vars}>
            {c === " " ? " " : c}
          </span>
        ))}
      </span>
    </p>
  );
}

/* ── barcode ── */

const hash = (s: string) => {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** EAN-style bars: guard bars at both ends and the middle, the rest from the seed. */
function bars(seed: string) {
  const rand = rng(hash(seed));
  const out: { x: number; w: number; g?: boolean }[] = [];
  let x = 0;
  const guard = () => {
    out.push({ x, w: 1, g: true }, { x: x + 2, w: 1, g: true });
    x += 4;
  };
  guard();
  for (let half = 0; half < 2; half++) {
    for (let i = 0; i < 12; i++) {
      const w = 1 + Math.floor(rand() * 3);
      out.push({ x, w });
      x += w + 1 + Math.floor(rand() * 2);
    }
    if (half === 0) {
      x += 1;
      guard();
    }
  }
  guard();
  return { list: out, width: x - 1 };
}

export function Barcode({ seed, digits, className = "" }: { seed: string; digits: string; className?: string }) {
  const b = bars(seed);
  return (
    <div className={`ed-code ${className}`} aria-hidden>
      <svg viewBox={`0 0 ${b.width} 40`} preserveAspectRatio="none" shapeRendering="crispEdges">
        {b.list.map((bar, i) => (
          <rect key={i} x={bar.x} y="0" width={bar.w} height={bar.g ? 40 : 35} />
        ))}
      </svg>
      <span>{digits}</span>
    </div>
  );
}

/** Thirteen digits for under the barcode, from the date and the names. */
export function codeDigits(r: Resolved) {
  const d = (datesOf(r)[0] ?? "").replace(/-/g, "").slice(2);
  const n = String(hash(r.names) % 1000000).padStart(6, "0");
  const all = `9${d || "000000"}${n}`.slice(0, 13);
  return `${all.slice(0, 1)} ${all.slice(1, 7)} ${all.slice(7)}`;
}


/* ── fitting the names ── */

// Advance widths (em, ×100) of the template's names face, measured in the browser,
// so the longest name can be set as large as the column allows.
const NAME_W = Object.fromEntries(
  "a52,b61,c51,d61,e52,f40,g60,h60,i30,j31,k60,l33,m86,n60,o56,p61,q61,r44,s44,t34,u60,v54,w76,x58,y55,z47,A77,B66,C72,D73,E62,F60,G74,H76,I39,J45,K71,L60,M87,N77,O75,P64,Q75,R72,S58,T67,U73,V77,W100,X77,Y73,Z58, 25,'20,-36,.20,"
    .split(",")
    .filter(Boolean)
    .map((p) => [p[0], Number(p.slice(1)) / 100]),
);

/** Width in em of a line of the names face, or null when it's not a Latin name or the host chose another font. */
function emWidth(s: string, track: number) {
  let w = 0;
  for (const c of s) {
    const k = NAME_W[c] ?? NAME_W[c.normalize("NFD")[0]];
    if (k == null) return null;
    w += k + track;
  }
  return w;
}

/** The longest name's width in em (with tracking), for `--nw`. */
function namesEm(r: Resolved) {
  const own = !r.data.look.namesFont || r.data.look.namesFont === "bodoni";
  const ws = r.people.map((p) => (own ? emWidth(p.name, -0.025) : null) ?? p.name.length * 0.62);
  return Math.max(2, ...ws) * 1.04;
}

/* ── hero ── */

export function Hero({ r }: HeroProps) {
  const lines = coverLines(r);
  const date = numeralsOf(r);
  const bless = r.data.bismillah !== "none";
  const sub = r.when.multi ? spanOfDays(r) : [r.when.weekday, r.when.time].filter(Boolean).join(" · ");
  return (
    <div className="ed-hero">
      <div className="ed-sheet">
        <header className="ed-top">
          <div className="ed-strap ed-a0">
            {bless && <Blessing r={r} className="ed-bless" />}
            <span>{r.t.youAreInvited}</span>
          </div>
          <Masthead label={r.occasionLabel} />
          <div className="ed-issue ed-a0">
            <span className="ed-issue-line" dir="auto">
              {issueOf(r)}
            </span>
            <span>{r.t.saveTheDate}</span>
          </div>
        </header>

        {(lines.length > 0 || r.milestone) && (
          <div className="ed-mid">
            {lines.length > 0 && (
              <ul className="ed-lines">
                {lines.map((l, i) => (
                  <li key={i} className="ed-line" style={{ "--i": i } as Vars}>
                    <span>{l.k}</span>
                    <strong dir="auto">{l.v}</strong>
                  </li>
                ))}
              </ul>
            )}
            {r.milestone && (
              <p className="ed-spot" style={{ "--sl": Math.max(1, r.milestone.length) } as Vars}>
                <span>{r.milestone}</span>
              </p>
            )}
          </div>
        )}

        <div className="ed-story" style={{ "--nw": namesEm(r).toFixed(3) } as Vars}>
          <p className="ed-title">{r.title}</p>
          <Names r={r} className={`ed-names${r.people.length < 2 ? " is-solo" : ""}`} />
        </div>

        <footer className="ed-foot">
          <div className="ed-date">
            {date && (
              <strong dir="ltr" style={{ "--dl": date.length } as Vars}>
                {date}
              </strong>
            )}
            {sub && <span dir="auto">{sub}</span>}
          </div>
          <Barcode seed={`${r.names}|${date}`} digits={codeDigits(r)} />
        </footer>
      </div>
      <span className="ed-cue" aria-hidden>
        {r.t.scroll}
        <i />
      </span>
    </div>
  );
}

/* ── body pieces ── */

export function Divider() {
  return <span className="ed-rule" />;
}

export function Ornament() {
  return <span className="ed-orn" />;
}
