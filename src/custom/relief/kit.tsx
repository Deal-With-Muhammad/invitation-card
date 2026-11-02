"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { FONT_VARS } from "@/invite/fonts";
import { Music } from "@/invite/runtime/music";
import type { MusicTrack } from "@/invite/types";

import "./relief.css";

// The ivory sculpted-relief design (first made for Aathika & Dilshad, after a video
// the bride chose). A ribboned envelope opens on a Veo film (closed.webp → couple.webp
// in public/custom/relief/), then full-screen scenes that write themselves in and
// move on by themselves like the video, until the guest touches the page. Each
// invitation passes its own scenes (<Scene>) and footer; the art is shared.

const ART = "/custom/relief";

/** How long each scene stays before the invitation moves on by itself. */
const FIRST_STEP_MS = 5500;
const STEP_MS = 6500;

export const BISMILLAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
export const PAIRS = { ar: "وَخَلَقْنَاكُمْ أَزْوَاجًا", en: "And We created you in pairs", ref: "Qur'an 78:8" };
export const RUM = {
  ar: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً",
  en: "And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy.",
  ref: "Surah Ar-Rum 30:21",
};
export const INSHALLAH = "إِنْ شَاءَ اللَّهُ";

export const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** A Google Calendar link for an event (times as ISO strings with their offset). */
export function calendarUrl({ title, start, end, details, location }: { title: string; start: string; end: string; details: string; location: string }) {
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${utc(start)}/${utc(end)}`,
    details,
    location,
    ctz: "Asia/Kolkata",
  })}`;
}

type Phase = "closed" | "opening" | "open";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Counted once per page load (React's dev double effect would count twice).
const counted = new Set<string>();

export function Relief({ slug, music: track, labels, children, footer }: { slug: string; music: MusicTrack; labels: string[]; children: ReactNode; footer: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [playing, setPlaying] = useState(false);
  const [scene, setScene] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const music = useRef<Music | null>(null);
  const timer = useRef<number | null>(null);
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    if (counted.has(slug)) return;
    counted.add(slug);
    fetch(`/api/invites/${slug}/view`, {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ref: document.referrer }),
    }).catch(() => {});
  }, [slug]);

  useEffect(() => {
    document.documentElement.classList.toggle("rl-locked", phase === "closed");
    return () => document.documentElement.classList.remove("rl-locked");
  }, [phase]);

  // Each scene writes itself in once it's well onto the screen; the dots follow the
  // scene nearest the middle. Checked on scroll (and once a second as a backstop)
  // rather than with an IntersectionObserver, which some in-app browsers delay.
  useEffect(() => {
    if (phase !== "open" || !main.current) return;
    const scenes = [...main.current.querySelectorAll<HTMLElement>(".rl-scene")];
    let raf = 0;
    const check = () => {
      raf = 0;
      const h = window.innerHeight;
      let best = 0;
      let bestDist = Infinity;
      scenes.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        if (r.top < h * 0.7 && r.bottom > h * 0.3) s.classList.add("is-in");
        const dist = Math.abs(r.top + r.height / 2 - h / 2);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setScene(best);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(check);
    };
    check();
    const backstop = window.setInterval(check, 1000);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearInterval(backstop);
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [phase]);

  // Like the video, the invitation moves on by itself, one scene every few
  // seconds, until the guest touches or scrolls the page themselves.
  useEffect(() => {
    if (phase !== "open" || reduced() || !main.current) return;
    const scenes = [...main.current.querySelectorAll<HTMLElement>(".rl-scene")];
    let i = 0;
    let t = 0;
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const stop = () => {
      window.clearTimeout(t);
      events.forEach((ev) => window.removeEventListener(ev, stop));
    };
    const next = () => {
      i += 1;
      if (i >= scenes.length) return stop();
      scenes[i].scrollIntoView({ behavior: "smooth" });
      t = window.setTimeout(next, STEP_MS);
    };
    t = window.setTimeout(next, FIRST_STEP_MS);
    events.forEach((ev) => window.addEventListener(ev, stop, { passive: true }));
    return stop;
  }, [phase]);

  const startMusic = useCallback(() => {
    music.current ??= new Music(track);
    void music.current.play(true);
    setPlaying(true);
  }, [track]);

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

  const finish = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setPhase("open");
  }, []);

  const open = () => {
    if (phase !== "closed") return;
    window.scrollTo({ top: 0, behavior: "instant" });
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

  const goTo = (i: number) => main.current?.querySelectorAll(".rl-scene")[i]?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className={`rl ${FONT_VARS}`} data-phase={phase}>
      {phase !== "open" && (
        <div
          className="rl-cover"
          role="button"
          tabIndex={0}
          aria-label="Tap to open the invitation"
          onClick={open}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rl-art" src={`${ART}/closed.webp`} alt="" />
          <video ref={video} className="rl-film" muted playsInline preload="auto" poster={`${ART}/closed.webp`} onEnded={finish} aria-hidden>
            {/* MP4 first: some browsers claim VP9 WebM and then fail to decode it */}
            <source src={`${ART}/open.mp4`} type="video/mp4" />
            <source src={`${ART}/open.webm`} type="video/webm" />
          </video>
          <span className="rl-tap">Tap to open</span>
        </div>
      )}

      <main ref={main} className="rl-main" aria-hidden={phase === "closed" || undefined}>
        {children}
        {footer}
      </main>

      {phase === "open" && (
        <>
          <nav className="rl-dots" aria-label="Scenes">
            {labels.map((s, i) => (
              <button key={s} type="button" className={scene === i ? "is-on" : ""} onClick={() => goTo(i)} aria-label={s} aria-current={scene === i || undefined} />
            ))}
          </nav>
          {scene === 0 && (
            <span className="rl-next" aria-hidden>
              Scroll
            </span>
          )}
          <button type="button" className={`rl-music${playing ? " is-on" : ""}`} onClick={toggleMusic} aria-label={playing ? "Pause music" : "Play music"} aria-pressed={playing}>
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

/** A full-screen scene over the frame (text in the middle) or the couple (text above them). */
export function Scene({ art, className = "", children }: { art: "couple" | "frame"; className?: string; children: ReactNode }) {
  return (
    <section className={`rl-scene is-${art} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="rl-art" src={`${ART}/${art}.webp`} alt="" loading={className.includes("is-first") ? "eager" : "lazy"} />
      <div className="rl-text">{children}</div>
    </section>
  );
}

/** The opening scene, as in the video: Bismillah and "And We created you in pairs". */
export function BismillahScene() {
  return (
    <Scene art="couple" className="is-first">
      <p className="rl-bism rl-write-rtl" lang="ar" dir="rtl">
        {BISMILLAH}
      </p>
      <p className="rl-small">In the name of Allah, the Most Beneficent, the Most Merciful</p>
      <span className="rl-orn" aria-hidden />
      <p className="rl-ar rl-write-rtl" lang="ar" dir="rtl">
        {PAIRS.ar}
      </p>
      <p className="rl-en">{PAIRS.en}</p>
      <p className="rl-ref">{PAIRS.ref}</p>
    </Scene>
  );
}

/** Monogram, names and "are saying Qubool Hai", with the date underneath. */
export function QuboolScene({ initials, first, second, when }: { initials: [string, string]; first: string; second: string; when: string }) {
  return (
    <Scene art="frame">
      <div className="rl-mono" aria-hidden>
        <span>{initials[0]}</span>
        <span>{initials[1]}</span>
      </div>
      <h1 className="rl-names rl-write">
        {first} <span>&amp;</span> {second}
      </h1>
      <p className="rl-saying">are saying</p>
      <p className="rl-qubool rl-write-rtl" lang="ur" dir="rtl">
        قبول ہے
      </p>
      <p className="rl-ref">Qubool Hai</p>
      <p className="rl-when">{when}</p>
    </Scene>
  );
}

/** Ar-Rum 30:21 above the couple, to close. */
export function RumScene() {
  return (
    <Scene art="couple" className="is-last">
      <p className="rl-ar rl-rum rl-write-rtl" lang="ar" dir="rtl">
        {RUM.ar}
      </p>
      <p className="rl-en">{RUM.en}</p>
      <p className="rl-ref">{RUM.ref}</p>
    </Scene>
  );
}

export function Credit() {
  return (
    <a className="rl-credit" href="https://invite.dealwithmuhammad.com/?ref=invite" target="_blank" rel="noopener">
      Made with DWM Invite
    </a>
  );
}

const ICONS: Record<string, ReactNode> = {
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14" rx="2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  hall: (
    <>
      <path d="M4 20h16M6 20V10M18 20V10M10 20v-6h4v6M3.5 10 12 4l8.5 6" />
    </>
  ),
};

export function Detail({ icon, children }: { icon: keyof typeof ICONS; children: ReactNode }) {
  return (
    <div className="rl-detail">
      <svg viewBox="0 0 24 24" aria-hidden>
        {ICONS[icon]}
      </svg>
      <p>{children}</p>
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ to }: { to: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const target = Date.parse(to);
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [to]);
  if (left === 0) return <p className="rl-today">Alhamdulillah, the day is here.</p>;
  const parts: [string, string][] =
    left == null
      ? [["–", "Days"], ["–", "Hrs"], ["–", "Min"], ["–", "Sec"]]
      : [
          [String(Math.floor(left / 86_400_000)), "Days"],
          [pad(Math.floor(left / 3_600_000) % 24), "Hrs"],
          [pad(Math.floor(left / 60_000) % 60), "Min"],
          [pad(Math.floor(left / 1000) % 60), "Sec"],
        ];
  return (
    <div className="rl-count" role="timer" aria-live="off">
      {parts.map(([n, l]) => (
        <span key={l}>
          {n}
          <small>{l}</small>
        </span>
      ))}
    </div>
  );
}
