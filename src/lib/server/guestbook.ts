import "server-only";

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { db, hasDb } from "@/lib/supabase/server";

// Guest replies to an invitation: RSVPs (only the host reads them, with the edit
// key or their account) and wishes for the couple (shown on the invitation).
// Supabase tables "rsvps" and "wishes" (supabase/schema.sql) in production; a
// JSON file in .data/ in development without Supabase keys.

export type Rsvp = {
  id: number;
  name: string;
  /** yes or no */
  attending: "yes" | "no";
  /** People coming, including the guest (0 when not attending). */
  guests: number;
  /** Which functions they're coming to, by the invitation's own event ids. */
  events: string[];
  phone: string | null;
  note: string | null;
  createdAt: number;
};

export type Wish = { id: number; name: string; message: string; createdAt: number };

export type NewRsvp = Omit<Rsvp, "id" | "createdAt">;
export type NewWish = Omit<Wish, "id" | "createdAt">;

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

/** Validates a guest's RSVP form. */
export function parseRsvp(body: unknown, eventIds: string[] | null): { ok: true; rsvp: NewRsvp } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = clip(b.name, 80);
  if (!name) return { ok: false, error: "Please write your name." };
  const attending = b.attending === "no" ? "no" : b.attending === "yes" ? "yes" : null;
  if (!attending) return { ok: false, error: "Please say whether you can come." };
  const n = Math.round(Number(b.guests));
  const guests = attending === "no" ? 0 : Number.isFinite(n) ? Math.min(30, Math.max(1, n)) : 1;
  const raw = Array.isArray(b.events) ? b.events.filter((e): e is string => typeof e === "string").map((e) => e.slice(0, 40)) : [];
  const events = attending === "no" ? [] : [...new Set(eventIds ? raw.filter((e) => eventIds.includes(e)) : raw)].slice(0, 12);
  if (attending === "yes" && eventIds && eventIds.length > 1 && !events.length) return { ok: false, error: "Please choose the functions you'll attend." };
  const phone = clip(b.phone, 30) || null;
  const note = clip(b.note, 300) || null;
  return { ok: true, rsvp: { name, attending, guests, events, phone, note } };
}

/** Validates a wish for the couple. */
export function parseWish(body: unknown): { ok: true; wish: NewWish } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = clip(b.name, 60);
  const message = typeof b.message === "string" ? b.message.trim().slice(0, 400) : "";
  if (!name) return { ok: false, error: "Please write your name." };
  if (message.length < 2) return { ok: false, error: "Please write a few words." };
  return { ok: true, wish: { name, message } };
}

type Book = {
  addRsvp(slug: string, r: NewRsvp): Promise<void>;
  rsvps(slug: string): Promise<Rsvp[]>;
  addWish(slug: string, w: NewWish): Promise<Wish>;
  wishes(slug: string, limit?: number): Promise<Wish[]>;
  removeWish(slug: string, id: number): Promise<void>;
};

const fail = (what: string, e: { message: string }) => {
  throw new Error(`guestbook ${what}: ${e.message}`);
};

function supabaseBook(): Book {
  return {
    async addRsvp(slug, r) {
      const { error } = await db().from("rsvps").insert({ slug, name: r.name, attending: r.attending, guests: r.guests, events: r.events, phone: r.phone, note: r.note });
      if (error) fail("addRsvp", error);
    },
    async rsvps(slug) {
      const { data, error } = await db().from("rsvps").select("id, name, attending, guests, events, phone, note, created_at").eq("slug", slug).order("created_at", { ascending: false }).limit(2000);
      if (error) fail("rsvps", error);
      return (data ?? []).map((r) => ({ ...r, events: r.events ?? [], createdAt: Date.parse(r.created_at) }) as Rsvp);
    },
    async addWish(slug, w) {
      const { data, error } = await db().from("wishes").insert({ slug, name: w.name, message: w.message }).select("id, created_at").single();
      if (error) fail("addWish", error);
      return { ...w, id: data!.id, createdAt: Date.parse(data!.created_at) };
    },
    async wishes(slug, limit = 60) {
      const { data, error } = await db().from("wishes").select("id, name, message, created_at").eq("slug", slug).eq("hidden", false).order("created_at", { ascending: false }).limit(limit);
      if (error) fail("wishes", error);
      return (data ?? []).map((w) => ({ id: w.id, name: w.name, message: w.message, createdAt: Date.parse(w.created_at) }));
    },
    async removeWish(slug, id) {
      const { error } = await db().from("wishes").update({ hidden: true }).eq("slug", slug).eq("id", id);
      if (error) fail("removeWish", error);
    },
  };
}

type FileBook = { rsvps: Record<string, Rsvp[]>; wishes: Record<string, (Wish & { hidden?: boolean })[]>; seq: number };

function fileBook(): Book {
  const dir = join(process.cwd(), ".data");
  const file = join(dir, "guestbook.json");
  const load = (): FileBook => {
    try {
      return JSON.parse(readFileSync(file, "utf8")) as FileBook;
    } catch {
      return { rsvps: {}, wishes: {}, seq: 0 };
    }
  };
  const save = (s: FileBook) => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, JSON.stringify(s, null, 1));
  };
  return {
    async addRsvp(slug, r) {
      const s = load();
      (s.rsvps[slug] ??= []).unshift({ ...r, id: ++s.seq, createdAt: Date.now() });
      save(s);
    },
    async rsvps(slug) {
      return load().rsvps[slug] ?? [];
    },
    async addWish(slug, w) {
      const s = load();
      const wish = { ...w, id: ++s.seq, createdAt: Date.now() };
      (s.wishes[slug] ??= []).unshift(wish);
      save(s);
      return wish;
    },
    async wishes(slug, limit = 60) {
      return (load().wishes[slug] ?? []).filter((w) => !w.hidden).slice(0, limit);
    },
    async removeWish(slug, id) {
      const s = load();
      const w = s.wishes[slug]?.find((x) => x.id === id);
      if (w) w.hidden = true;
      save(s);
    },
  };
}

let cached: Book | null | undefined;

export function getGuestbook(): Book | null {
  if (cached !== undefined) return cached;
  if (hasDb()) cached = supabaseBook();
  else if (process.env.NODE_ENV !== "production" || process.env.DWM_INVITE_FILE_STORE === "1") cached = fileBook();
  else cached = null;
  return cached;
}
