import type { CoverProps } from "../types";
import { Band, Medallion } from "./art";

// The woven cloth, cut down the middle: each panel holds its half of one songket
// (bands, bunga tabur, the central gold band), so together they read as a single
// piece. Tapping turns the bunga medallion away; the halves slide apart and gather
// into pleats like cloth being drawn back.

const initials = (names: string[]) => names.map((n) => n.trim().charAt(0).toUpperCase()).filter(Boolean);

function Cloth() {
  return (
    <div className="sk-cloth">
      <span className="sk-weave" />
      <span className="sk-tabur" />
      <Band className="sk-band-t" />
      <Band className="sk-band-b" />
      <span className="sk-tepi sk-tepi-l" />
      <span className="sk-tepi sk-tepi-r" />
      <span className="sk-vband" />
      <span className="sk-pleats" />
    </div>
  );
}

export function Cover({ r, onOpen }: CoverProps) {
  const ini = initials(r.people.map((p) => p.name));
  return (
    <div
      className="sk-cover"
      role="button"
      tabIndex={0}
      aria-label={r.t.tapToOpen}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
    >
      <div className="sk-stage">
        <div className="sk-panel sk-panel-l">
          <Cloth />
        </div>
        <div className="sk-panel sk-panel-r">
          <Cloth />
        </div>
        <div className="sk-cmedal">
          <Medallion plain />
          <span className="sk-ini">
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
        <span className="sk-tap">{r.t.tapToOpen}</span>
      </div>
    </div>
  );
}
