"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { FONT_VARS } from "@/invite/fonts";
import { Music } from "@/invite/runtime/music";

import "./invite.css";

// Custom invitation for Aathika & Dilshad's Nikah (Vellore, 20 November 2026), after
// the ivory sculpted-relief video the bride chose. A ribboned envelope opens on a Veo
// film (first frame closed.webp, last frame couple.webp); then full-screen scenes
// that write themselves in as you reach them: Bismillah and 78:8, "Qubool Hai", the
// invitation, the Nikah, and Ar-Rum 30:21 with regards. Details from her own invite
// (/aathika). Edit them below.

const SLUG = "aathika-and-dilshad";
const DIR = `/custom/${SLUG}`;

/** The Nikah, India time. */
const START = "2026-11-20T16:30:00+05:30";
const END = "2026-11-20T17:00:00+05:30";

const MASJID = {
  name: "Masjid-E-Azam",
  address: "Kaspa, Vellore",
  maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Masjid-E-Azam, Kaspa, Vellore")}`,
};

const HALL = {
  name: "Khanna Fiesta Banquet Hall",
  address: "Vellore",
  maps: "https://www.google.com/maps/place/Khanna+Fiesta,+A+Bergamont+Hotel+-+Vellore/@12.909297,79.1287891,17z/data=!4m9!3m8!1s0x3bad3890ebc7dde9:0xd2d8720815504e77!5m2!4m1!1i2!8m2!3d12.909297!4d79.131364!16s%2Fg%2F12hkwp02w",
};

const CONTACTS = [
  { name: "Abdul Shuckoor", phone: "9944650008" },
  { name: "Abdul Sathiq", phone: "9566916207" },
];

const BISMILLAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
const PAIRS = { ar: "وَخَلَقْنَاكُمْ أَزْوَاجًا", en: "And We created you in pairs", ref: "Qur'an 78:8" };
const RUM = {
  ar: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً",
  en: "And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy.",
  ref: "Surah Ar-Rum 30:21",
};

const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const CALENDAR = `https://calendar.google.com/calendar/render?${new URLSearchParams({
  action: "TEMPLATE",
  text: "Nikah · Aathika & Dilshad",
  dates: `${utc(START)}/${utc(END)}`,
  details: `Nikah at ${MASJID.name}, ${MASJID.address}\nVenue: ${HALL.name}, ${HALL.address}\n\nhttps://invite.dealwithmuhammad.com/${SLUG}`,
  location: `${MASJID.name}, ${MASJID.address}`,
  ctz: "Asia/Kolkata",
})}`;

type Phase = "closed" | "opening" | "open";

const SCENES = ["Bismillah", "Qubool Hai", "Invitation", "Nikah", "Regards"];

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Counted once per page load (React's dev double effect would count twice).
let counted = false;

export function Invite() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [playing, setPlaying] = useState(false);
  const [scene, setScene] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const music = useRef<Music | null>(null);
  const timer = useRef<number | null>(null);
  const main = useRef<HTMLElement>(null);

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
    document.documentElement.classList.toggle("ad-locked", phase === "closed");
    return () => document.documentElement.classList.remove("ad-locked");
  }, [phase]);

  // Each scene writes itself in the first time it's on screen; the dots follow along.
  useEffect(() => {
    if (phase !== "open" || !main.current) return;
    const scenes = [...main.current.querySelectorAll<HTMLElement>(".ad-scene")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          setScene(scenes.indexOf(e.target as HTMLElement));
        }
      },
      // a scene counts once it reaches the middle of the screen, however tall it is
      { rootMargin: "-45% 0px -45% 0px" },
    );
    scenes.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [phase]);

  const startMusic = useCallback(() => {
    music.current ??= new Music("harp");
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

  const goTo = (i: number) => main.current?.querySelectorAll(".ad-scene")[i]?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className={`ad ${FONT_VARS}`} data-phase={phase}>
      {phase !== "open" && (
        <div
          className="ad-cover"
          role="button"
          tabIndex={0}
          aria-label="Tap to open the invitation"
          onClick={open}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ad-art" src={`${DIR}/closed.webp`} alt="" />
          <video ref={video} className="ad-film" muted playsInline preload="auto" poster={`${DIR}/closed.webp`} onEnded={finish} aria-hidden>
            {/* MP4 first: some browsers claim VP9 WebM and then fail to decode it */}
            <source src={`${DIR}/open.mp4`} type="video/mp4" />
            <source src={`${DIR}/open.webm`} type="video/webm" />
          </video>
          <span className="ad-tap">Tap to open</span>
        </div>
      )}

      <main ref={main} className="ad-main" aria-hidden={phase === "closed" || undefined}>
        <Scene art="couple" className="is-first">
          <p className="ad-bism ad-write-rtl" lang="ar" dir="rtl">
            {BISMILLAH}
          </p>
          <p className="ad-small">In the name of Allah, the Most Beneficent, the Most Merciful</p>
          <span className="ad-orn" aria-hidden />
          <p className="ad-ar ad-write-rtl" lang="ar" dir="rtl">
            {PAIRS.ar}
          </p>
          <p className="ad-en">{PAIRS.en}</p>
          <p className="ad-ref">{PAIRS.ref}</p>
        </Scene>

        <Scene art="frame">
          <div className="ad-mono" aria-hidden>
            <span>A</span>
            <span>D</span>
          </div>
          <h1 className="ad-names ad-write">
            Aathika <span>&amp;</span> Dilshad
          </h1>
          <p className="ad-saying">are saying</p>
          <p className="ad-qubool ad-write-rtl" lang="ur" dir="rtl">
            قبول ہے
          </p>
          <p className="ad-ref">Qubool Hai</p>
        </Scene>

        <Scene art="frame">
          <p className="ad-bism-sm" lang="ar" dir="rtl">
            {BISMILLAH}
          </p>
          <p className="ad-caps">Mr &amp; Mrs Abdul Shuckoor Majeed</p>
          <p className="ad-body">request the pleasure of your gracious presence on the auspicious occasion of the Nikah of their beloved daughter</p>
          <p className="ad-person ad-write">Aathika Tharannum S</p>
          <p className="ad-with">with</p>
          <p className="ad-person ad-write">Dilshad Backer K</p>
          <p className="ad-body">son of Mr &amp; Mrs Abu Backer</p>
        </Scene>

        <Scene art="frame" className="is-details">
          <p className="ad-insha" lang="ar" dir="rtl">
            إِنْ شَاءَ اللَّهُ
          </p>
          <h2 className="ad-title ad-write">Nikah Ceremony</h2>
          <div className="ad-pair">
            <Detail icon="calendar">
              Friday
              <small>20th November 2026</small>
            </Detail>
            <Detail icon="clock">
              4:30 PM
              <small>Nikah</small>
            </Detail>
          </div>
          <div className="ad-pair">
            <Detail icon="pin">
              {MASJID.name}
              <small>{MASJID.address}</small>
              <a href={MASJID.maps} target="_blank" rel="noopener">
                Directions
              </a>
            </Detail>
            <Detail icon="hall">
              {HALL.name}
              <small>{HALL.address}</small>
              <a href={HALL.maps} target="_blank" rel="noopener">
                Directions
              </a>
            </Detail>
          </div>
          <Countdown />
          <a className="ad-btn" href={CALENDAR} target="_blank" rel="noopener">
            Add to calendar
          </a>
        </Scene>

        <Scene art="couple" className="is-last">
          <p className="ad-ar ad-rum ad-write-rtl" lang="ar" dir="rtl">
            {RUM.ar}
          </p>
          <p className="ad-en">{RUM.en}</p>
          <p className="ad-ref">{RUM.ref}</p>
        </Scene>

        <footer className="ad-foot">
          <p className="ad-caps">With warm regards</p>
          <p className="ad-family">BMS Family</p>
          <span className="ad-orn" aria-hidden />
          <p className="ad-small">For any queries</p>
          <div className="ad-calls">
            {CONTACTS.map((c) => (
              <a key={c.phone} href={`tel:+91${c.phone}`}>
                <span>{c.name}</span>
                <small>{c.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}</small>
              </a>
            ))}
          </div>
          <a className="ad-credit" href="https://invite.dealwithmuhammad.com/?ref=invite" target="_blank" rel="noopener">
            Made with DWM Invite
          </a>
        </footer>
      </main>

      {phase === "open" && (
        <>
          <nav className="ad-dots" aria-label="Scenes">
            {SCENES.map((s, i) => (
              <button key={s} type="button" className={scene === i ? "is-on" : ""} onClick={() => goTo(i)} aria-label={s} aria-current={scene === i || undefined} />
            ))}
          </nav>
          {scene === 0 && (
            <span className="ad-next" aria-hidden>
              Scroll
            </span>
          )}
          <button type="button" className={`ad-music${playing ? " is-on" : ""}`} onClick={toggleMusic} aria-label={playing ? "Pause music" : "Play music"} aria-pressed={playing}>
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

function Scene({ art, className = "", children }: { art: "couple" | "frame"; className?: string; children: ReactNode }) {
  return (
    <section className={`ad-scene is-${art} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ad-art" src={`${DIR}/${art}.webp`} alt="" loading={art === "couple" && className.includes("is-first") ? "eager" : "lazy"} />
      <div className="ad-text">{children}</div>
    </section>
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

function Detail({ icon, children }: { icon: keyof typeof ICONS; children: ReactNode }) {
  return (
    <div className="ad-detail">
      <svg viewBox="0 0 24 24" aria-hidden>
        {ICONS[icon]}
      </svg>
      <p>{children}</p>
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const target = Date.parse(START);
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);
  if (left === 0) return <p className="ad-today">Alhamdulillah, the day is here.</p>;
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
    <div className="ad-count" role="timer" aria-live="off">
      {parts.map(([n, l]) => (
        <span key={l}>
          {n}
          <small>{l}</small>
        </span>
      ))}
    </div>
  );
}
