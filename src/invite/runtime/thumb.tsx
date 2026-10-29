import { newInvite } from "../defaults";
import { FONT_VARS } from "../fonts";
import { rootStyle } from "../look";
import { resolve } from "../resolve";
import { getTemplate } from "../templates";
import type { InviteData, Occasion } from "../types";

import "./base.css";

/** A static, server-rendered picture of a template's first screen, for galleries. */
export function Thumb({
  id,
  palette,
  occasion,
  data,
  className = "",
}: {
  id: string;
  palette?: string;
  occasion?: Occasion;
  data?: InviteData;
  className?: string;
}) {
  const tpl = getTemplate(id);
  const d = data ?? newInvite(tpl.meta.id, occasion ?? tpl.meta.defaultOccasion, palette ?? tpl.meta.palettes[0].id);
  const r = resolve(d);
  const { Hero, Backdrop } = tpl;
  return (
    <div className={`inv-thumb ${className}`}>
      <div
        className={`inv is-thumb t-${tpl.meta.id} ${FONT_VARS}`}
        data-phase="open"
        data-occasion={d.occasion}
        lang={d.lang}
        dir={r.dir}
        style={rootStyle(tpl.meta, d.look, d.lang)}
        aria-hidden
      >
        {Backdrop && (
          <div className="inv-backdrop">
            <Backdrop r={r} />
          </div>
        )}
        <div className="inv-main">
          <div className="inv-hero">
            <Hero r={r} phase="open" thumb />
          </div>
        </div>
      </div>
    </div>
  );
}
