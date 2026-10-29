import type { CSSProperties } from "react";

import type { Resolved } from "../../resolve";
import { Blessing, Names } from "../../runtime/sections";
import type { HeroProps } from "../types";

// Boarding Pass: the invitation as a ticket. Airport codes come from the names,
// the flight number from the initials and the date, and the stub carries a
// PDF417-style barcode generated from the names, so every pass is its own.

type Vars = CSSProperties & Record<`--${string}`, string | number>;

// The ticket's own printed words. Real passes print these in English everywhere.
const L = {
  pass: "Boarding pass",
  from: "From",
  to: "To",
  passenger: "Passenger",
  flight: "Flight",
  boarding: "Boarding",
  gate: "Gate",
  seat: "Seat",
  guest: "Guest of honour",
  any: "Any",
  you: "YOU",
};

/* ── data → ticket ── */

const letters = (s: string) => [...s.replace(/[^\p{L}\p{N}]/gu, "")];
const code = (name: string) => letters(name).slice(0, 3).join("").toUpperCase();

export function routeOf(r: Resolved) {
  const [a, b] = r.people;
  if (a && b) return { from: code(a.name) || "———", to: code(b.name) || "———" };
  return { from: L.you, to: code(a?.name ?? "") || "———" };
}

const dated = (r: Resolved) => r.events.filter((e) => e.start != null).sort((a, b) => (a.start ?? 0) - (b.start ?? 0));

/** "IZ 2612": initials, then day and month of the first event. */
export function flightOf(r: Resolved) {
  const ini =
    r.people.length > 1
      ? r.people.map((p) => letters(p.name)[0] ?? "").join("")
      : letters(r.people[0]?.name ?? "").slice(0, 2).join("");
  const d = dated(r)[0]?.raw.date.split("-") ?? [];
  const num = d.length === 3 ? `${d[2]}${d[1]}` : "0001";
  return `${(ini || "DW").toUpperCase()} ${num}`;
}

/** "26 DEC 2026", or "25–27 DEC 2026" across several days. */
function dateOf(r: Resolved) {
  const ds = dated(r);
  if (!ds.length) return "—";
  const a = ds[0];
  const b = ds[ds.length - 1];
  const mon = (e: typeof a) => e.monthShort.replace(".", "").toUpperCase();
  if (a.raw.date === b.raw.date) return `${a.day} ${mon(a)} ${a.year}`;
  if (a.month === b.month && a.year === b.year) return `${a.day}–${b.day} ${mon(a)} ${a.year}`;
  return `${a.day} ${mon(a)} – ${b.day} ${mon(b)}`;
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

const START = [8, 1, 1, 1, 1, 1, 1, 3];
const STOP = [7, 1, 1, 3, 1, 1, 1, 2, 1];
const COLS = 132;
const ROWS = 8;
const ROW_H = 5;

/** Stacked rows of bars with fixed start and stop patterns, like the PDF417 code on a pass. */
function barcodePath(seed: string) {
  const rand = rng(hash(seed));
  let d = "";
  for (let row = 0; row < ROWS; row++) {
    const y = row * ROW_H;
    let x = 0;
    const run = (widths: number[]) => {
      widths.forEach((w, i) => {
        if (i % 2 === 0) d += `M${x} ${y}h${w}v${ROW_H}h-${w}z`;
        x += w;
      });
    };
    run(START);
    const end = COLS - STOP.reduce((s, w) => s + w, 0) - 1;
    let bar = true;
    while (x < end) {
      const w = Math.min(1 + Math.floor(rand() * (bar ? 4 : 3)), end - x);
      if (bar) d += `M${x} ${y}h${w}v${ROW_H}h-${w}z`;
      x += w;
      bar = !bar;
    }
    x = end + 1;
    run(STOP);
  }
  return d;
}

export function Barcode({ seed, className = "" }: { seed: string; className?: string }) {
  return (
    <svg className={`bp-code ${className}`} viewBox={`0 0 ${COLS} ${ROWS * ROW_H}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden>
      <path d={barcodePath(seed)} />
    </svg>
  );
}

/* ── glyphs ── */

/** A small airliner seen from above, nose to the right. */
export function Plane({ className = "" }: { className?: string }) {
  return (
    <svg className={`bp-plane ${className}`} viewBox="0 0 24 24" aria-hidden>
      <path d="M22 12c0 .8-.9 1.4-2 1.4h-5.2l-4.3 7.6h-2l2.2-7.6H6.1l-1.8 2.4H2.7l.9-3.8-.9-3.8h1.6l1.8 2.4h4.6L8.5 3h2l4.3 7.6H20c1.1 0 2 .6 2 1.4Z" />
    </svg>
  );
}

function Route({ from, to }: { from: string; to: string }) {
  return (
    <div className="bp-route">
      <div className="bp-port">
        <span>{L.from}</span>
        <strong>{from}</strong>
      </div>
      <svg className="bp-path" viewBox="0 0 110 44" fill="none" aria-hidden>
        <path d="M6 36C30 6 80 6 104 36" className="bp-dots" />
        <circle cx="6" cy="36" r="3" className="bp-dot" />
        <circle cx="104" cy="36" r="3" className="bp-ring" />
        <circle cx="55" cy="13.6" r="10" className="bp-halo" />
        <g transform="translate(55 13.6) rotate(-1) scale(.72) translate(-12 -12)">
          <path d="M22 12c0 .8-.9 1.4-2 1.4h-5.2l-4.3 7.6h-2l2.2-7.6H6.1l-1.8 2.4H2.7l.9-3.8-.9-3.8h1.6l1.8 2.4h4.6L8.5 3h2l4.3 7.6H20c1.1 0 2 .6 2 1.4Z" className="bp-fill" />
        </g>
      </svg>
      <div className="bp-port is-to">
        <span>{L.to}</span>
        <strong>{to}</strong>
      </div>
    </div>
  );
}


/* ── fitting the names ── */

// Advance widths (em, ×100) of the template's names face, measured in the browser,
// so the longest name can be set as large as the column allows.
const NAME_W = Object.fromEntries(
  "a59,b64,c57,d64,e58,f40,g60,h63,i28,j28,k59,l27,m95,n63,o61,p64,q64,r43,s54,t40,u62,v57,w86,x57,y60,z53,A70,B68,C68,D70,E62,F59,G72,H72,I29,J37,K69,L51,M94,N78,O72,P65,Q72,R68,S65,T57,U73,V67,W99,X70,Y64,Z57, 23,'18,-35,.23,"
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

/** Widest line of the names in em: the first name, then "& second name". */
function namesEm(r: Resolved) {
  const own = !r.data.look.namesFont || r.data.look.namesFont === "bricolage";
  const w = (s: string) => (own ? emWidth(s, -0.035) : null) ?? s.length * 0.66;
  const [a, b] = r.people.map((p) => p.name);
  const lines = b ? [w(a), w(r.t.and) + 0.24 + w(b)] : [w(a ?? "")];
  return Math.max(2, ...lines) * 1.04;
}

/* ── the ticket ── */

export function Ticket({ r, className = "" }: { r: Resolved; className?: string }) {
  const { from, to } = routeOf(r);
  const flight = flightOf(r);
  const first = dated(r)[0];
  const boarding = r.main ? (r.main.allDay ? r.t.allDay : r.main.startTime) : "";
  const stubDate = first ? `${first.day.padStart(2, "0")}${first.monthShort.replace(".", "").toUpperCase()}` : "";
  return (
    <div className={`bp-ticket ${className}`}>
      <div className="bp-main">
        <header className="bp-head">
          <span className="bp-head-l">
            <Plane />
            {r.occasionLabel}
          </span>
          <span className="bp-head-r">{L.pass}</span>
        </header>
        <div className="bp-body">
          <div className="bp-who" style={{ "--nw": namesEm(r).toFixed(3) } as Vars}>
            <p className="bp-title">{r.title}</p>
            <Names r={r} className={`bp-names${r.people.length > 1 ? " is-two" : ""}`} />
            {r.milestone && (
              <p className="bp-stamp" style={{ "--sl": r.milestone.length } as Vars}>
                <small>{r.occasionLabel}</small>
                <b dir="auto">{r.milestone}</b>
                <small>{stubDate || flight}</small>
              </p>
            )}
          </div>
          <Route from={from} to={to} />
          <dl className="bp-fields">
            <div>
              <dt>{L.passenger}</dt>
              <dd dir="auto">{L.guest}</dd>
            </div>
            <div>
              <dt>{L.flight}</dt>
              <dd className="is-mono" dir="ltr">
                {flight}
              </dd>
            </div>
            <div>
              <dt>{r.t.date}</dt>
              <dd dir="auto">{dateOf(r)}</dd>
            </div>
            <div>
              <dt>{L.boarding}</dt>
              <dd dir="auto">{boarding || "—"}</dd>
            </div>
            <div>
              <dt>{L.gate}</dt>
              <dd className="is-clamp" dir="auto">
                {r.main?.venue || "—"}
              </dd>
            </div>
            <div>
              <dt>{L.seat}</dt>
              <dd dir="auto">{L.any}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="bp-stub">
        <Barcode seed={`${r.names}|${flight}`} />
        <p className="bp-stub-line">
          <span>{flight.replace(" ", "")}</span>
          {stubDate && <span>{stubDate}</span>}
          <span>
            {from}/{to}
          </span>
          <span>{L.seat} {L.any}</span>
        </p>
      </div>
    </div>
  );
}

export function Hero({ r }: HeroProps) {
  const bless = r.data.bismillah !== "none";
  return (
    <div className={`bp-hero${bless ? " has-bless" : ""}`}>
      {bless && <Blessing r={r} className="bp-bless bp-a1" />}
      <Ticket r={r} className="bp-ticket-hero" />
      <span className="bp-cue" aria-hidden>
        {r.t.scroll}
        <i />
      </span>
    </div>
  );
}

/* ── body pieces ── */

export function Divider() {
  return (
    <svg className="bp-divider" viewBox="0 0 220 20" fill="none" aria-hidden>
      <path d="M2 10H88M132 10H218" className="bp-dots" />
      <g transform="translate(110 10) scale(.8) translate(-12 -12)">
        <path d="M22 12c0 .8-.9 1.4-2 1.4h-5.2l-4.3 7.6h-2l2.2-7.6H6.1l-1.8 2.4H2.7l.9-3.8-.9-3.8h1.6l1.8 2.4h4.6L8.5 3h2l4.3 7.6H20c1.1 0 2 .6 2 1.4Z" className="bp-fill" />
      </g>
    </svg>
  );
}

export function Ornament() {
  return <span className="bp-orn" />;
}

export function Backdrop() {
  return <div className="bp-sky" />;
}
