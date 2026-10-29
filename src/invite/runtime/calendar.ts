import type { ResolvedEvent } from "../resolve";

// "Add to calendar": a Google Calendar link per event, and one .ics file with every
// event for Apple Calendar, Outlook and everything else.

const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const dayStamp = (ms: number) => stamp(ms).slice(0, 8);
const HOUR = 3_600_000;

const range = (e: ResolvedEvent) => {
  const start = e.start ?? Date.now();
  const end = e.end ?? start + (e.allDay ? 24 : 3) * HOUR;
  return { start, end };
};

const place = (e: ResolvedEvent) => [e.venue, e.address.replace(/\s*\n\s*/g, ", ")].filter(Boolean).join(", ");

export function googleCalendarUrl(e: ResolvedEvent, title: string, details: string) {
  const { start, end } = range(e);
  const dates = e.allDay ? `${dayStamp(start)}/${dayStamp(end)}` : `${stamp(start)}/${stamp(end)}`;
  const p = new URLSearchParams({ action: "TEMPLATE", text: title, dates, details, location: place(e) });
  return `https://calendar.google.com/calendar/render?${p}`;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

// Lines longer than 75 octets must be folded (RFC 5545).
const fold = (line: string) => {
  const out: string[] = [];
  let rest = line;
  while (new TextEncoder().encode(rest).length > 74) {
    let cut = 74;
    while (new TextEncoder().encode(rest.slice(0, cut)).length > 74) cut--;
    out.push(rest.slice(0, cut));
    rest = ` ${rest.slice(cut)}`;
  }
  out.push(rest);
  return out.join("\r\n");
};

export function icsFile(events: ResolvedEvent[], titleFor: (e: ResolvedEvent) => string, details: string, url: string) {
  const now = stamp(Date.now());
  const body = events
    .filter((e) => e.start != null)
    .flatMap((e, i) => {
      const { start, end } = range(e);
      return [
        "BEGIN:VEVENT",
        `UID:${e.id}-${i}@invite.dealwithmuhammad.com`,
        `DTSTAMP:${now}`,
        e.allDay ? `DTSTART;VALUE=DATE:${dayStamp(start)}` : `DTSTART:${stamp(start)}`,
        e.allDay ? `DTEND;VALUE=DATE:${dayStamp(end)}` : `DTEND:${stamp(end)}`,
        `SUMMARY:${esc(titleFor(e))}`,
        `DESCRIPTION:${esc(details)}`,
        `LOCATION:${esc(place(e))}`,
        url ? `URL:${url}` : "",
        "END:VEVENT",
      ].filter(Boolean);
    });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DWM Invite//EN", "CALSCALE:GREGORIAN", ...body, "END:VCALENDAR"]
    .map(fold)
    .join("\r\n");
}

export function downloadIcs(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
