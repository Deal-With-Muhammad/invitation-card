import type { Resolved } from "../../resolve";
import { SaveVideo, type VideoSpec } from "../../runtime/video-maker";
import { artUrl } from "../painted/kit";

// Yaadein's events, set like the inside of an old wedding card: each function's name in
// gold, then the day and date, the time and the place, each on its own line, with a
// directions button, over the stage. Then "Save as video" (the stage film, the names, each
// function on the empty stage, and the family's numbers), in the invitation's language.

const ID = "yaadein";

function videoSpec(r: Resolved): VideoSpec {
  return {
    names: r.names,
    title: r.title || r.occasionLabel,
    line: r.inviteLine,
    when: r.when.date,
    film: `/art/${ID}/open.mp4`,
    hero: artUrl(ID, "hero", 720),
    closed: artUrl(ID, "closed", 720),
    track: r.data.music.track,
    lang: r.lang,
    tone: "dark",
    // below the tinsel and the swags, on the curtain
    titleTop: 300,
    closingTop: 290,
    chapters: r.events.map((e) => ({
      art: artUrl(ID, "hero", 720),
      urdu: "",
      dark: true,
      wide: 500,
      top: 0.24,
      ink: "#f6dfa6",
      accent: "#e3b45c",
      titleFont: "rozha",
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

export function Occasions({ r }: { r: Resolved }) {
  if (!r.events.length) return null;
  return (
    <>
      <section className="inv-sec yd-events" data-sec="events">
        {r.events.map((e) => (
          <article key={e.id} className="yd-ev">
            <h3 className="yd-ev-title rv">{e.title}</h3>
            {e.dateLong ? (
              <p className="yd-ev-date rv">
                {e.weekday && <span>{e.weekday}</span>}
                <strong>{e.dateLong}</strong>
              </p>
            ) : null}
            {e.dateLong && e.time && <p className="yd-ev-time rv">{e.time}</p>}
            {e.note && <p className="yd-ev-note rv">{e.note}</p>}
            {e.venue && <p className="yd-ev-venue rv">{e.venue}</p>}
            {e.address && <p className="yd-ev-addr rv">{e.address}</p>}
            {(e.venue || e.address) && r.show.map && (
              <a className="yd-btn rv" href={e.links.google} target="_blank" rel="noopener">
                {r.t.directions}
              </a>
            )}
          </article>
        ))}
      </section>
      <section className="inv-sec yd-video">
        <SaveVideo spec={videoSpec(r)} />
      </section>
    </>
  );
}
