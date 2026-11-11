import Link from "next/link";

import type { GalleryItem } from "@/components/gallery";
import { Reveal, TemplateRow } from "@/components/templates-showcase";

// The special designs: one link for every function of a wedding, each in its own
// colours, with RSVP, wishes and a "save as video" button. Shown above the other rows
// on the homepage and the Templates page, with the four function paintings beside the card.

const FUNCTIONS = [
  { name: "Mayoun", art: "/art/shagun/mayoun-720.webp", note: "Marigold yellow" },
  { name: "Mehndi", art: "/art/shagun/mehndi-720.webp", note: "Henna & peacocks" },
  { name: "Baraat", art: "/art/shagun/baraat-720.webp", note: "Mughal red & gold" },
  { name: "Walima", art: "/art/shagun/walima-720.webp", note: "White & green" },
];

const INSIDE = [
  "Each function gets its own chapter, colours, date, time, venue and map",
  "Guests RSVP for the functions they'll attend; you see the count for each",
  "A wishes wall where family and friends leave duas for the couple",
  "Save the whole invitation as one video, for guests who find links hard to open",
];

export const SPECIAL_LINK = { id: "special", label: "All functions" };

export function SpecialDesigns({ items }: { items: GalleryItem[] }) {
  if (!items.length) return null;
  const first = items[0].meta.id;
  return (
    <section id="special" aria-labelledby="special-h" className="scroll-mt-8 border-t border-line pt-10 pb-12">
      <Reveal className="mb-6">
        <h2 id="special-h" className="font-serif text-[28px] leading-tight sm:text-[32px]">
          Every function, one link
        </h2>
        <p className="mt-1 max-w-2xl text-[15.5px] text-muted">
          Mayoun to Walima in a single invitation, each function in its own world. Send one link instead of four cards.
        </p>
      </Reveal>
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,300px)_1fr]">
        <TemplateRow items={items} />
        <div className="grid gap-6">
          <ul className="grid grid-cols-4 gap-2.5 sm:gap-3" aria-label="The four chapters">
            {FUNCTIONS.map((f) => (
              <li key={f.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.art} alt={`${f.name} chapter`} loading="lazy" className="aspect-[9/16] w-full rounded-xl object-cover shadow-[0_14px_30px_-18px_rgba(30,40,30,0.55)]" />
                <p className="mt-2 font-serif text-[17px] leading-tight">{f.name}</p>
                <p className="text-[12.5px] text-muted">{f.note}</p>
              </li>
            ))}
          </ul>
          <ul className="grid gap-2 text-[15px] leading-relaxed">
            {INSIDE.map((t) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rotate-45 bg-gold" />
                {t}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link href={`/create/${first}?occasion=wedding`} className="inline-flex h-11 items-center rounded-full bg-deep px-6 text-[15px] font-medium text-ivory transition hover:brightness-110">
              Make yours
            </Link>
            <Link href={`/preview/${first}?occasion=wedding`} className="inline-flex h-11 items-center rounded-full border border-line px-6 text-[15px] transition hover:bg-paper-2">
              See it open
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
