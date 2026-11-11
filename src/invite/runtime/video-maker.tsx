"use client";

import { useEffect, useRef, useState } from "react";

import type { Lang } from "../types";
import type { MusicTrack } from "../types";
import { Synth } from "./music";

import "./video-maker.css";

type Words = {
  kicker: string;
  title: string;
  sub: (s: number) => string;
  make: string;
  making: (p: number) => string;
  download: string;
  share: string;
  unsupported: string;
  failed: string;
  await: string;
  details: string;
  soon: string;
};

const WORDS: Record<"en" | "ur" | "hi", Words> = {
  en: {
    kicker: "For WhatsApp & Instagram",
    title: "Save as a video",
    sub: (s) => `One video with every function, the music and the family's numbers, for anyone who finds links hard to open. It takes about ${s} seconds to make; please keep this screen open.`,
    make: "Make the video",
    making: (p) => `Making your video… ${p}%`,
    download: "Download video",
    share: "Share",
    unsupported: "This browser can't make videos. Please open the invitation in Chrome or Safari.",
    failed: "The video couldn't be made.",
    await: "We await your presence",
    details: "FOR DETAILS",
    soon: "Date to be shared soon",
  },
  ur: {
    kicker: "واٹس ایپ اور انسٹاگرام کے لیے",
    title: "ویڈیو بنائیں",
    sub: (s) => `تمام تقریبات، موسیقی اور گھر والوں کے نمبروں کے ساتھ ایک ویڈیو، اُن کے لیے جنہیں لنک کھولنا مشکل لگتا ہے۔ بننے میں تقریباً ${s} سیکنڈ لگیں گے؛ براہِ کرم یہ صفحہ کھلا رکھیں۔`,
    make: "ویڈیو بنائیں",
    making: (p) => `ویڈیو بن رہی ہے… ${p}%`,
    download: "ویڈیو ڈاؤن لوڈ کریں",
    share: "شیئر کریں",
    unsupported: "یہ براؤزر ویڈیو نہیں بنا سکتا۔ براہِ کرم کروم یا سفاری میں کھولیں۔",
    failed: "ویڈیو نہیں بن سکی۔",
    await: "آپ کی آمد کے منتظر",
    details: "مزید معلومات کے لیے",
    soon: "تاریخ جلد بتائی جائے گی",
  },
  hi: {
    kicker: "व्हाट्सऐप और इंस्टाग्राम के लिए",
    title: "वीडियो बनाएँ",
    sub: (s) => `सभी कार्यक्रमों, संगीत और परिवार के नंबरों के साथ एक वीडियो, उनके लिए जिन्हें लिंक खोलना मुश्किल लगता है। बनने में लगभग ${s} सेकंड लगेंगे; कृपया यह पेज खुला रखें।`,
    make: "वीडियो बनाएँ",
    making: (p) => `वीडियो बन रहा है… ${p}%`,
    download: "वीडियो डाउनलोड करें",
    share: "शेयर करें",
    unsupported: "यह ब्राउज़र वीडियो नहीं बना सकता। कृपया क्रोम या सफ़ारी में खोलें।",
    failed: "वीडियो नहीं बन सका।",
    await: "आपके आगमन की प्रतीक्षा में",
    details: "जानकारी के लिए",
    soon: "तारीख़ जल्द बताई जाएगी",
  },
};

const wordsFor = (lang: Lang) => (lang === "ur" ? WORDS.ur : lang === "hi" ? WORDS.hi : WORDS.en);

/** Text colours and the wash behind the title and closing, by tone. */
const TONES = {
  light: { wash: "253,249,242", kicker: "#7b5b33", name: "#3f2a1e", body: "#5b4130", soft: "#6b4c2c", label: "#8a6a3e" },
  dark: { wash: "34,6,8", kicker: "#e7bf6a", name: "#f6dfa6", body: "#f1d8a8", soft: "#e9c98a", label: "#d6a54f" },
};

// "Save as video" on premium designs: the whole invitation as one MP4 for WhatsApp,
// Instagram and Facebook, for guests who can't open links easily. It is made on the
// phone itself: the opening film, the names, then every function one by one (each on
// its own art, with a soft circular reveal between them) and a closing card with the
// family's numbers, drawn onto a canvas and recorded with the music. Recording runs in
// real time (about half a minute), so the screen has to stay open.

export type VideoSpec = {
  names: string;
  title: string;
  line: string;
  when: string;
  film: string;
  hero: string;
  closed: string;
  track: MusicTrack;
  /** The language the words are in (labels and right-to-left text follow it). */
  lang: Lang;
  /** light: dark text on a pale wash (Shagun); dark: light text on a dark wash (Yaadein). */
  tone: "light" | "dark";
  /** Where the names card and the closing card start (px of 1280), to clear busy art at the top. */
  titleTop?: number;
  closingTop?: number;
  chapters: {
    art: string;
    /** A small line above the title (the function's name in Urdu, on Shagun). */
    urdu: string;
    /** Light text on a dark part of the art. */
    dark?: boolean;
    /** How wide the text may run (px of 720). */
    wide?: number;
    /** Where the text starts, as a share of the height. */
    top?: number;
    ink: string;
    accent: string;
    titleFont: string;
    title: string;
    weekday: string;
    date: string;
    time: string;
    venue: string;
    address: string;
  }[];
  contacts: { name: string; phone: string }[];
  hosts: string[];
};

const W = 720;
const H = 1280;
const FPS = 30;
const TITLE_S = 4.2;
const CHAPTER_S = 5.2;
const WIPE_S = 0.9;
const CLOSING_S = 5;

type Made = { url: string; name: string; type: string; file: File };

// H.264 first: WhatsApp and older phones play it everywhere (Chrome on Android and
// Safari can make it; Chrome without H.264 falls back to VP9 in MP4 or WebM).
const MIMES = [
  ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "mp4"],
  ["video/mp4;codecs=avc1.4D401F,mp4a.40.2", "mp4"],
  ["video/mp4;codecs=avc1,mp4a", "mp4"],
  ["video/mp4;codecs=avc1.42E01E,opus", "mp4"],
  ["video/mp4;codecs=avc1", "mp4"],
  ["video/mp4", "mp4"],
  ["video/webm;codecs=vp9,opus", "webm"],
  ["video/webm;codecs=vp8,opus", "webm"],
  ["video/webm", "webm"],
] as const;

const pickMime = () => MIMES.find(([m]) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) ?? null;

export const canMakeVideo = () =>
  typeof window !== "undefined" && typeof MediaRecorder !== "undefined" && "captureStream" in HTMLCanvasElement.prototype && pickMime() !== null;

const img = (src: string) =>
  new Promise<HTMLImageElement>((ok, fail) => {
    const i = new Image();
    i.decoding = "async";
    i.onload = () => ok(i);
    i.onerror = () => fail(new Error(`Couldn't load ${src}`));
    i.src = src;
  });

const film = (src: string) =>
  new Promise<HTMLVideoElement>((ok, fail) => {
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.oncanplaythrough = () => ok(v);
    v.onerror = () => fail(new Error("Couldn't load the opening film"));
    v.src = src;
    v.load();
  });

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
const clamp = (x: number) => Math.min(1, Math.max(0, x));

/** Draws an image or video frame to cover the canvas, zoomed by `z` around the centre. */
function cover(ctx: CanvasRenderingContext2D, src: CanvasImageSource, sw: number, sh: number, z = 1) {
  const s = Math.max(W / sw, H / sh) * z;
  const w = sw * s;
  const h = sh * s;
  ctx.drawImage(src, (W - w) / 2, (H - h) / 2, w, h);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

type Fonts = Record<string, string>;

function fontsOf(el: Element): Fonts {
  const cs = getComputedStyle(el);
  const get = (k: string, fb: string) => cs.getPropertyValue(`--f-${k}`).trim() || fb;
  return {
    script: get("pinyon", "cursive"),
    serif: get("cormorant", "Georgia, serif"),
    nastaliq: get("nastaliq", "serif"),
    devanagari: get("devanagari", "serif"),
    rozha: get("rozha", "Georgia, serif"),
    yeseva: get("yeseva", "Georgia, serif"),
    shrikhand: get("shrikhand", "Georgia, serif"),
    cinzel: get("cinzel", "Georgia, serif"),
    italiana: get("italiana", "Georgia, serif"),
  };
}

/** Text with a fade and a small rise, centred. Returns the y below it. */
function line(ctx: CanvasRenderingContext2D, text: string, y: number, font: string, color: string, a: number, opts: { max?: number; lh?: number; shadow?: string } = {}) {
  if (!text) return y;
  ctx.save();
  ctx.direction = dirNow;
  ctx.globalAlpha = a;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  if (opts.shadow) {
    ctx.shadowColor = opts.shadow;
    ctx.shadowBlur = 18;
  }
  // Nastaliq is tall: right-to-left lines get more room unless a height is given.
  const lh = opts.lh ?? parseInt(font.match(/(\d+)px/)?.[1] ?? "30", 10) * (dirNow === "rtl" ? 1.7 : 1.22);
  const lines = opts.max ? wrap(ctx, text, opts.max) : [text];
  const rise = (1 - a) * 14;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, y + rise + i * lh));
  ctx.restore();
  return y + lines.length * lh;
}

/** Writing direction for the text being drawn (set per video). */
let dirNow: CanvasDirection = "ltr";

async function make(spec: VideoSpec, root: Element, onProgress: (p: number) => void): Promise<Made> {
  const w = wordsFor(spec.lang);
  const mime = pickMime();
  if (!mime) throw new Error(w.unsupported);
  dirNow = spec.lang === "ur" || spec.lang === "ar" || spec.lang === "fa" ? "rtl" : "ltr";
  const tone = TONES[spec.tone];
  const raw = fontsOf(root);
  // Every face falls back to the script faces, so Urdu and Hindi words draw in Nastaliq and Devanagari.
  const tail = `${raw.nastaliq}, ${raw.devanagari}`;
  const f: Fonts = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, `${v}, ${tail}`]));
  await Promise.all(Object.values(f).map((fam) => document.fonts?.load(`40px ${fam}`).catch(() => null)));
  const [hero, closed, clip, ...arts] = await Promise.all([img(spec.hero), img(spec.closed), film(spec.film), ...spec.chapters.map((c) => img(c.art))]);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const synth = new Synth(spec.track);
  const stream = canvas.captureStream(FPS);
  synth.stream(2.6).getAudioTracks().forEach((t) => stream.addTrack(t));
  const rec = new MediaRecorder(stream, { mimeType: mime[0], videoBitsPerSecond: 5_000_000 });
  const parts: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
  const done = new Promise<void>((ok) => (rec.onstop = () => ok()));

  const filmS = Number.isFinite(clip.duration) && clip.duration > 0 ? clip.duration : 6.3;
  const n = spec.chapters.length;
  const t1 = filmS;
  const t2 = t1 + TITLE_S;
  const t3 = t2 + n * CHAPTER_S;
  const total = t3 + CLOSING_S;

  const drawTitle = (t: number) => {
    cover(ctx, hero, hero.width, hero.height, 1 + 0.03 * (t / TITLE_S));
    if (spec.titleTop == null) {
      const g = ctx.createLinearGradient(0, 0, 0, H * 0.42);
      g.addColorStop(0, `rgba(${tone.wash},0.82)`);
      g.addColorStop(1, `rgba(${tone.wash},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H * 0.42);
    } else {
      // a band of wash behind text set lower down
      const a0 = Math.max(0, spec.titleTop - 140);
      const g = ctx.createLinearGradient(0, a0, 0, a0 + 560);
      g.addColorStop(0, `rgba(${tone.wash},0)`);
      g.addColorStop(0.3, `rgba(${tone.wash},0.7)`);
      g.addColorStop(0.7, `rgba(${tone.wash},0.7)`);
      g.addColorStop(1, `rgba(${tone.wash},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, a0, W, 560);
    }
    let y = spec.titleTop ?? 92;
    y = line(ctx, spec.title.toUpperCase(), y, `600 22px ${f.serif}`, tone.kicker, ease(t / 0.8), { lh: 34 });
    y = line(ctx, spec.names, y + 8, `400 ${spec.tone === "dark" ? "84px " + f.rozha : "96px " + f.script}`, tone.name, ease((t - 0.3) / 0.9), { max: 660, lh: 108 });
    line(ctx, spec.when, y + 10, `600 36px ${f.serif}`, tone.body, ease((t - 0.8) / 0.9));
  };

  const drawChapter = (i: number, t: number) => {
    const c = spec.chapters[i];
    const a = arts[i];
    cover(ctx, a, a.width, a.height, 1.02 + 0.05 * (t / CHAPTER_S));
    const dark = c.dark === true;
    const shade = dark ? "rgba(40,0,0,0.55)" : "rgba(255,250,240,0.9)";
    const top = H * (c.top ?? 0.25);
    // Baraat's text sits inside the arch, between the curtains.
    const wide = c.wide ?? 580;
    let y = top;
    y = line(ctx, c.urdu, y, `400 66px ${f.nastaliq}`, c.accent, ease((t - 0.35) / 0.8), { shadow: shade, lh: 108 });
    y = line(ctx, c.title, y, `400 ${c.titleFont === "cinzel" ? 74 : 86}px ${f[c.titleFont] ?? f.serif}`, c.ink, ease((t - 0.55) / 0.8), { max: wide, shadow: shade, lh: 98 });
    y += 16;
    if (c.date) {
      y = line(ctx, `${c.weekday} · ${c.date}`, y, `600 37px ${f.serif}`, c.ink, ease((t - 0.9) / 0.8), { shadow: shade, max: wide });
      y = line(ctx, c.time, y + 4, `600 34px ${f.serif}`, c.ink, ease((t - 1.05) / 0.8), { shadow: shade });
    } else y = line(ctx, w.soon, y, `italic 500 36px ${f.serif}`, c.ink, ease((t - 0.9) / 0.8), { shadow: shade });
    y += 22;
    y = line(ctx, c.venue, y, `italic 700 42px ${f.serif}`, c.accent, ease((t - 1.3) / 0.8), { max: wide, shadow: shade });
    line(ctx, c.address, y + 6, `500 27px ${f.serif}`, c.ink, ease((t - 1.5) / 0.8), { max: wide - 20, lh: 36, shadow: shade });
  };

  const drawClosing = (t: number) => {
    cover(ctx, closed, closed.width, closed.height, 1.04 - 0.03 * (t / CLOSING_S));
    ctx.fillStyle = `rgba(${tone.wash},${spec.tone === "dark" ? 0.62 : 0.55})`;
    ctx.fillRect(0, 0, W, H);
    let y = spec.closingTop ?? 150;
    y = line(ctx, w.await, y, `italic 500 36px ${f.serif}`, tone.soft, ease(t / 0.8));
    y = line(ctx, spec.names, y + 10, `400 ${spec.tone === "dark" ? "76px " + f.rozha : "84px " + f.script}`, tone.name, ease((t - 0.3) / 0.8), { max: 640, lh: 96 });
    y += 20;
    spec.hosts.slice(0, 2).forEach((h, i) => (y = line(ctx, h, y, `600 32px ${f.serif}`, tone.body, ease((t - 0.7 - i * 0.15) / 0.8), { max: 620 })));
    if (spec.contacts.length) {
      y += 30;
      y = line(ctx, w.details, y, `700 22px ${f.serif}`, tone.label, ease((t - 1.1) / 0.8), { lh: 38 });
      spec.contacts.forEach((c, i) => (y = line(ctx, [c.name, c.phone].filter(Boolean).join(" · "), y, `600 33px ${f.serif}`, tone.name, ease((t - 1.3 - i * 0.15) / 0.8))));
    }
    if (t > CLOSING_S - 0.7) {
      ctx.fillStyle = `rgba(${tone.wash},${clamp((t - (CLOSING_S - 0.7)) / 0.7)})`;
      ctx.fillRect(0, 0, W, H);
    }
  };

  /** The scene at time t, with a circular reveal into each chapter and the closing. */
  const frame = (t: number) => {
    ctx.globalAlpha = 1;
    if (t < t1) {
      cover(ctx, clip, clip.videoWidth || W, clip.videoHeight || H);
      return;
    }
    if (t < t2) return drawTitle(t - t1);
    const k = Math.floor((t - t2) / CHAPTER_S);
    const local = t - t2 - k * CHAPTER_S;
    const prev = () => (k === 0 ? drawTitle(TITLE_S) : drawChapter(k - 1, CHAPTER_S));
    const wipe = (draw: () => void, p: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.5, Math.hypot(W, H) * 0.55 * ease(p), 0, Math.PI * 2);
      ctx.clip();
      draw();
      ctx.restore();
    };
    if (t < t3) {
      if (local < WIPE_S) {
        prev();
        wipe(() => drawChapter(k, local), local / WIPE_S);
      } else drawChapter(k, local);
      return;
    }
    const c = t - t3;
    if (c < WIPE_S) {
      drawChapter(n - 1, CHAPTER_S);
      wipe(() => drawClosing(c), c / WIPE_S);
    } else drawClosing(c);
  };

  // Paint the first frame before recording so the video doesn't start blank.
  frame(0);
  await synth.play();
  rec.start(1000);
  await clip.play().catch(() => {});
  const t0 = performance.now();
  await new Promise<void>((ok) => {
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      frame(Math.min(t, total));
      onProgress(Math.min(1, t / total));
      if (t >= total) return ok();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  rec.stop();
  await done;
  clip.pause();
  synth.close();
  stream.getTracks().forEach((t) => t.stop());

  const type = mime[0].split(";")[0];
  const blob = new Blob(parts, { type });
  const name = `${spec.names.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "invitation"}-invitation.${mime[1]}`;
  return { url: URL.createObjectURL(blob), name, type, file: new File([blob], name, { type }) };
}

export function SaveVideo({ spec }: { spec: VideoSpec }) {
  const [state, setState] = useState<"idle" | "making" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [made, setMade] = useState<Made | null>(null);
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);
  const [canShare, setCanShare] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- checks what this browser can record
    setSupported(canMakeVideo());
  }, []);
  useEffect(
    () => () => {
      if (made) URL.revokeObjectURL(made.url);
    },
    [made],
  );

  const w = wordsFor(spec.lang);
  const total = Math.round(6.5 + TITLE_S + spec.chapters.length * CHAPTER_S + CLOSING_S);

  const start = async () => {
    setState("making");
    setProgress(0);
    setError("");
    try {
      const root = box.current?.closest(".inv") ?? document.documentElement;
      const out = await make(spec, root, setProgress);
      setMade(out);
      setCanShare(typeof navigator.canShare === "function" && navigator.canShare({ files: [out.file] }));
      setState("done");
    } catch (e) {
      setError((e as Error).message || w.failed);
      setState("error");
    }
  };

  const share = async () => {
    if (!made) return;
    try {
      await navigator.share({ files: [made.file], title: spec.names });
    } catch {}
  };

  return (
    <div ref={box} className="vm rv">
      <p className="vm-kicker">{w.kicker}</p>
      <h2 className="vm-h">{w.title}</h2>
      <p className="vm-sub">{w.sub(total)}</p>
      {!supported ? (
        <p className="vm-empty">{w.unsupported}</p>
      ) : state === "making" ? (
        <div className="vm-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label={w.title}>
          <i style={{ width: `${Math.round(progress * 100)}%` }} />
          <span>{w.making(Math.round(progress * 100))}</span>
        </div>
      ) : state === "done" && made ? (
        <div className="vm-done">
          <video src={made.url} controls playsInline className="vm-preview" />
          <div className="vm-actions">
            <a className="vm-btn" href={made.url} download={made.name}>
              {w.download}
            </a>
            {canShare && (
              <button type="button" className="vm-btn is-ghost" onClick={share}>
                {w.share}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <button type="button" className="vm-btn" onClick={start}>
            {w.make}
          </button>
          {state === "error" && (
            <p className="vm-error" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
