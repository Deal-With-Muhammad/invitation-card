import { readLocalPhoto } from "@/lib/server/photos";

// Development only: photos saved in .data/photos. In production guests load photos
// straight from Storage (see invite/photo.ts), so this returns 404 there.

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const bytes = readLocalPhoto(id);
  if (!bytes) return new Response("Not found", { status: 404 });
  return new Response(bytes as BodyInit, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=31536000, immutable" } });
}
