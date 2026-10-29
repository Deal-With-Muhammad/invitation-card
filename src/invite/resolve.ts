import { copyFor, type Copy } from "./i18n";
import { formatDate, hijriDate, plainSpaces, zonedToUtc } from "./time";
import type { EventItem, InviteData, Lang, Occasion } from "./types";

// Turns saved data + the guest's language into exactly what a template prints,
// so templates never deal with fallbacks, formatting or time zones themselves.

export type ResolvedEvent = {
  id: string;
  title: string;
  /** "Saturday" */
  weekday: string;
  /** "12 December 2026" */
  dateLong: string;
  /** Pieces for templates that set the date as a block. */
  day: string;
  month: string;
  monthShort: string;
  year: string;
  /** "7:30 PM – 11:00 PM", or the "All day" label. */
  time: string;
  startTime: string;
  hijri: string;
  venue: string;
  address: string;
  note: string;
  /** UTC instants, or null when the date isn't filled in yet. */
  start: number | null;
  end: number | null;
  allDay: boolean;
  mapQuery: string;
  links: { google: string; waze: string; embed: string };
  raw: EventItem;
};

export type ResolvedPerson = { name: string; full: string; line: string };

export type Resolved = {
  data: InviteData;
  lang: Lang;
  dir: "ltr" | "rtl";
  locale: string;
  t: Copy["ui"];
  occasion: Occasion;
  occasionLabel: string;
  title: string;
  inviteLine: string;
  hosts: string[];
  people: ResolvedPerson[];
  /** "Zara & Ibrahim" */
  names: string;
  milestone: string;
  message: string;
  closing: string;
  events: ResolvedEvent[];
  main: ResolvedEvent | null;
  /** True when every event shares one venue, so templates can show it once. */
  oneVenue: boolean;
  /**
   * The date line for a hero. One day: "Saturday", "26 December 2026", "7:30 PM".
   * Several days: weekday and time are empty and `date` is a range ("24 – 27 December 2026").
   */
  when: { weekday: string; date: string; time: string; multi: boolean };
  dress: { title: string; note: string; colors: string[] };
  prayer: { text: string; arabic: string };
  gifts: { title: string; note: string };
  show: InviteData["show"] & { bismillah: boolean; salam: boolean };
};

const MARRIAGE: Occasion[] = ["wedding", "nikah", "walima", "mehndi", "engagement", "reception", "anniversary"];
const CHILD: Occasion[] = ["aqiqah", "babyshower"];

const MARRIAGE_DUA = "بَارَكَ اللَّهُ لَهُمَا وَبَارَكَ عَلَيْهِمَا وَجَمَعَ بَيْنَهُمَا فِي خَيْرٍ";
const CHILD_DUA = "اللَّهُمَّ اجْعَلْهُ مُبَارَكًا وَأَنْبِتْهُ نَبَاتًا حَسَنًا";

export const defaultArabicPrayer = (occasion: Occasion) =>
  MARRIAGE.includes(occasion) ? MARRIAGE_DUA : CHILD.includes(occasion) ? CHILD_DUA : "";

// Most of our guests read 12-hour times ("7:30 PM"); these languages expect 24-hour.
const H24 = ["fr", "es", "pt", "tr", "fa"];
const hour12 = (locale: string) => !H24.includes(locale.slice(0, 2));

export const defaultPrayerText = (occasion: Occasion, c: Copy) =>
  MARRIAGE.includes(occasion) ? c.defaults.marriagePrayer : CHILD.includes(occasion) ? c.defaults.childPrayer : "";

const val = (custom: string | null | undefined, fallback: string) => (custom == null ? fallback : custom);

export function mapLinks(query: string, mapUrl: string) {
  const q = encodeURIComponent(query);
  return {
    google: mapUrl && !/waze\.com/.test(mapUrl) ? mapUrl : `https://www.google.com/maps/search/?api=1&query=${q}`,
    waze: mapUrl && /waze\.com/.test(mapUrl) ? mapUrl : `https://waze.com/ul?q=${q}&navigate=yes`,
    embed: `https://maps.google.com/maps?q=${q}&z=15&output=embed`,
  };
}

// In right-to-left text a Latin time like "3:00 PM – 5:00 PM" gets reordered by the
// bidi algorithm ("PM 3:00 – PM 5:00"). Isolating it left-to-right keeps it intact.
const isolate = (s: string, rtl: boolean) => (rtl && /[A-Za-z]/.test(s) ? `\u2066${s}\u2069` : s);

function resolveEvent(e: EventItem, c: Copy, occasion: Occasion, locale: string, tz: string): ResolvedEvent {
  const rtl = c.meta.dir === "rtl";
  const allDay = !e.start;
  const start = zonedToUtc(e.date, e.start || "12:00", tz);
  const endRaw = e.end ? zonedToUtc(e.date, e.end, tz) : null;
  // An end time earlier than the start means the party runs past midnight.
  const end = start != null && endRaw != null ? (endRaw <= start ? endRaw + 86_400_000 : endRaw) : null;
  const f = (opts: Intl.DateTimeFormatOptions) => (start == null ? "" : formatDate(start, locale, tz, opts));
  const clock = (ms: number | null) =>
    ms == null ? "" : formatDate(ms, locale, tz, { hour: "numeric", minute: "2-digit", hour12: hour12(locale) });
  const startTime = allDay ? "" : isolate(clock(start), rtl);
  const time = allDay ? c.ui.allDay : isolate(end != null ? `${clock(start)} – ${clock(end)}` : clock(start), rtl);
  const mapQuery = [e.venue, e.address].filter(Boolean).join(", ").replace(/\s*\n\s*/g, ", ");
  return {
    id: e.id,
    title: e.title || c.occasions[occasion].event,
    weekday: f({ weekday: "long" }),
    dateLong: f({ day: "numeric", month: "long", year: "numeric" }),
    day: f({ day: "numeric" }),
    month: f({ month: "long" }),
    monthShort: f({ month: "short" }),
    year: f({ year: "numeric" }),
    time,
    startTime,
    hijri: start == null ? "" : hijriDate(start, locale, tz),
    venue: e.venue,
    address: e.address,
    note: e.note,
    start: allDay && start != null ? zonedToUtc(e.date, "00:00", tz) : start,
    end,
    allDay,
    mapQuery,
    links: mapLinks(mapQuery || e.venue, e.mapUrl),
    raw: e,
  };
}

export function resolve(data: InviteData, lang: Lang = data.lang): Resolved {
  const c = copyFor(lang);
  const occ = c.occasions[data.occasion] ?? c.occasions.party;
  const locale = c.meta.locale;
  const tz = data.timeZone || "Asia/Kuala_Lumpur";
  const hosts = data.hosts
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const people = data.people
    .filter((p) => p.name.trim() || p.full.trim())
    .map((p) => ({
      name: p.name.trim() || p.full.trim().split(/\s+/)[0],
      full: p.full.trim() || p.name.trim(),
      line: p.parents.trim()
        ? p.relation === "none"
          ? p.parents.trim()
          : `${p.relation === "son" ? c.ui.son : c.ui.daughter} ${p.parents.trim()}`
        : "",
    }));

  const events = data.events.map((e) => resolveEvent(e, c, data.occasion, locale, tz));
  const venues = new Set(events.map((e) => `${e.venue}|${e.address}`.toLowerCase()));

  const dated = events.filter((e) => e.start != null);
  const first = dated[0] ?? null;
  const last = dated.length ? dated.reduce((a, b) => ((b.start ?? 0) > (a.start ?? 0) ? b : a)) : null;
  const multi = !!first && !!last && first.raw.date !== last.raw.date;
  let range = first?.dateLong ?? "";
  if (multi && first?.start != null && last?.start != null) {
    try {
      range = plainSpaces(
        new Intl.DateTimeFormat(locale, { timeZone: tz, day: "numeric", month: "long", year: "numeric" }).formatRange(
          new Date(Math.min(first.start, last.start)),
          new Date(Math.max(first.start, last.start)),
        ),
      );
    } catch {
      range = `${first.dateLong} – ${last.dateLong}`;
    }
  }
  const when = multi
    ? { weekday: "", date: range, time: "", multi: true }
    : { weekday: first?.weekday ?? "", date: first?.dateLong ?? "", time: first?.startTime || first?.time || "", multi: false };


  return {
    data,
    lang,
    dir: c.meta.dir === "rtl" ? "rtl" : "ltr",
    locale,
    t: c.ui,
    occasion: data.occasion,
    occasionLabel: occ.label,
    title: val(data.title, occ.title),
    inviteLine: val(data.inviteLine, hosts.length ? occ.invite : occ.inviteSolo),
    hosts,
    people,
    names: people.map((p) => p.name).join(` ${c.ui.and} `),
    milestone: data.milestone.trim(),
    message: val(data.message, occ.message),
    closing: val(data.closing, occ.closing),
    events,
    main: events[0] ?? null,
    oneVenue: venues.size <= 1,
    when,
    dress: {
      title: val(data.dress.title, c.defaults.dressTitle),
      note: val(data.dress.note, c.defaults.dressNote),
      colors: data.dress.colors,
    },
    prayer: {
      text: val(data.prayer.text, defaultPrayerText(data.occasion, c)),
      arabic: val(data.prayer.arabic, defaultArabicPrayer(data.occasion)),
    },
    gifts: {
      title: val(data.gifts.title, c.defaults.giftsTitle),
      note: val(data.gifts.note, c.defaults.giftsNote),
    },
    show: {
      ...data.show,
      bismillah: data.bismillah !== "none",
      salam: data.salam,
      schedule: data.show.schedule && data.schedule.some((s) => s.title.trim()),
      dress: data.show.dress,
      contacts: data.show.contacts && data.contacts.some((x) => x.phone.trim()),
      calendar: data.show.calendar && events.some((e) => e.start != null),
      countdown: data.show.countdown && events[0]?.start != null,
    },
  };
}
