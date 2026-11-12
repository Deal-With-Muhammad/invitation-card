// A host's photo (InviteData.photo) for designs that show one.

const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");

/** Where a photo is loaded from: Storage in production, the dev route otherwise. */
export const photoUrl = (id: string) => (base ? `${base}/storage/v1/object/public/invite-photos/${id}.jpg` : `/api/photos/${id}`);

/**
 * Scales a picked image down to a JPEG small enough to store (longest side 1400px,
 * then lower quality until it is under ~320 KB). Runs in the browser.
 */
export async function shrinkPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can't prepare the photo.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const q of [0.84, 0.74, 0.64, 0.52]) {
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", q));
    if (blob && (blob.size < 320_000 || q === 0.52)) return blob;
  }
  throw new Error("This browser can't prepare the photo.");
}
