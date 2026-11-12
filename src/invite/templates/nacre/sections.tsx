import type { Lang } from "../../types";
import type { Resolved, ResolvedEvent } from "../../resolve";
import { CalendarButton, Countdown } from "../../runtime/client-bits";
import { Lines, MapButtons, Names } from "../../runtime/sections";
import { Initials } from "../painted/kit";

import { Scratch } from "./scratch";

// Nacre's own sections. The page below the card is a run of different surfaces: a slate
// band for the countdown, a slab of shell with a medallion to scratch, plain paper for the
// place, carved pearl curtains round the programme, a fine frame with a wax seal for the
// dress code, a paper card floating on shell and a carved leaf frame for the extra details,
// and a wax seal over the closing. Art in public/art/nacre/ (i-*.webp are the line drawings).

const A = "/art/nacre";

const SCRATCH: Record<Lang, string> = {
  en: "Scratch to reveal",
  ms: "Gores untuk lihat",
  id: "Gosok untuk melihat",
  ur: "کھرچ کر دیکھیے",
  ar: "اكشط لتكتشف",
  hi: "खुरच कर देखिए",
  bn: "ঘষে দেখুন",
  fa: "بخراشید تا ببینید",
  tr: "Kazıyın ve görün",
  es: "Rasca para descubrir",
  fr: "Grattez pour découvrir",
  pt: "Raspe para revelar",
};

/** A line drawing (plum ink on a clear background). */
function Drawing({ name, w }: { name: string; w: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="nc-draw rv" src={`${A}/i-${name}.webp`} alt="" width={w} loading="lazy" decoding="async" draggable={false} />;
}

/** The slab of shell with the medallion: rub it and the date shows. */
function Medallion({ r }: { r: Resolved }) {
  const e = r.main;
  if (!e?.day) return null;
  return (
    <section className="inv-sec nc-shell" aria-label={r.t.saveTheDate}>
      <Scratch label={SCRATCH[r.lang] ?? SCRATCH.en}>
        <span className="nc-sc-sm">{e.weekday}</span>
        <strong className="nc-sc-day">{e.day}</strong>
        <span className="nc-sc-sm">{e.month}</span>
        <span className="nc-sc-yr">{e.year}</span>
      </Scratch>
    </section>
  );
}

export function CountdownSec({ r }: { r: Resolved }) {
  if (!r.main?.start) return null;
  return (
    <>
      <section className="inv-sec nc-count" data-sec="countdown">
        <h2 className="nc-serif rv">{r.t.countdownTitle}</h2>
        <div className="nc-plaque rv">
          <Countdown target={r.main.start} t={r.t} />
        </div>
        <p className="nc-script nc-count-note rv">{r.t.saveTheDate}</p>
      </section>
      <Medallion r={r} />
    </>
  );
}

function Place({ e, r, map }: { e: ResolvedEvent; r: Resolved; map: boolean }) {
  return (
    <>
      {e.venue && <h3 className="nc-script nc-venue rv">{e.venue}</h3>}
      {e.address && (
        <p className="nc-caps nc-addr rv">
          <Lines text={e.address} />
        </p>
      )}
      {e.dateLong && (
        <p className="nc-when rv">
          {[e.weekday, e.dateLong].filter(Boolean).join(", ")}
          {e.time && <span>{e.time}</span>}
        </p>
      )}
      {r.show.hijri && e.hijri && <p className="nc-note rv">{e.hijri}</p>}
      {e.note && <p className="nc-note rv">{e.note}</p>}
      {map && r.show.map && e.mapQuery && (
        <div className="inv-map rv">
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
  // With the countdown off, the medallion leads this section instead.
  const lead = !(r.show.countdown && r.main?.start);
  return (
    <>
      {lead && <Medallion r={r} />}
      <section className={`inv-sec nc-loc${many ? " is-many" : ""}`} data-sec="events">
        <h2 className="nc-serif rv">{many ? r.t.celebrations : r.t.venue}</h2>
        {many ? (
          <>
            <Drawing name="venue" w={250} />
            {r.events.map((e) => (
              <article key={e.id} className="nc-ev">
                <p className="nc-caps nc-ev-title rv">{e.title}</p>
                <Place e={e} r={r} map={false} />
              </article>
            ))}
          </>
        ) : (
          <>
            {r.events[0].venue && <h3 className="nc-script nc-venue rv">{r.events[0].venue}</h3>}
            {r.events[0].address && (
              <p className="nc-caps nc-addr rv">
                <Lines text={r.events[0].address} />
              </p>
            )}
            {r.events[0].dateLong && (
              <p className="nc-when rv">
                {[r.events[0].weekday, r.events[0].dateLong].filter(Boolean).join(", ")}
                {r.events[0].time && <span>{r.events[0].time}</span>}
              </p>
            )}
            {r.show.hijri && r.events[0].hijri && <p className="nc-note rv">{r.events[0].hijri}</p>}
            {r.events[0].note && <p className="nc-note rv">{r.events[0].note}</p>}
            <Drawing name="venue" w={270} />
            {r.show.map && r.events[0].mapQuery && (
              <div className="inv-map rv">
                <iframe title={r.events[0].venue || r.t.venue} src={r.events[0].links.embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
            <div className="inv-actions rv">
              <MapButtons e={r.events[0]} r={r} />
            </div>
          </>
        )}
        {r.show.calendar && (
          <div className="inv-cal rv">
            <CalendarButton r={r} />
          </div>
        )}
      </section>
    </>
  );
}

export function ScheduleSec({ r }: { r: Resolved }) {
  const rows = r.data.schedule.filter((s) => s.title.trim());
  if (!rows.length) return null;
  return (
    <section className="inv-sec nc-day" data-sec="schedule">
      <h2 className="nc-script nc-day-h rv">{r.t.schedule}</h2>
      {r.main?.title && <p className="nc-caps nc-day-sub rv">{r.main.title}</p>}
      <ol className="nc-tl">
        {rows.map((s, i) => (
          <li key={i} className="rv">
            <time>{s.time}</time>
            <span className="nc-caps">{s.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function DressSec({ r }: { r: Resolved }) {
  return (
    <section className="inv-sec nc-dress" data-sec="dress">
      <div className="nc-frame rv">
        <h2 className="nc-serif">{r.t.dressCode}</h2>
        {r.dress.title && <p className="nc-script nc-dress-sub">{r.dress.title}</p>}
        <Drawing name="dress" w={132} />
        {r.dress.note && <p className="nc-note">{r.dress.note}</p>}
        {r.dress.colors.length > 0 && (
          <div className="inv-swatches">
            {r.dress.colors.map((c, i) => (
              <i key={i} style={{ background: c }} />
            ))}
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nc-frame-seal" src={`${A}/seal.webp`} alt="" loading="lazy" draggable={false} />
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

/** The host's extra blocks: the first on a paper card floating on shell, the next in a carved leaf frame, and so on. */
export function DetailsSec({ r }: { r: Resolved }) {
  const items = (r.data.details ?? []).filter((d) => d.title.trim() || d.text.trim());
  if (!items.length) return null;
  return (
    <>
      {items.map((d, i) => {
        const link = d.mapUrl && (
          <div className="inv-actions">
            <a className="inv-btn" href={d.mapUrl} target="_blank" rel="noopener noreferrer">
              {pin}
              {r.t.googleMaps}
            </a>
          </div>
        );
        return i % 2 === 0 ? (
          <section key={i} className="inv-sec nc-float" data-sec={i === 0 ? "details" : undefined}>
            <div className="nc-card rv">
              <Drawing name="stamps" w={112} />
              {d.title.trim() && <h2 className="nc-script nc-float-h">{d.title}</h2>}
              {d.text.trim() && (
                <p className="nc-note">
                  <Lines text={d.text} />
                </p>
              )}
              {link}
            </div>
          </section>
        ) : (
          <section key={i} className="inv-sec nc-stay">
            {d.title.trim() && <h2 className="nc-script nc-float-h rv">{d.title}</h2>}
            <div className="nc-leaf rv">
              {d.text.trim() && (
                <p className="nc-note">
                  <Lines text={d.text} />
                </p>
              )}
              {link}
            </div>
          </section>
        );
      })}
    </>
  );
}

export function GiftsSec({ r }: { r: Resolved }) {
  if (!r.gifts.title && !r.gifts.note) return null;
  return (
    <section className="inv-sec nc-gift" data-sec="gifts">
      <div className="nc-card is-pearl rv">
        <Drawing name="gift" w={96} />
        {r.gifts.title && <h2 className="nc-script nc-float-h">{r.gifts.title}</h2>}
        {r.gifts.note && <p className="nc-note">{r.gifts.note}</p>}
      </div>
    </section>
  );
}

export function ClosingSec({ r }: { r: Resolved }) {
  return (
    <footer className="inv-sec nc-close" data-sec="closing">
      <span className="nc-close-seal rv" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${A}/seal.webp`} alt="" loading="lazy" draggable={false} />
        <Initials r={r} />
      </span>
      {r.closing && <p className="nc-note nc-close-text rv">{r.closing}</p>}
      <Names r={r} as="p" className="nc-script nc-close-names rv" />
      {r.main && <p className="nc-caps nc-close-meta rv">{[r.main.dateLong, r.oneVenue ? r.main.venue : ""].filter(Boolean).join(" · ")}</p>}
    </footer>
  );
}
