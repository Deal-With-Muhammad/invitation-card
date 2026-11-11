"use client";

import { Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PlayGlyph } from "@/components/live-thumb";
import { TRACK_INFO, trackSections } from "@/invite/music-tracks";
import { Music } from "@/invite/runtime/music";
import type { MusicTrack } from "@/invite/types";

import { groupLabel } from "./fields";

const PREVIEW_MS = 25_000;

/**
 * Every track with a name, a line on its mood and a listen button, under a heading for
 * its feel; the piece made for the design comes first. One plays at a time.
 */
export function MusicPicker({ value, suggested, onChange }: { value: MusicTrack; suggested: MusicTrack; onChange: (t: MusicTrack) => void }) {
  const [playing, setPlaying] = useState<MusicTrack | null>(null);
  const music = useRef<Music | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const stop = () => {
    window.clearTimeout(timer.current);
    music.current?.dispose();
    music.current = null;
    setPlaying(null);
  };

  const listen = (t: MusicTrack) => {
    if (playing === t) return stop();
    stop();
    music.current = new Music(t);
    void music.current.play();
    setPlaying(t);
    timer.current = window.setTimeout(stop, PREVIEW_MS);
  };

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      music.current?.dispose();
    },
    [],
  );

  return (
    <div role="radiogroup" aria-label="Music">
      <p className={groupLabel}>Music</p>
      <div className="space-y-3.5">
        {trackSections(suggested).map((section) => (
          <div key={section.title} role="group" aria-label={section.title}>
            <p className="mb-1.5 text-[13px] font-medium text-muted">{section.title}</p>
            <ul className="space-y-1.5">
              {section.tracks.map((t) => {
                const on = value === t;
                const info = TRACK_INFO[t];
                return (
                  <li key={t} className={`flex items-center gap-3 rounded-2xl border p-2.5 ps-3 transition-colors ${on ? "border-brand bg-brand/8" : "border-line bg-card hover:bg-paper-2"}`}>
                    <button type="button" role="radio" aria-checked={on} onClick={() => onChange(t)} className="flex min-w-0 flex-1 items-start gap-3 text-start">
                      <span aria-hidden className={`mt-1 grid size-4 flex-none place-items-center rounded-full border-2 ${on ? "border-brand" : "border-line"}`}>
                        {on && <span className="size-2 rounded-full bg-brand" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14.5px] font-medium">{info.name}</span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{info.mood}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => listen(t)}
                      aria-label={playing === t ? `Stop ${info.name}` : `Listen to ${info.name}`}
                      className={`grid size-9 flex-none place-items-center rounded-full transition-colors ${playing === t ? "bg-brand text-ivory" : "bg-paper-2 text-ink hover:bg-brand hover:text-ivory"}`}
                    >
                      {playing === t ? <Pause className="size-3.5 fill-current" strokeWidth={0} /> : <PlayGlyph className="size-4" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[12.5px] text-muted">Tap play to listen. Guests hear it once they open the invitation, and can pause it.</p>
    </div>
  );
}
