import { NextResponse } from "next/server";

import { PHOTO_MAX_BYTES, savePhoto } from "@/lib/server/photos";
import { clientIp, getStore } from "@/lib/server/store";

// A host's photo for a design that shows one. The editor scales it down to a JPEG
// first; this stores it and returns the id the invitation keeps (see lib/server/photos.ts).

const PHOTOS_PER_HOUR = 12;

export async function POST(req: Request) {
  const store = getStore();
  if (!store) return NextResponse.json({ error: "Photos are not available right now." }, { status: 503 });
  const n = await store.hit(`inv:rl:photo:${clientIp(req.headers)}`, 3600);
  if (n > PHOTOS_PER_HOUR) return NextResponse.json({ error: "Too many photos from here. Try again in an hour." }, { status: 429 });
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > PHOTO_MAX_BYTES) return NextResponse.json({ error: "This photo is too large." }, { status: 413 });
  const bytes = new Uint8Array(await req.arrayBuffer());
  if (!bytes.length || bytes.length > PHOTO_MAX_BYTES) return NextResponse.json({ error: "This photo is too large." }, { status: 413 });
  try {
    return NextResponse.json({ id: await savePhoto(bytes) });
  } catch (e) {
    if (e instanceof Error && e.message === "type") return NextResponse.json({ error: "Please choose a photo (JPEG, PNG or HEIC)." }, { status: 415 });
    console.error("photo upload failed", e);
    return NextResponse.json({ error: "Couldn't save the photo. Please try again." }, { status: 500 });
  }
}
