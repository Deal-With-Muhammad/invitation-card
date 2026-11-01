import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { InviteData } from "@/invite/types";
import { db, hasDb } from "@/lib/supabase/server";

import type { VisitInfo } from "./visitor";

// Where shared invitations live: the Supabase "invites" table in production
// (schema in supabase/schema.sql). In development without Supabase keys, a JSON
// file in .data/ so links survive restarts.

/** Visits each invitation includes. Every time the link is opened counts as one. */
export const VISIT_LIMIT = 100;

export type InviteRecord = {
  data: InviteData;
  /** sha256 (hex) of the edit token. The token itself is never stored. */
  tokenHash: string;
  /** The account it belongs to, or null if it was made as a guest. */
  ownerId: string | null;
  views: number;
  maxViews: number;
  /** Anyone who opens /edit/<slug> can edit it, without the private key. */
  openEdit?: boolean;
  /** Where it was made (from the request's location headers), if known. */
  country?: string | null;
  city?: string | null;
  createdAt: number;
  updatedAt: number;
};

export type InviteSummary = Pick<InviteRecord, "views" | "maxViews" | "createdAt" | "updatedAt"> & {
  slug: string;
  names: string;
  template: string;
  occasion: string;
};

export type ViewResult = { counted: boolean; views: number; maxViews: number };

export type Store = {
  kind: "supabase" | "file";
  /** Saves a new invitation. Returns false if the slug is taken. */
  create(slug: string, rec: InviteRecord): Promise<boolean>;
  get(slug: string): Promise<InviteRecord | null>;
  update(slug: string, data: InviteData): Promise<void>;
  remove(slug: string): Promise<void>;
  exists(slug: string): Promise<boolean>;
  /** Counts a visit (and where it came from) if any are left. Null if the invitation doesn't exist. */
  registerView(slug: string, info: VisitInfo): Promise<ViewResult | null>;
  /** Invitations saved to an account, newest first. */
  listByOwner(ownerId: string): Promise<InviteSummary[]>;
  /** Lets anyone with /edit/<slug> edit it (true), or only the key holder and account (false). */
  setOpenEdit(slug: string, open: boolean): Promise<void>;
  /** Moves a guest invitation into an account. False if it already has one. */
  claim(slug: string, ownerId: string): Promise<boolean>;
  /** Counter that resets after `windowSeconds`; returns the new count. */
  hit(key: string, windowSeconds: number): Promise<number>;
};

type Row = {
  slug: string;
  data: InviteData;
  token_hash: string;
  owner_id: string | null;
  views: number;
  max_views: number;
  // Added Nov 2026; missing until the column is created (schema.sql).
  open_edit?: boolean;
  country: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
};

const fromRow = (r: Row): InviteRecord => ({
  data: r.data,
  tokenHash: r.token_hash,
  ownerId: r.owner_id,
  views: r.views,
  maxViews: r.max_views,
  openEdit: r.open_edit === true,
  country: r.country,
  city: r.city,
  createdAt: Date.parse(r.created_at),
  updatedAt: Date.parse(r.updated_at),
});

/** The parts of an invitation a list needs, without its full contents. */
export function summarise(slug: string, rec: InviteRecord): InviteSummary {
  const names = rec.data.people.map((p) => p.name).filter(Boolean).join(" & ");
  return { slug, names, template: rec.data.template, occasion: rec.data.occasion, views: rec.views, maxViews: rec.maxViews, createdAt: rec.createdAt, updatedAt: rec.updatedAt };
}

function fail(what: string, error: { message: string }): never {
  throw new Error(`Supabase ${what} failed: ${error.message}`);
}

function supabaseStore(): Store {
  const t = () => db().from("invites");
  return {
    kind: "supabase",
    async create(slug, rec) {
      const row: Record<string, unknown> = {
        slug,
        data: rec.data,
        token_hash: rec.tokenHash,
        owner_id: rec.ownerId,
        views: rec.views,
        max_views: rec.maxViews,
        country: rec.country ?? null,
        city: rec.city ?? null,
        created_at: new Date(rec.createdAt).toISOString(),
        updated_at: new Date(rec.updatedAt).toISOString(),
      };
      let { error } = await t().insert(rec.openEdit ? { ...row, open_edit: true } : row);
      // Before the open_edit column exists (PGRST204), publish it as private.
      if (error?.code === "PGRST204" && rec.openEdit) ({ error } = await t().insert(row));
      if (error?.code === "23505") return false; // slug already taken
      if (error) fail("insert", error);
      return true;
    },
    async get(slug) {
      const { data, error } = await t().select("*").eq("slug", slug).maybeSingle<Row>();
      if (error) fail("select", error);
      return data ? fromRow(data) : null;
    },
    async update(slug, data) {
      const { error } = await t().update({ data, updated_at: new Date().toISOString() }).eq("slug", slug);
      if (error) fail("update", error);
    },
    async remove(slug) {
      const { error } = await t().delete().eq("slug", slug);
      if (error) fail("delete", error);
    },
    async exists(slug) {
      const { count, error } = await t().select("slug", { count: "exact", head: true }).eq("slug", slug);
      if (error) fail("count", error);
      return (count ?? 0) > 0;
    },
    async registerView(slug, info) {
      const { data, error } = await db().rpc("register_view", {
        p_slug: slug,
        p_country: info.country,
        p_region: info.region,
        p_city: info.city,
        p_device: info.device,
        p_source: info.source,
      });
      if (error) fail("register_view", error);
      const row = (data as { counted: boolean; views: number; max_views: number }[] | null)?.[0];
      return row ? { counted: row.counted, views: row.views, maxViews: row.max_views } : null;
    },
    async setOpenEdit(slug, open) {
      const { error } = await t().update({ open_edit: open }).eq("slug", slug);
      if (error) fail("update", error);
    },
    async listByOwner(ownerId) {
      const { data, error } = await t().select("*").eq("owner_id", ownerId).order("created_at", { ascending: false }).limit(200).overrideTypes<Row[], { merge: false }>();
      if (error) fail("select", error);
      return (data ?? []).map((r) => summarise(r.slug, fromRow(r)));
    },
    async claim(slug, ownerId) {
      const { data, error } = await t().update({ owner_id: ownerId }).eq("slug", slug).is("owner_id", null).select("slug");
      if (error) fail("claim", error);
      return (data?.length ?? 0) > 0;
    },
    async hit(key, windowSeconds) {
      const { data, error } = await db().rpc("hit_rate", { p_key: key, p_window: windowSeconds });
      if (error) fail("hit_rate", error);
      return Number(data);
    },
  };
}

type FileState = { docs: Record<string, InviteRecord> };

function fileStore(): Store {
  const dir = join(process.cwd(), ".data");
  const file = join(dir, "invites.json");
  const counters = new Map<string, { n: number; until: number }>();
  const load = (): FileState => {
    try {
      const s = JSON.parse(readFileSync(file, "utf8")) as FileState & { views?: Record<string, number> };
      // Older files kept views separately and had no owner or limit.
      for (const [slug, rec] of Object.entries(s.docs)) {
        rec.ownerId ??= null;
        rec.views ??= s.views?.[slug] ?? 0;
        rec.maxViews ??= VISIT_LIMIT;
      }
      return { docs: s.docs };
    } catch {
      return { docs: {} };
    }
  };
  const save = (s: FileState) => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, JSON.stringify(s, null, 1));
  };
  return {
    kind: "file",
    async create(slug, rec) {
      const s = load();
      if (s.docs[slug]) return false;
      s.docs[slug] = rec;
      save(s);
      return true;
    },
    async get(slug) {
      return load().docs[slug] ?? null;
    },
    async update(slug, data) {
      const s = load();
      if (!s.docs[slug]) return;
      s.docs[slug] = { ...s.docs[slug], data, updatedAt: Date.now() };
      save(s);
    },
    async remove(slug) {
      const s = load();
      delete s.docs[slug];
      save(s);
    },
    async exists(slug) {
      return Boolean(load().docs[slug]);
    },
    async registerView(slug) {
      const s = load();
      const rec = s.docs[slug];
      if (!rec) return null;
      if (rec.views >= rec.maxViews) return { counted: false, views: rec.views, maxViews: rec.maxViews };
      rec.views += 1;
      save(s);
      return { counted: true, views: rec.views, maxViews: rec.maxViews };
    },
    async setOpenEdit(slug, open) {
      const s = load();
      if (!s.docs[slug]) return;
      s.docs[slug].openEdit = open;
      save(s);
    },
    async listByOwner(ownerId) {
      return Object.entries(load().docs)
        .filter(([, r]) => r.ownerId === ownerId)
        .map(([slug, r]) => summarise(slug, r))
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    async claim(slug, ownerId) {
      const s = load();
      const rec = s.docs[slug];
      if (!rec || rec.ownerId) return false;
      rec.ownerId = ownerId;
      save(s);
      return true;
    },
    async hit(key, windowSeconds) {
      const now = Date.now();
      const c = counters.get(key);
      if (!c || c.until < now) {
        counters.set(key, { n: 1, until: now + windowSeconds * 1000 });
        return 1;
      }
      c.n += 1;
      return c.n;
    },
  };
}

let cached: Store | null | undefined;

/** The configured store, or null in production without Supabase (sharing is then unavailable). */
export function getStore(): Store | null {
  if (cached !== undefined) return cached;
  if (hasDb()) cached = supabaseStore();
  // DWM_INVITE_FILE_STORE=1 lets a local production build run without Supabase.
  else if (process.env.NODE_ENV !== "production" || process.env.DWM_INVITE_FILE_STORE === "1") cached = fileStore();
  else cached = null;
  return cached;
}

export const newToken = () => randomBytes(18).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function tokenMatches(token: string | null, hash: string) {
  if (!token) return false;
  const a = Buffer.from(hashToken(token), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
}
