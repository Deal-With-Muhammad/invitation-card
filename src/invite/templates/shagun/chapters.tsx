import type { CSSProperties } from "react";

import type { Resolved, ResolvedEvent } from "../../resolve";
import { googleCalendarUrl } from "../../runtime/calendar";
import { artUrl } from "../painted/kit";

import { Replies } from "./replies";
import { themesFor, type Theme } from "./themes";
import { SaveVideo, type VideoSpec } from "./video";

// The Shagun design's events section: every function is its own full-screen chapter
// on its own painted art (Mayoun in marigold yellow, Mehndi in henna colours, Baraat
// in Mughal red and gold, Walima in white and green), then the guest replies (RSVP
// and wishes) and "Save as video". No hooks here: the replies and the video maker
// are client components.

const ID = "shagun";

const fontVar = (key: string) => `var(--f-${key})`;

function Chapter({ e, theme, n, of, r }: { e: ResolvedEvent; theme: Theme; n: number; of: number; r: Resolved }) {
  const style = {
    "--c-ink": theme.ink,
    "--c-accent": theme.accent,
    "--c-on": theme.onAccent,
    "--c-title": fontVar(theme.title),
    "--c-body": fontVar(theme.body),
    "--c-top": `${theme.top}%`,
  } as CSSProperties;
  const dated = Boolean(e.dateLong);
  const cal = googleCalendarUrl(e, `${e.title} · ${r.names}`, r.title || r.occasionLabel);
  return (
    <section className={`sg-ch is-${theme.id}`} id={`ch-${e.id}`} style={style} aria-label={e.title}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="sg-ch-art"
        src={artUrl(ID, theme.art)}
        srcSet={`${artUrl(ID, theme.art, 720)} 720w, ${artUrl(ID, theme.art)} 1080w`}
        sizes="min(100vw, 480px)"
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <div className="sg-ch-text">
        <p className="sg-ch-count rv">
          {n} / {of}
        </p>
        <p className="sg-ch-urdu rv" lang="ur" dir="rtl">
          {theme.urdu}
        </p>
        <h2 className="sg-ch-title rv">{e.title}</h2>
        {dated ? (
          <div className="sg-ch-date rv">
            <span>{e.weekday}</span>
            <strong>{e.day}</strong>
            <span>
              {e.month} {e.year}
            </span>
          </div>
        ) : (
          <p className="sg-ch-soon rv">Date to be shared soon</p>
        )}
        {dated && e.time && <p className="sg-ch-time rv">{e.time}</p>}
        {e.note && <p className="sg-ch-note rv">{e.note}</p>}
        {e.venue && <p className="sg-ch-venue rv">{e.venue}</p>}
        {e.address && <p className="sg-ch-addr rv">{e.address}</p>}
        {(e.venue || e.address || dated) && (
          <div className="sg-ch-actions rv">
            {(e.venue || e.address) && r.show.map && (
              <a className="sg-btn" href={e.links.google} target="_blank" rel="noopener">
                Directions
              </a>
            )}
            {dated && r.show.calendar && (
              <a className="sg-btn is-ghost" href={cal} target="_blank" rel="noopener">
                Add to calendar
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** The plain data the video maker needs (it runs in the browser). */
function videoSpec(r: Resolved, themes: Theme[]): VideoSpec {
  return {
    names: r.names,
    title: r.title || r.occasionLabel,
    line: r.inviteLine,
    when: r.when.date,
    film: `/art/${ID}/open.mp4`,
    hero: artUrl(ID, "hero", 720),
    closed: artUrl(ID, "closed", 720),
    track: r.data.music.track,
    chapters: r.events.map((e, i) => ({
      theme: themes[i].id,
      art: artUrl(ID, themes[i].art, 720),
      urdu: themes[i].urdu,
      ink: themes[i].ink,
      accent: themes[i].accent,
      titleFont: themes[i].title,
      title: e.title,
      weekday: e.weekday,
      date: e.dateLong,
      time: e.dateLong ? e.time : "",
      venue: e.venue,
      address: e.address,
    })),
    contacts: r.show.contacts ? r.data.contacts.filter((c) => c.name || c.phone).slice(0, 3) : [],
    hosts: r.hosts,
  };
}

export function Chapters({ r }: { r: Resolved }) {
  if (!r.events.length) return null;
  const themes = themesFor(r.events.map((e) => e.title));
  return (
    <div className="sg-chapters" data-sec="events">
      <nav className="sg-index rv" aria-label="The functions">
        {r.events.map((e, i) => (
          <a key={e.id} href={`#ch-${e.id}`} className={`sg-pill is-${themes[i].id}`}>
            {e.title}
          </a>
        ))}
      </nav>
      {r.events.map((e, i) => (
        <Chapter key={e.id} e={e} theme={themes[i]} n={i + 1} of={r.events.length} r={r} />
      ))}
      <section className="inv-sec sg-replies" data-sec="replies">
        <Replies events={r.events.map((e, i) => ({ id: e.id, title: e.title, theme: themes[i].id }))} names={r.names} />
      </section>
      <section className="inv-sec sg-video-sec">
        <SaveVideo spec={videoSpec(r, themes)} />
      </section>
    </div>
  );
}
