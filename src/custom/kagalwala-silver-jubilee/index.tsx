"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { FONT_VARS } from "@/invite/fonts";
import { Music } from "@/invite/runtime/music";

import { burst, ScratchCard } from "./scratch";

import "./invite.css";

// Custom invitation (a proposal for the client, Ammar Kagalwala): his parents'
// silver jubilee, 25 years married, party on Sunday 27 December 2026. All silver,
// as asked: a dove-grey envelope sealed with a silver "25" that opens on a filmed
// video (Veo, first frame closed.webp, last frame hero.webp), then the years
// together, the invitation, a scratch-to-reveal date, the party, a countdown and a
// closing note. Names, time and venue aren't known yet: edit the details below.

const SLUG = "kagalwala-silver-jubilee";
const DIR = `/custom/${SLUG}`;

const TITLES = "Mr & Mrs";
const SURNAME = "Kagalwala";
const COUPLE = `${TITLES} ${SURNAME}`;
const HOSTS = "Ammar & family";

/** The wedding day, 25 years before the party (India time). */
const WED = "2001-12-27T00:00:00+05:30";

/** Counts down to the party. Set the hour once the time is known. */
const PARTY = "2026-12-27T00:00:00+05:30";

const EVENT = {
  name: "Silver Jubilee Party",
  note: "An evening of dinner, music and memories",
  day: "Sunday",
  date: "27 December 2026",
  time: null as string | null,
  venue: null as string | null,
  address: null as string | null,
  maps: null as string | null,
};

const MILESTONES = [
  { year: "2001", text: "Two families became one" },
  { year: "25 years", text: "Of love, laughter, patience and home" },
  { year: "2026", text: "Celebrating with everyone who made it special" },
];

type Phase = "closed" | "opening" | "open";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const onRevealed = (el: HTMLElement) => !reduced() && burst(el);

// Counted once per page load (React's dev double effect would count twice).
let counted = false;

export function Invite() {
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
        <Hero />
        <Years />
        <Message />
        <Reveal />
        <Party />
        <Countdown />
        <Closing />
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

function Hero() {
  return (
    <section className="sjb-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="sjb-hero-art" src={`${DIR}/hero.webp`} srcSet={`${DIR}/hero-720.webp 720w, ${DIR}/hero.webp 1080w`} sizes="(max-width: 480px) 100vw, 480px" alt="" />
      <div className="sjb-hero-text">
        <p className="sjb-kicker">You are invited to the</p>
        <p className="sjb-jubilee">Silver Jubilee</p>
        <p className="sjb-of">of</p>
        <h1 className="sjb-names">
          <span>{TITLES}</span>
          <span>{SURNAME}</span>
        </h1>
        <Rule />
        <p className="sjb-dates">Sunday · 27 December 2026</p>
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
function Years() {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setDays(Math.floor((Date.now() - Date.parse(WED)) / DAY));
    tick();
    const t = window.setInterval(tick, 60_000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <section className="sjb-sec sjb-years">
      <p className="sjb-sub">twenty-five years</p>
      <p className="sjb-25" aria-label="25">
        25
      </p>
      <p className="sjb-span">
        2001 <i aria-hidden /> 2026
      </p>
      <p className="sjb-days">
        <strong>{days == null ? "–" : days.toLocaleString("en-IN")}</strong> days together, and counting
      </p>
      <ol className="sjb-steps">
        {MILESTONES.map((m) => (
          <li key={m.year}>
            <span>{m.year}</span>
            <p>{m.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Message() {
  return (
    <section className="sjb-sec">
      <Heading title="Dear Family & Friends" sub="our invitation" />
      <div className="sjb-card sjb-message">
        <p>Twenty-five years ago, our parents began a journey of love, faith and togetherness.</p>
        <p>With grateful hearts, we request the pleasure of your company as we celebrate the silver wedding anniversary of</p>
        <p className="sjb-person">{COUPLE}</p>
        <p>Your presence and blessings will make the evening complete.</p>
        <p className="sjb-script">With love, {HOSTS}</p>
      </div>
    </section>
  );
}

function Reveal() {
  return (
    <section className="sjb-sec">
      <Heading title="Save the Date" sub="scratch the silver" />
      <ScratchCard onReveal={onRevealed}>
        <div className="sjb-revealed">
          <p className="sjb-sub">the celebration is on</p>
          <p className="sjb-day">{EVENT.day}</p>
          <p className="sjb-date">{EVENT.date}</p>
          <p className="sjb-script">We can&apos;t wait to celebrate with you</p>
        </div>
      </ScratchCard>
    </section>
  );
}

function Party() {
  return (
    <section className="sjb-sec" id="party">
      <Heading title="The Celebration" sub="join us for" />
      <div className="sjb-card sjb-event">
        <p className="sjb-when">
          {EVENT.day} · {EVENT.date}
          {EVENT.time && ` · ${EVENT.time}`}
        </p>
        <h3>{EVENT.name}</h3>
        <p className="sjb-note">{EVENT.note}</p>
        {EVENT.venue ? (
          <p className="sjb-place">
            {EVENT.venue}
            <span>{EVENT.address}</span>
          </p>
        ) : (
          <p className="sjb-place is-tba">Time and venue to be shared soon</p>
        )}
        {EVENT.maps && (
          <a className="sjb-btn" href={EVENT.maps} target="_blank" rel="noopener">
            Directions
          </a>
        )}
        <p className="sjb-dress">
          <span className="sjb-swatches" aria-hidden>
            <i style={{ background: "#f4f4f2" }} />
            <i style={{ background: "#c7cbd1" }} />
            <i style={{ background: "#8e949c" }} />
          </span>
          Dress code: a touch of silver, white or grey
        </p>
      </div>
    </section>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const target = Date.parse(PARTY);
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);
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
      <p className="sjb-after">Sunday, 27 December 2026</p>
    </section>
  );
}

function Closing() {
  return (
    <footer className="sjb-sec sjb-closing">
      <p className="sjb-25-sm" aria-hidden>
        25
      </p>
      <p className="sjb-names-sm">Happy Silver Jubilee</p>
      <p>Thank you for being a part of their story.</p>
      <p className="sjb-wish">Here&apos;s to many more years of love, laughter and togetherness.</p>
      <Rule />
      <p className="sjb-small">{HOSTS}</p>
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
