import { z } from "zod";

import { validTimeZone } from "./time";
import { LANGS, MUSIC_TRACKS, OCCASIONS, type InviteData } from "./types";

// Server-side check of everything an invitation can contain. Text is only ever
// rendered as text, and the only links a guest can follow are map links on known
// map hosts, so a shared invitation can't be turned into a phishing page.

const text = (max: number) => z.string().max(max).transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ""));
const maybe = (max: number) => text(max).nullable();
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const MAP_HOSTS = /^(?:[a-z0-9-]+\.)*(?:google\.[a-z.]+|goo\.gl|maps\.app\.goo\.gl|waze\.com|apple\.com|openstreetmap\.org)$/i;
const mapUrl = text(600).refine((s) => {
  if (!s) return true;
  try {
    const u = new URL(s);
    return u.protocol === "https:" && MAP_HOSTS.test(u.hostname);
  } catch {
    return false;
  }
}, "Use a Google Maps, Waze or Apple Maps link");

const dateStr = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/);
const timeStr = z.string().regex(/^(\d{2}:\d{2})?$/);

export const inviteSchema = z.object({
  v: z.literal(1),
  template: z.string().regex(/^[a-z0-9-]{2,32}$/),
  occasion: z.enum(OCCASIONS),
  look: z.object({
    palette: z.string().regex(/^[a-z0-9-]{1,32}$/),
    colors: z.object({ bg: color, ink: color, accent: color }).nullable(),
    namesFont: z.string().regex(/^[a-z0-9-]{0,32}$/),
    opening: z.boolean(),
  }),
  lang: z.enum(LANGS),
  langs: z.array(z.enum(LANGS)).min(1).max(LANGS.length),
  bismillah: z.enum(["none", "calligraphy", "arabic"]),
  salam: z.boolean(),
  title: maybe(80),
  hosts: text(300),
  inviteLine: maybe(240),
  people: z
    .array(
      z.object({
        name: text(40),
        full: text(80),
        relation: z.enum(["son", "daughter", "none"]),
        parents: text(120),
      }),
    )
    .min(1)
    .max(2),
  milestone: text(30),
  message: maybe(700),
  events: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9]{1,16}$/),
        title: text(50),
        date: dateStr,
        start: timeStr,
        end: timeStr,
        venue: text(100),
        address: text(240),
        mapUrl,
        note: text(200),
      }),
    )
    .min(1)
    .max(8),
  timeZone: z.string().max(64).refine(validTimeZone),
  schedule: z.array(z.object({ time: text(20), title: text(80) })).max(12),
  dress: z.object({ title: maybe(60), note: maybe(300), colors: z.array(color).max(6) }),
  contacts: z.array(z.object({ name: text(50), phone: text(24) })).max(4),
  prayer: z.object({ text: maybe(400), arabic: maybe(300) }),
  gifts: z.object({ title: maybe(80), note: maybe(400) }),
  closing: maybe(200),
  show: z.object({
    countdown: z.boolean(),
    calendar: z.boolean(),
    map: z.boolean(),
    schedule: z.boolean(),
    dress: z.boolean(),
    contacts: z.boolean(),
    prayer: z.boolean(),
    gifts: z.boolean(),
    hijri: z.boolean(),
    rsvp: z.boolean().optional(),
    wishes: z.boolean().optional(),
  }),
  music: z.object({ on: z.boolean(), track: z.enum(MUSIC_TRACKS) }),
  autoScroll: z.object({ on: z.boolean(), speed: z.union([z.literal(1), z.literal(2), z.literal(3)]) }),
});

export function parseInvite(input: unknown): { ok: true; data: InviteData } | { ok: false; error: string } {
  const r = inviteSchema.safeParse(input);
  if (!r.success) {
    const first = r.error.issues[0];
    return { ok: false, error: `${first?.path.join(".") || "invite"}: ${first?.message ?? "invalid"}` };
  }
  const data = r.data as InviteData;
  if (!data.langs.includes(data.lang)) data.langs = [data.lang, ...data.langs];
  data.langs = [...new Set(data.langs)];
  return { ok: true, data };
}
