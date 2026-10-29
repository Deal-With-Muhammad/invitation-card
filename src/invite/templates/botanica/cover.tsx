import type { CSSProperties } from "react";

import type { CoverProps } from "../types";
import { Branch, grow, initials, rng, type Built, type Pt } from "./art";

// Two lush bouquets reach in from the left and right edges and meet in the middle,
// where a paper tag on a ribbon carries the initials. On tap every stem swings
// outward from its own base, the bouquets slide off and the paper fades.

type Stem = { b: Built; o: Pt; turn: number; d: number; a: number };

// Each bouquet is three bunches of stems held just off the edge of the screen.
// Every stem keeps its bunch's base, so on opening it can swing outward around it.
const BUNCHES: [number, number][] = [
  [110, 0.42],
  [450, 0],
  [790, -0.42],
];

function bouquet(seed: number, mirror: boolean): Stem[] {
  const r = rng(seed);
  const out: Stem[] = [];
  const X = (x: number) => (mirror ? 300 - x : x);
  let k = 0;
  for (const [y0, main] of BUNCHES) {
    const o: Pt = [-70, y0 + (r() - 0.5) * 30];
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = main + ((i / (n - 1)) * 2 - 1) * 0.72 + (r() - 0.5) * 0.12;
      const len = (250 + r() * 70) * (1 - Math.abs(a) * 0.12);
      const bend = (r() - 0.5) * 0.7;
      const dir = (ang: number, l: number): Pt => [o[0] + Math.cos(ang) * l, o[1] + Math.sin(ang) * l];
      const p: Pt[] = [o, dir(a - bend * 0.3, len * 0.36), dir(a + bend * 0.4, len * 0.7), dir(a + bend, len)].map(([x, y]) => [X(x), y] as Pt);
      const euca = (k + (mirror ? 1 : 0)) % 2 === 1;
      const b = grow({
        p,
        kind: euca ? "euca" : "olive",
        n: euca ? 9 : 15,
        size: euca ? 1.6 : 1.7,
        seed: seed * 31 + k * 7,
        from: 0.26,
        fruit: euca ? 0 : 3,
        twigs: euca && k % 4 === 1 ? [[0.62, a < main ? 1 : -1]] : undefined,
      });
      out.push({ b, a: a - main, o: [X(o[0]), o[1]], turn: (a < main ? -1 : 1) * (mirror ? -1 : 1), d: Math.round(r() * 160) });
      k++;
    }
  }
  // outer stems sit behind, the ones reaching for the middle in front
  out.sort((x, y) => Math.abs(y.a) - Math.abs(x.a));
  return out;
}

const LEFT = bouquet(7, false);
const RIGHT = bouquet(19, true);

function Bouquet({ side }: { side: "l" | "r" }) {
  const list = side === "l" ? LEFT : RIGHT;
  return (
    <svg className={`bt-bq bt-bq-${side}`} viewBox="0 0 300 900" fill="none" aria-hidden>
      {list.map((s, i) => (
        <g
          key={i}
          className="bt-bq-stem"
          style={{ transformOrigin: `${s.o[0].toFixed(1)}px ${s.o[1].toFixed(1)}px`, "--turn": s.turn, "--d": `${s.d}ms` } as CSSProperties}
        >
          <Branch b={s.b} />
        </g>
      ))}
    </svg>
  );
}

function Tag({ names, tap }: { names: string[]; tap: string }) {
  const ini = initials(names);
  return (
    <div className="bt-tag">
      <svg viewBox="0 0 150 250" fill="none" aria-hidden>
        <path d="M14 96L46 66H104L136 96V232Q136 240 128 240H22Q14 240 14 232Z" className="bt-tag-card" />
        <path d="M21 99L49 73H101L129 99V227Q129 233 123 233H27Q21 233 21 227Z" className="bt-tag-line" />
        <circle cx="75" cy="86" r="7.5" className="bt-tag-ring" />
        <path d="M72 89C66 100 59 111 49 123L56 122L58 130C66 118 73 104 78 91Z" className="bt-bow" />
        <path d="M78 89C83 101 90 112 101 121L94 123L94 131C86 119 80 105 73 91Z" className="bt-bow bt-bow-dk" />
        <path d="M75 86C66 76 52 66 43 71C35 76 38 93 49 95C59 97 68 91 75 86Z" className="bt-bow" />
        <path d="M75 86C84 76 98 66 107 71C115 76 112 93 101 95C91 97 82 91 75 86Z" className="bt-bow" />
        <path d="M74 86C64 81 54 79 45 81M76 86C86 81 96 79 105 81" className="bt-bow-crease" />
        <ellipse cx="75" cy="87" rx="6.2" ry="5.4" className="bt-bow bt-bow-dk" />
        <path d="M71 85.5C73.5 84 76.5 84 79 85.5" className="bt-bow-crease" />
      </svg>
      <div className="bt-tag-in">
        <span className="bt-tag-ini">
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
        <span className="bt-tag-tap">{tap}</span>
      </div>
    </div>
  );
}

export function Cover({ r, onOpen }: CoverProps) {
  return (
    <div
      className="bt-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <div className="bt-cv-paper" />
      <div className="bt-cv-stage">
        <Bouquet side="l" />
        <Bouquet side="r" />
        <Tag names={r.people.map((p) => p.name)} tap={r.t.tapToOpen} />
      </div>
    </div>
  );
}
