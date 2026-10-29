import type { Metadata } from "next";

import type { GalleryItem } from "@/components/gallery";
import { galleryItems } from "@/components/gallery-items";
import { OccasionLinks } from "@/components/sections";
import { Reveal, TemplateRow, TemplatesHero } from "@/components/templates-showcase";
import { CATALOG } from "@/invite/templates/catalog";
import type { Occasion } from "@/invite/types";

export const metadata: Metadata = {
  title: "Invitation Templates: Wedding, Nikah, Mehndi, Birthday & More",
  description: `Browse ${CATALOG.length} animated invitation templates for weddings, nikah, walima, mehndi, birthdays, aqiqah, Eid and parties. Free to use and share as a link.`,
  alternates: { canonical: "/templates" },
};

/** The designs people open most, in the order they are shown. */
const MOST_LOVED = ["marigold", "jharokha", "sehra", "botanica", "deco"];

/** Browse sections; a design lands in the first one that lists its main occasion, everything else goes to the last. */
const GROUPS: { id: string; title: string; blurb: string; occasions: Occasion[] }[] = [
  { id: "weddings", title: "Weddings & receptions", blurb: "For the big day and the dinner after it.", occasions: ["wedding", "reception"] },
  { id: "nikah", title: "Nikah, walima & engagement", blurb: "Quieter, warmer, made for family.", occasions: ["nikah", "walima", "engagement"] },
  { id: "festive", title: "Mehndi & festive nights", blurb: "Colour, music and a little noise.", occasions: ["mehndi", "eid"] },
  { id: "celebrate", title: "Birthdays & every other reason", blurb: "Baby showers, graduations, housewarmings and parties.", occasions: [] },
];

export default function TemplatesPage() {
  const all = galleryItems();
  const loved = MOST_LOVED.map((id) => all.find((it) => it.meta.id === id)).filter((it): it is GalleryItem => !!it);
  const rest = all.filter((it) => !MOST_LOVED.includes(it.meta.id));
  const grouped = GROUPS.map((g, gi) => ({
    ...g,
    items: rest.filter((it) => {
      const own = GROUPS.findIndex((x) => x.occasions.includes(it.meta.defaultOccasion));
      return (own === -1 ? GROUPS.length - 1 : own) === gi;
    }),
  })).filter((g) => g.items.length);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      <TemplatesHero count={CATALOG.length} items={loved} links={grouped.map((g) => ({ id: g.id, label: g.title.split(",")[0].split(" &")[0] }))} />


      {grouped.map((g) => (
        <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-8 border-t border-line pt-10 pb-12">
          <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-1">
            <div>
              <h2 id={`${g.id}-h`} className="font-serif text-[28px] leading-tight sm:text-[32px]">
                {g.title}
              </h2>
              <p className="mt-1 text-[15.5px] text-muted">
                {g.blurb} <span className="text-muted/70">· {g.items.length} designs</span>
              </p>
            </div>
          </Reveal>
          <TemplateRow items={g.items} />
        </section>
      ))}

      <section className="border-t border-line pt-10 pb-16">
        <p className="mb-3 text-[14px] text-muted">Looking for something specific?</p>
        <OccasionLinks />
      </section>
    </main>
  );
}
