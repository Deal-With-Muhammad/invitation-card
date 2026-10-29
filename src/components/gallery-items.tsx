import { Thumb } from "@/invite/runtime/thumb";
import { TEMPLATE_LIST } from "@/invite/templates";
import type { Occasion } from "@/invite/types";

import type { GalleryItem } from "./gallery";

/** Server-rendered thumbnails for the gallery, optionally showing a given occasion's sample. */
export function galleryItems(occasion?: Occasion, only?: Occasion[], featured?: string): GalleryItem[] {
  const rank = (id: string, def: Occasion) => (id === featured ? 2 : occasion && def === occasion ? 1 : 0);
  return TEMPLATE_LIST.filter((t) => !only?.length || t.meta.occasions.some((o) => only.includes(o)))
    .sort((a, b) => rank(b.meta.id, b.meta.defaultOccasion) - rank(a.meta.id, a.meta.defaultOccasion))
    .map((t) => ({
      meta: t.meta,
      thumb: <Thumb id={t.meta.id} occasion={occasion && t.meta.occasions.includes(occasion) ? occasion : undefined} />,
    }));
}
