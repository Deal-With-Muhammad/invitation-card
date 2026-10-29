import { Blessing, Names } from "../runtime/sections";
import type { HeroProps, TemplateParts } from "./types";

/** Placeholder parts for a design that hasn't been drawn yet. */
function StubHero({ r }: HeroProps) {
  return (
    <div className="inv-stub-hero">
      <Blessing r={r} />
      <p className="inv-eyebrow">{r.title}</p>
      <Names r={r} />
      {r.main && (
        <p className="inv-stub-date">
          {r.main.weekday} · {r.main.dateLong}
        </p>
      )}
    </div>
  );
}

export const stubParts: TemplateParts = { Hero: StubHero };
