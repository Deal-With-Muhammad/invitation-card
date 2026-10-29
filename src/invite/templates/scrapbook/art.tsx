import type { CSSProperties, FC } from "react";

import type { Resolved } from "../../resolve";
import { Blessing, Names } from "../../runtime/sections";
import type { Occasion } from "../../types";
import type { HeroProps } from "../types";

// Scrapbook: a kraft-paper page with a polaroid, washi tape, a ticket stub and
// pen doodles. Doodles are drawn with a 2.6 ink line and a colour fill printed a
// little off-register, like a quick hand-coloured sketch.

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* ── doodles for the polaroid, one per kind of occasion ── */

const HEART = "M0 30C-20 15-41 0-35-19C-30-33-11-37 1-21C10-37 30-35 35-19C40-1 21 15 0 30Z";

function Heart({ x, y, s, r }: { x: number; y: number; s: number; r: number }) {
  const t = `translate(${x} ${y}) rotate(${r}) scale(${s})`;
  return (
    <>
      <path d={HEART} transform={t} className="sb-paper" />
      <path d={HEART} transform={`translate(${x + 4} ${y + 4}) rotate(${r}) scale(${s})`} className="sb-tint" />
      <path d={HEART} transform={t} className="sb-pen" />
    </>
  );
}

function Hearts() {
  return (
    <>
      <path d="M22 156 70 122M130 80 178 46" className="sb-pen" />
      <path d="M164 43l15 2-5 13M22 156l-4-13M30 150l-4-13M22 156l-13 2M30 150l-13 2" className="sb-pen" />
      <Heart x={84} y={98} s={1.25} r={-10} />
      <Heart x={140} y={70} s={0.72} r={14} />
      <path d="M40 54l7-7M34 44l2-9M50 60l9-2M168 120l8 5M160 132l3 9" className="sb-pen sb-thin" />
    </>
  );
}

function Hat() {
  const cone = "M60 154L97 36L138 150C114 160 86 160 60 154Z";
  return (
    <>
      <path d={cone} className="sb-paper" />
      <path d={cone} transform="translate(5 4)" className="sb-tint" />
      <path d="M76 104 124 88M86 72 114 62M66 134 130 116" className="sb-pen sb-thin" />
      <path d={cone} className="sb-pen" />
      <path d="M60 154l7-9 8 9 7-9 8 9 8-9 7 9 8-9 8 9 7-9 8 9" className="sb-pen" />
      <path d="M97 34c-6-2-9-8-5-12c-3-6 4-10 8-6c4-5 11-1 9 4c6 2 5 10-1 11c-1 6-8 7-11 3Z" className="sb-pen sb-fill" />
      <path d="M36 66l9 5M30 96l10-2M154 50l10-5M162 84l9 4M150 112l8 7" className="sb-pen sb-thin" />
      <circle cx="44" cy="128" r="3.4" className="sb-dot" />
      <circle cx="168" cy="140" r="3" className="sb-dot" />
      <path d="M146 158c8-6 22-6 26 2s-6 14-13 9c-6-4 0-13 9-12" className="sb-pen sb-thin" />
    </>
  );
}

function Cap() {
  const board = "M28 74L100 46L174 72L102 101Z";
  return (
    <>
      <path d="M62 88V120C80 134 124 134 142 120V88" className="sb-paper" />
      <path d="M62 88V120C80 134 124 134 142 120V88" transform="translate(4 4)" className="sb-tint" />
      <path d="M62 88V120C80 134 124 134 142 120V88" className="sb-pen" />
      <path d={board} className="sb-paper" />
      <path d={board} transform="translate(5 4)" className="sb-tint" />
      <path d={board} className="sb-pen" />
      <path d="M101 73C122 76 142 80 154 83V120" className="sb-pen" />
      <path d="M148 120h12l-2 20h-8Z" className="sb-pen sb-fill" />
      <circle cx="101" cy="73" r="4" className="sb-dot" />
      <path d="M40 132l8 4M30 112l9-1M164 44l8-6M176 100l8 2" className="sb-pen sb-thin" />
    </>
  );
}

function House() {
  const body = "M50 158V94L100 52L150 94V158Z";
  return (
    <>
      <path d="M126 72V46H142V86" className="sb-pen" />
      <path d={body} className="sb-paper" />
      <path d={body} transform="translate(5 4)" className="sb-tint" />
      <path d={body} className="sb-pen" />
      <path d="M38 104L100 46L163 103" className="sb-pen" />
      <path d="M88 158V126C88 114 112 114 112 126V158" className="sb-pen" />
      <path d="M100 104c-6-6-14-1-9 6l9 8 9-8c5-7-3-12-9-6Z" className="sb-pen sb-fill" />
      <path d="M134 38c-7-6 5-9-1-16s6-10 0-17" className="sb-pen sb-thin" />
      <path d="M24 158H178" className="sb-pen sb-thin" />
    </>
  );
}

function Baby() {
  const suit =
    "M74 44C84 56 116 56 126 44L162 64L150 92L134 84V138C122 150 112 156 100 156C88 156 78 150 66 138V84L50 92L38 64Z";
  return (
    <>
      <path d={suit} className="sb-paper" />
      <path d={suit} transform="translate(5 4)" className="sb-tint" />
      <path d={suit} className="sb-pen" />
      <path d="M78 46C88 62 112 62 122 46" className="sb-pen sb-thin" />
      <path d="M100 102c-6-6-14-1-9 6l9 8 9-8c5-7-3-12-9-6Z" className="sb-pen sb-fill" />
      <circle cx="92" cy="148" r="2.6" className="sb-dot" />
      <circle cx="108" cy="148" r="2.6" className="sb-dot" />
      <path d="M30 120l9-2M36 140l7 6M168 118l9 3M160 140l6 7" className="sb-pen sb-thin" />
    </>
  );
}

function Moon() {
  const moon = "M118 34A58 58 0 1 0 160 134A46 46 0 1 1 118 34Z";
  return (
    <>
      <path d={moon} className="sb-paper" />
      <path d={moon} transform="translate(5 4)" className="sb-tint" />
      <path d={moon} className="sb-pen" />
      <path d="M150 58l4 10 10 1-8 7 3 10-9-6-9 6 3-10-8-7 10-1Z" className="sb-pen sb-fill" />
      <path d="M40 40l2 6 6 1-5 4 2 6-5-4-6 4 2-6-5-4 6-1Z" className="sb-pen sb-thin" />
      <path d="M170 116l2 5 5 1-4 3 1 5-4-3-5 3 2-5-4-3 5-1Z" className="sb-pen sb-thin" />
    </>
  );
}

const KIND: Partial<Record<Occasion, FC>> = {
  birthday: Hat,
  party: Hat,
  graduation: Cap,
  housewarming: House,
  babyshower: Baby,
  aqiqah: Baby,
  eid: Moon,
};

export function Doodle({ occasion, className = "" }: { occasion: Occasion; className?: string }) {
  const Art = KIND[occasion] ?? Hearts;
  return (
    <svg className={`sb-doodle ${className}`} viewBox="0 0 200 180" fill="none" aria-hidden>
      <Art />
    </svg>
  );
}

/* ── little pen marks around the page ── */

export function Star({ className = "" }: { className?: string }) {
  return (
    <svg className={`sb-mark ${className}`} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path d="M20 4l4.6 10.4 11.2 1.2-8.4 7.4 2.6 11-10-5.8-9.8 6.2 2.2-11.2L4 15.8l11.4-1.4Z" className="sb-pen" />
    </svg>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={`sb-mark ${className}`} viewBox="0 0 70 80" fill="none" aria-hidden>
      <path d="M58 76C40 70 22 56 20 38C18 26 22 14 30 6" className="sb-pen" />
      <path d="M18 14l12-9 6 13" className="sb-pen" />
    </svg>
  );
}

function Loop({ className = "" }: { className?: string }) {
  return (
    <svg className={`sb-mark ${className}`} viewBox="0 0 90 30" fill="none" aria-hidden>
      <path d="M4 20c10-2 14-14 22-12s-2 16 8 14 10-16 20-14-2 16 8 14 12-12 22-12" className="sb-pen sb-thin" />
    </svg>
  );
}

/* ── fitting the names ── */

// Advance widths (em, ×100) of Homemade Apple, measured in the browser.
const NAME_W = Object.fromEntries(
  "a65,b61,c61,d67,e59,f59,g65,h58,i38,j31,k63,l52,m103,n59,o54,p67,q58,r65,s58,t47,u71,v58,w104,x40,y65,z46,A89,B79,C79,D79,E74,F62,G74,H78,I108,J53,K59,L74,M108,N71,O74,P70,Q70,R58,S62,T115,U73,V53,W89,X51,Y61,Z53, 35,'15,-33,.27,"
    .split(",")
    .filter(Boolean)
    .map((p) => [p[0], Number(p.slice(1)) / 100]),
);

function namesEm(r: Resolved) {
  const own = !r.data.look.namesFont || r.data.look.namesFont === "homemade";
  const w = (s: string) => {
    if (!own) return s.length * 0.66;
    let t = 0;
    for (const c of s) t += NAME_W[c] ?? NAME_W[c.normalize("NFD")[0]] ?? 0.7;
    return t;
  };
  return Math.max(2.4, ...r.people.map((p) => w(p.name))) * 1.06;
}

/* ── hero ── */

function stubLines(r: Resolved) {
  if (r.when.multi) return { top: r.t.saveTheDate, main: r.when.date, time: "" };
  const day = r.main?.start != null ? `${r.main.day} ${r.main.monthShort}` : "";
  return { top: r.when.weekday || r.t.saveTheDate, main: day, time: r.when.time };
}

export function Hero({ r }: HeroProps) {
  const bless = r.data.bismillah !== "none";
  const stub = stubLines(r);
  const dated = r.main?.start != null ? r.main : null;
  const caption = r.milestone || (dated ? `${dated.day}.${dated.raw.date.slice(5, 7)}.${dated.year}` : r.occasionLabel);
  return (
    <div className="sb-hero">
      <Star className="sb-star-a sb-a3" />
      <Star className="sb-star-b sb-a3" />
      <Loop className="sb-loop sb-a3" />
      <div className="sb-in">
        {bless && <Blessing r={r} className="sb-bless sb-a1" />}
        <p className="sb-title sb-a1">{r.title}</p>
        <figure className="sb-polaroid">
          <div className="sb-photo">
            <Doodle occasion={r.occasion} />
          </div>
          <figcaption className="sb-caption" dir="auto" style={{ "--cl": caption.length } as Vars}>
            {caption}
          </figcaption>
          <span className="sb-tape sb-tape-a" />
          <span className="sb-tape sb-tape-b" />
          {stub.main && (
            <p className="sb-stub">
              <small dir="auto">{stub.top}</small>
              <b dir="auto">{stub.main}</b>
              {stub.time && <small dir="auto">{stub.time}</small>}
            </p>
          )}
        </figure>
        <div className="sb-who sb-a2" style={{ "--nw": namesEm(r).toFixed(3) } as Vars}>
          <Arrow className="sb-arrow" />
          <Names r={r} className={`sb-names${r.people.length < 2 ? " is-solo" : ""}`} />
        </div>
        {r.main?.venue && r.oneVenue && <p className="sb-venue sb-a2">{r.main.venue}</p>}
      </div>
      <span className="sb-cue" aria-hidden>
        {r.t.scroll}
        <svg viewBox="0 0 24 30" fill="none">
          <path d="M12 2c-2 8 2 16 0 26M5 21c3 3 5 6 7 8 2-3 4-5 7-8" />
        </svg>
      </span>
    </div>
  );
}

/* ── body pieces ── */

export function Divider({ index }: { index: number }) {
  return (
    <svg className="sb-divider" viewBox="0 0 200 30" fill="none" aria-hidden>
      <path d="M6 16c12-8 20 8 32 0s20 8 32 0M130 16c12-8 20 8 32 0s20 8 32 0" className="sb-pen sb-thin" />
      {index % 2 ? (
        <path d="M100 25c-12-9-19-16-14-22 4-4 10-3 14 3 4-6 10-7 14-3 5 6-2 13-14 22Z" className="sb-pen sb-fill" />
      ) : (
        <path d="M100 3l4 8.6 9.4 1-7 6.2 2.2 9.2-8.6-5-8.4 5.2 2-9.4-7-6.4 9.4-1Z" className="sb-pen sb-fill" />
      )}
    </svg>
  );
}

export function Ornament() {
  return (
    <svg className="sb-orn" viewBox="0 0 110 14" fill="none" aria-hidden>
      <path d="M3 9C20 4 34 11 52 7s34-5 55 1" />
    </svg>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="sb-grain" />
      <div className="sb-grain sb-mottle" />
    </>
  );
}
