import type { MetadataRoute } from "next";

import { CATALOG } from "@/invite/templates/catalog";
import { PAGE_LIST } from "@/lib/pages";
import { site } from "@/lib/site";

// Fixed dates: bump them (src/lib/site.ts, src/lib/pages.ts) when the copy changes.
export default function sitemap(): MetadataRoute.Sitemap {
  const d = site.updated.iso;
  return [
    { url: `${site.url}/`, lastModified: d, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/templates`, lastModified: d, changeFrequency: "monthly", priority: 0.9 },
    ...PAGE_LIST.map((p) => ({ url: `${site.url}/${p.slug}`, lastModified: p.dateModified, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...CATALOG.map((m) => ({ url: `${site.url}/templates/${m.id}`, lastModified: d, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${site.url}/custom`, lastModified: d, changeFrequency: "yearly", priority: 0.5 },
    { url: `${site.url}/privacy`, lastModified: "2026-11-05", changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/terms`, lastModified: "2026-11-05", changeFrequency: "yearly", priority: 0.3 },
  ];
}
