import "server-only";

import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { db, hasDb } from "@/lib/supabase/server";

// Where a host's photo lives (designs with a photo, e.g. Heirloom): a public Supabase
// Storage bucket in production, so guests load it straight from Storage; a folder in
// .data/ in development, served by /api/photos/<id>. Photos are JPEGs the editor has
// already scaled down, named by a random id that the invitation stores.

export const PHOTO_BUCKET = "invite-photos";
/** The editor sends at most ~300 KB; anything larger is refused. */
export const PHOTO_MAX_BYTES = 700_000;

export const PHOTO_ID = /^[a-f0-9]{24}$/;

const isJpeg = (b: Uint8Array) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

const dir = () => join(process.cwd(), ".data", "photos");

/** Saves a JPEG and returns its id. Throws "type" for anything that is not a JPEG. */
export async function savePhoto(bytes: Uint8Array): Promise<string> {
  if (!isJpeg(bytes)) throw new Error("type");
  const id = randomBytes(12).toString("hex");
  if (!hasDb()) {
    mkdirSync(dir(), { recursive: true });
    writeFileSync(join(dir(), `${id}.jpg`), bytes);
    return id;
  }
  const put = () => db().storage.from(PHOTO_BUCKET).upload(`${id}.jpg`, bytes, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
  let { error } = await put();
  if (error && /bucket.*not found|not found/i.test(error.message)) {
    // First photo ever: make the public bucket, then try once more.
    const made = await db().storage.createBucket(PHOTO_BUCKET, { public: true, fileSizeLimit: PHOTO_MAX_BYTES, allowedMimeTypes: ["image/jpeg"] });
    if (made.error && !/already exists/i.test(made.error.message)) throw new Error(`storage: ${made.error.message}`);
    ({ error } = await put());
  }
  if (error) throw new Error(`storage: ${error.message}`);
  return id;
}

/** Development only: the bytes of a photo saved in .data/photos. */
export function readLocalPhoto(id: string): Uint8Array | null {
  if (!PHOTO_ID.test(id)) return null;
  try {
    return readFileSync(join(dir(), `${id}.jpg`));
  } catch {
    return null;
  }
}
