"use client";

import Link from "next/link";
import { useState } from "react";

import type { GalleryItem } from "@/components/gallery";
import { LiveThumb, ThumbPlayButton, type ThumbControl } from "@/components/live-thumb";
import { PreviewIconButton, usePreview } from "@/components/preview-sheet";
import { Reveal } from "@/components/templates-showcase";

// The premium collection (PREMIUM_DESIGNS in lib/groups.ts): the most detailed designs,
// each opening on its own film, with RSVP and wishes (Shagun Box and Yaadein also save as a
// video). Shown above every
// other row on the homepage and the Templates page as product tiles (the opened card in a
// phone, its closed cover beside it), then Shagun Box's four function paintings.

const FUNCTIONS = [
  { name: "Mayoun", art: "/art/shagun/mayoun-720.webp", note: "Marigold yellow" },
  { name: "Mehndi", art: "/art/shagun/mehndi-720.webp", note: "Henna & peacocks" },
  { name: "Baraat", art: "/art/shagun/baraat-720.webp", note: "Mughal red & gold" },
  { name: "Walima", art: "/art/shagun/walima-720.webp", note: "White & green" },
];

const INCLUDED = ["A filmed opening", "RSVP from guests", "Wishes wall", "80 visits included"];

const SHAGUN = [
  "Every function in one link, each with its own colours, date, time, venue and map",
  "Guests RSVP for the functions they'll attend; you see the count for each",
  "A wishes wall where family and friends leave duas for the couple",
  "Save the whole invitation as one video, for guests who find links hard to open",
];

/** How many tiles show before "Show all". */
const FIRST = 8;

export const PREMIUM_LINK = { id: "premium", label: "Premium" };

export function PremiumDesigns({ items }: { items: GalleryItem[] }) {
  const [all, setAll] = useState(false);
  if (!items.length) return null;
  const shown = all ? items : items.slice(0, FIRST);
  return (
    <section id="premium" aria-labelledby="premium-h" className="scroll-mt-8 border-t border-line pt-10 pb-12">
      <Reveal className="mb-7 grid gap-x-10 gap-y-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h2 id="premium-h" className="font-serif text-[28px] leading-tight sm:text-[34px]">
            The premium collection
          </h2>
          <p className="mt-1.5 max-w-2xl text-[15.5px] leading-relaxed text-muted">
            {items.length} invitations, each one painted and filmed for it alone. Tap play to watch one open, or a card to put your names on it. Free to make; more visits are arranged by message.
          </p>
        </div>
        <ul className="flex flex-wrap gap-1.5 lg:max-w-[420px] lg:justify-end" aria-label="Every premium design includes">
          {INCLUDED.map((t) => (
            <li key={t} className="rounded-full border border-line bg-card px-3 py-1 text-[13px] text-ink/80">
              {t}
            </li>
          ))}
        </ul>
      </Reveal>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
        {shown.map((it) => (
          <PremiumTile key={it.meta.id} item={it} />
        ))}
      </ul>
      {!all && items.length > FIRST && (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={() => setAll(true)} className="inline-flex h-11 items-center rounded-full border border-ink/20 bg-card px-6 text-[15px] font-medium transition hover:border-ink/40 hover:bg-paper-2">
            Show all {items.length} premium designs · {items.length - FIRST} more
          </button>
        </div>
      )}

      <div className="mt-12 grid items-center gap-7 rounded-3xl border border-line bg-card p-5 sm:p-7 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
        <div>
          <p className="text-[13px] font-medium text-gold-ink">Shagun Box</p>
          <h3 className="mt-0.5 font-serif text-[26px] leading-tight">Every function, one link</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-muted">Mayoun to Walima in a single invitation, each function in its own world. Send one link instead of four cards.</p>
          <ul className="mt-4 grid gap-2 text-[14.5px] leading-relaxed">
            {SHAGUN.map((t) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rotate-45 bg-gold" />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/create/shagun?occasion=wedding" className="inline-flex h-11 items-center rounded-full bg-deep px-6 text-[15px] font-medium text-ivory transition hover:brightness-110">
              Make yours
            </Link>
            <Link href="/preview/shagun?occasion=wedding" className="inline-flex h-11 items-center rounded-full border border-line px-6 text-[15px] transition hover:bg-paper-2">
              See it open
            </Link>
          </div>
        </div>
        <ul className="grid grid-cols-4 gap-2.5 sm:gap-3.5" aria-label="The four chapters">
          {FUNCTIONS.map((f) => (
            <li key={f.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.art} alt={`${f.name} chapter`} loading="lazy" className="aspect-[9/16] w-full rounded-xl object-cover shadow-[0_14px_30px_-18px_rgba(30,40,30,0.55)]" />
              <p className="mt-2 font-serif text-[16px] leading-tight">{f.name}</p>
              <p className="text-[12px] leading-snug text-muted">{f.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** One premium design as a product photo: the opened card in a phone (it plays its
 *  opening), with the closed cover leaning behind it, on a tile in the design's own colour. */
function PremiumTile({ item }: { item: GalleryItem }) {
  const { meta, thumb } = item;
  const [control, setControl] = useState<ThumbControl | null>(null);
  const { open } = usePreview();
  const p = meta.palettes[0];
  return (
    <li className="group">
      <div className="relative aspect-[10/11] overflow-hidden rounded-[20px] ring-1 ring-black/5" style={{ background: `color-mix(in srgb, ${p.soft} 62%, #ece5d8)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/art/${meta.id}/closed-720.webp`}
          alt=""
          loading="lazy"
          draggable={false}
          className="absolute top-[12%] right-[8%] aspect-[9/16] w-[41%] rotate-[5deg] rounded-[10px] object-cover shadow-[0_18px_30px_-16px_rgb(31_28_25/0.7)] ring-1 ring-black/10 transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-1 group-hover:rotate-[7deg] sm:rounded-[12px]"
        />
        <div className="absolute top-[7%] left-[9%] w-[47%] overflow-hidden rounded-[13px] shadow-[0_22px_34px_-16px_rgb(31_28_25/0.75)] ring-[3px] ring-[#2b2723] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1 sm:rounded-[16px] sm:ring-4">
          <LiveThumb id={meta.id} name={meta.name} href={`/create/${meta.id}`} onControl={setControl} compact>
            {thumb}
          </LiveThumb>
        </div>
        <PreviewIconButton id={meta.id} name={meta.name} className="absolute top-2.5 right-2.5 z-10" />
      </div>
      <div className="mt-3 flex items-start gap-2.5">
        <ThumbPlayButton control={control} name={meta.name} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] leading-tight font-medium">{meta.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-snug text-muted">{meta.tagline}</p>
        </div>
      </div>
      <div className="mt-2 flex gap-4 text-[14px] font-medium whitespace-nowrap">
        <Link href={`/create/${meta.id}`} className="text-brand underline-offset-4 hover:underline">
          Use <span className="max-sm:hidden">this </span>design
        </Link>
        <button type="button" onClick={() => open(meta.id)} className="text-muted underline-offset-4 hover:text-ink hover:underline">
          <span className="max-sm:hidden">Live preview</span>
          <span className="sm:hidden">Preview</span>
        </button>
      </div>
    </li>
  );
}
