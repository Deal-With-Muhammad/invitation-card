import type { MusicTrack } from "../types";

// Background music, synthesised live with Web Audio, so there is no audio file to
// download and no copyright to worry about. Three moods share one chord loop:
// harp (plucked arpeggios + bells), piano (warmer, slower) and music box (bells only).

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

type Bar = { bass: number; pad: number[]; arp: number[]; mel: [number, number][] };

// D major: I – vi – IV – V – I/3 – ii – IV – Vsus
const BARS: Bar[] = [
  { bass: 38, pad: [62, 66, 69, 73], arp: [50, 57, 62, 66, 69, 66, 62, 57], mel: [[0, 78], [2, 76], [3, 74]] },
  { bass: 35, pad: [59, 62, 66, 69], arp: [47, 54, 59, 62, 66, 62, 59, 54], mel: [[0, 74], [1.5, 73], [2, 71]] },
  { bass: 43, pad: [59, 62, 66, 67], arp: [43, 50, 55, 59, 62, 66, 62, 59], mel: [[0, 71], [1, 74], [2, 79]] },
  { bass: 45, pad: [57, 61, 64, 69], arp: [45, 52, 57, 61, 64, 61, 57, 52], mel: [[0, 78], [2, 76]] },
  { bass: 42, pad: [57, 62, 66, 69], arp: [42, 50, 54, 57, 62, 57, 54, 50], mel: [[0, 78], [1, 81], [2, 78], [3, 76]] },
  { bass: 40, pad: [59, 62, 64, 67], arp: [40, 47, 52, 55, 59, 55, 52, 47], mel: [[0, 74], [2, 71], [3, 74]] },
  { bass: 43, pad: [59, 62, 66, 67], arp: [43, 50, 55, 59, 62, 66, 62, 59], mel: [[0, 76], [1.5, 74], [2, 71]] },
  { bass: 45, pad: [57, 62, 64, 69], arp: [45, 52, 57, 62, 64, 61, 57, 52], mel: [[0, 73], [2, 69]] },
];

const STYLE: Record<MusicTrack, { bpm: number; pluck: number; bell: number; pad: number; bass: number; shift: number }> = {
  harp: { bpm: 66, pluck: 1, bell: 1, pad: 1, bass: 1, shift: 0 },
  piano: { bpm: 58, pluck: 1.3, bell: 0.35, pad: 0.7, bass: 0.8, shift: -12 },
  musicbox: { bpm: 76, pluck: 0, bell: 1.3, pad: 0.35, bass: 0, shift: 12 },
};

class Synth {
  ctx: AudioContext;
  private master: GainNode;
  private dry: GainNode;
  private wet: GainNode;
  private timer: number | null = null;
  private nextBar = 0;
  private barIndex = 0;
  private s: (typeof STYLE)[MusicTrack];
  private beat: number;

  constructor(track: MusicTrack) {
    this.s = STYLE[track];
    this.beat = 60 / this.s.bpm;
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

  private out(g: GainNode, wet = 1) {
    g.connect(this.dry);
    const s = this.ctx.createGain();
    s.gain.value = wet;
    g.connect(s).connect(this.wet);
  }

  private pluck(m: number, t: number, vel: number, decay: number) {
    const c = this.ctx;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    const o1 = c.createOscillator();
    o1.type = "sine";
    o1.frequency.value = mtof(m);
    const o2 = c.createOscillator();
    o2.type = "triangle";
    o2.frequency.value = mtof(m) * 2;
    const g2 = c.createGain();
    g2.gain.value = 0.18;
    o1.connect(g);
    o2.connect(g2).connect(g);
    this.out(g, 0.8);
    o1.start(t);
    o2.start(t);
    o1.stop(t + decay + 0.1);
    o2.stop(t + decay + 0.1);
  }

  bell(m: number, t: number, vel = 0.07, decay = 3.2) {
    const c = this.ctx;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    [1, 2.76, 5.4].forEach((ratio, i) => {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = mtof(m) * ratio;
      const pg = c.createGain();
      pg.gain.value = [1, 0.16, 0.05][i];
      o.connect(pg).connect(g);
      o.start(t);
      o.stop(t + decay + 0.1);
    });
    this.out(g, 1.2);
  }

  private pad(notes: number[], t: number, dur: number, level: number) {
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
    notes.forEach((m) =>
      [-6, 6].forEach((det) => {
        const o = c.createOscillator();
        o.type = "triangle";
        o.frequency.value = mtof(m);
        o.detune.value = det;
        o.connect(lp);
        o.start(t);
        o.stop(t + dur + 1.4);
      }),
    );
  }

  private bass(m: number, t: number, level: number) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = mtof(m);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16 * level, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + this.beat * 4);
    o.connect(g);
    this.out(g, 0.3);
    o.start(t);
    o.stop(t + this.beat * 4 + 0.1);
  }

  private scheduleBar(t: number, n: number) {
    const { s, beat } = this;
    const bar = BARS[n % BARS.length];
    if (s.bass) this.bass(bar.bass, t, s.bass);
    if (s.pad) this.pad(bar.pad, t, beat * 4, s.pad);
    if (s.pluck)
      bar.arp.forEach((m, i) => this.pluck(m + s.shift, t + i * beat * 0.5, (i === 0 ? 0.11 : 0.075) * s.pluck, s.pluck > 1 ? 2.6 : 1.8));
    if (s.bell && (n >= 4 || !s.pluck))
      bar.mel.forEach(([b, m]) => this.bell(m + (s.pluck ? 0 : s.shift - 12), t + b * beat, 0.075 * s.bell));
    if (!s.pluck) bar.arp.slice(0, 4).forEach((m, i) => this.bell(m + 24, t + i * beat, 0.03, 1.6));
  }

  private tick = () => {
    while (this.nextBar < this.ctx.currentTime + 0.4) {
      this.scheduleBar(this.nextBar, this.barIndex++);
      this.nextBar += this.beat * 4;
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
}

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
