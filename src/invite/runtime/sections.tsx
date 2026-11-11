import { Fragment, type CSSProperties, type FC, type ReactNode } from "react";

import { Bismillah } from "../art/bismillah";
import type { Resolved, ResolvedEvent } from "../resolve";
import type { TemplateParts } from "../templates/types";
import type { SectionId } from "../types";
import { isPremium } from "@/lib/groups";

import { CalendarButton, Countdown } from "./client-bits";
import { RsvpForm, WishesWall } from "./replies";
import { repliesCopy } from "./replies-copy";

// The shared section markup. Templates restyle these through their own CSS (every
// element has a stable inv-* class) or replace a section outright.

export function Heading({ eyebrow, title, Ornament }: { eyebrow?: string; title: string; Ornament?: FC }) {
  return (
    <header className="inv-h rv">
      {eyebrow && <span className="inv-eyebrow">{eyebrow}</span>}
      <h2 className="inv-title">{title}</h2>
      {Ornament ? (
        <span className="inv-orn" aria-hidden>
          <Ornament />
        </span>
      ) : (
        <span className="inv-orn inv-orn-default" aria-hidden>
          <i />
        </span>
      )}
    </header>
  );
}

/** The Bismillah and/or salam lines, for heroes and the invite section. */
export function Blessing({ r, className = "" }: { r: Resolved; className?: string }) {
  const b = r.data.bismillah;
  if (b === "none" && !r.show.salam) return null;
  return (
    <div className={`inv-blessing ${className}`}>
      {b === "calligraphy" && <Bismillah className="inv-bism" />}
      {b === "arabic" && (
        <p className="inv-bism-text" lang="ar" dir="rtl">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
      )}
    </div>
  );
}

/**
 * The big names. Sets --len (longest name, in characters) so a template can shrink
 * long names to fit: font-size: min(46px, calc(100cqi / (var(--len) * 0.5))).
 */
export function Names({ r, as: Tag = "h1", className = "" }: { r: Resolved; as?: "h1" | "h2" | "p"; className?: string }) {
  const len = Math.max(4, ...r.people.map((p) => p.name.length));
  return (
    <Tag className={`inv-names ${className}`} style={{ "--len": len } as CSSProperties}>
      {r.people.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="inv-amp">{r.t.and}</span>}
          <span className="inv-name">{p.name}</span>
        </Fragment>
      ))}
    </Tag>
  );
}

const lines = (s: string) =>
  s.split("\n").map((l, i, a) => (
    <Fragment key={i}>
      {l}
      {i < a.length - 1 && <br />}
    </Fragment>
  ));

export const Lines = ({ text }: { text: string }) => <>{lines(text)}</>;

function InviteSection({ r }: { r: Resolved }) {
  return (
    <section className="inv-sec inv-invite" data-sec="invite">
      {r.show.salam && (
        <p className="inv-salam rv" lang={r.dir === "rtl" ? r.lang : "ar"} dir="rtl">
          {r.dir === "rtl" ? r.t.salam : "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ ٱللَّٰهِ"}
        </p>
      )}
      {r.hosts.length > 0 && (
        <div className="inv-hosts rv">
          {r.hosts.map((h, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="inv-hosts-amp">{r.t.and}</span>}
              <p>{h}</p>
            </Fragment>
          ))}
        </div>
      )}
      {r.inviteLine && <p className="inv-line rv">{r.inviteLine}</p>}
      <div className="inv-people rv">
        {r.people.map((p, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="inv-people-amp">{r.t.and}</span>}
            <div className="inv-person">
              <h2 className="inv-pname">{p.full}</h2>
              {p.line && <p className="inv-pline">{p.line}</p>}
            </div>
          </Fragment>
        ))}
      </div>
      {r.milestone && <p className="inv-milestone rv">{r.milestone}</p>}
      {r.message && (
        <p className="inv-message rv">
          <Lines text={r.message} />
        </p>
      )}
    </section>
  );
}

function CountdownSection({ r, Ornament }: { r: Resolved; Ornament?: FC }) {
  if (!r.show.countdown || !r.main?.start) return null;
  return (
    <section className="inv-sec inv-countdown" data-sec="countdown">
      <Heading eyebrow={r.t.saveTheDate} title={r.t.countdownTitle} Ornament={Ornament} />
      <Countdown target={r.main.start} t={r.t} />
    </section>
  );
}

export function MapButtons({ e, r }: { e: ResolvedEvent; r: Resolved }) {
  if (!e.mapQuery && !e.raw.mapUrl) return null;
  return (
    <>
      <a className="inv-btn" href={e.links.google} target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
        {r.t.googleMaps}
      </a>
      <a className="inv-btn" href={e.links.waze} target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M3 11.5 21 3l-8.5 18-2-7.5Z" />
        </svg>
        {r.t.waze}
      </a>
    </>
  );
}

export function EventDate({ e }: { e: ResolvedEvent }) {
  return (
    <div className="inv-ev-date">
      <span className="inv-ev-weekday">{e.weekday}</span>
      <strong className="inv-ev-day">{e.day}</strong>
      <span className="inv-ev-month">{e.month}</span>
      <span className="inv-ev-year">{e.year}</span>
    </div>
  );
}

export function VenueBlock({ e, r, map }: { e: ResolvedEvent; r: Resolved; map: boolean }) {
  if (!e.venue && !e.address) return null;
  return (
    <div className="inv-venue">
      {e.venue && <h3 className="inv-venue-name">{e.venue}</h3>}
      {e.address && (
        <p className="inv-venue-addr">
          <Lines text={e.address} />
        </p>
      )}
      {map && r.show.map && e.mapQuery && (
        <div className="inv-map">
          <iframe title={e.venue || r.t.venue} src={e.links.embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      )}
      <div className="inv-actions">
        <MapButtons e={e} r={r} />
      </div>
    </div>
  );
}

function EventsSection({ r, Ornament }: { r: Resolved; Ornament?: FC }) {
  if (!r.events.length) return null;
  const many = r.events.length > 1;
  const shared = many && r.oneVenue ? r.events[0] : null;
  return (
    <section className={`inv-sec inv-events${many ? " is-many" : ""}`} data-sec="events">
      <Heading eyebrow={r.t.when} title={many ? r.t.celebrations : r.events[0].title} Ornament={Ornament} />
      <div className="inv-ev-list">
        {r.events.map((e) => (
          <article key={e.id} className="inv-ev rv">
            {many && <h3 className="inv-ev-title">{e.title}</h3>}
            <EventDate e={e} />
            <p className="inv-ev-time">{e.time}</p>
            {r.show.hijri && e.hijri && <p className="inv-ev-hijri">{e.hijri}</p>}
            {e.note && <p className="inv-ev-note">{e.note}</p>}
            {!shared && <VenueBlock e={e} r={r} map={!many} />}
          </article>
        ))}
      </div>
      {shared && (
        <div className="inv-ev-shared rv">
          <span className="inv-eyebrow">{r.t.where}</span>
          <VenueBlock e={shared} r={r} map />
        </div>
      )}
      {r.show.calendar && (
        <div className="inv-cal rv">
          <CalendarButton r={r} />
        </div>
      )}
    </section>
  );
}

function ScheduleSection({ r, Ornament }: { r: Resolved; Ornament?: FC }) {
  if (!r.show.schedule) return null;
  return (
    <section className="inv-sec inv-schedule" data-sec="schedule">
      <Heading eyebrow={r.main?.title} title={r.t.schedule} Ornament={Ornament} />
      <ol className="inv-sched rv">
        {r.data.schedule
          .filter((s) => s.title.trim())
          .map((s, i) => (
            <li key={i}>
              <time>{s.time}</time>
              <span>{s.title}</span>
            </li>
          ))}
      </ol>
    </section>
  );
}

function DressSection({ r, Ornament }: { r: Resolved; Ornament?: FC }) {
  if (!r.show.dress) return null;
  return (
    <section className="inv-sec inv-dress" data-sec="dress">
      <Heading eyebrow={r.t.dressCode} title={r.dress.title} Ornament={Ornament} />
      {r.dress.note && <p className="inv-dress-note rv">{r.dress.note}</p>}
      {r.dress.colors.length > 0 && (
        <div className="inv-swatches rv">
          {r.dress.colors.map((c, i) => (
            <i key={i} style={{ background: c }} />
          ))}
        </div>
      )}
    </section>
  );
}

const digits = (phone: string) => phone.replace(/[^\d+]/g, "").replace(/^\+/, "");

function ContactsSection({ r, Ornament }: { r: Resolved; Ornament?: FC }) {
  if (!r.show.contacts) return null;
  return (
    <section className="inv-sec inv-contacts" data-sec="contacts">
      <Heading title={r.t.contact} Ornament={Ornament} />
      <div className="inv-contact-list">
        {r.data.contacts
          .filter((c) => c.phone.trim())
          .map((c, i) => (
            <div key={i} className="inv-contact rv">
              <p className="inv-contact-name">{c.name}</p>
              <div className="inv-actions">
                <a className="inv-btn is-primary" href={`https://wa.me/${digits(c.phone)}`} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M4 20l1.3-4A8 8 0 1 1 8.4 19z" />
                  </svg>
                  {r.t.whatsapp}
                </a>
                <a className="inv-btn" href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                  </svg>
                  {r.t.call}
                </a>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

function PrayerSection({ r, Ornament }: { r: Resolved; Ornament?: FC }) {
  if (!r.show.prayer || (!r.prayer.text && !r.prayer.arabic)) return null;
  return (
    <section className="inv-sec inv-prayer" data-sec="prayer">
      <Heading title={r.t.prayer} Ornament={Ornament} />
      {r.prayer.arabic && (
        <p className="inv-prayer-ar rv" lang="ar" dir="rtl">
          {r.prayer.arabic}
        </p>
      )}
      {r.prayer.text && <p className="inv-prayer-text rv">{r.prayer.text}</p>}
    </section>
  );
}

function GiftsSection({ r, Ornament }: { r: Resolved; Ornament?: FC }) {
  if (!r.show.gifts || (!r.gifts.title && !r.gifts.note)) return null;
  return (
    <section className="inv-sec inv-gifts" data-sec="gifts">
      <Heading title={r.gifts.title} Ornament={Ornament} />
      {r.gifts.note && <p className="inv-gifts-note rv">{r.gifts.note}</p>}
    </section>
  );
}

function ClosingSection({ r }: { r: Resolved }) {
  return (
    <footer className="inv-sec inv-closing" data-sec="closing">
      {r.closing && <p className="inv-closing-text rv">{r.closing}</p>}
      <Names r={r} as="p" className="inv-closing-names rv" />
      {r.main && (
        <p className="inv-closing-meta rv">
          {[r.main.dateLong, r.oneVenue ? r.main.venue : ""].filter(Boolean).join(" · ")}
        </p>
      )}
    </footer>
  );
}

/** RSVP (premium designs, when the host turns it on). */
function RsvpSection({ r, Ornament }: { r: Resolved; Ornament?: FC }) {
  const c = repliesCopy(r.lang);
  return (
    <section className="inv-sec inv-rsvp" data-sec="rsvp">
      <Heading eyebrow={c.rsvpEyebrow} title={c.rsvpTitle} Ornament={Ornament} />
      <RsvpForm events={r.events.map((e) => ({ id: e.id, title: e.title }))} lang={r.lang} />
    </section>
  );
}

/** Wishes for the couple (premium designs, when the host turns them on). */
function WishesSection({ r, Ornament }: { r: Resolved; Ornament?: FC }) {
  const c = repliesCopy(r.lang);
  return (
    <section className="inv-sec inv-wishes" data-sec="wishes">
      <Heading eyebrow={c.wishesEyebrow} title={c.wishesTitle(r.names)} Ornament={Ornament} />
      <WishesWall lang={r.lang} />
    </section>
  );
}

const DEFAULTS: Record<SectionId, FC<{ r: Resolved; Ornament?: FC }>> = {
  invite: InviteSection,
  countdown: CountdownSection,
  events: EventsSection,
  rsvp: RsvpSection,
  wishes: WishesSection,
  schedule: ScheduleSection,
  dress: DressSection,
  contacts: ContactsSection,
  prayer: PrayerSection,
  gifts: GiftsSection,
  closing: ClosingSection,
};

export const SECTION_ORDER: SectionId[] = ["invite", "countdown", "events", "rsvp", "wishes", "schedule", "dress", "contacts", "prayer", "gifts", "closing"];

export function visibleSections(r: Resolved): SectionId[] {
  return SECTION_ORDER.filter((id) => {
    switch (id) {
      case "countdown":
        return r.show.countdown;
      case "schedule":
        return r.show.schedule;
      case "dress":
        return r.show.dress;
      case "contacts":
        return r.show.contacts;
      case "prayer":
        return r.show.prayer && Boolean(r.prayer.text || r.prayer.arabic);
      case "gifts":
        return r.show.gifts && Boolean(r.gifts.title || r.gifts.note);
      case "events":
        return r.events.length > 0;
      case "rsvp":
        return r.show.rsvp === true && isPremium(r.data.template);
      case "wishes":
        return r.show.wishes === true && isPremium(r.data.template);
      default:
        return true;
    }
  });
}

/** Every section after the hero, with the template's dividers in between. */
export function Body({ r, parts, credit }: { r: Resolved; parts: TemplateParts; credit?: ReactNode }) {
  const ids = visibleSections(r);
  const Divider = parts.Divider;
  return (
    <>
      {ids.map((id, i) => {
        const Own = parts.sections?.[id];
        const Def = DEFAULTS[id];
        return (
          <Fragment key={id}>
            {Divider && (
              <div className="inv-divider" aria-hidden>
                <Divider index={i} />
              </div>
            )}
            {Own ? <Own r={r} /> : <Def r={r} Ornament={parts.Ornament} />}
          </Fragment>
        );
      })}
      {credit}
    </>
  );
}
