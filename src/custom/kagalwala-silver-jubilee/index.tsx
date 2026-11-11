"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { FONT_VARS } from "@/invite/fonts";
import { resolve } from "@/invite/resolve";
import { Music } from "@/invite/runtime/music";
import type { InviteData } from "@/invite/types";

import { burst, ScratchCard } from "./scratch";

import "./invite.css";

// Custom invitation (a proposal for the client, Ammar Kagalwala): his parents'
// silver jubilee, 25 years married, party on Sunday 27 December 2026. All silver,
// as asked: a dove-grey envelope sealed with a silver "25" that opens on a filmed
// video (Veo, first frame closed.webp, last frame hero.webp), then the years
// together, the invitation, a scratch-to-reveal date, the party, a countdown and a
// closing note.
//
// The details are editable: they come from this invitation's row in the invites table
// (people, hosts, the first event, the dress note), which the normal edit link changes
// (/edit/kagalwala-silver-jubilee#k=…). Anything left empty there keeps the wording
// below. The editor's own preview shows a standard design, not this page.

const SLUG = "kagalwala-silver-jubilee";
const DIR = `/custom/${SLUG}`;

const YEARS = 25;

type Details = {
  /** The names as two lines, e.g. "Mr & Mrs" / "Kagalwala". */
  lines: [string, string];
  couple: string;
  hosts: string;
  /** The wedding day, 25 years before the party. */
  wed: number;
  /** Counts down to the party. */
  party: number;
  event: { name: string; note: string; day: string; date: string; time: string | null; venue: string | null; address: string | null; maps: string | null };
  dress: string;
};

const FALLBACK: Details = {
  lines: ["Mr & Mrs", "Kagalwala"],
  couple: "Mr & Mrs Kagalwala",
  hosts: "Ammar & family",
  wed: Date.parse("2001-12-27T00:00:00+05:30"),
  party: Date.parse("2026-12-27T00:00:00+05:30"),
  event: {
    name: "Silver Jubilee Party",
    note: "An evening of dinner, music and memories",
    day: "Sunday",
    date: "27 December 2026",
    time: null,
    venue: null,
    address: null,
    maps: null,
  },
  dress: "Dress code: a touch of silver, white or grey",
};

const HONORIFIC = /^(mr|mrs|ms|miss|dr|haji|hajjah)\.?\s+/i;

/** "Mr Kagalwala" and "Mrs Kagalwala" read as "Mr & Mrs" / "Kagalwala"; anything else as two names. */
function nameLines(a: string, b: string): [string, string] {
  const split = (n: string) => {
    const m = n.match(HONORIFIC);
    return m ? [m[0].trim(), n.slice(m[0].length).trim()] : ["", n];
  };
  const [ta, ra] = split(a);
  const [tb, rb] = split(b);
  if (ta && tb && ra && ra.toLowerCase() === rb.toLowerCase()) return [`${ta} & ${tb}`, ra];
  return [`${a} &`, b];
}

/** The page's details from the invitation's row, falling back to the original wording. */
function detailsFrom(data?: InviteData | null): Details {
  if (!data) return FALLBACK;
  const r = resolve(data);
  const e = r.events[0];
  const a = data.people[0]?.full.trim() || data.people[0]?.name.trim() || "";
  const b = data.people[1]?.full.trim() || data.people[1]?.name.trim() || "";
  const lines = a && b ? nameLines(a, b) : FALLBACK.lines;
  const party = e?.start ?? FALLBACK.party;
  const wedDay = new Date(party);
  wedDay.setFullYear(wedDay.getFullYear() - YEARS);
  return {
    lines,
    couple: a && b ? `${lines[0]} ${lines[1]}`.replace(/ &$/, "") : FALLBACK.couple,
    hosts: data.hosts.trim().replace(/\s*\n\s*/g, " & ") || FALLBACK.hosts,
    wed: wedDay.getTime(),
    party,
    event: e
      ? {
          name: e.title || FALLBACK.event.name,
          note: e.note || FALLBACK.event.note,
          day: e.weekday || FALLBACK.event.day,
          date: e.dateLong || FALLBACK.event.date,
          time: e.raw.start ? e.time : null,
          venue: e.venue || null,
          address: e.address || null,
          maps: e.venue || e.address || e.raw.mapUrl ? e.raw.mapUrl || e.links.google : null,
        }
      : FALLBACK.event,
    dress: data.dress.note?.trim() || FALLBACK.dress,
  };
}

const yearOf = (t: number) => new Date(t).getFullYear();

type Phase = "closed" | "opening" | "open";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const onRevealed = (el: HTMLElement) => !reduced() && burst(el);

// Counted once per page load (React's dev double effect would count twice).
let counted = false;

export function Invite({ data }: { data?: InviteData | null }) {
  const k = useMemo(() => detailsFrom(data), [data]);
  const [phase, setPhase] = useState<Phase>("closed");
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const music = useRef<Music | null>(null);
  const timer = useRef<number | null>(null);

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

  // The sealed envelope holds the page still until it's opened.
  useEffect(() => {
    document.documentElement.classList.toggle("sjb-locked", phase === "closed");
    return () => document.documentElement.classList.remove("sjb-locked");
  }, [phase]);

  const startMusic = useCallback(() => {
    music.current ??= new Music("piano");
    void Promise.resolve(music.current.play()).catch(() => {});
    setPlaying(true);
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (!music.current) return;
      if (document.hidden) music.current.pause();
      else if (playing) void Promise.resolve(music.current.play()).catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [playing]);

  useEffect(() => () => music.current?.dispose(), []);

  const finish = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setPhase("open");
  }, []);

  const open = () => {
    if (phase !== "closed") return;
    startMusic();
    const v = video.current;
    if (!v || reduced()) return finish();
    setPhase("opening");
    // Played inside the tap so phones allow it. If it can't play, open straight away.
    v.play().catch(finish);
    timer.current = window.setTimeout(finish, 9000);
  };

  // Scrolling while the film plays skips to the invitation.
  useEffect(() => {
    if (phase !== "opening") return;
    window.addEventListener("wheel", finish, { passive: true });
    window.addEventListener("touchmove", finish, { passive: true });
    return () => {
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchmove", finish);
    };
  }, [phase, finish]);

  const toggleMusic = () => {
    if (playing) {
      music.current?.pause();
      setPlaying(false);
    } else startMusic();
  };

  return (
    <div className={`sjb ${FONT_VARS}`} data-phase={phase}>
      {phase !== "open" && (
        <div
          className="sjb-cover"
          role="button"
          tabIndex={0}
          aria-label="Tap to open the invitation"
          onClick={open}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="sjb-cover-art" src={`${DIR}/closed.webp`} srcSet={`${DIR}/closed-720.webp 720w, ${DIR}/closed.webp 1080w`} sizes="(max-width: 480px) 100vw, 480px" alt="" />
          <video ref={video} className="sjb-film" muted playsInline preload="auto" poster={`${DIR}/closed-720.webp`} onEnded={finish} aria-hidden>
            {/* MP4 first: some browsers claim VP9 WebM and then fail to decode it */}
            <source src={`${DIR}/open.mp4`} type="video/mp4" />
            <source src={`${DIR}/open.webm`} type="video/webm" />
          </video>
          <span className="sjb-tap">Tap to open</span>
        </div>
      )}

      <main className="sjb-main" aria-hidden={phase === "closed" || undefined}>
        <Hero k={k} />
        <Years k={k} />
        <Message k={k} />
        <Reveal k={k} />
        <Party k={k} />
        <Countdown k={k} />
        <Closing k={k} />
      </main>

      {phase === "open" && (
        <>
          <Sparkles />
          <button type="button" className={`sjb-music${playing ? " is-on" : ""}`} onClick={toggleMusic} aria-label={playing ? "Pause music" : "Play music"} aria-pressed={playing}>
            <span aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </button>
        </>
      )}
    </div>
  );
}

function Hero({ k }: { k: Details }) {
  return (
    <section className="sjb-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="sjb-hero-art" src={`${DIR}/hero.webp`} srcSet={`${DIR}/hero-720.webp 720w, ${DIR}/hero.webp 1080w`} sizes="(max-width: 480px) 100vw, 480px" alt="" />
      <div className="sjb-hero-text">
        <p className="sjb-kicker">You are invited to the</p>
        <p className="sjb-jubilee">Silver Jubilee</p>
        <p className="sjb-of">of</p>
        <h1 className="sjb-names">
          <span>{k.lines[0]}</span>
          <span>{k.lines[1]}</span>
        </h1>
        <Rule />
        <p className="sjb-dates">
          {k.event.day} · {k.event.date}
        </p>
        <p className="sjb-city">25 years of togetherness</p>
      </div>
      <span className="sjb-scroll" aria-hidden>
        Scroll
      </span>
    </section>
  );
}

function Rule() {
  return (
    <span className="sjb-rule" aria-hidden>
      <i />
    </span>
  );
}

function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="sjb-head">
      {sub && <p className="sjb-sub">{sub}</p>}
      <h2>{title}</h2>
      <Rule />
    </header>
  );
}

const DAY = 86_400_000;

/** A big silver 25, the years either side, and the days together so far. */
function Years({ k }: { k: Details }) {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setDays(Math.floor((Date.now() - k.wed) / DAY));
    tick();
    const t = window.setInterval(tick, 60_000);
    return () => window.clearInterval(t);
  }, [k.wed]);
  const from = yearOf(k.wed);
  const to = yearOf(k.party);
  const milestones = [
    { year: String(from), text: "Two families became one" },
    { year: `${YEARS} years`, text: "Of love, laughter, patience and home" },
    { year: String(to), text: "Celebrating with everyone who made it special" },
  ];
  return (
    <section className="sjb-sec sjb-years">
      <p className="sjb-sub">twenty-five years</p>
      <p className="sjb-25" aria-label="25">
        25
      </p>
      <p className="sjb-span">
        {from} <i aria-hidden /> {to}
      </p>
      <p className="sjb-days">
        <strong>{days == null ? "–" : days.toLocaleString("en-IN")}</strong> days together, and counting
      </p>
      <ol className="sjb-steps">
        {milestones.map((m) => (
          <li key={m.year}>
            <span>{m.year}</span>
            <p>{m.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Message({ k }: { k: Details }) {
  return (
    <section className="sjb-sec">
      <Heading title="Dear Family & Friends" sub="our invitation" />
      <div className="sjb-card sjb-message">
        <p>Twenty-five years ago, our parents began a journey of love, faith and togetherness.</p>
        <p>With grateful hearts, we request the pleasure of your company as we celebrate the silver wedding anniversary of</p>
        <p className="sjb-person">{k.couple}</p>
        <p>Your presence and blessings will make the evening complete.</p>
        <p className="sjb-script">With love, {k.hosts}</p>
      </div>
    </section>
  );
}

function Reveal({ k }: { k: Details }) {
  return (
    <section className="sjb-sec">
      <Heading title="Save the Date" sub="scratch the silver" />
      <ScratchCard onReveal={onRevealed}>
        <div className="sjb-revealed">
          <p className="sjb-sub">the celebration is on</p>
          <p className="sjb-day">{k.event.day}</p>
          <p className="sjb-date">{k.event.date}</p>
          <p className="sjb-script">We can&apos;t wait to celebrate with you</p>
        </div>
      </ScratchCard>
    </section>
  );
}

function Party({ k }: { k: Details }) {
  const ev = k.event;
  return (
    <section className="sjb-sec" id="party">
      <Heading title="The Celebration" sub="join us for" />
      <div className="sjb-card sjb-event">
        <p className="sjb-when">
          {ev.day} · {ev.date}
          {ev.time && ` · ${ev.time}`}
        </p>
        <h3>{ev.name}</h3>
        <p className="sjb-note">{ev.note}</p>
        {ev.venue ? (
          <p className="sjb-place">
            {ev.venue}
            <span>{ev.address}</span>
          </p>
        ) : (
          <p className="sjb-place is-tba">Time and venue to be shared soon</p>
        )}
        {ev.maps && (
          <a className="sjb-btn" href={ev.maps} target="_blank" rel="noopener">
            Directions
          </a>
        )}
        <p className="sjb-dress">
          <span className="sjb-swatches" aria-hidden>
            <i style={{ background: "#f4f4f2" }} />
            <i style={{ background: "#c7cbd1" }} />
            <i style={{ background: "#8e949c" }} />
          </span>
          {k.dress}
        </p>
      </div>
    </section>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

function Countdown({ k }: { k: Details }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, k.party - Date.now()));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [k.party]);
  const parts =
    left == null
      ? null
      : ([
          [Math.floor(left / DAY), "Days"],
          [Math.floor(left / 3_600_000) % 24, "Hours"],
          [Math.floor(left / 60_000) % 60, "Minutes"],
          [Math.floor(left / 1000) % 60, "Seconds"],
        ] as const);
  return (
    <section className="sjb-sec">
      <Heading title="Counting Down" sub="until the celebration" />
      {left === 0 ? (
        <p className="sjb-card sjb-today">The day is here. Happy 25th anniversary!</p>
      ) : (
        <div className="sjb-count" role="timer" aria-live="off">
          {(parts ?? (["Days", "Hours", "Minutes", "Seconds"] as const).map((l) => [null, l] as const)).map(([n, label]) => (
            <div key={label} className="sjb-tile">
              <span>{n == null ? "–" : label === "Days" ? n : pad(n)}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>
      )}
      <p className="sjb-after">
        {k.event.day}, {k.event.date}
      </p>
    </section>
  );
}

function Closing({ k }: { k: Details }) {
  return (
    <footer className="sjb-sec sjb-closing">
      <p className="sjb-25-sm" aria-hidden>
        25
      </p>
      <p className="sjb-names-sm">Happy Silver Jubilee</p>
      <p>Thank you for being a part of their story.</p>
      <p className="sjb-wish">Here&apos;s to many more years of love, laughter and togetherness.</p>
      <Rule />
      <p className="sjb-small">{k.hosts}</p>
      <a className="sjb-credit" href="https://invite.dealwithmuhammad.com/?ref=invite" target="_blank" rel="noopener">
        Made with DWM Invite
      </a>
    </footer>
  );
}

/** Small silver sparkles drifting down, now and then. */
function Sparkles() {
  const bits = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        "--x": `${(i * 11 + 4) % 96}%`,
        "--s": 0.6 + ((i * 37) % 10) / 14,
        "--d": `${12 + ((i * 7) % 9)}s`,
        "--delay": `${-((i * 5) % 17)}s`,
        "--sway": `${i % 2 ? 30 : -30}px`,
      })) as CSSProperties[],
    [],
  );
  return (
    <div className="sjb-sparkles" aria-hidden>
      {bits.map((s, i) => (
        <i key={i} style={s} />
      ))}
    </div>
  );
}
