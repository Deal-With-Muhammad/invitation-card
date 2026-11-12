"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FONT_VARS } from "../fonts";
import { copyFor } from "../i18n";
import { rootStyle } from "../look";
import { resolve } from "../resolve";
import { getTemplate } from "../templates";
import type { Song } from "../songs";
import type { Phase } from "../templates/types";
import type { InviteData, Lang } from "../types";
import { useAutoScroll } from "./auto-scroll";
import { Music } from "./music";
import { watchReveals } from "./reveal";
import { Body } from "./sections";
import { SimpleCover } from "./simple-cover";
import { YouTubeSong } from "./youtube-song";

import "./base.css";

type Props = {
  data: InviteData;
  /** "live": a real page (guest link, demo, editor preview frame). */
  mode?: "live";
  /** Increment to play the opening again (editor "Replay"). */
  replay?: number;
  /** Shown at the bottom. Off in the editor preview. */
  credit?: boolean;
  /** "section:nonce" — scroll to that section, skipping the cover (editor jumps to what you're editing). */
  focus?: string | null;
  /** A real song to play instead of the synthesised music. */
  song?: Song;
};

const SITE = "https://invite.dealwithmuhammad.com";

export function Invitation({ data, replay = 0, credit = true, focus = null, song }: Props) {
  const tpl = getTemplate(data.template);
  const [lang, setLang] = useState<Lang>(data.lang);
  // The host changed the main language in the editor: show it.
  const [mainLang, setMainLang] = useState(data.lang);
  if (mainLang !== data.lang) {
    setMainLang(data.lang);
    setLang(data.lang);
  }
  const guestLang = data.langs.includes(lang) ? lang : data.lang;
  const r = useMemo(() => resolve(data, guestLang), [data, guestLang]);
  const [phase, setPhase] = useState<Phase>(data.look.opening ? "closed" : "open");
  const [playingState, setPlaying] = useState(false);
  // A song the host asked for plays even if the music setting is off.
  const musicOn = data.music.on || Boolean(song);
  const playing = playingState && musicOn;
  const music = useRef<Music | YouTubeSong | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  // Editor: replay the cover, or skip it when the host turns the opening off.
  const resetKey = `${replay}:${data.look.opening}`;
  const [lastReset, setLastReset] = useState(resetKey);
  if (resetKey !== lastReset) {
    setLastReset(resetKey);
    setPhase(data.look.opening ? "closed" : "open");
  }
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    window.scrollTo({ top: 0 });
  }, [resetKey]);

  // Editor: jumping to a section skips the cover.
  const [lastFocus, setLastFocus] = useState(focus);
  if (focus !== lastFocus) {
    setLastFocus(focus);
    if (focus && phase === "closed") setPhase("open");
  }

  // Only the closed card ("tap to open") holds the page still. During the opening
  // the page scrolls, and scrolling skips the rest of the opening (see below).
  useEffect(() => {
    document.documentElement.classList.toggle("inv-locked", phase === "closed");
    return () => document.documentElement.classList.remove("inv-locked");
  }, [phase]);

  // Music follows the host's settings live in the editor.
  useEffect(() => {
    if (!musicOn) {
      music.current?.dispose();
      music.current = null;
    } else music.current?.setTrack(data.music.track);
  }, [musicOn, data.music.track]);

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

  // A song's player loads with the page, so it's ready for the tap that opens the card.
  useEffect(() => {
    if (!song || !musicOn) return;
    const s = new YouTubeSong(song, data.music.track);
    music.current = s;
    return () => {
      s.dispose();
      if (music.current === s) music.current = null;
    };
  }, [song, musicOn, data.music.track]);

  // A song with an intro moves on to the song itself once the card is open.
  useEffect(() => {
    if (phase === "open" && music.current instanceof YouTubeSong) music.current.opened();
  }, [phase, song, musicOn]);

  const startMusic = useCallback(
    (chime = false) => {
      if (!musicOn) return;
      music.current ??= new Music(data.music.track);
      void music.current.play(chime);
      setPlaying(true);
    },
    [musicOn, data.music.track],
  );

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("open");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (root.current && !reduce) tpl.celebrate?.(root.current);
  }, [tpl]);

  const open = useCallback(() => {
    if (phase !== "closed") return;
    startMusic(true);
    setPhase("opening");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timers.current.push(window.setTimeout(finish, reduce ? 300 : tpl.meta.openMs));
  }, [phase, startMusic, tpl, finish]);

  // A guest who scrolls while the opening plays (or its film loads) skips straight
  // to the invitation and keeps scrolling. Touch scrolling shows up as "scroll";
  // a wheel or the keyboard counts even at the top of the page.
  useEffect(() => {
    if (phase !== "opening") return;
    const keys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "End", "Home", " "]);
    const onKey = (e: KeyboardEvent) => keys.has(e.key) && finish();
    window.addEventListener("scroll", finish, { passive: true });
    window.addEventListener("wheel", finish, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", finish);
      window.removeEventListener("wheel", finish);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, finish]);

  const toggleMusic = () => {
    if (playing) {
      music.current?.pause();
      setPlaying(false);
    } else startMusic();
  };

  const scroll = useAutoScroll(phase === "open" && data.autoScroll.on, data.autoScroll.speed);

  // Pieces ease in as they scroll into view, also where CSS can't follow the scroll itself.
  useEffect(() => {
    if (phase !== "open" || !root.current) return;
    return watchReveals(root.current);
  }, [phase]);

  useEffect(() => {
    if (!focus || phase !== "open") return;
    const id = focus.split(":")[0];
    const el = document.querySelector(`[data-sec="${id}"]`);
    if (id === "hero") window.scrollTo({ top: 0, behavior: "smooth" });
    else el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focus, phase]);

  const Cover = tpl.Cover ?? SimpleCover;
  const { Hero, Backdrop } = tpl;
  const style = rootStyle(tpl.meta, data.look, guestLang);
  const copy = copyFor(guestLang);

  return (
    <div
      ref={root}
      className={`inv t-${tpl.meta.id} ${tpl.rootClass ?? ""} ${FONT_VARS}`}
      data-phase={phase}
      data-occasion={data.occasion}
      lang={guestLang}
      dir={r.dir}
      style={style}
    >
      {Backdrop && (
        <div className="inv-backdrop" aria-hidden>
          <Backdrop r={r} />
        </div>
      )}

      {phase !== "open" && (
        <div className="inv-cover">
          <Cover r={r} phase={phase} onOpen={open} />
        </div>
      )}

      <main className="inv-main" aria-hidden={phase === "closed" || undefined}>
        <section className="inv-hero" data-sec="hero">
          <Hero r={r} phase={phase} />
        </section>
        <Body
          r={r}
          parts={tpl}
          credit={
            credit && (
              <p className="inv-credit">
                <a href={`${SITE}/?ref=invite`} target="_blank" rel="noopener">
                  {copy.ui.madeWith}
                </a>
              </p>
            )
          }
        />
      </main>

      {phase === "open" && (
        <div className="inv-controls">
          {data.langs.length > 1 && <LangSwitch langs={data.langs} lang={guestLang} onChange={setLang} label={r.t.language} />}
          {data.autoScroll.on && (
            <button
              type="button"
              className={`inv-ctl${scroll.running ? " is-on" : ""}`}
              onClick={scroll.toggle}
              aria-label={scroll.running ? r.t.autoScrollOff : r.t.autoScrollOn}
              title={scroll.running ? r.t.autoScrollOff : r.t.autoScrollOn}
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                {scroll.running ? <path d="M9 6v12M15 6v12" /> : <path d="M12 5v14M6 13l6 6 6-6" />}
              </svg>
            </button>
          )}
          {musicOn && (
            <button
              type="button"
              className={`inv-ctl inv-ctl-music${playing ? " is-on" : ""}`}
              onClick={toggleMusic}
              aria-label={playing ? r.t.pauseMusic : r.t.playMusic}
              aria-pressed={playing}
            >
              <span className="inv-bars" aria-hidden>
                <i />
                <i />
                <i />
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function LangSwitch({ langs, lang, onChange, label }: { langs: Lang[]; lang: Lang; onChange: (l: Lang) => void; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="inv-lang">
      <button type="button" className="inv-ctl" aria-label={label} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5s1.2-6.2 3.6-8.5Z" />
        </svg>
      </button>
      {open && (
        <ul className="inv-lang-menu" role="listbox" aria-label={label}>
          {langs.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === lang}
                lang={l}
                onClick={() => {
                  onChange(l);
                  setOpen(false);
                }}
              >
                {copyFor(l).meta.native}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
