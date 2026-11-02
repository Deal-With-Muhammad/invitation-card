"use client";

import qrcode from "qrcode-generator";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { FONT_VARS } from "@/invite/fonts";
import { Music } from "@/invite/runtime/music";

import { burst, ScratchCard } from "./scratch";

import "./invite.css";

// Custom invitation for Muhammed Siraj & Shireen Begum (Nikah 2 Dec, Walima 4 Dec
// 2026, Hyderabad). Ivory and sage, after the client's reference: a sealed envelope
// that opens on a filmed video (Veo, first frame closed.webp, last frame hero.webp),
// then the Quran verse, a scratch-to-reveal date, the invitation, the events, a
// countdown and the venue. Edit the details below.

const SLUG = "siraj-and-shireen";
const DIR = `/custom/${SLUG}`;

/** An mp3 in public/custom/<slug>/ to play instead of the synthesised oud piece. */
const SONG: string | null = null;

/** Counts down to the Nikah (India time). Set the hour once the time is known. */
const COUNT_TO = "2026-12-02T00:00:00+05:30";

const VENUE = {
  name: "Baqueries Function Hall",
  address: "Chota Bazar, Golconda Fort, Hyderabad",
  maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Baqueri Function Hall, Golconda Fort, Hyderabad")}`,
};

type Event = { name: string; note: string; day: string; date: string; time?: string; venue?: string; address?: string };

const EVENTS: Event[] = [
  { name: "Nikah", note: "The marriage ceremony", day: "Wednesday", date: "2 December 2026" },
  { name: "Walima", note: "The wedding feast", day: "Friday", date: "4 December 2026", venue: VENUE.name, address: VENUE.address },
];

const VERSE = {
  ar: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِقَوْمٍ يَتَفَكَّرُونَ",
  en: "And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought.",
  ref: "Surah Ar-Rum 30:21",
};

type Phase = "closed" | "opening" | "open";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Outside the component so the scratch card's effect doesn't re-run (and repaint
// the foil) every time the page re-renders.
const onRevealed = (el: HTMLElement) => !reduced() && burst(el);

// Counted once per page load (React's dev double effect would count twice).
let counted = false;

export function Invite() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const music = useRef<{ play: () => Promise<void> | void; pause: () => void; dispose: () => void } | null>(null);
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
    document.documentElement.classList.toggle("sns-locked", phase === "closed");
    return () => document.documentElement.classList.remove("sns-locked");
  }, [phase]);

  const startMusic = useCallback(() => {
    if (!music.current) {
      if (SONG) {
        const a = new Audio(`${DIR}/${SONG}`);
        a.loop = true;
        a.volume = 0.7;
        music.current = { play: () => a.play().then(() => {}), pause: () => a.pause(), dispose: () => a.pause() };
      } else {
        const m = new Music("oud");
        music.current = { play: () => m.play(), pause: () => m.pause(), dispose: () => m.dispose() };
      }
    }
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
    <div className={`sns ${FONT_VARS}`} data-phase={phase}>
      {phase !== "open" && (
        <div
          className="sns-cover"
          role="button"
          tabIndex={0}
          aria-label="Tap to open the invitation"
          onClick={open}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="sns-cover-art" src={`${DIR}/closed.webp`} srcSet={`${DIR}/closed-720.webp 720w, ${DIR}/closed.webp 1080w`} sizes="(max-width: 480px) 100vw, 480px" alt="" />
          <video ref={video} className="sns-film" muted playsInline preload="auto" poster={`${DIR}/closed-720.webp`} onEnded={finish} aria-hidden>
            {/* MP4 first: some browsers claim VP9 WebM and then fail to decode it */}
            <source src={`${DIR}/open.mp4`} type="video/mp4" />
            <source src={`${DIR}/open.webm`} type="video/webm" />
          </video>
          <span className="sns-tap">Tap to open</span>
        </div>
      )}

      <main className="sns-main" aria-hidden={phase === "closed" || undefined}>
        <Hero />
        <Verse />
        <Reveal />
        <Message />
        <Events />
        <Countdown />
        <Venue />
        <Closing />
      </main>

      {phase === "open" && (
        <>
          <Leaves />
          <button type="button" className={`sns-music${playing ? " is-on" : ""}`} onClick={toggleMusic} aria-label={playing ? "Pause music" : "Play music"} aria-pressed={playing}>
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
    <section className="sns-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="sns-hero-art" src={`${DIR}/hero.webp`} srcSet={`${DIR}/hero-720.webp 720w, ${DIR}/hero.webp 1080w`} sizes="(max-width: 480px) 100vw, 480px" alt="" />
      <div className="sns-hero-text">
        <p className="sns-bism" lang="ar" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="sns-kicker">Together with their families, we invite you to celebrate the wedding of</p>
        <h1 className="sns-names">
          <span>Siraj</span>
          <span className="sns-amp">&amp;</span>
          <span>Shireen</span>
        </h1>
        <p className="sns-occasion">Nikah &amp; Walima</p>
        <Rule />
        <p className="sns-dates">2 &amp; 4 December 2026</p>
        <p className="sns-city">Hyderabad</p>
        <div className="sns-actions">
          <a className="sns-btn" href="#events">
            View events
          </a>
          <a className="sns-btn is-ghost" href={VENUE.maps} target="_blank" rel="noopener">
            Directions
          </a>
        </div>
      </div>
      <span className="sns-scroll" aria-hidden>
        Scroll
      </span>
    </section>
  );
}

function Rule() {
  return (
    <span className="sns-rule" aria-hidden>
      <i />
    </span>
  );
}

function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="sns-head">
      {sub && <p className="sns-sub">{sub}</p>}
      <h2>{title}</h2>
      <Rule />
    </header>
  );
}

function Verse() {
  return (
    <section className="sns-sec">
      <figure className="sns-card sns-verse">
        <span className="sns-quote" aria-hidden>
          &ldquo;
        </span>
        <p className="sns-ar" lang="ar" dir="rtl">
          {VERSE.ar}
        </p>
        <p className="sns-en">{VERSE.en}</p>
        <figcaption>{VERSE.ref}</figcaption>
      </figure>
    </section>
  );
}

function Reveal() {
  return (
    <section className="sns-sec">
      <Heading title="Scratch & Reveal" sub="a little surprise" />
      <ScratchCard onReveal={onRevealed}>
        <div className="sns-revealed">
          <p className="sns-sub">Save the date</p>
          <p className="sns-day">Wednesday</p>
          <p className="sns-date">2 December 2026</p>
          <p className="sns-script">We can&apos;t wait to celebrate with you</p>
        </div>
      </ScratchCard>
    </section>
  );
}

function Message() {
  return (
    <section className="sns-sec">
      <Heading title="Dear Family & Friends" sub="our invitation" />
      <div className="sns-card sns-message">
        <p>With the blessings of Allah, and with joy in our hearts, we request the honour of your presence at the Nikah and Walima of</p>
        <p className="sns-person">
          <strong>Muhammed Siraj</strong>
          <span>son of Late Mr &amp; Mrs Fazal Muhammed</span>
        </p>
        <p className="sns-with">with</p>
        <p className="sns-person">
          <strong>Shireen Begum</strong>
          <span>daughter of Mr &amp; Mrs Mohammed Azeem Uddin</span>
        </p>
        <p>Your presence and your duas will make our celebration complete.</p>
        <p className="sns-script">
          With love, Siraj <span className="sns-and">&amp;</span> Shireen
        </p>
      </div>
    </section>
  );
}

function Events() {
  return (
    <section className="sns-sec" id="events">
      <Heading title="Wedding Events" sub="celebrating together" />
      <ol className="sns-timeline">
        {EVENTS.map((e) => (
          <li key={e.name}>
            <span className="sns-dot" aria-hidden />
            <div className="sns-card sns-event">
              <p className="sns-when">
                {e.day} · {e.date}
                {e.time && ` · ${e.time}`}
              </p>
              <h3>{e.name}</h3>
              <p className="sns-note">{e.note}</p>
              {e.venue ? (
                <p className="sns-place">
                  {e.venue}
                  <span>{e.address}</span>
                </p>
              ) : (
                <p className="sns-place is-tba">Time and venue to be shared soon</p>
              )}
            </div>
          </li>
        ))}
      </ol>
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
  const parts =
    left == null
      ? null
      : [
          [Math.floor(left / 86_400_000), "Days"],
          [Math.floor(left / 3_600_000) % 24, "Hours"],
          [Math.floor(left / 60_000) % 60, "Minutes"],
          [Math.floor(left / 1000) % 60, "Seconds"],
        ] as const;
  return (
    <section className="sns-sec">
      <Heading title="Counting Down" sub="until the Nikah" />
      {left === 0 ? (
        <p className="sns-card sns-today">Alhamdulillah, the day is here.</p>
      ) : (
        <div className="sns-count" role="timer" aria-live="off">
          {(parts ?? (["Days", "Hours", "Minutes", "Seconds"] as const).map((l) => [null, l] as const)).map(([n, label]) => (
            <div key={label} className="sns-tile">
              <span>{n == null ? "–" : label === "Days" ? n : pad(n)}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>
      )}
      <p className="sns-after">Wednesday, 2 December 2026</p>
    </section>
  );
}

function Venue() {
  const qr = useMemo(() => {
    const q = qrcode(0, "M");
    q.addData(VENUE.maps);
    q.make();
    const n = q.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + 2} ${r + 2}h1v1h-1z`;
    return { d, size: n + 4 };
  }, []);
  return (
    <section className="sns-sec">
      <Heading title="The Venue" sub="for the Walima" />
      <div className="sns-card sns-venue">
        <h3>{VENUE.name}</h3>
        <p>{VENUE.address}</p>
        <a className="sns-btn" href={VENUE.maps} target="_blank" rel="noopener">
          Open in Maps
        </a>
        <svg className="sns-qr" viewBox={`0 0 ${qr.size} ${qr.size}`} shapeRendering="crispEdges" role="img" aria-label="QR code for directions">
          <path d={qr.d} />
        </svg>
        <p className="sns-small">Scan for directions</p>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <footer className="sns-sec sns-closing">
      <p className="sns-names-sm">
        Siraj <span className="sns-and">&amp;</span> Shireen
      </p>
      <p>Thank you for being a part of our story.</p>
      <p className="sns-dua">May Allah bless this union with love, mercy and barakah.</p>
      <p className="sns-ameen" lang="ar" dir="rtl">
        آمين
      </p>
      <Rule />
      <p className="sns-small">2 &amp; 4 December 2026 · Hyderabad</p>
      <a className="sns-credit" href="https://invite.dealwithmuhammad.com/?ref=invite" target="_blank" rel="noopener">
        Made with DWM Invite
      </a>
    </footer>
  );
}

/** Olive leaves drifting down, now and then, like the reference. */
function Leaves() {
  const leaves = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        "--x": `${(i * 11 + 4) % 96}%`,
        "--s": 0.7 + ((i * 37) % 10) / 16,
        "--d": `${13 + ((i * 7) % 9)}s`,
        "--delay": `${-((i * 5) % 17)}s`,
        "--sway": `${i % 2 ? 40 : -40}px`,
      })) as CSSProperties[],
    [],
  );
  return (
    <div className="sns-leaves" aria-hidden>
      {leaves.map((s, i) => (
        <i key={i} style={s} />
      ))}
    </div>
  );
}
