import type { MusicTrack } from "../types";

// Background music, synthesised live with Web Audio, so there is no audio file to
// download and no copyright to worry about. Each track is its own short piece
// (chords, melody, tempo and instruments) that loops: see PIECES at the bottom.
// Names and descriptions for the editor live in ../music-tracks.ts.

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** Plays one bar of a piece starting at time t. */
type Piece = { bpm: number; beats: number; bar: (s: Synth, n: number, t: number, beat: number) => void };

export class Synth {
  ctx: AudioContext;
  private master: GainNode;
  private dry: GainNode;
  private wet: GainNode;
  private noise: AudioBuffer;
  private timer: number | null = null;
  private nextBar = 0;
  private barIndex = 0;
  private piece: Piece;
  private beat: number;

  constructor(track: MusicTrack) {
    this.piece = PIECES[track] ?? PIECES.harp;
    this.beat = 60 / this.piece.bpm;
    // iOS mutes Web Audio on the silent switch unless the session is "playback".
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = "playback";
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    this.master.connect(comp).connect(this.ctx.destination);
    this.dry = this.ctx.createGain();
    this.dry.gain.value = 0.8;
    this.wet = this.ctx.createGain();
    this.wet.gain.value = 0.55;
    const verb = this.ctx.createConvolver();
    verb.buffer = this.impulse(3.6);
    this.dry.connect(this.master);
    this.wet.connect(verb).connect(this.master);
    const len = this.ctx.sampleRate;
    this.noise = this.ctx.createBuffer(1, len, len);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  private impulse(seconds: number) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    return buf;
  }

  private out(g: AudioNode, wet = 1) {
    g.connect(this.dry);
    const s = this.ctx.createGain();
    s.gain.value = wet;
    g.connect(s).connect(this.wet);
  }

  private env(t: number, peak: number, attack: number, decay: number) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    return g;
  }

  private osc(type: OscillatorType, freq: number, t: number, stop: number, to: AudioNode, detune = 0) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    o.connect(to);
    o.start(t);
    o.stop(stop);
    return o;
  }

  /* ── tuned voices ── */

  /** Harp or piano-like pluck. */
  pluck(m: number, t: number, vel: number, decay: number) {
    const g = this.env(t, vel, 0.006, decay);
    this.osc("sine", mtof(m), t, t + decay + 0.1, g);
    const g2 = this.ctx.createGain();
    g2.gain.value = 0.18;
    g2.connect(g);
    this.osc("triangle", mtof(m) * 2, t, t + decay + 0.1, g2);
    this.out(g, 0.8);
  }

  bell(m: number, t: number, vel = 0.07, decay = 3.2) {
    const g = this.env(t, vel, 0.01, decay);
    [1, 2.76, 5.4].forEach((ratio, i) => {
      const pg = this.ctx.createGain();
      pg.gain.value = [1, 0.16, 0.05][i];
      pg.connect(g);
      this.osc("sine", mtof(m) * ratio, t, t + decay + 0.1, pg);
    });
    this.out(g, 1.2);
  }

  /** Mallet: warm sine with a short bright overtone (marimba / santoor). */
  mallet(m: number, t: number, vel = 0.08, decay = 0.9) {
    const g = this.env(t, vel, 0.004, decay);
    this.osc("sine", mtof(m), t, t + decay + 0.1, g);
    const hi = this.env(t, vel * 0.35, 0.002, decay * 0.25);
    hi.connect(g);
    this.osc("sine", mtof(m) * 4, t, t + decay * 0.3, hi);
    this.out(g, 0.6);
  }

  /** Electric piano: two-operator FM, the bell-like attack mellowing as it rings. */
  keys(m: number, t: number, vel = 0.06, decay = 2.2) {
    const c = this.ctx;
    const f = mtof(m);
    const g = this.env(t, vel, 0.005, decay);
    const car = c.createOscillator();
    car.frequency.value = f;
    const mod = c.createOscillator();
    mod.frequency.value = f;
    const idx = c.createGain();
    idx.gain.setValueAtTime(f * 1.4, t);
    idx.gain.exponentialRampToValueAtTime(f * 0.08, t + 0.9);
    mod.connect(idx).connect(car.frequency);
    car.connect(g);
    car.start(t);
    mod.start(t);
    car.stop(t + decay + 0.1);
    mod.stop(t + decay + 0.1);
    this.out(g, 0.7);
  }

  /** Oud-like pluck: a bright, nasal attack that dies quickly, with a slight pitch fall. */
  oud(m: number, t: number, vel = 0.09, decay = 0.9) {
    const c = this.ctx;
    const g = this.env(t, vel, 0.004, decay);
    const bp = c.createBiquadFilter();
    bp.type = "lowpass";
    bp.frequency.setValueAtTime(3200, t);
    bp.frequency.exponentialRampToValueAtTime(700, t + decay * 0.6);
    bp.Q.value = 3;
    bp.connect(g);
    [-5, 5].forEach((det) => {
      const o = this.osc("sawtooth", mtof(m), t, t + decay + 0.1, bp, det);
      o.detune.setValueAtTime(det + 35, t);
      o.detune.linearRampToValueAtTime(det, t + 0.04);
    });
    this.out(g, 0.5);
  }

  /** Bowed strings: detuned saws through a soft filter, swelling in and out. */
  strings(notes: number[], t: number, dur: number, level = 1, attack = 1.2) {
    const c = this.ctx;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1300;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.03 * level, t + attack);
    g.gain.setValueAtTime(0.03 * level, t + dur - 0.2);
    g.gain.linearRampToValueAtTime(0, t + dur + 1);
    lp.connect(g);
    this.out(g, 1.1);
    notes.forEach((m) => [-7, 7].forEach((det) => this.osc("sawtooth", mtof(m), t, t + dur + 1.1, lp, det)));
  }

  pad(notes: number[], t: number, dur: number, level: number) {
    const c = this.ctx;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05 * level, t + 1.4);
    g.gain.setValueAtTime(0.05 * level, t + dur - 0.3);
    g.gain.linearRampToValueAtTime(0, t + dur + 1.2);
    lp.connect(g);
    this.out(g, 1);
    notes.forEach((m) => [-6, 6].forEach((det) => this.osc("triangle", mtof(m), t, t + dur + 1.4, lp, det)));
  }

  bass(m: number, t: number, level: number, len: number) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16 * level, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    this.out(g, 0.3);
    this.osc("sine", mtof(m), t, t + len + 0.1, g);
  }

  /* ── drums ── */

  private hit(t: number, vel: number, decay: number, filter: BiquadFilterType, freq: number, q = 1) {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.env(t, vel, 0.002, decay);
    src.connect(f).connect(g);
    this.out(g, 0.35);
    src.start(t, Math.random() * 0.5);
    src.stop(t + decay + 0.05);
  }

  /** A low drum: a sine dropping in pitch (kick, dum, dha). */
  thump(t: number, vel = 0.3, from = 120, to = 50, decay = 0.35) {
    const g = this.env(t, vel, 0.003, decay);
    const o = this.osc("sine", from, t, t + decay + 0.05, g);
    o.frequency.exponentialRampToValueAtTime(to, t + decay * 0.6);
    this.out(g, 0.2);
  }

  /** A frame drum's or dholak's ringing rim (tek, na). */
  tek(t: number, vel = 0.1, pitch = 520) {
    const g = this.env(t, vel, 0.002, 0.12);
    this.osc("sine", pitch, t, t + 0.15, g);
    this.out(g, 0.4);
    this.hit(t, vel * 0.6, 0.05, "bandpass", 2400, 1.2);
  }

  clap(t: number, vel = 0.08) {
    [0, 0.011, 0.023].forEach((d) => this.hit(t + d, vel, 0.09, "bandpass", 1500, 0.9));
  }

  shaker(t: number, vel = 0.025) {
    this.hit(t, vel, 0.05, "highpass", 6500);
  }

  /* ── transport ── */

  private tick = () => {
    const barLen = this.beat * this.piece.beats;
    while (this.nextBar < this.ctx.currentTime + 0.4) {
      this.piece.bar(this, this.barIndex++, this.nextBar, this.beat);
      this.nextBar += barLen;
    }
  };

  chime() {
    const t = this.ctx.currentTime + 0.05;
    if (this.timer == null) {
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(0.9, t);
    }
    [69, 71, 74, 76, 78, 81, 83, 86, 88, 90, 93].forEach((m, i) => this.bell(m, t + i * 0.085, 0.05, 2.6));
  }

  async play() {
    await this.ctx.resume();
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.9, now + 2.5);
    if (this.timer == null) {
      if (this.nextBar < now) this.nextBar = now + 0.1;
      this.tick();
      this.timer = window.setInterval(this.tick, 120);
    }
  }

  pause() {
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.6);
    if (this.timer != null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    window.setTimeout(() => {
      if (this.timer == null) this.ctx.suspend();
    }, 700);
  }

  close() {
    this.pause();
    window.setTimeout(() => this.ctx.close().catch(() => {}), 800);
  }

  /** A copy of the music as a MediaStream, for recording it into a video (`gain` lifts it to a video's level). */
  stream(gain = 1) {
    const out = this.ctx.createMediaStreamDestination();
    const lift = this.ctx.createGain();
    lift.gain.value = gain;
    const limit = this.ctx.createDynamicsCompressor();
    this.master.connect(lift).connect(limit).connect(out);
    return out.stream;
  }
}

/* ── the pieces ── */

type Chord = { bass: number; pad: number[]; arp: number[]; mel: [number, number][] };

// Garden harp, D major: I – vi – IV – V – I/3 – ii – IV – Vsus
const HARP: Chord[] = [
  { bass: 38, pad: [62, 66, 69, 73], arp: [50, 57, 62, 66, 69, 66, 62, 57], mel: [[0, 78], [2, 76], [3, 74]] },
  { bass: 35, pad: [59, 62, 66, 69], arp: [47, 54, 59, 62, 66, 62, 59, 54], mel: [[0, 74], [1.5, 73], [2, 71]] },
  { bass: 43, pad: [59, 62, 66, 67], arp: [43, 50, 55, 59, 62, 66, 62, 59], mel: [[0, 71], [1, 74], [2, 79]] },
  { bass: 45, pad: [57, 61, 64, 69], arp: [45, 52, 57, 61, 64, 61, 57, 52], mel: [[0, 78], [2, 76]] },
  { bass: 42, pad: [57, 62, 66, 69], arp: [42, 50, 54, 57, 62, 57, 54, 50], mel: [[0, 78], [1, 81], [2, 78], [3, 76]] },
  { bass: 40, pad: [59, 62, 64, 67], arp: [40, 47, 52, 55, 59, 55, 52, 47], mel: [[0, 74], [2, 71], [3, 74]] },
  { bass: 43, pad: [59, 62, 66, 67], arp: [43, 50, 55, 59, 62, 66, 62, 59], mel: [[0, 76], [1.5, 74], [2, 71]] },
  { bass: 45, pad: [57, 62, 64, 69], arp: [45, 52, 57, 62, 64, 61, 57, 52], mel: [[0, 73], [2, 69]] },
];

// Pachelbel's Canon in D (1680s, public domain): its eight-chord ground, two chords a bar.
const CANON_BASS = [50, 45, 47, 42, 43, 38, 43, 45];
const CANON_CHORD = [
  [62, 66, 69],
  [61, 64, 69],
  [62, 66, 71],
  [61, 66, 69],
  [62, 67, 71],
  [62, 66, 69],
  [62, 67, 71],
  [61, 64, 69],
];
// The upper voices in turn: long notes, then the falling line, then flowing quarters.
const CANON_TUNE: [number, number][][] = [
  [[0, 78], [2, 76], [4, 74], [6, 73], [8, 71], [10, 69], [12, 71], [14, 73]],
  [[0, 74], [2, 73], [4, 71], [6, 69], [8, 67], [10, 66], [12, 67], [14, 64]],
  [[0, 62], [1, 66], [2, 69], [3, 67], [4, 66], [5, 62], [6, 66], [7, 64], [8, 62], [9, 59], [10, 62], [11, 69], [12, 67], [13, 71], [14, 69], [15, 67]],
];

// Music box, a waltz in G: G – Em – C – D – G – C – D – G
const BOX: { root: number; chord: number[]; tune: number[] }[] = [
  { root: 55, chord: [59, 62], tune: [83, 86, 83] },
  { root: 52, chord: [55, 59], tune: [83, 79, 76] },
  { root: 48, chord: [52, 55], tune: [84, 79, 76] },
  { root: 50, chord: [54, 57], tune: [81, 78, 74] },
  { root: 55, chord: [59, 62], tune: [79, 83, 86] },
  { root: 48, chord: [52, 55], tune: [88, 84, 79] },
  { root: 50, chord: [54, 57], tune: [78, 81, 86] },
  { root: 55, chord: [59, 62], tune: [79, 0, 0] },
];

// Velvet strings, A minor: Am – F – C – G, each chord held for two bars.
const STRINGS: { bass: number; chord: number[]; tune: number[] }[] = [
  { bass: 45, chord: [57, 60, 64], tune: [76, 74, 72, 71] },
  { bass: 41, chord: [57, 60, 65], tune: [72, 77, 76, 72] },
  { bass: 48, chord: [55, 60, 64], tune: [76, 79, 77, 76] },
  { bass: 43, chord: [55, 59, 62], tune: [74, 71, 74, 79] },
];

// Oud & daf: maqam Hijaz on D (D Eb F# G A Bb C), eighth notes, 0 = rest.
const OUD: number[][] = [
  [62, 63, 66, 67, 69, 0, 67, 66],
  [67, 69, 70, 69, 67, 66, 63, 62],
  [69, 0, 70, 72, 74, 72, 70, 69],
  [67, 66, 63, 66, 62, 0, 0, 0],
  [74, 72, 70, 69, 70, 69, 67, 66],
  [67, 66, 63, 62, 63, 66, 67, 69],
  [70, 69, 67, 66, 67, 66, 63, 0],
  [62, 0, 0, 0, 62, 0, 0, 0],
];
// Maqsum: dum tek . tek dum . tek .
const MAQSUM = ["D", "T", "", "T", "D", "", "T", ""];

// Dholki night: a Bhoopali-style pentatonic tune on D (D E F# A B) over a dholak beat.
const DHOLKI: number[][] = [
  [69, 71, 74, 71, 69, 66, 64, 66],
  [69, 0, 66, 64, 62, 64, 66, 0],
  [74, 76, 78, 76, 74, 71, 69, 71],
  [74, 0, 71, 69, 66, 69, 62, 0],
];
const DHOLAK = ["dha", "na", "na", "dha", "dha", "na", "tin", "na"];

// Soft keys, C major sevenths: Fmaj7 – Em7 – Dm7 – Cmaj7, lazily swung.
const KEYS: { bass: number[]; chord: number[]; tune: [number, number][] }[] = [
  { bass: [41, 48], chord: [57, 60, 64, 65], tune: [[0, 72], [1.5, 76], [3, 77]] },
  { bass: [40, 47], chord: [55, 59, 62, 64], tune: [[0.5, 76], [2, 74]] },
  { bass: [38, 45], chord: [53, 57, 60, 64], tune: [[0, 72], [1.5, 74], [2.5, 77], [3, 76]] },
  { bass: [36, 43], chord: [52, 55, 59, 62], tune: [[0, 71], [2, 67], [3.5, 69]] },
];

// Celebration, F major: F – C – Dm – Bb, bright and bouncy.
const PARTY: { bass: number; chord: number[]; tune: number[] }[] = [
  { bass: 41, chord: [65, 69, 72], tune: [77, 79, 81, 79] },
  { bass: 36, chord: [64, 67, 72], tune: [76, 72, 76, 79] },
  { bass: 38, chord: [62, 65, 69], tune: [77, 81, 84, 81] },
  { bass: 34, chord: [62, 65, 70], tune: [79, 77, 74, 72] },
];

const PIECES: Record<MusicTrack, Piece> = {
  harp: {
    bpm: 66,
    beats: 4,
    bar(s, n, t, beat) {
      const c = HARP[n % HARP.length];
      s.bass(c.bass, t, 1, beat * 4);
      s.pad(c.pad, t, beat * 4, 1);
      c.arp.forEach((m, i) => s.pluck(m, t + i * beat * 0.5, i === 0 ? 0.11 : 0.075, 1.8));
      if (n >= 4) c.mel.forEach(([b, m]) => s.bell(m, t + b * beat, 0.075));
    },
  },
  piano: {
    bpm: 60,
    beats: 4,
    bar(s, n, t, beat) {
      const pair = (n % 4) * 2;
      for (let h = 0; h < 2; h++) {
        const k = pair + h;
        const at = t + h * beat * 2;
        s.bass(CANON_BASS[k] - 12, at, 0.9, beat * 2.2);
        const [a, b, c] = CANON_CHORD[k];
        [CANON_BASS[k], a, b, c].forEach((m, i) => s.pluck(m, at + i * beat * 0.5, 0.055, 2.6));
      }
      const tune = CANON_TUNE[Math.floor(n / 4) % CANON_TUNE.length];
      const from = (n % 4) * 4;
      tune.filter(([b]) => b >= from && b < from + 4).forEach(([b, m]) => s.pluck(m, t + (b - from) * beat, 0.1, 3));
    },
  },
  musicbox: {
    bpm: 84,
    beats: 3,
    bar(s, n, t, beat) {
      const c = BOX[n % BOX.length];
      s.bell(c.root + 12, t, 0.05, 2.2);
      c.chord.forEach((m, i) => s.bell(m + 12, t + (i + 1) * beat, 0.03, 1.6));
      c.tune.forEach((m, i) => m && s.bell(m, t + i * beat, 0.07, 2.6));
    },
  },
  strings: {
    bpm: 56,
    beats: 4,
    bar(s, n, t, beat) {
      const c = STRINGS[Math.floor(n / 2) % STRINGS.length];
      const half = n % 2;
      if (!half) {
        s.strings([c.bass - 12, c.bass], t, beat * 8, 1.1, 1.6);
        s.strings(c.chord, t, beat * 8, 0.9, 2);
      }
      c.tune.slice(half * 2, half * 2 + 2).forEach((m, i) => s.strings([m], t + i * beat * 2, beat * 2, 1.1, 0.5));
      if (n >= 8) s.bell(c.tune[half * 2] + 12, t, 0.03, 3);
    },
  },
  oud: {
    bpm: 92,
    beats: 4,
    bar(s, n, t, beat) {
      const e = beat / 2;
      if (n % 2 === 0) s.pad([50, 57], t, beat * 8, 0.8);
      OUD[n % OUD.length].forEach((m, i) => m && s.oud(m, t + i * e, i % 2 ? 0.07 : 0.09));
      if (n >= 2)
        MAQSUM.forEach((k, i) => {
          if (k === "D") s.thump(t + i * e, 0.22, 110, 55, 0.4);
          if (k === "T") s.tek(t + i * e, 0.07, 480);
        });
    },
  },
  dholki: {
    bpm: 100,
    beats: 4,
    bar(s, n, t, beat) {
      const e = beat / 2;
      if (n % 2 === 0) s.pad([50, 57, 62], t, beat * 8, 0.7);
      DHOLKI[n % DHOLKI.length].forEach((m, i) => m && s.mallet(m, t + i * e, 0.07, 1.1));
      DHOLAK.forEach((k, i) => {
        if (k === "dha") s.thump(t + i * e, 0.2, 140, 70, 0.3);
        if (k === "na") s.tek(t + i * e, 0.06, 620);
        if (k === "tin") s.tek(t + i * e, 0.05, 820);
      });
      if (n >= 4) [1, 3].forEach((b) => s.clap(t + b * beat, 0.05));
    },
  },
  softkeys: {
    bpm: 72,
    beats: 4,
    bar(s, n, t, beat) {
      const c = KEYS[n % KEYS.length];
      const sw = (b: number) => (b % 1 ? Math.floor(b) + 0.62 : b) * beat;
      s.bass(c.bass[0], t, 1, beat * 2.5);
      s.bass(c.bass[1], t + sw(2.5), 0.7, beat * 1.4);
      c.chord.forEach((m) => s.keys(m, t, 0.03, 2.4));
      c.chord.forEach((m) => s.keys(m, t + sw(2.5), 0.022, 1.2));
      if (n >= 2) c.tune.forEach(([b, m]) => s.keys(m, t + sw(b), 0.055, 2));
      if (n >= 4) for (let i = 0; i < 8; i++) s.shaker(t + sw(i / 2), i % 2 ? 0.015 : 0.022);
    },
  },
  celebrate: {
    bpm: 112,
    beats: 4,
    bar(s, n, t, beat) {
      const c = PARTY[n % PARTY.length];
      [0, 2].forEach((b) => s.thump(t + b * beat, 0.24));
      [1, 3].forEach((b) => s.clap(t + b * beat, 0.06));
      [0, 1.5, 2, 3.5].forEach((b) => s.bass(c.bass, t + b * beat, 0.8, beat * 0.9));
      [0.5, 1.5, 2.5, 3.5].forEach((b) => c.chord.forEach((m) => s.mallet(m, t + b * beat, 0.025, 0.4)));
      if (n >= 4) c.tune.forEach((m, i) => s.mallet(m, t + i * beat, 0.085, 0.8));
      for (let i = 0; i < 8; i++) s.shaker(t + i * beat * 0.5);
    },
  },
};

export class Music {
  private synth: Synth | null = null;
  playing = false;

  constructor(private track: MusicTrack) {}

  setTrack(track: MusicTrack) {
    if (track === this.track) return;
    this.track = track;
    const was = this.playing;
    this.synth?.close();
    this.synth = null;
    if (was) void this.play();
  }

  /** Must be called from a user gesture the first time. */
  async play(withChime = false) {
    const s = this.ensure();
    if (!s) return;
    this.playing = true;
    await s.play();
    if (withChime) s.chime();
  }

  pause() {
    this.playing = false;
    this.synth?.pause();
  }

  dispose() {
    this.playing = false;
    this.synth?.close();
    this.synth = null;
  }

  private ensure() {
    if (!this.synth) {
      try {
        this.synth = new Synth(this.track);
      } catch {
        return null;
      }
    }
    return this.synth;
  }
}
