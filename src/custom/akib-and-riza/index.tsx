"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";

import { FONT_VARS } from "@/invite/fonts";
import { Music } from "@/invite/runtime/music";

import { burst, ScratchCard } from "./scratch";

import "./invite.css";

// Custom invitation for Akib Shaikh & Riza Fatima (Nikah 14 Dec 2026, Jodhpur; Walima
// 30 Dec 2026, Ahmednagar). Blush rose garden after the client's reference reel: a
// blush embossed envelope with a wax seal opens on a filmed video (Veo, first frame
// closed.webp, last frame hero.webp): the flap lifts, a satin bow on a pair of garden
// gates unties and the gates open onto a rose arch over a lake, where the names
// appear. Then the Quran verse, a scratch-to-reveal date, the families, the events
// with pencil sketches of each venue, a countdown, the hashtag and a draped closing.
// Edit the details below. The "anr-" class prefix keeps clear of ad-blocker rules.

const SLUG = "akib-and-riza";
const DIR = `/custom/${SLUG}`;

/** An mp3 in public/custom/<slug>/ to play instead of the synthesised harp piece. */
const SONG: string | null = null;

/** Counts down to the Nikah (India time). Set the hour once the time is known. */
const COUNT_TO = "2026-12-14T00:00:00+05:30";

const HASHTAG = "#AkibWedsRiza";

const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

type Event = { name: string; note: string; day: string; date: string; time?: string; venue: string; city: string; maps: string; art: string };

const EVENTS: Event[] = [
  {
    name: "Nikah",
    note: "The marriage ceremony",
    day: "Monday",
    date: "14 December 2026",
    venue: "N.S Garden",
    city: "Jodhpur, Rajasthan",
    maps: maps("N.S Garden, Jodhpur, Rajasthan"),
    art: "nikah-venue",
  },
  {
    name: "Walima",
    note: "The wedding feast",
    day: "Wednesday",
    date: "30 December 2026",
    venue: "NR Lawn",
    city: "Ahmednagar, Maharashtra",
    maps: maps("NR Lawn, Ahmednagar, Maharashtra"),
    art: "walima-venue",
  },
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
  const root = useRef<HTMLDivElement>(null);
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
    document.documentElement.classList.toggle("anr-locked", phase !== "open");
    return () => document.documentElement.classList.remove("anr-locked");
  }, [phase]);

  useReveal(root, phase === "open");

  const startMusic = useCallback(() => {
    if (!music.current) {
      if (SONG) {
        const a = new Audio(`${DIR}/${SONG}`);
        a.loop = true;
        a.volume = 0.7;
        music.current = { play: () => a.play().then(() => {}), pause: () => a.pause(), dispose: () => a.pause() };
      } else {
        const m = new Music("harp");
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
    timer.current = window.setTimeout(finish, 11000);
  };

  // The names start to rise while the last, still second of the film plays.
  const onTime = () => {
    const v = video.current;
    if (v && v.duration && v.currentTime > v.duration - 0.45) finish();
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
    <div ref={root} className={`anr ${FONT_VARS}`} data-phase={phase}>
      {phase !== "open" && (
        <div
          className="anr-cover"
          role="button"
          tabIndex={0}
          aria-label="Tap to open the invitation"
          onClick={open}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="anr-cover-art" src={`${DIR}/closed.webp`} srcSet={`${DIR}/closed-720.webp 720w, ${DIR}/closed.webp 1080w`} sizes="(max-width: 480px) 100vw, 480px" alt="" />
          <video ref={video} className="anr-film" muted playsInline preload="auto" poster={`${DIR}/closed-720.webp`} onTimeUpdate={onTime} onEnded={finish} aria-hidden>
            {/* MP4 first: some browsers claim VP9 WebM and then fail to decode it */}
            <source src={`${DIR}/open.mp4`} type="video/mp4" />
            <source src={`${DIR}/open.webm`} type="video/webm" />
          </video>
          <span className="anr-seal" aria-hidden>
            A<i>&amp;</i>R
          </span>
          <p className="anr-cover-line" aria-hidden>
            Requests the pleasure
            <br />
            of your company
          </p>
          <span className="anr-tap">Tap the seal to open</span>
        </div>
      )}

      <main className="anr-main" aria-hidden={phase === "closed" || undefined}>
        <Hero />
        <Verse />
        <Reveal />
        <Families />
        <Events />
        <Countdown />
        <Hashtag />
        <Closing />
      </main>

      {phase === "open" && (
        <>
          <Petals />
          <button type="button" className={`anr-music${playing ? " is-on" : ""}`} onClick={toggleMusic} aria-label={playing ? "Pause music" : "Play music"} aria-pressed={playing}>
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

/** Adds .is-in to each .anr-rv as it scrolls into view. A scroll check backs up the
 *  observer (it has been slow to fire on some phones), and everything shows at once
 *  for reduced motion. */
function useReveal(root: RefObject<HTMLDivElement | null>, on: boolean) {
  useEffect(() => {
    const el = root.current;
    if (!el || !on) return;
    const items = () => [...el.querySelectorAll<HTMLElement>(".anr-rv:not(.is-in)")];
    if (reduced()) {
      items().forEach((n) => n.classList.add("is-in"));
      return;
    }
    const check = () => {
      const h = window.innerHeight;
      for (const n of items()) if (n.getBoundingClientRect().top < h * 0.92) n.classList.add("is-in");
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-in")), { threshold: 0.12 });
    items().forEach((n) => io.observe(n));
    window.addEventListener("scroll", check, { passive: true });
    const t = window.setInterval(check, 700);
    check();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", check);
      window.clearInterval(t);
    };
  }, [root, on]);
}

function Hero() {
  return (
    <section className="anr-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="anr-hero-art" src={`${DIR}/hero.webp`} srcSet={`${DIR}/hero-720.webp 720w, ${DIR}/hero.webp 1080w`} sizes="(max-width: 480px) 100vw, 480px" alt="" />
      <div className="anr-hero-text">
        <p className="anr-bism" lang="ar" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <Monogram />
        <h1 className="anr-names">
          <span>Akib</span>
          <span className="anr-amp">&amp;</span>
          <span>Riza</span>
        </h1>
        <p className="anr-caps">Together with their families request the pleasure of your company to celebrate their wedding</p>
        <Rule />
        <p className="anr-occasion">Nikah &amp; Walima</p>
        <p className="anr-caps anr-cities">Jodhpur · Ahmednagar</p>
      </div>
      <a className="anr-scroll" href="#verse" aria-label="Scroll to the invitation">
        <span>Scroll</span>
      </a>
    </section>
  );
}

function Monogram() {
  return (
    <span className="anr-mono" aria-hidden>
      <b>A</b>
      <b>R</b>
    </span>
  );
}

function Rule() {
  return (
    <span className="anr-rule" aria-hidden>
      <i />
    </span>
  );
}

function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="anr-head anr-rv">
      {sub && <p className="anr-caps">{sub}</p>}
      <h2>{title}</h2>
      <Rule />
    </header>
  );
}

function Verse() {
  return (
    <section className="anr-sec" id="verse">
      <figure className="anr-verse anr-rv">
        <p className="anr-ar" lang="ar" dir="rtl">
          {VERSE.ar}
        </p>
        <p className="anr-en">{VERSE.en}</p>
        <figcaption className="anr-caps">{VERSE.ref}</figcaption>
      </figure>
    </section>
  );
}

function Reveal() {
  return (
    <section className="anr-sec">
      <Heading title="Save the Date" sub="Scratch to reveal" />
      <div className="anr-rv">
        <ScratchCard onReveal={onRevealed}>
          <div className="anr-revealed">
            <p className="anr-caps">The Nikah</p>
            <div className="anr-datebox">
              <span>December</span>
              <strong>14</strong>
              <span>Monday</span>
            </div>
            <p className="anr-year">2026</p>
            <p className="anr-script">Jodhpur, Rajasthan</p>
          </div>
        </ScratchCard>
      </div>
    </section>
  );
}

function Families() {
  return (
    <section className="anr-sec">
      <Heading title="Our Families" sub="with the blessings of Allah" />
      <div className="anr-families anr-rv">
        <p>With joy in our hearts, we request the honour of your presence at the wedding of</p>
        <div className="anr-person">
          <strong>Akib Shaikh</strong>
          <span>son of</span>
          <em>Mr. Liyakat Shaikh &amp; Mrs. Yasmeen Bano</em>
        </div>
        <span className="anr-with" aria-hidden>
          &amp;
        </span>
        <div className="anr-person">
          <strong>Riza Fatima</strong>
          <span>daughter of</span>
          <em>Mr. Mohsin Ali &amp; Mrs. Nasreen Bano</em>
        </div>
        <p>Your presence and your duas will make our celebration complete.</p>
      </div>
    </section>
  );
}

function Events() {
  return (
    <section className="anr-sec" id="events">
      <Heading title="The Celebrations" sub="join us for" />
      {EVENTS.map((e) => (
        <article key={e.name} className="anr-event anr-rv">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="anr-sketch" src={`${DIR}/${e.art}.webp`} alt={`Sketch of ${e.venue}`} loading="lazy" decoding="async" />
          <p className="anr-caps">{e.note}</p>
          <h3>{e.name}</h3>
          <p className="anr-when">
            {e.day}, {e.date}
            {e.time && ` · ${e.time}`}
          </p>
          <p className="anr-venue">{e.venue}</p>
          <p className="anr-city">{e.city}</p>
          <a className="anr-link" href={e.maps} target="_blank" rel="noopener">
            View on map
          </a>
        </article>
      ))}
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
      : ([
          [Math.floor(left / 86_400_000), "Days"],
          [Math.floor(left / 3_600_000) % 24, "Hours"],
          [Math.floor(left / 60_000) % 60, "Minutes"],
          [Math.floor(left / 1000) % 60, "Seconds"],
        ] as const);
  return (
    <section className="anr-sec">
      <Heading title="Counting Down" sub="until the Nikah" />
      {left === 0 ? (
        <p className="anr-today anr-rv">Alhamdulillah, the day is here.</p>
      ) : (
        <div className="anr-count anr-rv" role="timer" aria-live="off">
          {(parts ?? (["Days", "Hours", "Minutes", "Seconds"] as const).map((l) => [null, l] as const)).map(([n, label]) => (
            <div key={label} className="anr-tile">
              <span>{n == null ? "–" : label === "Days" ? n : pad(n)}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Hashtag() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard
      ?.writeText(HASHTAG)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  };
  return (
    <section className="anr-sec">
      <div className="anr-tag anr-rv">
        <p className="anr-caps">Share your moments with us</p>
        <button type="button" className="anr-tag-btn" onClick={copy} aria-label={`Copy ${HASHTAG}`}>
          {HASHTAG}
        </button>
        <p className="anr-small" aria-live="polite">
          {copied ? "Copied" : "Tap to copy"}
        </p>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <footer className="anr-closing">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="anr-drapes" src={`${DIR}/drapes.webp`} alt="" loading="lazy" decoding="async" />
      <div className="anr-closing-text anr-rv">
        <p className="anr-caps">With love</p>
        <p className="anr-names-sm">
          Akib <span className="anr-amp">&amp;</span> Riza
        </p>
        <p>Thank you for being a part of our story.</p>
        <p className="anr-dua">May Allah bless this union with love, mercy and barakah.</p>
        <p className="anr-ameen" lang="ar" dir="rtl">
          آمين
        </p>
        <Rule />
        <p className="anr-small">Nikah 14 December · Walima 30 December 2026</p>
        <a className="anr-credit" href="https://invite.dealwithmuhammad.com/?ref=invite" target="_blank" rel="noopener">
          Made with DWM Invite
        </a>
      </div>
    </footer>
  );
}

/** Rose petals drifting down, now and then, like the reference. */
function Petals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        "--x": `${(i * 13 + 5) % 96}%`,
        "--s": 0.7 + ((i * 37) % 10) / 16,
        "--d": `${12 + ((i * 7) % 9)}s`,
        "--delay": `${-((i * 5) % 17)}s`,
        "--sway": `${i % 2 ? 46 : -46}px`,
      })) as CSSProperties[],
    [],
  );
  return (
    <div className="anr-petals" aria-hidden>
      {petals.map((s, i) => (
        <i key={i} style={s} />
      ))}
    </div>
  );
}
