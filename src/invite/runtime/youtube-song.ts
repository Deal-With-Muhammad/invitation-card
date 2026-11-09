import type { Song, SongPart } from "../songs";
import type { MusicTrack } from "../types";
import { Music } from "./music";

// Plays a YouTube video (or part of one) on repeat as an invitation's music, with
// the same controls as Music, optionally after a short intro: the intro plays on
// the tap that opens the card, the song once the card is open. The players sit
// out of sight and load (silently buffering) with the page, so sound starts the
// moment the guest taps. If YouTube won't play the song, the design's own
// synthesised music takes over.

type Player = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  getCurrentTime(): number;
  destroy(): void;
};

type YouTube = {
  Player: new (
    el: HTMLElement,
    opts: {
      host: string;
      width: number;
      height: number;
      videoId: string;
      playerVars: Record<string, number>;
      events: {
        onReady: () => void;
        onError: () => void;
        onStateChange: (e: { data: number }) => void;
      };
    },
  ) => Player;
};

declare global {
  interface Window {
    YT?: YouTube;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API = "https://www.youtube.com/iframe_api";
const FADE = 1; // seconds faded out before a cut-off part repeats
const ENDED = 0;
const PLAYING = 1;

let api: Promise<YouTube> | null = null;

function loadApi() {
  api ??= new Promise<YouTube>((resolve, reject) => {
    if (window.YT?.Player) return resolve(window.YT);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT!);
    const script = document.createElement("script");
    script.src = API;
    script.onerror = () => {
      api = null;
      reject(new Error("YouTube didn't load"));
    };
    document.head.appendChild(script);
  });
  return api;
}

/** One hidden player for one part of a video. */
class Clip {
  player: Player | null = null;
  failed = false;
  /** Started muted inside the opening tap and paused, so it may play later on phones. */
  private priming = false;
  private playing = false;
  private box: HTMLDivElement | null = null;
  private watch: number | null = null;
  private volume = 100;

  constructor(
    private part: SongPart,
    private events: { ready: () => void; end: () => void; fail: () => void },
    private loop: boolean,
  ) {}

  create(yt: YouTube) {
    const box = document.createElement("div");
    box.setAttribute("aria-hidden", "true");
    box.style.cssText = "position:fixed;left:0;bottom:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
    const target = box.appendChild(document.createElement("div"));
    document.body.appendChild(box);
    this.box = box;
    const player = new yt.Player(target, {
      host: "https://www.youtube-nocookie.com",
      width: 200,
      height: 200,
      videoId: this.part.video,
      playerVars: { start: this.part.start ?? 0, controls: 0, disablekb: 1, fs: 0, playsinline: 1, rel: 0, iv_load_policy: 3 },
      events: {
        onReady: () => {
          this.player = player;
          // Buffer it now (muted autoplay is allowed), so playing it later is instant.
          if (!this.playing) this.prime();
          this.events.ready();
        },
        onError: () => this.fail(),
        onStateChange: (e) => {
          if (e.data === PLAYING && this.priming) {
            this.priming = false;
            player.pauseVideo();
            player.seekTo(this.part.start ?? 0, true);
            player.unMute();
          } else if (e.data === ENDED) this.ended();
        },
      },
    });
  }

  play() {
    const p = this.player;
    if (!p || this.failed) return;
    this.playing = true;
    if (this.priming) {
      this.priming = false;
      p.unMute();
    }
    p.playVideo();
    this.startWatching();
  }

  /** Buffers it, and lets a phone play it later without another tap: starts it silently, then pauses. */
  prime() {
    if (!this.player || this.failed || this.playing) return;
    this.priming = true;
    this.player.mute();
    this.player.playVideo();
  }

  pause() {
    this.playing = false;
    this.priming = false;
    this.stopWatching();
    this.player?.pauseVideo();
  }

  dispose() {
    this.stopWatching();
    this.player?.destroy();
    this.player = null;
    this.box?.remove();
    this.box = null;
  }

  private ended() {
    const p = this.player;
    if (!p) return;
    if (!this.loop) {
      this.playing = false;
      this.stopWatching();
      this.events.end();
      return;
    }
    p.seekTo(this.part.start ?? 0, true);
    this.setVolume(100);
    p.playVideo();
  }

  /** A part that stops before the video ends: fade its end and treat it as the end. */
  private startWatching() {
    const { end } = this.part;
    if (end === undefined || this.watch !== null) return;
    this.watch = window.setInterval(() => {
      const p = this.player;
      if (!p) return;
      const left = end - p.getCurrentTime();
      if (left <= 0) this.ended();
      else if (this.loop) this.setVolume(left < FADE ? Math.round((left / FADE) * 100) : 100);
    }, 100);
  }

  private setVolume(volume: number) {
    if (volume === this.volume) return;
    this.volume = volume;
    this.player?.setVolume(volume);
  }

  private stopWatching() {
    if (this.watch !== null) clearInterval(this.watch);
    this.watch = null;
  }

  private fail() {
    if (this.failed) return;
    this.failed = true;
    this.stopWatching();
    this.player = null;
    this.events.fail();
  }
}

export class YouTubeSong {
  playing = false;
  private main: Clip;
  private intro: Clip | null = null;
  /** The card is open (or the intro can't play), so the song is what plays now. */
  private introDone: boolean;
  private synth: Music | null = null;
  private disposed = false;

  constructor(
    song: Song,
    private track: MusicTrack,
  ) {
    this.main = new Clip(song, { ready: () => this.resume(), end: () => {}, fail: () => this.resume() }, true);
    if (song.intro) this.intro = new Clip(song.intro, { ready: () => {}, end: () => {}, fail: () => this.opened() }, false);
    this.introDone = !this.intro;
    loadApi().then(
      (yt) => {
        if (this.disposed) return;
        this.main.create(yt);
        this.intro?.create(yt);
      },
      () => {
        this.main.failed = true;
        this.introDone = true;
        this.resume();
      },
    );
  }

  setTrack(track: MusicTrack) {
    this.track = track;
    this.synth?.setTrack(track);
  }

  /** Must be called from a user gesture the first time. */
  async play(withChime = false) {
    this.playing = true;
    if (!this.introDone) {
      // The song waits for the card to open; an intro that isn't ready by the tap is skipped.
      if (this.intro?.player) this.intro.play();
      this.main.prime();
      return;
    }
    if (this.main.failed) return (this.synth ??= new Music(this.track)).play(withChime && !this.intro);
    this.main.play(); // a player that isn't ready yet starts once it is (resume)
  }

  /** The card is open: the intro stops and the song starts. */
  opened() {
    if (this.introDone) return;
    this.introDone = true;
    this.intro?.pause();
    this.resume();
  }

  pause() {
    this.playing = false;
    this.intro?.pause();
    this.main.pause();
    this.synth?.pause();
  }

  dispose() {
    this.disposed = true;
    this.playing = false;
    this.intro?.dispose();
    this.main.dispose();
    this.synth?.dispose();
    this.synth = null;
  }

  /** Something became ready, ended or failed: carry on playing, if we are. */
  private resume() {
    if (this.disposed || !this.playing) return;
    void this.play();
  }
}
