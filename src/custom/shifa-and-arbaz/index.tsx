"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { FONT_VARS } from "@/invite/fonts";
import { Music } from "@/invite/runtime/music";
import { fall, PINK_PETALS, RED_PETALS, tapToThrow } from "@/invite/templates/painted/fx";

import "./invite.css";

// Custom invitation for Shifa & Arbaz: all four functions (Nikah, Mehendi, Pithi &
// Mosaru, Daawat-e-Mehmani; Vapi, 7–9 January 2027) in one invite, from the
// family's four printed cards. Plum silk gatefold that opens in code (no film),
// an ivory card inside, and the events as a deck of cards in the printed cards'
// own colours. Edit the details below.

const SLUG = "shifa-and-arbaz";
const DIR = `/custom/${SLUG}`;

/** Counts down to the first function (India time). */
const COUNT_TO = "2027-01-07T00:00:00+05:30";

const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

type Place = { name: string; address: string; maps: string };

const FARHEEN: Place = {
  name: "FARHEEN Party Plot",
  address: "Mohid Bungalow, G-9, Vapi–Daman Main Road, Opp. GST Bhavan, near Adit Hospital, Chala, Vapi, Gujarat 396191",
  maps: maps("FARHEEN Party Plot, Vapi Daman Main Road, Chala, Vapi, Gujarat 396191"),
};

const MASJID: Place = {
  name: "Madina Masjid",
  address: "Imran Nagar, Vapi",
  maps: maps("Madina Masjid, Imran Nagar, Vapi, Gujarat"),
};

type Stop = { time: string; what: string; place: Place };

type Ev = {
  id: string;
  name: string;
  short: string;
  day: string;
  date: string;
  /** yyyymmdd, for the calendar link */
  ymd: string;
  host?: string;
  /** the line under the hosts, from the printed card */
  invite?: string;
  tag?: string;
  stops: Stop[];
  /** title, date and ornament colours, from the printed card */
  look: { a: string; b: string; c: string };
  dots?: boolean;
};

const EVENTS: Ev[] = [
  {
    id: "nikah",
    name: "Nikah",
    short: "Nikah",
    day: "Thursday",
    date: "7th January 2027",
    ymd: "20270107",
    stops: [
      { time: "After Zuhr", what: "Nikah ceremony", place: MASJID },
      { time: "From 2:00 pm", what: "Lunch", place: FARHEEN },
    ],
    look: { a: "#7a2a45", b: "#8a8357", c: "#a0577a" },
  },
  {
    id: "mehendi",
    name: "Mehendi",
    short: "Mehendi",
    day: "Thursday",
    date: "7th January 2027",
    ymd: "20270107",
    host: "Arbaz, Sohaa, Adnan & Hassan",
    invite: "would like to invite you to Shifa's",
    stops: [{ time: "Guest arrival 7:00 pm", what: "Mehendi", place: FARHEEN }],
    look: { a: "#7a2a45", b: "#8a8357", c: "#a0577a" },
  },
  {
    id: "pithi",
    name: "Pithi & Mosaru",
    short: "Pithi & Mosaru",
    day: "Friday",
    date: "8th January 2027",
    ymd: "20270108",
    tag: "An evening of colour, family & celebration",
    stops: [{ time: "Guest arrival 6:00 pm", what: "Pithi & Mosaru", place: FARHEEN }],
    look: { a: "#2f7f7a", b: "#c4672a", c: "#b8336a" },
    dots: true,
  },
  {
    id: "daawat",
    name: "Daawat-e-Mehmani",
    short: "Daawat-e-Mehmani",
    day: "Saturday",
    date: "9th January 2027",
    ymd: "20270109",
    host: "Aslam & Vahida Vankalwala",
    invite: "request the pleasure of your company for",
    tag: "Celebrating the wedding of their beloved niece",
    stops: [{ time: "Guest arrival 7:00 pm", what: "Daawat-e-Mehmani", place: FARHEEN }],
    look: { a: "#7d7550", b: "#8a8357", c: "#a39a6c" },
  },
];

function calendarUrl(e: Ev) {
  const next = new Date(Date.UTC(+e.ymd.slice(0, 4), +e.ymd.slice(4, 6) - 1, +e.ymd.slice(6, 8) + 1));
  const end = next.toISOString().slice(0, 10).replace(/-/g, "");
  const details = e.stops.map((s) => `${s.time}: ${s.what} at ${s.place.name}, ${s.place.address}`).join("\n");
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${e.name} · Shifa & Arbaz`,
    dates: `${e.ymd}/${end}`,
    details: `${details}\n\nhttps://invite.dealwithmuhammad.com/${SLUG}`,
    location: `${e.stops[0].place.name}, ${e.stops[0].place.address}`,
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

type Phase = "closed" | "opening" | "open";

const OPEN_MS = 1700;
const PETALS = [...RED_PETALS, ...PINK_PETALS];
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Counted once per page load (React's dev double effect would count twice).
let counted = false;

export function Invite() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [playing, setPlaying] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const music = useRef<Music | null>(null);

  useEffect(() => {
    if (counted) return;
    counted = true;
    fetch(`/api/invites/${SLUG}/view`, {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ref: document.referrer }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("sa-locked", phase === "closed");
    return () => document.documentElement.classList.remove("sa-locked");
  }, [phase]);

  // Tapping the card inside throws a few petals from where you tapped.
  useEffect(() => {
    if (root.current && !reduced()) tapToThrow(root.current, ".sa-hero", { pieces: PETALS });
  }, []);

  const startMusic = useCallback(() => {
    music.current ??= new Music("strings");
    void music.current.play(true);
    setPlaying(true);
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (!music.current) return;
      if (document.hidden) music.current.pause();
      else if (playing) void music.current.play();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [playing]);

  useEffect(() => () => music.current?.dispose(), []);

  const open = () => {
    if (phase !== "closed") return;
    // A reload can restore a scroll position; the card always opens at the top.
    window.scrollTo({ top: 0, behavior: "instant" });
    startMusic();
    if (reduced()) return setPhase("open");
    setPhase("opening");
    window.setTimeout(() => {
      setPhase("open");
      if (root.current) fall(root.current, { pieces: PETALS, count: 30, spread: 1.6 });
    }, OPEN_MS);
  };

  const toggleMusic = () => {
    if (playing) {
      music.current?.pause();
      setPlaying(false);
    } else startMusic();
  };

  return (
    <div ref={root} className={`sa ${FONT_VARS}`} data-phase={phase}>
      <div className="sa-bg" aria-hidden />

      {phase !== "open" && (
        <div
          className="sa-cover"
          role="button"
          tabIndex={0}
          aria-label="Tap to open the invitation"
          onClick={open}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
        >
          <span className="sa-glow" aria-hidden />
          {(["l", "r"] as const).map((side) => (
            <span key={side} className={`sa-door is-${side}`} aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${DIR}/cover.webp`} srcSet={`${DIR}/cover-720.webp 720w, ${DIR}/cover.webp 1080w`} sizes="(max-width: 480px) 100vw, 480px" alt="" />
            </span>
          ))}
          <div className="sa-cover-text">
            <p className="sa-cover-names">
              Shifa <span>&amp;</span> Arbaz
            </p>
            <p className="sa-cover-date">7 – 9 January 2027 · Vapi</p>
            <span className="sa-tap">Tap to open</span>
          </div>
        </div>
      )}

      <main className="sa-main" aria-hidden={phase === "closed" || undefined}>
        <Hero />
        <Celebrations />
        <Countdown />
        <Venues />
        <Closing />
      </main>

      {phase === "open" && (
        <button type="button" className={`sa-music${playing ? " is-on" : ""}`} onClick={toggleMusic} aria-label={playing ? "Pause music" : "Play music"} aria-pressed={playing}>
          <span aria-hidden>
            <i />
            <i />
            <i />
          </span>
        </button>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section className="sa-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="sa-hero-art" src={`${DIR}/hero.webp`} srcSet={`${DIR}/hero-720.webp 720w, ${DIR}/hero.webp 1080w`} sizes="(max-width: 480px) 100vw, 480px" alt="" />
      <div className="sa-hero-text">
        <p className="sa-hosts">Mrs.&nbsp;Yashmin &amp; Late&nbsp;Mr.&nbsp;Firoz&nbsp;Vankalwala</p>
        <p className="sa-request">request the pleasure of your company at the wedding celebrations of their beloved daughter</p>
        <h1 className="sa-names">
          <span>Shifa</span>
          <span className="sa-amp">&amp;</span>
          <span>Arbaz</span>
        </h1>
        <p className="sa-groom">son of Late Shahzad &amp; Femida Khan</p>
        <Rule />
        <p className="sa-dates">7 · 8 · 9 January 2027</p>
        <p className="sa-city">Vapi, Gujarat</p>
      </div>
      <a className="sa-scroll" href="#celebrations">
        The celebrations
      </a>
    </section>
  );
}

function Rule() {
  return (
    <span className="sa-rule" aria-hidden>
      <i />
    </span>
  );
}

/** The side ornament from the printed cards: a stem with three clusters of loops. */
function Stem({ side }: { side: "l" | "r" }) {
  const clusters = [42, 80, 118];
  return (
    <svg className={`sa-stem is-${side}`} viewBox="0 0 30 160" aria-hidden>
      <path d="M15 4 C 11 50, 19 110, 15 156" />
      {clusters.map((y) => (
        <g key={y}>
          <ellipse cx={8} cy={y} rx={6} ry={3} />
          <ellipse cx={22} cy={y} rx={6} ry={3} />
          <ellipse cx={15} cy={y - 6} rx={5} ry={2.8} />
          <ellipse cx={15} cy={y + 6} rx={5} ry={2.8} />
        </g>
      ))}
    </svg>
  );
}

const DOTS = ["#b8336a", "#d9a12b", "#2f7f7a", "#c4672a", "#3a5fa0", "#4c8a4a"];

function Celebrations() {
  const deck = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);

  // Keep the current celebration's tab in view.
  useEffect(() => {
    const strip = tabs.current;
    const tab = strip?.children[at] as HTMLElement | undefined;
    if (!strip || !tab) return;
    const left = tab.offsetLeft - strip.offsetLeft;
    if (left < strip.scrollLeft || left + tab.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollTo({ left: left - 22, behavior: "smooth" });
  }, [at]);

  useEffect(() => {
    const el = deck.current;
    if (!el) return;
    const onScroll = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
      setAt(Math.max(0, Math.min(EVENTS.length - 1, Math.round(el.scrollLeft / step))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (i: number) => {
    const el = deck.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - (el.offsetWidth - card.offsetWidth) / 2, behavior: "smooth" });
  };

  return (
    <section className="sa-sec" id="celebrations">
      <header className="sa-head">
        <p className="sa-sub">three days, four celebrations</p>
        <h2>The Celebrations</h2>
        <Rule />
      </header>

      <div ref={tabs} className="sa-tabs" role="tablist" aria-label="Celebrations">
        {EVENTS.map((e, i) => (
          <button key={e.id} type="button" role="tab" aria-selected={at === i} className={at === i ? "is-on" : ""} onClick={() => go(i)}>
            <span>{e.short}</span>
            <small>{e.date.replace(" 2027", "").replace("January", "Jan")}</small>
          </button>
        ))}
      </div>

      <div ref={deck} className="sa-deck">
        {EVENTS.map((e) => (
          <article key={e.id} className="sa-ev" style={{ "--a": e.look.a, "--b": e.look.b, "--c": e.look.c } as CSSProperties}>
            <span className="sa-corners" aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </span>
            <Stem side="l" />
            <Stem side="r" />
            <div className="sa-ev-body">
              {e.host && (
                <p className="sa-ev-host">
                  {e.host}
                  <span>{e.invite}</span>
                </p>
              )}
              {e.dots && (
                <span className="sa-dots" aria-hidden>
                  {DOTS.map((c) => (
                    <i key={c} style={{ background: c }} />
                  ))}
                </span>
              )}
              <p className="sa-ev-day">{e.day}</p>
              <h3>{e.name}</h3>
              {e.tag && <p className="sa-ev-tag">{e.tag}</p>}
              <p className="sa-ev-date">{e.date}</p>
              <ul className="sa-stops">
                {e.stops.map((s) => (
                  <li key={s.what}>
                    <p className="sa-stop-time">{s.time}</p>
                    {e.stops.length > 1 && <p className="sa-stop-what">{s.what}</p>}
                    <p className="sa-stop-place">{s.place.name}</p>
                    <p className="sa-stop-addr">{s.place.address}</p>
                    <a className="sa-link" href={s.place.maps} target="_blank" rel="noopener">
                      Directions
                    </a>
                  </li>
                ))}
              </ul>
              <a className="sa-btn" href={calendarUrl(e)} target="_blank" rel="noopener">
                Add to calendar
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="sa-pager" aria-hidden>
        {EVENTS.map((e, i) => (
          <i key={e.id} className={at === i ? "is-on" : ""} />
        ))}
      </div>
      <p className="sa-swipe">Swipe for the next celebration</p>
    </section>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const target = Date.parse(COUNT_TO);
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);
  const parts: [string, string][] =
    left == null
      ? [["–", "Days"], ["–", "Hours"], ["–", "Minutes"], ["–", "Seconds"]]
      : [
          [String(Math.floor(left / 86_400_000)), "Days"],
          [pad(Math.floor(left / 3_600_000) % 24), "Hours"],
          [pad(Math.floor(left / 60_000) % 60), "Minutes"],
          [pad(Math.floor(left / 1000) % 60), "Seconds"],
        ];
  return (
    <section className="sa-sec">
      <header className="sa-head">
        <p className="sa-sub">until the celebrations begin</p>
        <h2>Counting Down</h2>
        <Rule />
      </header>
      {left === 0 ? (
        <p className="sa-today">Alhamdulillah, the celebrations have begun.</p>
      ) : (
        <div className="sa-count" role="timer" aria-live="off">
          {parts.map(([n, label]) => (
            <div key={label}>
              <span>{n}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Venues() {
  const places = useMemo(
    () => [
      { place: FARHEEN, for: "Mehendi · Nikah lunch · Pithi & Mosaru · Daawat-e-Mehmani" },
      { place: MASJID, for: "Nikah ceremony, after Zuhr" },
    ],
    [],
  );
  return (
    <section className="sa-sec">
      <header className="sa-head">
        <p className="sa-sub">where to find us</p>
        <h2>The Venues</h2>
        <Rule />
      </header>
      <div className="sa-venues">
        {places.map((v) => (
          <div key={v.place.name} className="sa-venue">
            <p className="sa-venue-for">{v.for}</p>
            <h3>{v.place.name}</h3>
            <p>{v.place.address}</p>
            <a className="sa-btn" href={v.place.maps} target="_blank" rel="noopener">
              Open in Maps
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

function Closing() {
  return (
    <footer className="sa-sec sa-closing">
      <p className="sa-note">A gentle request: no boxed gifts, please.</p>
      <p className="sa-close-names">
        Shifa <span>&amp;</span> Arbaz
      </p>
      <p>We look forward to celebrating with you.</p>
      <p className="sa-from">With love, the Vankalwala family</p>
      <Rule />
      <a className="sa-credit" href="https://invite.dealwithmuhammad.com/?ref=invite" target="_blank" rel="noopener">
        Made with DWM Invite
      </a>
    </footer>
  );
}
