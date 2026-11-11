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

  /**
   * A plucked string: two saws through a filter that closes as the note dies.
   * `open` and `shut` are multiples of the note's own pitch; `bend` is how far
   * off pitch it starts, in cents.
   */
  private string(m: number, t: number, vel: number, decay: number, o: { open: number; shut: number; q: number; spread: number; wet: number; bend?: number }) {
    const f = mtof(m);
    const g = this.env(t, vel, 0.004, decay);
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = o.q;
    lp.frequency.setValueAtTime(Math.min(f * o.open, 9000), t);
    lp.frequency.exponentialRampToValueAtTime(f * o.shut, t + decay * 0.5);
    lp.connect(g);
    [-o.spread, o.spread].forEach((det) => {
      const osc = this.osc("sawtooth", f, t, t + decay + 0.1, lp, det);
      if (o.bend) {
        osc.detune.setValueAtTime(det + o.bend, t);
        osc.detune.linearRampToValueAtTime(det, t + 0.07);
      }
    });
    this.out(g, o.wet);
  }

  /** Nylon-string guitar: round and warm, the brightness gone almost at once. */
  nylon(m: number, t: number, vel = 0.08, decay = 2) {
    this.string(m, t, vel, decay, { open: 5, shut: 1.2, q: 0.6, spread: 3, wet: 0.5 });
  }

  /** Koto or guzheng: a hard, ringing pluck that is pressed up into pitch. */
  koto(m: number, t: number, vel = 0.07, decay = 2.6) {
    this.string(m, t, vel, decay, { open: 9, shut: 2, q: 2.5, spread: 4, wet: 0.9, bend: -45 });
  }

  /** Santoor: hammered pairs of wire strings, bright and slightly out with each other. */
  santoor(m: number, t: number, vel = 0.07, decay = 2) {
    this.string(m, t, vel, decay, { open: 9, shut: 3, q: 1, spread: 7, wet: 0.8 });
  }

  /** Qanun: a short, glassy pluck, made to be repeated. */
  qanun(m: number, t: number, vel = 0.07, decay = 1.2) {
    this.string(m, t, vel, decay, { open: 7, shut: 2.4, q: 2, spread: 6, wet: 0.7 });
  }

  /** Tanpura: a buzzing drone string whose overtones bloom after it is plucked. */
  tanpura(m: number, t: number, vel = 0.05, decay = 4.5) {
    const f = mtof(m);
    const g = this.env(t, vel, 0.06, decay);
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(f * 2, t);
    bp.frequency.exponentialRampToValueAtTime(f * 6, t + 0.9);
    bp.frequency.exponentialRampToValueAtTime(f * 3, t + decay);
    bp.connect(g);
    [-4, 4].forEach((det) => this.osc("sawtooth", f, t, t + decay + 0.1, bp, det));
    this.out(g, 0.9);
  }

  /** Celesta: a small round chime with a faint tick as the hammer lands. */
  celesta(m: number, t: number, vel = 0.05, decay = 2) {
    const f = mtof(m);
    const g = this.env(t, vel, 0.004, decay);
    this.osc("sine", f, t, t + decay + 0.1, g);
    const oct = this.ctx.createGain();
    oct.gain.value = 0.22;
    oct.connect(g);
    this.osc("sine", f * 2, t, t + decay + 0.1, oct);
    const tick = this.env(t, 0.16, 0.002, 0.12);
    tick.connect(g);
    this.osc("sine", f * 4, t, t + 0.2, tick);
    this.out(g, 1.1);
  }

  /** A bronze key (saron, gender): a tuned pair that shimmers, with the mallet's clang on top. */
  metal(m: number, t: number, vel = 0.06, decay = 2.4) {
    const f = mtof(m);
    const g = this.env(t, vel, 0.004, decay);
    this.osc("sine", f, t, t + decay + 0.1, g);
    const pair = this.ctx.createGain();
    pair.gain.value = 0.6;
    pair.connect(g);
    this.osc("sine", f * 1.006, t, t + decay + 0.1, pair);
    const clang = this.env(t, 0.2, 0.002, decay * 0.2);
    clang.connect(g);
    this.osc("sine", f * 2.76, t, t + decay * 0.25, clang);
    this.out(g, 1);
  }

  /** A hanging gong: a low tone that beats slowly and sinks a little as it rings. */
  gong(m: number, t: number, vel = 0.12, decay = 7) {
    const f = mtof(m);
    const g = this.env(t, vel, 0.03, decay);
    [1, 1.007, 2.02].forEach((ratio, i) => {
      const pg = this.ctx.createGain();
      pg.gain.value = [1, 0.7, 0.3][i];
      pg.connect(g);
      const o = this.osc("sine", f * ratio, t, t + decay + 0.1, pg);
      o.frequency.setValueAtTime(f * ratio * 1.012, t);
      o.frequency.exponentialRampToValueAtTime(f * ratio, t + 0.6);
    });
    this.out(g, 1.2);
  }

  /** A breathy flute: close to a sine, with a slow vibrato that arrives late and a little air. */
  flute(m: number, t: number, dur: number, vel = 0.05) {
    const c = this.ctx;
    const f = mtof(m);
    const end = t + dur + 0.5;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.3);
    g.gain.setValueAtTime(vel, t + dur);
    g.gain.linearRampToValueAtTime(0, end);
    const vib = c.createGain();
    vib.gain.setValueAtTime(0, t + 0.4);
    vib.gain.linearRampToValueAtTime(9, t + 1.2);
    this.osc("sine", 4.7, t, end, vib);
    vib.connect(this.osc("sine", f, t, end, g).detune);
    const oct = c.createGain();
    oct.gain.value = 0.14;
    oct.connect(g);
    vib.connect(this.osc("sine", f * 2, t, end, oct).detune);
    const air = c.createBufferSource();
    air.buffer = this.noise;
    air.loop = true;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = f * 2;
    bp.Q.value = 1.5;
    const breath = c.createGain();
    breath.gain.value = 0.3;
    air.connect(bp).connect(breath).connect(g);
    air.start(t);
    air.stop(end);
    this.out(g, 1.1);
  }

  /** A pad that opens and closes: detuned saws under a filter that rises and falls across the chord. */
  swell(notes: number[], t: number, dur: number, level = 1, low = 420, high = 1700) {
    const c = this.ctx;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 0.8;
    lp.frequency.setValueAtTime(low, t);
    lp.frequency.exponentialRampToValueAtTime(high, t + dur * 0.55);
    lp.frequency.exponentialRampToValueAtTime(low, t + dur + 2);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.022 * level, t + dur * 0.4);
    g.gain.setValueAtTime(0.022 * level, t + dur - 0.2);
    g.gain.linearRampToValueAtTime(0, t + dur + 2.4);
    lp.connect(g);
    this.out(g, 1.2);
    notes.forEach((m) => [-8, 8].forEach((det) => this.osc("sawtooth", mtof(m), t, t + dur + 2.5, lp, det)));
  }

  /* ── drums ── */

  private hit(t: number, vel: number, decay: number, filter: BiquadFilterType, freq: number, q = 1, attack = 0.002) {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.env(t, vel, attack, decay);
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

  /** A wire brush drawn across a snare head. */
  brush(t: number, vel = 0.03) {
    this.hit(t, vel, 0.2, "bandpass", 3600, 0.7, 0.025);
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

// First dance: a slow waltz in E flat, sixteen bars. The left hand plays the root, then the chord twice.
const WALTZ: { bass: number; chord: number[]; tune: [number, number][] }[] = [
  { bass: 39, chord: [58, 63, 67], tune: [[0, 79], [2, 77]] },
  { bass: 36, chord: [60, 63, 67], tune: [[0, 75], [2, 72]] },
  { bass: 44, chord: [60, 63, 68], tune: [[0, 72], [2, 75]] },
  { bass: 46, chord: [58, 62, 68], tune: [[0, 74]] },
  { bass: 43, chord: [58, 63, 67], tune: [[0, 75], [2, 79]] },
  { bass: 44, chord: [60, 63, 68], tune: [[0, 80], [2, 79]] },
  { bass: 41, chord: [60, 63, 68], tune: [[0, 77], [2, 75]] },
  { bass: 46, chord: [56, 62, 65], tune: [[0, 77], [2, 74]] },
  { bass: 36, chord: [60, 63, 67], tune: [[0, 75], [1, 74], [2, 72]] },
  { bass: 43, chord: [58, 62, 67], tune: [[0, 74], [2, 70]] },
  { bass: 44, chord: [60, 63, 68], tune: [[0, 72], [1, 70], [2, 68]] },
  { bass: 43, chord: [58, 63, 67], tune: [[0, 70], [2, 67]] },
  { bass: 41, chord: [60, 65, 68], tune: [[0, 68], [1, 72], [2, 77]] },
  { bass: 46, chord: [56, 62, 65], tune: [[0, 80], [2, 77]] },
  { bass: 39, chord: [58, 63, 67], tune: [[0, 79], [2, 75]] },
  { bass: 39, chord: [58, 63, 67], tune: [[0, 75], [2, 77]] },
];

// Spanish guitar, A minor: the Andalusian fall (Am – G – F – E) twice, then a brighter turn through C.
// Eight picked notes a bar, the thumb on the first and fifth.
const GUITAR: { arp: number[]; tune: [number, number][] }[] = [
  { arp: [45, 57, 60, 64, 52, 64, 60, 57], tune: [[0, 76], [2, 72], [3, 71]] },
  { arp: [43, 55, 59, 62, 50, 62, 59, 55], tune: [[0, 74], [2, 71], [3, 67]] },
  { arp: [41, 57, 60, 65, 48, 65, 60, 57], tune: [[0, 72], [2, 69], [3, 72]] },
  { arp: [40, 56, 59, 64, 47, 64, 59, 56], tune: [[0, 71], [3, 68]] },
  { arp: [45, 57, 60, 64, 52, 64, 60, 57], tune: [[0, 69], [1, 72], [2, 76], [3, 81]] },
  { arp: [43, 55, 59, 62, 50, 62, 59, 55], tune: [[0, 79], [2, 77], [3, 74]] },
  { arp: [41, 57, 60, 65, 48, 65, 60, 57], tune: [[0, 77], [1, 76], [2, 74], [3, 72]] },
  { arp: [40, 56, 59, 64, 47, 64, 59, 56], tune: [[0, 71], [2, 68], [3, 71]] },
  { arp: [48, 55, 60, 64, 43, 64, 60, 55], tune: [[0, 76], [2, 79]] },
  { arp: [43, 55, 59, 62, 50, 62, 59, 55], tune: [[0, 74], [2, 71], [3, 74]] },
  { arp: [45, 57, 60, 64, 52, 64, 60, 57], tune: [[0, 72], [2, 76]] },
  { arp: [40, 55, 59, 64, 47, 64, 59, 55], tune: [[0, 71], [3, 76]] },
  { arp: [41, 57, 60, 65, 48, 65, 60, 57], tune: [[0, 81], [2, 77], [3, 76]] },
  { arp: [48, 55, 60, 64, 43, 64, 60, 55], tune: [[0, 79], [2, 76], [3, 72]] },
  { arp: [50, 57, 62, 65, 40, 56, 59, 64], tune: [[0, 74], [1, 77], [2, 76], [3, 80]] },
  { arp: [45, 57, 60, 64, 52, 64, 60, 57], tune: [[0, 81], [2, 76]] },
];

// Koto & flute: G major pentatonic (G A B D E), eighth notes, 0 = rest. Sixteen bars.
const KOTO: number[][] = [
  [74, 0, 76, 74, 71, 0, 69, 71],
  [74, 0, 0, 0, 67, 69, 71, 0],
  [76, 0, 79, 76, 74, 0, 71, 74],
  [69, 0, 0, 0, 0, 0, 0, 0],
  [79, 0, 81, 79, 76, 0, 74, 76],
  [79, 0, 0, 0, 83, 81, 79, 0],
  [76, 74, 71, 74, 69, 0, 71, 69],
  [67, 0, 0, 0, 0, 0, 0, 0],
  [71, 0, 71, 74, 76, 0, 74, 0],
  [71, 69, 67, 0, 64, 0, 67, 0],
  [69, 0, 69, 71, 74, 0, 71, 0],
  [69, 67, 64, 0, 62, 0, 0, 0],
  [74, 76, 79, 0, 81, 0, 79, 76],
  [74, 0, 76, 74, 71, 0, 69, 0],
  [71, 0, 74, 71, 69, 0, 67, 69],
  [67, 0, 0, 0, 0, 0, 0, 0],
];
// The low string under each bar, and the flute's long notes as [bar, note, bars held].
const KOTO_LOW = [43, 43, 40, 50, 43, 40, 50, 43, 40, 40, 50, 50, 43, 43, 50, 43];
const KOTO_FLUTE: [number, number, number][] = [[0, 62, 2], [2, 64, 2], [4, 67, 2], [6, 69, 1], [7, 67, 1], [8, 71, 2], [10, 69, 2], [12, 74, 2], [14, 69, 1], [15, 67, 1]];
// The strings in order, for a sweep of the hand across them.
const KOTO_STRINGS = [62, 64, 67, 69, 71, 74, 76, 79, 81, 83, 86];

// Gamelan: five notes close to pelog (B flat, D, E flat, F, A). The core tune goes in quarter notes;
// the small chimes above play each pair of its notes twice as fast, and a gong marks every fourth bar.
const GAMELAN: number[][] = [
  [70, 74, 75, 74],
  [70, 69, 65, 69],
  [70, 74, 75, 77],
  [75, 74, 70, 69],
  [65, 69, 70, 69],
  [65, 63, 62, 63],
  [65, 69, 70, 74],
  [70, 69, 70, 74],
  [77, 75, 74, 75],
  [77, 81, 82, 81],
  [77, 75, 74, 70],
  [69, 70, 74, 70],
  [75, 74, 70, 69],
  [65, 69, 70, 74],
  [75, 74, 70, 69],
  [65, 62, 63, 65],
];

// Kalimba, A major in 12/8: A – D – A – E – F#m – D – A – E. The low tines fall on the four beats,
// the high ones on every second pulse, so the two hands cross (0 = rest).
const KALIMBA: { bass: number; low: number[] }[] = [
  { bass: 45, low: [57, 64, 61, 64] },
  { bass: 50, low: [62, 57, 66, 57] },
  { bass: 45, low: [57, 64, 61, 64] },
  { bass: 40, low: [64, 59, 68, 59] },
  { bass: 42, low: [54, 61, 57, 61] },
  { bass: 50, low: [62, 57, 66, 57] },
  { bass: 45, low: [57, 64, 61, 64] },
  { bass: 40, low: [64, 59, 68, 59] },
];
const KALIMBA_TOP: number[][] = [
  [73, 76, 81, 76, 73, 76],
  [74, 78, 81, 78, 74, 78],
  [76, 81, 85, 81, 76, 73],
  [71, 76, 80, 83, 80, 76],
  [73, 78, 81, 78, 73, 69],
  [74, 78, 81, 78, 81, 86],
  [85, 81, 76, 73, 76, 81],
  [80, 76, 71, 76, 80, 83],
  [81, 0, 78, 76, 0, 73],
  [74, 0, 78, 81, 0, 78],
  [76, 0, 73, 69, 0, 73],
  [71, 0, 76, 80, 0, 76],
  [81, 0, 78, 73, 0, 78],
  [74, 0, 81, 78, 0, 74],
  [73, 0, 76, 81, 0, 85],
  [83, 0, 80, 76, 0, 71],
];
// The bell pattern that runs through 12/8 music across West and Central Africa, as pulses of twelve.
const TIMELINE = [0, 2, 4, 5, 7, 9, 11];

// Santoor & tabla: phrases in raga Yaman on C (C D E F# G A B), six beats to the bar. [beat, note];
// a note left to ring for two beats or more is rolled.
const SANTOOR: [number, number][][] = [
  [[0, 71], [1, 74], [2, 76]],
  [[0, 74], [1, 76], [2, 78], [3, 79], [5, 78]],
  [[0, 76], [2, 74], [3, 71], [4, 74]],
  [[0, 72]],
  [[0, 76], [1, 78], [2, 81], [3, 83], [4, 84]],
  [[0, 83], [1, 81], [2, 79], [3, 78], [4, 76], [5, 78]],
  [[0, 79], [2, 78], [3, 76], [4, 74], [5, 76]],
  [[0, 74], [2, 71], [3, 74], [4, 72]],
  [[0, 84], [1, 86], [2, 88], [3, 86], [4, 84], [5, 83]],
  [[0, 81], [1, 83], [2, 81], [3, 79], [4, 78], [5, 79]],
  [[0, 78], [1, 76], [2, 74], [3, 76], [4, 78], [5, 81]],
  [[0, 79], [3, 78], [4, 76], [5, 74]],
  [[0, 71], [1, 74], [2, 76], [3, 78], [4, 76], [5, 74]],
  [[0, 76], [1, 78], [2, 79], [4, 78], [5, 76]],
  [[0, 74], [1, 76], [2, 74], [3, 71], [4, 69], [5, 71]],
  [[0, 72]],
];
// The tanpura's four strings (Pa Sa Sa and the low Sa), and the tabla's dadra.
const TANPURA = [55, 60, 60, 48];
const DADRA = ["dha", "dhin", "na", "dha", "tin", "na"];

// Qanun: maqam Nahawand on G (G A Bb C D Eb, with F# rising and F falling). [beat, note, beats held];
// held notes are played tremolo.
const QANUN: [number, number, number][][] = [
  [[0, 74, 2], [2, 75, 0.5], [2.5, 74, 0.5], [3, 72, 0.5], [3.5, 70, 0.5]],
  [[0, 72, 1.5], [1.5, 70, 0.5], [2, 69, 1], [3, 70, 1]],
  [[0, 67, 2], [2, 69, 0.5], [2.5, 70, 0.5], [3, 72, 0.5], [3.5, 74, 0.5]],
  [[0, 74, 3]],
  [[0, 79, 2], [2, 77, 0.5], [2.5, 75, 0.5], [3, 74, 1]],
  [[0, 75, 1.5], [1.5, 74, 0.5], [2, 72, 1], [3, 74, 1]],
  [[0, 70, 1], [1, 72, 0.5], [1.5, 70, 0.5], [2, 69, 1], [3, 66, 1]],
  [[0, 67, 3]],
  [[0, 74, 1], [1, 75, 0.5], [1.5, 78, 0.5], [2, 79, 2]],
  [[0, 81, 1], [1, 79, 0.5], [1.5, 78, 0.5], [2, 79, 1], [3, 82, 1]],
  [[0, 81, 1.5], [1.5, 79, 0.5], [2, 77, 1], [3, 75, 1]],
  [[0, 74, 3]],
  [[0, 79, 1], [1, 77, 0.5], [1.5, 75, 0.5], [2, 74, 1], [3, 72, 1]],
  [[0, 70, 1.5], [1.5, 72, 0.5], [2, 74, 1], [3, 70, 1]],
  [[0, 69, 1], [1, 70, 0.5], [1.5, 69, 0.5], [2, 67, 1], [3, 66, 1]],
  [[0, 67, 3]],
];
const QANUN_LOW = [55, 48, 55, 50, 55, 48, 50, 43, 50, 55, 48, 50, 55, 46, 50, 43];
// Wahda, the slow one: dum . . tek . . tek .
const WAHDA = ["D", "", "", "T", "", "", "T", ""];

// Lullaby, F major, rocking in 6/8. The tune is [eighth of the bar, note].
const LULLABY: { bass: number; chord: number[]; tune: [number, number][] }[] = [
  { bass: 41, chord: [53, 57, 60], tune: [[0, 69], [2, 72], [3, 77]] },
  { bass: 38, chord: [53, 57, 62], tune: [[0, 74], [2, 72], [3, 69]] },
  { bass: 46, chord: [53, 58, 62], tune: [[0, 70], [2, 74], [3, 77]] },
  { bass: 48, chord: [52, 55, 60], tune: [[0, 76], [3, 72]] },
  { bass: 41, chord: [53, 57, 60], tune: [[0, 69], [2, 72], [3, 77], [5, 81]] },
  { bass: 38, chord: [53, 57, 62], tune: [[0, 81], [2, 77], [3, 74]] },
  { bass: 43, chord: [53, 58, 62], tune: [[0, 70], [2, 74], [3, 79], [5, 77]] },
  { bass: 36, chord: [52, 58, 60], tune: [[0, 76], [3, 79]] },
  { bass: 46, chord: [53, 58, 62], tune: [[0, 77], [2, 74], [3, 70]] },
  { bass: 45, chord: [53, 60, 65], tune: [[0, 72], [2, 69], [3, 65]] },
  { bass: 43, chord: [55, 58, 62], tune: [[0, 67], [2, 70], [3, 74]] },
  { bass: 48, chord: [52, 55, 60], tune: [[0, 72], [3, 76]] },
  { bass: 46, chord: [53, 58, 62], tune: [[0, 74], [2, 77], [3, 82]] },
  { bass: 45, chord: [53, 60, 65], tune: [[0, 81], [2, 77], [3, 72]] },
  { bass: 36, chord: [53, 58, 62], tune: [[0, 70], [2, 74], [3, 72], [5, 79]] },
  { bass: 41, chord: [53, 57, 60], tune: [[0, 77]] },
];

// Lounge trio, B flat: sixteen bars of ii – V – I turns. Rootless chords in the right hand,
// a bass that walks to the next root by a half step, and a tune that leaves room.
const JAZZ: { walk: number[]; chord: number[]; tune: [number, number][] }[] = [
  { walk: [46, 50, 53, 54], chord: [57, 60, 62, 65], tune: [[0, 77], [1.5, 74], [2.5, 72], [3, 74]] }, // Bbmaj9
  { walk: [55, 53, 50, 49], chord: [53, 59, 63], tune: [[0.5, 75], [1.5, 77], [3, 71]] }, // G7b13
  { walk: [48, 51, 55, 54], chord: [58, 62, 63, 67], tune: [[0, 74], [1.5, 72], [2.5, 70], [3, 67]] }, // Cm9
  { walk: [53, 57, 55, 51], chord: [57, 60, 63, 67], tune: [[0.5, 69], [2, 72], [3.5, 75]] }, // F9
  { walk: [50, 53, 57, 56], chord: [57, 60, 65], tune: [[0, 77], [1.5, 74], [3, 72]] }, // Dm7
  { walk: [55, 53, 50, 49], chord: [53, 59, 64], tune: [[0.5, 71], [1.5, 74], [2.5, 76], [3, 79]] }, // G13
  { walk: [48, 50, 51, 52], chord: [58, 62, 63, 67], tune: [[0, 77], [1.5, 75], [2.5, 74], [3, 72]] }, // Cm9
  { walk: [53, 57, 55, 52], chord: [57, 60, 63, 67], tune: [[0.5, 72], [2, 69]] }, // F9
  { walk: [51, 55, 58, 57], chord: [55, 58, 62, 65], tune: [[0, 82], [1.5, 79], [2.5, 77], [3, 74]] }, // Ebmaj9
  { walk: [56, 54, 51, 49], chord: [54, 58, 60, 63], tune: [[0.5, 78], [2, 75], [3, 72]] }, // Ab9
  { walk: [50, 53, 57, 56], chord: [57, 60, 65], tune: [[0, 77], [1.5, 81], [3, 77]] }, // Dm7
  { walk: [55, 53, 50, 49], chord: [53, 56, 59, 62], tune: [[0.5, 80], [1.5, 77], [2.5, 74], [3, 71]] }, // G7b9
  { walk: [48, 51, 55, 54], chord: [58, 62, 63, 67], tune: [[0, 72], [1.5, 75], [2.5, 79], [3, 82]] }, // Cm9
  { walk: [53, 51, 48, 47], chord: [57, 60, 63, 67], tune: [[0.5, 81], [2, 79], [3, 75]] }, // F9
  { walk: [46, 50, 53, 55], chord: [55, 60, 62, 65], tune: [[0, 74], [1.5, 72], [2.5, 70], [3.5, 67]] }, // Bb6/9
  { walk: [48, 51, 53, 45], chord: [58, 60, 63, 67], tune: [[1.5, 72], [3, 70]] }, // Cm7 – F7sus
];

// Aurora, E major: eight slow chords of two bars each (Eadd9 – C#m7 – Amaj7 – Bsus – E/G# – Aadd9 – F#m9 – Bsus),
// and a few piano notes over them as [beat of the eight, note].
const AURORA: { bass: number; pad: number[]; notes: [number, number][] }[] = [
  { bass: 40, pad: [56, 59, 64, 66], notes: [[0, 71], [1.5, 78], [4, 80], [6.5, 76]] },
  { bass: 37, pad: [56, 59, 64, 68], notes: [[0, 76], [1.5, 75], [4, 71], [6, 68]] },
  { bass: 45, pad: [57, 61, 64, 68], notes: [[0, 73], [1.5, 76], [4, 80], [5.5, 78]] },
  { bass: 47, pad: [54, 59, 64, 66], notes: [[0, 78], [3, 76], [4, 71]] },
  { bass: 44, pad: [59, 64, 66, 71], notes: [[0, 83], [1.5, 80], [4, 78], [6.5, 76]] },
  { bass: 45, pad: [57, 59, 61, 64], notes: [[0, 73], [2, 71], [4, 76], [6, 73]] },
  { bass: 42, pad: [57, 61, 64, 68], notes: [[0, 69], [1.5, 73], [4, 76], [5.5, 80]] },
  { bass: 47, pad: [54, 59, 64, 66], notes: [[0, 78], [2, 76], [4, 71]] },
];

/**
 * One note struck again and again for `dur` seconds, the way a qanun or a santoor holds a long
 * note. `fade` below 1 lets it die away like a hammer bouncing on the string.
 */
function roll(strike: (t: number, vel: number) => void, t: number, dur: number, every: number, vel: number, fade = 1) {
  for (let i = 0; i * every < dur; i++) strike(t + i * every, i ? vel * 0.6 * Math.pow(fade, i) : vel);
}

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
  waltz: {
    bpm: 92,
    beats: 3,
    bar(s, n, t, beat) {
      const c = WALTZ[n % WALTZ.length];
      s.bass(c.bass, t, 0.9, beat * 2.6);
      s.pluck(c.bass + 12, t, 0.06, 2.4);
      [1, 2].forEach((b) => c.chord.forEach((m) => s.pluck(m, t + b * beat, 0.032, 1.6)));
      c.tune.forEach(([b, m]) => s.pluck(m, t + b * beat, 0.1, 3));
      if (n >= 4) s.strings(c.chord, t, beat * 3, 0.7, 0.9);
    },
  },
  guitar: {
    bpm: 88,
    beats: 4,
    bar(s, n, t, beat) {
      const c = GUITAR[n % GUITAR.length];
      s.bass(c.arp[0], t, 0.5, beat * 2);
      c.arp.forEach((m, i) => s.nylon(m, t + i * beat * 0.5, i % 4 ? 0.05 : 0.085, i % 4 ? 1.6 : 2.6));
      if (n >= 4) c.tune.forEach(([b, m]) => s.nylon(m, t + b * beat, 0.1, 2.4));
    },
  },
  koto: {
    bpm: 63,
    beats: 4,
    bar(s, n, t, beat) {
      const k = n % KOTO.length;
      const e = beat / 2;
      if (k % 4 === 0) s.pad([43, 50, 55], t, beat * 16, 0.45);
      s.koto(KOTO_LOW[k], t, 0.063, 3);
      s.koto(KOTO_LOW[k] + 12, t + beat * 2, 0.04, 2.4);
      KOTO[k].forEach((m, i) => m && s.koto(m, t + i * e, i % 2 ? 0.054 : 0.072));
      // A sweep across the strings closes each phrase: up into the next one, or back down to rest.
      if (k % 8 === 3) KOTO_STRINGS.forEach((m, i) => s.koto(m, t + beat * 3 + i * 0.05, 0.03, 1.6));
      if (k % 8 === 7) [...KOTO_STRINGS].reverse().forEach((m, i) => s.koto(m, t + beat * 2 + i * 0.05, 0.03, 1.6));
      if (n >= 4) KOTO_FLUTE.forEach(([b, m, len]) => b === k && s.flute(m, t, beat * 4 * len - 0.5));
    },
  },
  gamelan: {
    bpm: 72,
    beats: 4,
    bar(s, n, t, beat) {
      const k = n % GAMELAN.length;
      const row = GAMELAN[k];
      if (k % 4 === 0) {
        s.gong(46, t, 0.085);
        s.pad([46, 53], t, beat * 16, 0.5);
      }
      if (k % 4 === 2) s.gong(53, t, 0.045, 4);
      row.forEach((m, i) => s.metal(m, t + i * beat, 0.07));
      [0, 2].forEach((i) => s.metal(row[i] - 12, t + i * beat, 0.05, 3.2));
      if (n >= 2)
        [0, 2].forEach((i) => {
          [row[i], row[i + 1], row[i], row[i + 1]].forEach((m, j) => s.metal(m + 12, t + (i + j / 2) * beat, 0.03, 1.2));
        });
    },
  },
  kalimba: {
    bpm: 92,
    beats: 4,
    bar(s, n, t, beat) {
      const k = n % KALIMBA_TOP.length;
      const c = KALIMBA[k % KALIMBA.length];
      const p = beat / 3;
      [0, 2].forEach((b) => s.bass(c.bass, t + b * beat, 0.9, beat * 1.6));
      c.low.forEach((m, i) => s.mallet(m, t + i * beat, 0.072, 1.3));
      KALIMBA_TOP[k].forEach((m, i) => {
        if (!m) return;
        s.mallet(m, t + i * 2 * p, 0.084, 1.5);
        // The second eight bars are doubled by a marimba an octave down.
        if (k >= 8) s.mallet(m - 12, t + i * 2 * p, 0.06, 0.9);
      });
      if (n >= 4) {
        TIMELINE.forEach((i) => s.shaker(t + i * p, i ? 0.019 : 0.028));
        [0, 6].forEach((i) => s.thump(t + i * p, i ? 0.12 : 0.19, 150, 90, 0.22));
        [4, 5, 10, 11].forEach((i) => s.tek(t + i * p, 0.048, 380));
      }
    },
  },
  santoor: {
    bpm: 126,
    beats: 6,
    bar(s, n, t, beat) {
      const row = SANTOOR[n % SANTOOR.length];
      TANPURA.forEach((m, i) => s.tanpura(m, t + i * beat * 1.5));
      row.forEach(([b, m], i) => {
        const held = (row[i + 1]?.[0] ?? 6) - b;
        if (held >= 2) roll((at, vel) => s.santoor(m, at, vel, 1.8), t + b * beat, (held - 1) * beat, beat / 4, 0.105, 0.85);
        else s.santoor(m, t + b * beat, 0.105);
      });
      if (n >= 4)
        DADRA.forEach((bol, i) => {
          if (bol === "dha" || bol === "dhin") s.thump(t + i * beat, bol === "dha" ? 0.17 : 0.12, 85, 115, 0.3);
          s.tek(t + i * beat, bol === "tin" ? 0.042 : 0.055, 523);
        });
    },
  },
  qanun: {
    bpm: 76,
    beats: 4,
    bar(s, n, t, beat) {
      const k = n % QANUN.length;
      const e = beat / 2;
      if (k % 2 === 0) s.pad([43, 55, 62], t, beat * 8, 0.62);
      s.qanun(QANUN_LOW[k], t, 0.062, 2.4);
      QANUN[k].forEach(([b, m, held]) => {
        if (held >= 1.5) roll((at, vel) => s.qanun(m, at, vel, 0.9), t + b * beat, held * beat * 0.85, beat / 8, 0.076);
        else s.qanun(m, t + b * beat, 0.076, held > 0.5 ? 1.6 : 1.1);
        // Both hands, an octave apart, on the beat.
        if (b % 1 === 0) s.qanun(m - 12, t + b * beat, 0.036, 1.4);
      });
      // A phrase that ends on a long note is answered by three low strings.
      if (QANUN[k].length === 1) [0, 7, 12].forEach((up, i) => s.qanun(QANUN_LOW[k] + 12 + up, t + (3 + i / 3) * beat, 0.04, 1.6));
      if (n >= 2)
        WAHDA.forEach((hit, i) => {
          if (hit === "D") s.thump(t + i * e, 0.2, 105, 55, 0.45);
          if (hit === "T") s.tek(t + i * e, 0.055, 500);
        });
      if (n >= 4) for (let i = 0; i < 8; i++) s.shaker(t + i * e, i % 2 ? 0.01 : 0.018);
    },
  },
  lullaby: {
    bpm: 126,
    beats: 6,
    bar(s, n, t, beat) {
      const c = LULLABY[n % LULLABY.length];
      s.pad([c.bass + 12, ...c.chord], t, beat * 6, 0.4);
      s.bass(c.bass, t, 0.42, beat * 5);
      // The left hand rocks: low, high, middle, high.
      [0, 2, 3, 5].forEach((b, i) => s.celesta(c.chord[[0, 2, 1, 2][i]], t + b * beat, 0.024, 1.8));
      c.tune.forEach(([b, m]) => s.celesta(m, t + b * beat, 0.055, 2.8));
    },
  },
  jazz: {
    bpm: 108,
    beats: 4,
    bar(s, n, t, beat) {
      const k = n % JAZZ.length;
      const c = JAZZ[k];
      const sw = (b: number) => (b % 1 ? Math.floor(b) + 0.64 : b) * beat;
      c.walk.forEach((m, i) => {
        s.bass(m, t + i * beat, 0.85, beat * 1.1);
        s.nylon(m, t + i * beat, 0.03, 0.8);
      });
      // The chord on one, then pushed ahead of three, or of four in every other bar.
      c.chord.forEach((m) => s.keys(m, t, 0.026, 2));
      c.chord.forEach((m) => s.keys(m, t + sw(k % 2 ? 2.5 : 1.5), 0.02, 1.2));
      if (n >= 4) c.tune.forEach(([b, m]) => s.keys(m, t + sw(b), 0.055, 1.8));
      [0, 1, 1.5, 2, 3, 3.5].forEach((b) => s.shaker(t + sw(b), b % 1 ? 0.012 : 0.02));
      [1, 3].forEach((b) => s.brush(t + b * beat));
    },
  },
  aurora: {
    bpm: 54,
    beats: 4,
    bar(s, n, t, beat) {
      const i = Math.floor(n / 2) % AURORA.length;
      const c = AURORA[i];
      const half = n % 2;
      if (!half) {
        s.swell(c.pad, t, beat * 8, 1, 420, i % 2 ? 1300 : 1900);
        s.bass(c.bass, t, 0.8, beat * 7);
        s.bell(c.pad[3] + 12, t + beat * 2, 0.018, 5);
      }
      // Each piano note comes back twice, fainter, like a tape echo.
      if (n >= 2)
        c.notes.forEach(([b, m]) => {
          if (Math.floor(b / 4) !== half) return;
          [1, 0.4, 0.16].forEach((vel, j) => s.pluck(m, t + (b - half * 4 + j * 0.75) * beat, 0.085 * vel, 4));
        });
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
