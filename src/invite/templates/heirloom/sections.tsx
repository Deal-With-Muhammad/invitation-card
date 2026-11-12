import type { CSSProperties } from "react";

import { photoUrl } from "../../photo";
import type { Resolved, ResolvedEvent } from "../../resolve";
import { CalendarButton, Countdown } from "../../runtime/client-bits";
import { DEFAULT_SECTIONS, Lines, MapButtons, Names } from "../../runtime/sections";
import { Initials } from "../painted/kit";

// Heirloom's own sections. Below the portrait the page moves through a salon: a laurel crest
// with the initials, the countdown on claret velvet as four enamel medallions, the place with
// a gold engraving and a gilded map, the programme on a marble slab with a gold thread, the
// dress code in a card with gold corners, travel notes as cards on velvet, and a closing with
// the portrait in a locket and a gold seal. Art in public/art/heirloom/ (i-*.webp are the
// drawings: they are used as masks and filled with gold).

const A = "/art/heirloom";

export const SAMPLE_PORTRAIT = `${A}/portrait-720.webp`;

/** The host's photo, or the sample one. */
export function Photo({ r, className }: { r: Resolved; className: string }) {
  const p = r.data.photo;
  return (
    <span className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p ? photoUrl(p.id) : SAMPLE_PORTRAIT} alt="" decoding="async" draggable={false} style={{ objectPosition: `50% ${p?.y ?? 30}%` }} />
    </span>
  );
}

/** The portrait inside the painted frame (over the hero art, under the text). */
export function Portrait({ r }: { r: Resolved }) {
  return (
    <span className="hl-artbox" aria-hidden>
      <Photo r={r} className="hl-photo" />
    </span>
  );
}

/** A drawing filled with gold: the image is the mask. `ratio` is its width / height. */
function Gold({ name, w, ratio, className = "" }: { name: string; w: number; ratio: number; className?: string }) {
  return <span className={`hl-gold hl-draw rv ${className}`} aria-hidden style={{ "--m": `url(${A}/i-${name}.webp)`, width: w, aspectRatio: String(ratio) } as CSSProperties} />;
}

const Flourish = () => <Gold name="flourish" w={150} ratio={560 / 107} className="hl-flourish" />;

export function InviteSec({ r }: { r: Resolved }) {
  const Invite = DEFAULT_SECTIONS.invite;
  return (
    <>
      <section className="inv-sec hl-crest" aria-hidden>
        <span className="hl-wreath rv">
          <span className="hl-gold" style={{ "--m": `url(${A}/i-wreath.webp)` } as CSSProperties} />
          <Initials r={r} />
        </span>
      </section>
      <Invite r={r} />
    </>
  );
}

export function CountdownSec({ r }: { r: Resolved }) {
  if (!r.main?.start) return null;
  return (
    <section className="inv-sec hl-count hl-velvet" data-sec="countdown">
      <p className="hl-caps hl-foil rv">{r.t.saveTheDate}</p>
      <h2 className="hl-script hl-foil rv">{r.t.countdownTitle}</h2>
      <div className="hl-medals">
        <Countdown target={r.main.start} t={r.t} />
      </div>
      {r.main.dateLong && <p className="hl-italic rv">{[r.main.weekday, r.main.dateLong].filter(Boolean).join(", ")}</p>}
    </section>
  );
}

function Place({ e, r, map }: { e: ResolvedEvent; r: Resolved; map: boolean }) {
  return (
    <>
      {e.venue && <h3 className="hl-script hl-venue rv">{e.venue}</h3>}
      {e.address && (
        <p className="hl-addr rv">
          <Lines text={e.address} />
        </p>
      )}
      {e.dateLong && (
        <p className="hl-when rv">
          <span>{[e.weekday, e.dateLong].filter(Boolean).join(", ")}</span>
          {e.time && <span className="hl-caps">{e.time}</span>}
        </p>
      )}
      {r.show.hijri && e.hijri && <p className="hl-italic rv">{e.hijri}</p>}
      {e.note && <p className="hl-note rv">{e.note}</p>}
      {map && r.show.map && e.mapQuery && (
        <div className="inv-map hl-map">
          <iframe title={e.venue || r.t.venue} src={e.links.embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      )}
      <div className="inv-actions rv">
        <MapButtons e={e} r={r} />
      </div>
    </>
  );
}

export function EventsSec({ r }: { r: Resolved }) {
  if (!r.events.length) return null;
  const many = r.events.length > 1;
  return (
    <section className={`inv-sec hl-place${many ? " is-many" : ""}`} data-sec="events">
      <Gold name="venue" w={236} ratio={560 / 551} className="hl-engraving" />
      <h2 className="hl-caps hl-h hl-foil rv">{many ? r.t.celebrations : r.t.venue}</h2>
      <Flourish />
      {many ? (
        r.events.map((e) => (
          <article key={e.id} className="hl-ev">
            <p className="hl-caps hl-ev-title rv">{e.title}</p>
            <Place e={e} r={r} map={false} />
          </article>
        ))
      ) : (
        <Place e={r.events[0]} r={r} map />
      )}
      {r.show.calendar && (
        <div className="inv-cal rv">
          <CalendarButton r={r} />
        </div>
      )}
    </section>
  );
}

export function ScheduleSec({ r }: { r: Resolved }) {
  const rows = r.data.schedule.filter((s) => s.title.trim());
  if (!rows.length) return null;
  return (
    <section className="inv-sec hl-day" data-sec="schedule">
      {r.main?.title && <p className="hl-caps rv">{r.main.title}</p>}
      <h2 className="hl-script hl-day-h rv">{r.t.schedule}</h2>
      <Flourish />
      <ol className="hl-tl">
        {rows.map((s, i) => (
          <li key={i}>
            <time>{s.time}</time>
            <i aria-hidden />
            <span>{s.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function DressSec({ r }: { r: Resolved }) {
  return (
    <section className="inv-sec hl-dress" data-sec="dress">
      <div className="hl-plate rv">
        <Gold name="attire" w={150} ratio={515 / 371} />
        <h2 className="hl-caps hl-h hl-foil">{r.t.dressCode}</h2>
        {r.dress.title && <p className="hl-script hl-dress-sub">{r.dress.title}</p>}
        {r.dress.note && <p className="hl-note">{r.dress.note}</p>}
        {r.dress.colors.length > 0 && (
          <div className="inv-swatches">
            {r.dress.colors.map((c, i) => (
              <i key={i} style={{ background: c }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const pin = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

const NOTE_ART: [string, number, number][] = [
  ["car", 170, 560 / 243],
  ["key", 62, 260 / 560],
];

/** The host's extra blocks, as ivory cards on a band of velvet. */
export function DetailsSec({ r }: { r: Resolved }) {
  const items = (r.data.details ?? []).filter((d) => d.title.trim() || d.text.trim());
  if (!items.length) return null;
  return (
    <section className="inv-sec hl-notes hl-velvet" data-sec="details">
      {items.map((d, i) => {
        const art = NOTE_ART[i];
        return (
          <article key={i} className="hl-card rv">
            {art ? <Gold name={art[0]} w={art[1]} ratio={art[2]} /> : <Flourish />}
            {d.title.trim() && <h2 className="hl-caps hl-h hl-foil">{d.title}</h2>}
            {d.text.trim() && (
              <p className="hl-note">
                <Lines text={d.text} />
              </p>
            )}
            {d.mapUrl && (
              <div className="inv-actions">
                <a className="inv-btn" href={d.mapUrl} target="_blank" rel="noopener noreferrer">
                  {pin}
                  {r.t.googleMaps}
                </a>
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}

export function GiftsSec({ r }: { r: Resolved }) {
  if (!r.gifts.title && !r.gifts.note) return null;
  return (
    <section className="inv-sec hl-gift" data-sec="gifts">
      <Gold name="gift" w={150} ratio={549 / 384} />
      {r.gifts.title && <h2 className="hl-script hl-gift-h rv">{r.gifts.title}</h2>}
      <Flourish />
      {r.gifts.note && <p className="hl-note rv">{r.gifts.note}</p>}
    </section>
  );
}

export function ClosingSec({ r }: { r: Resolved }) {
  return (
    <footer className="inv-sec hl-close" data-sec="closing">
      <span className="hl-locket" aria-hidden>
        <Photo r={r} className="hl-locket-photo" />
      </span>
      {r.closing && <p className="hl-italic hl-close-text rv">{r.closing}</p>}
      <Names r={r} as="p" className="hl-script hl-foil hl-close-names rv" />
      {r.main && <p className="hl-caps hl-close-meta rv">{[r.main.dateLong, r.oneVenue ? r.main.venue : ""].filter(Boolean).join(" · ")}</p>}
      <span className="hl-seal" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${A}/seal.webp`} alt="" loading="lazy" draggable={false} />
        <Initials r={r} />
      </span>
    </footer>
  );
}
