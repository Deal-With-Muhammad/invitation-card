"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { LiveThumb, ThumbPlayButton, type ThumbControl } from "@/components/live-thumb";
import { PreviewIconButton } from "@/components/preview-sheet";
import type { TemplateMeta } from "@/invite/templates/types";
import type { Occasion } from "@/invite/types";
import { FILTERS } from "@/lib/filters";

export type GalleryItem = { meta: TemplateMeta; thumb: ReactNode };

/** Template cards with occasion chips. Thumbnails are rendered on the server and passed in. */
export function Gallery({ items, occasion, showFilters = true }: { items: GalleryItem[]; occasion?: Occasion; showFilters?: boolean }) {
  const [filter, setFilter] = useState("all");
  const f = FILTERS.find((x) => x.id === filter) ?? FILTERS[0];
  const shown = f.occasions.length ? items.filter((it) => it.meta.occasions.some((o) => f.occasions.includes(o))) : items;

  return (
    <div>
      {showFilters && (
        <div className="-mx-4 mb-8 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap" role="tablist" aria-label="Occasion">
            {FILTERS.map((x) => (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={filter === x.id}
                onClick={() => setFilter(x.id)}
                className={`h-9 whitespace-nowrap rounded-xl border px-3.5 text-[14px] transition-colors ${
                  filter === x.id ? "border-ink bg-ink text-paper" : "border-line bg-card text-muted hover:border-ink/30 hover:text-ink"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
        {shown.map((it) => (
          <GalleryTile key={it.meta.id} item={it} occasion={occasion} />
        ))}
      </ul>
      {shown.length === 0 && <p className="py-10 text-center text-muted">No designs for this occasion yet.</p>}
    </div>
  );
}

/** One design in the grid: the tile plays its opening, with a play button by its name. */
function GalleryTile({ item, occasion }: { item: GalleryItem; occasion?: Occasion }) {
  const { meta, thumb } = item;
  const [control, setControl] = useState<ThumbControl | null>(null);
  const q = occasion && meta.occasions.includes(occasion) ? `?occasion=${occasion}` : "";
  return (
    <li className="group">
      <div className="relative transition-transform duration-300 ease-[var(--ease-out)] group-hover:-translate-y-1">
        <LiveThumb
          id={meta.id}
          name={meta.name}
          label={meta.filmed ? "Filmed opening" : undefined}
          href={`/create/${meta.id}${q}`}
          onControl={setControl}
          className="overflow-hidden rounded-[16px] shadow-[0_18px_36px_-20px_rgb(31_28_25/0.55)] ring-1 ring-black/5"
        >
          {thumb}
        </LiveThumb>
        <PreviewIconButton id={meta.id} name={meta.name} className="absolute top-2.5 right-2.5 z-10" />
      </div>
      <div className="mt-3 flex items-start gap-2.5">
        <ThumbPlayButton control={control} name={meta.name} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] leading-tight font-medium">{meta.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-snug text-muted">{meta.tagline}</p>
        </div>
        <span className="mt-1 flex flex-none -space-x-1" aria-hidden>
          {meta.palettes.slice(0, 3).map((p) => (
            <i key={p.id} className="size-3.5 rounded-full ring-2 ring-paper" style={{ background: p.bg, boxShadow: `inset 0 0 0 3px ${p.accent}` }} />
          ))}
        </span>
      </div>
      <div className="mt-2 flex gap-4 text-[14px] font-medium">
        <Link href={`/create/${meta.id}${q}`} className="text-brand underline-offset-4 hover:underline">
          Use this design
        </Link>
        <Link href={`/templates/${meta.id}${q}`} className="text-muted underline-offset-4 hover:text-ink hover:underline max-sm:hidden">
          Details
        </Link>
      </div>
    </li>
  );
}
