import type { CSSProperties } from "react";

import type { CoverProps } from "../types";
import { bud, rose } from "./geo";

// A groom's sehra: strands of jasmine buds, with roses set in chevrons, hang from
// a gold band over the whole screen. A gold medallion carries the initials. On a
// tap the strands part from the centre outward, swinging as they go.

const COUNT = 101;
const MID = (COUNT - 1) / 2;
const PITCH = 10; // bud spacing inside a strand
const CYCLE = 6; // buds per pattern tile; one of them is a rose
const LEN = 1380; // pattern length, a whole number of tiles

const initials = (names: string[]) => names.map((n) => n.trim().charAt(0).toUpperCase()).filter(Boolean);

/** One pattern tile per rose slot, so roses line up in chevrons across the veil. */
function StrandPattern({ v }: { v: number }) {
  const slots = Array.from({ length: CYCLE }, (_, i) => i);
  return (
    <pattern
      id={`sh-pv${v}`}
      patternUnits="userSpaceOnUse"
      width="12"
      height={PITCH * CYCLE}
      patternTransform={v % 2 ? `translate(0 ${PITCH / 2})` : undefined}
    >
      {slots.map((i) => {
        const y = i * PITCH;
        if (i === v) {
          const r = rose(6, y + 5, 5.2);
          return (
            <g key={i}>
              <path d={r.out} className="sh-rose" />
              <path d={r.spiral} className="sh-rose-s" />
            </g>
          );
        }
        return (
          <g key={i}>
            <circle cx="6" cy={y + 0.4} r="1" className="sh-f" />
            <path d={bud(6, y + 1.3, 2.9, 8)} className="sh-jas" />
          </g>
        );
      })}
    </pattern>
  );
}

function Strand({ i }: { i: number }) {
  const off = i - MID;
  const d = Math.abs(off);
  const v = d % CYCLE;
  // the hem dips a little in the middle, like a sehra over a turban
  const p = Math.min(1, d / 19);
  const end = 0.84 + 0.07 * (1 - p * p);
  const tip = rose(6, LEN + 6.2, 5.6);
  const style = {
    "--o": off,
    "--d": d,
    "--dir": off < 0 ? -1 : 1,
    "--end": end,
  } as CSSProperties;
  return (
    <div className="sh-strand" style={style}>
      <svg viewBox="0 0 12 1400" fill="none" aria-hidden>
        <path d={`M6 0V${LEN + 2}`} className="sh-thread" />
        <rect x="0" y="0" width="12" height={LEN} fill={`url(#sh-pv${v})`} />
        <path d={tip.out} className="sh-rose" />
        <path d={tip.spiral} className="sh-rose-s" />
        <circle cx="6" cy={LEN + 13.6} r="1.7" className="sh-f" />
        <path d={`M6 ${LEN + 15}l1.8 3.6-1.8 2.6-1.8-2.6z`} className="sh-f" />
      </svg>
    </div>
  );
}

function Band() {
  return (
    <svg className="sh-cband" viewBox="0 0 1400 50" preserveAspectRatio="xMidYMin slice" fill="none" aria-hidden>
      <defs>
        <pattern id="sh-zari" patternUnits="userSpaceOnUse" width="28" height="50" x="-14">
          <circle cx="14" cy="20" r="6.2" className="sh-deep-l" />
          <path d="M14 15.6l1.6 3 3 1.4-3 1.4-1.6 3-1.6-3-3-1.4 3-1.4z" className="sh-deep" />
          <path d="M0 16l4 4-4 4-4-4zM28 16l4 4-4 4-4-4z" className="sh-deep" />
          <circle cx="14" cy="41" r="2.3" className="sh-pearl" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="1400" height="34" className="sh-f" />
      <path d="M0 4.5H1400M0 31.5H1400" className="sh-deep-l" />
      <rect x="0" y="0" width="1400" height="50" fill="url(#sh-zari)" />
      <path
        d={`M0 34${Array.from({ length: 50 }, (_, i) => `A14 9 0 0 0 ${(i + 1) * 28} 34`).join("")}`}
        className="sh-f"
        transform="translate(-14 0)"
      />
    </svg>
  );
}

export function Cover({ r, onOpen }: CoverProps) {
  const ini = initials(r.people.map((p) => p.name));
  return (
    <div
      className="sh-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <svg width="0" height="0" style={{ position: "absolute" }} fill="none" aria-hidden>
        <defs>
          {Array.from({ length: CYCLE }, (_, v) => (
            <StrandPattern key={v} v={v} />
          ))}
        </defs>
      </svg>
      <div className="sh-backing" />
      <div className="sh-veil">
        {Array.from({ length: COUNT }, (_, i) => (
          <Strand key={i} i={i} />
        ))}
      </div>
      <Band />
      <div className="sh-medal">
        <svg viewBox="-80 -80 160 160" fill="none" aria-hidden>
          <circle r="77" className="sh-halo" />
          <path
            d={(() => {
              let d = "";
              for (let i = 0; i <= 144; i++) {
                const a = (i / 144) * Math.PI * 2;
                const rr = 68 + 2.6 * Math.cos(a * 24);
                d += `${i ? "L" : "M"}${(Math.cos(a) * rr).toFixed(2)} ${(Math.sin(a) * rr).toFixed(2)}`;
              }
              return `${d}Z`;
            })()}
            className="sh-f"
          />
          {Array.from({ length: 24 }, (_, i) => {
            const a = ((i + 0.5) / 24) * Math.PI * 2;
            return <circle key={i} cx={(Math.cos(a) * 73).toFixed(2)} cy={(Math.sin(a) * 73).toFixed(2)} r="1.7" className="sh-pearl" />;
          })}
          <circle r="58" className="sh-on-l" />
          <circle r="53.5" className="sh-on-t" />
          {Array.from({ length: 36 }, (_, i) => {
            const a = (i / 36) * Math.PI * 2;
            return <circle key={i} cx={(Math.cos(a) * 49).toFixed(2)} cy={(Math.sin(a) * 49).toFixed(2)} r="0.9" className="sh-on-f" />;
          })}
        </svg>
        <span className="sh-mono">
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
      </div>
      <span className="sh-tap">{r.t.tapToOpen}</span>
    </div>
  );
}
