"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

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
      <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {shown.map(({ meta, thumb }) => {
          const q = occasion && meta.occasions.includes(occasion) ? `?occasion=${occasion}` : "";
          return (
            <li key={meta.id} className="group">
              <Link href={`/templates/${meta.id}${q}`} className="block rounded-[22px]" aria-label={`${meta.name}: ${meta.tagline}`}>
                <div className="rounded-2xl bg-paper-2 px-[13%] py-[9%] transition-colors duration-200 group-hover:bg-[#ebe6dd]">
                  <div className="overflow-hidden rounded-[10px] shadow-[0_18px_36px_-20px_rgb(31_28_25/0.55)] ring-1 ring-black/5 transition-transform duration-300 ease-[var(--ease-out)] group-hover:-translate-y-1">
                    {thumb}
                  </div>
                </div>
              </Link>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-[16px] leading-tight font-medium">{meta.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-snug text-muted">{meta.tagline}</p>
                </div>
                <span className="mt-1 flex flex-none -space-x-1" aria-hidden>
                  {meta.palettes.slice(0, 3).map((p) => (
                    <i key={p.id} className="size-3.5 rounded-full ring-2 ring-paper" style={{ background: p.bg, boxShadow: `inset 0 0 0 3px ${p.accent}` }} />
                  ))}
                </span>
              </div>
              <Link href={`/create/${meta.id}${q}`} className="mt-2 inline-flex text-[14px] font-medium text-brand underline-offset-4 hover:underline">
                Use this design
              </Link>
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && <p className="py-10 text-center text-muted">No designs for this occasion yet.</p>}
    </div>
  );
}
