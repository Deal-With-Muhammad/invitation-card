"use client";

import { useEffect, useRef, useState } from "react";

import type { Copy } from "../i18n";
import type { Resolved } from "../resolve";
import { downloadIcs, googleCalendarUrl, icsFile } from "./calendar";

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

export function Countdown({ target, t }: { target: number; t: Copy["ui"] }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(target - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (left != null && left <= 0) {
    const sameDay = left > -86_400_000;
    return <p className="inv-cd-done rv">{sameDay ? t.today : t.passed}</p>;
  }

  const s = left == null ? 0 : Math.floor(left / 1000);
  const units: [string, number][] = [
    [t.days, Math.floor(s / 86400)],
    [t.hours, Math.floor((s % 86400) / 3600)],
    [t.minutes, Math.floor((s % 3600) / 60)],
    [t.seconds, s % 60],
  ];
  return (
    <div className="inv-cd rv" role="timer">
      {units.map(([label, v], i) => (
        <div key={i} className="inv-cd-unit">
          <b suppressHydrationWarning>{left == null ? "--" : i === 0 ? String(v) : pad(v)}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function CalendarButton({ r }: { r: Resolved }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const events = r.events.filter((e) => e.start != null);
  if (!events.length) return null;
  const titleFor = (e: (typeof events)[number]) => (r.names ? `${e.title}: ${r.names}` : e.title);
  const url = typeof window === "undefined" ? "" : window.location.href.split("#")[0];
  const details = [r.title, r.names, url].filter(Boolean).join("\n");

  return (
    <div className="inv-cal-wrap" ref={ref}>
      <button type="button" className="inv-btn is-primary" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
        {r.t.addToCalendar}
      </button>
      {open && (
        <div className="inv-cal-menu" role="menu">
          {events.map((e) => (
            <a
              key={e.id}
              role="menuitem"
              href={googleCalendarUrl(e, titleFor(e), details)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              {r.t.googleCalendar}
              {events.length > 1 && <small>{e.title}</small>}
            </a>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              downloadIcs(icsFile(events, titleFor, details, url), `${(r.names || "invitation").replace(/[^\w-]+/g, "-")}.ics`);
              setOpen(false);
            }}
          >
            {r.t.otherCalendar}
          </button>
        </div>
      )}
    </div>
  );
}
