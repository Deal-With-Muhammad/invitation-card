import type { Song } from "../songs";
import type { MusicTrack } from "../types";
import { Music } from "./music";

// Plays part of a YouTube video on repeat as an invitation's music, with the same
// controls as Music. The player sits out of sight and loads with the page, because
// phones only start playback if the tap on the card can reach a player that's ready.
// If YouTube won't play it, the design's own synthesised music takes over.

type Player = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
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
      events: { onReady: () => void; onError: () => void };
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
const FADE = 1; // seconds faded out before the part repeats

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

export class YouTubeSong {
  playing = false;
  private player: Player | null = null;
  private box: HTMLDivElement | null = null;
  private synth: Music | null = null;
  private failed = false;
  private disposed = false;
  private watch: number | null = null;
  private volume = 100;

  constructor(
    private song: Song,
    private track: MusicTrack,
  ) {
    loadApi().then(
      (yt) => this.create(yt),
      () => this.fail(),
    );
  }

  setTrack(track: MusicTrack) {
    this.track = track;
    this.synth?.setTrack(track);
  }

  async play(withChime = false) {
    this.playing = true;
    if (this.failed) return (this.synth ??= new Music(this.track)).play(withChime);
    if (!this.player) return; // starts as soon as the player is ready
    this.player.playVideo();
    this.startWatching();
  }

  pause() {
    this.playing = false;
    this.stopWatching();
    this.player?.pauseVideo();
    this.synth?.pause();
  }

  dispose() {
    this.disposed = true;
    this.playing = false;
    this.stopWatching();
    this.player?.destroy();
    this.player = null;
    this.box?.remove();
    this.box = null;
    this.synth?.dispose();
    this.synth = null;
  }

  private create(yt: YouTube) {
    if (this.disposed) return;
    const box = document.createElement("div");
    box.setAttribute("aria-hidden", "true");
    box.style.cssText = "position:fixed;left:0;bottom:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
    const target = box.appendChild(document.createElement("div"));
    document.body.appendChild(box);
    this.box = box;
    const { video, start } = this.song;
    const player = new yt.Player(target, {
      host: "https://www.youtube-nocookie.com",
      width: 200,
      height: 200,
      videoId: video,
      playerVars: { start, controls: 0, disablekb: 1, fs: 0, playsinline: 1, rel: 0, iv_load_policy: 3 },
      events: {
        onReady: () => {
          if (this.disposed) return;
          this.player = player;
          if (this.playing) void this.play();
        },
        onError: () => this.fail(),
      },
    });
  }

  /** Fades the end of the part and jumps back to its start. */
  private startWatching() {
    if (this.watch !== null) return;
    const { start, end } = this.song;
    this.watch = window.setInterval(() => {
      const p = this.player;
      if (!p) return;
      const left = end - p.getCurrentTime();
      if (left <= 0) {
        p.seekTo(start, true);
        this.setVolume(100);
      } else this.setVolume(left < FADE ? Math.round((left / FADE) * 100) : 100);
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
    if (this.disposed || this.failed) return;
    this.failed = true;
    this.stopWatching();
    this.player = null;
    if (this.playing) void this.play();
  }
}
