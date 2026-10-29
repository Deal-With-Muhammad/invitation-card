// Dates are saved as wall-clock time in the event's own time zone ("2026-12-12",
// "19:30", "Asia/Kuala_Lumpur"), so a guest abroad still sees the time printed on
// the card. These helpers turn that into real instants for the countdown and the
// calendar files, and format it for each language.

const partsIn = (ms: number, timeZone: string) => {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const get = (type: string, parts: Intl.DateTimeFormatPart[]) => Number(parts.find((p) => p.type === type)?.value);
  const p = f.formatToParts(new Date(ms));
  return Date.UTC(get("year", p), get("month", p) - 1, get("day", p), get("hour", p) % 24, get("minute", p), get("second", p));
};

/** How far `timeZone` is ahead of UTC at the instant `ms`. */
function offsetMs(ms: number, timeZone: string) {
  try {
    return partsIn(ms, timeZone) - ms;
  } catch {
    return 0;
  }
}

export function validTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{2}):(\d{2})$/;

/** The UTC instant for a wall-clock date + time in `timeZone`, or null if the date is incomplete. */
export function zonedToUtc(date: string, time: string, timeZone: string): number | null {
  const d = DATE_RE.exec(date);
  if (!d) return null;
  const t = TIME_RE.exec(time) ?? ["", "00", "00"];
  const guess = Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
  const first = offsetMs(guess, timeZone);
  let utc = guess - first;
  const second = offsetMs(utc, timeZone);
  if (second !== first) utc = guess - second;
  return utc;
}

/**
 * Node and browsers ship different ICU versions that disagree on thin and
 * non-breaking spaces ("7:30\u202fPM", "24\u2009–\u200926"). Plain spaces keep the
 * server-rendered text identical to the browser's, so hydration matches.
 */
export const plainSpaces = (s: string) => s.replace(/[\u2009\u202f\u00a0]/g, " ");

export function formatDate(ms: number, locale: string, timeZone: string, opts: Intl.DateTimeFormatOptions) {
  try {
    return plainSpaces(new Intl.DateTimeFormat(locale, { timeZone, ...opts }).format(new Date(ms)));
  } catch {
    return plainSpaces(new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts }).format(new Date(ms)));
  }
}

/** "18 Jumada al-Ula 1448 AH" in the guest's language. */
export function hijriDate(ms: number, locale: string, timeZone: string) {
  const base = locale.split("-u-")[0];
  try {
    return plainSpaces(
      new Intl.DateTimeFormat(`${base}-u-ca-islamic-umalqura`, {
        timeZone,
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(ms)),
    );
  } catch {
    return "";
  }
}

/** A date a few weeks out on a Saturday, for sample invitations. Stable for a whole day. */
export function sampleDate(weeks = 8) {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + weeks * 7));
  d.setUTCDate(d.getUTCDate() + ((6 - d.getUTCDay() + 7) % 7));
  return d.toISOString().slice(0, 10);
}

export const addDays = (date: string, days: number) => {
  const d = DATE_RE.exec(date);
  if (!d) return date;
  return new Date(Date.UTC(+d[1], +d[2] - 1, +d[3] + days)).toISOString().slice(0, 10);
};

export function guessTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kuala_Lumpur";
  } catch {
    return "Asia/Kuala_Lumpur";
  }
}
