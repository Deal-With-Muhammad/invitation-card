import type { CoverProps } from "../types";
import { Monogram, OPENING } from "./art";

// Two carved doors fill the arch of the hero underneath. Tapping swings them open
// (3D, hinged on the jambs), light spills out, and the hero is already in place.

const LATTICE = (() => {
  let d = "";
  for (let y = 160; y < 268; y += 12)
    for (let x = 58 + ((y / 12) % 2) * 6; x < 142; x += 12) d += `M${x} ${y - 5}l5 5-5 5-5-5z`;
  return d;
})();

function DoorArt({ side }: { side: "l" | "r" }) {
  // Drawn for the left door (x 40–150); the right door mirrors it around x = 150.
  const t = side === "r" ? "matrix(-1 0 0 1 300 0)" : undefined;
  return (
    <g transform={t}>
      <rect x="40" y="0" width="110" height="520" className="jh-wood" />
      <path d={OPENING} transform="translate(150 520) scale(.93) translate(-150 -520)" className="jh-carve" />
      <path d="M56 272V196C56 168 76 152 99 146C122 152 142 168 142 196V272Z" className="jh-carve jh-panel" />
      <g clipPath="url(#jh-panel-clip)">
        <path d={LATTICE} className="jh-lattice" />
      </g>
      <rect x="56" y="288" width="86" height="132" rx="3" className="jh-carve jh-panel" />
      <rect x="64" y="296" width="70" height="116" rx="2" className="jh-carve" />
      <path d="M99 334c6 0 9 5 9 10c5 0 10 3 10 10s-5 10-10 10c0 5-3 10-9 10s-9-5-9-10c-5 0-10-3-10-10s5-10 10-10c0-5 3-10 9-10Z" className="jh-carve" />
      <path d="M99 344l10 10-10 10-10-10Z" className="jh-carve" />
      <circle cx="99" cy="354" r="2.4" className="jh-stud" />
      <rect x="56" y="436" width="86" height="62" rx="3" className="jh-carve jh-panel" />
      <path d="M64 467h70" className="jh-carve" />
      {[296, 412, 444, 490].map((y) => (
        <g key={y}>
          <circle cx="60" cy={y} r="2.2" className="jh-stud" />
          <circle cx="138" cy={y} r="2.2" className="jh-stud" />
        </g>
      ))}
      <path d="M150 90V520" className="jh-seam" />
      <circle cx="138" cy="372" r="8" className="jh-ring" />
      <circle cx="138" cy="363" r="3" className="jh-stud" />
    </g>
  );
}

function Door({ side }: { side: "l" | "r" }) {
  return (
    <div className={`jh-door jh-door-${side}`}>
      <svg viewBox={side === "l" ? "40 0 110 520" : "150 0 110 520"} preserveAspectRatio="none" aria-hidden>
        <g clipPath="url(#jh-door-clip)">
          <DoorArt side={side} />
        </g>
      </svg>
    </div>
  );
}

export function Cover({ r, onOpen }: CoverProps) {
  return (
    <div
      className="jh-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <clipPath id="jh-door-clip" clipPathUnits="userSpaceOnUse">
            <path d={OPENING} />
          </clipPath>
          <clipPath id="jh-panel-clip" clipPathUnits="userSpaceOnUse">
            <path d="M56 272V196C56 168 76 152 99 146C122 152 142 168 142 196V272Z" />
          </clipPath>
        </defs>
      </svg>
      <div className="jh-hero jh-hero-cover">
        <div className="jh-arch">
          <div className="jh-glow" />
          <Door side="l" />
          <Door side="r" />
          <div className="jh-seal">
            <Monogram names={r.people.map((p) => p.name)} />
          </div>
        </div>
        <span className="jh-tap">
          <i />
          {r.t.tapToOpen}
          <i />
        </span>
      </div>
    </div>
  );
}
