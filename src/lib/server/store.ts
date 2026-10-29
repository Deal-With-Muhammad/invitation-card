import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { Redis } from "@upstash/redis";

import type { InviteData } from "@/invite/types";

// Where shared invitations live. Upstash Redis in production (the database is
// shared with the other DWM sites, so every key starts with "inv:"). In
// development without Redis credentials, a JSON file in .data/ so links survive
// restarts.

export type InviteRecord = {
  data: InviteData;
  /** sha256 (hex) of the edit token. The token itself is never stored. */
  tokenHash: string;
  createdAt: number;
  updatedAt: number;
};

export type Store = {
  kind: "redis" | "file";
  /** Saves a new invitation. Returns false if the slug is taken. */
  create(slug: string, rec: InviteRecord): Promise<boolean>;
  get(slug: string): Promise<InviteRecord | null>;
  put(slug: string, rec: InviteRecord): Promise<void>;
  remove(slug: string): Promise<void>;
  exists(slug: string): Promise<boolean>;
  views(slug: string): Promise<number>;
  addView(slug: string): Promise<number>;
  /** Counter that resets after `windowSeconds`; returns the new count. */
  hit(key: string, windowSeconds: number): Promise<number>;
};

const doc = (slug: string) => `inv:doc:${slug}`;
const viewKey = (slug: string) => `inv:views:${slug}`;
const COUNT = "inv:count";
const LIST = "inv:list";

function redisStore(redis: Redis): Store {
  return {
    kind: "redis",
    async create(slug, rec) {
      const ok = await redis.set(doc(slug), rec, { nx: true });
      if (ok !== "OK") return false;
      const p = redis.pipeline();
      p.incr(COUNT);
      p.zadd(LIST, { score: rec.createdAt, member: slug });
      await p.exec();
      return true;
    },
    async get(slug) {
      return (await redis.get<InviteRecord>(doc(slug))) ?? null;
    },
    async put(slug, rec) {
      await redis.set(doc(slug), rec);
    },
    async remove(slug) {
      const p = redis.pipeline();
      p.del(doc(slug));
      p.del(viewKey(slug));
      p.zrem(LIST, slug);
      await p.exec();
    },
    async exists(slug) {
      return (await redis.exists(doc(slug))) === 1;
    },
    async views(slug) {
      return Number((await redis.get<number>(viewKey(slug))) ?? 0);
    },
    async addView(slug) {
      return redis.incr(viewKey(slug));
    },
    async hit(key, windowSeconds) {
      const n = await redis.incr(key);
      if (n === 1) await redis.expire(key, windowSeconds);
      return n;
    },
  };
}

type FileState = { docs: Record<string, InviteRecord>; views: Record<string, number>; count: number };

function fileStore(): Store {
  const dir = join(process.cwd(), ".data");
  const file = join(dir, "invites.json");
  const counters = new Map<string, { n: number; until: number }>();
  const load = (): FileState => {
    try {
      return JSON.parse(readFileSync(file, "utf8")) as FileState;
    } catch {
      return { docs: {}, views: {}, count: 0 };
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
      s.count += 1;
      save(s);
      return true;
    },
    async get(slug) {
      return load().docs[slug] ?? null;
    },
    async put(slug, rec) {
      const s = load();
      s.docs[slug] = rec;
      save(s);
    },
    async remove(slug) {
      const s = load();
      delete s.docs[slug];
      delete s.views[slug];
      save(s);
    },
    async exists(slug) {
      return Boolean(load().docs[slug]);
    },
    async views(slug) {
      return load().views[slug] ?? 0;
    },
    async addView(slug) {
      const s = load();
      s.views[slug] = (s.views[slug] ?? 0) + 1;
      save(s);
      return s.views[slug];
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

/** The configured store, or null in production without Redis (sharing is then unavailable). */
export function getStore(): Store | null {
  if (cached !== undefined) return cached;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) cached = redisStore(new Redis({ url, token }));
  // DWM_INVITE_FILE_STORE=1 lets a local production build run without Redis.
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
