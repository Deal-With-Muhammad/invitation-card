import type { Metadata } from "next";

import type { GalleryItem } from "@/components/gallery";
import { galleryItems } from "@/components/gallery-items";
import { OccasionLinks } from "@/components/sections";
import { Reveal, TemplateRow, TemplatesHero } from "@/components/templates-showcase";
import { CATALOG } from "@/invite/templates/catalog";
import { GROUPS, groupOf, NEW_DESIGNS, PREMIUM_DESIGNS } from "@/lib/groups";
import { PREMIUM_LINK, PremiumDesigns } from "@/components/premium-designs";

export const metadata: Metadata = {
  title: "Invitation Templates: Wedding, Nikah, Mehndi, Birthday & More",
  description: `Browse ${CATALOG.length} animated invitation templates for weddings, nikah, walima, mehndi, birthdays, aqiqah and parties. Free to use and share as a link.`,
  alternates: { canonical: "/templates" },
};

/** The designs shown in the fan, in order; the middle one plays its opening. */
const MOST_LOVED = ["velvetrose", "peony", "silkribbon", "haveli", "petals"];

export default function TemplatesPage() {
  const all = galleryItems();
  const loved = MOST_LOVED.map((id) => all.find((it) => it.meta.id === id)).filter((it): it is GalleryItem => !!it);
  const grouped = [
    { id: "new", title: "New: light and modern", blurb: "Soft daylight, cotton paper and silk, each one opening on film.", items: all.filter((it) => NEW_DESIGNS.includes(it.meta.id) && !PREMIUM_DESIGNS.includes(it.meta.id)) },
    ...GROUPS.map((g) => ({ ...g, items: all.filter((it) => !NEW_DESIGNS.includes(it.meta.id) && !PREMIUM_DESIGNS.includes(it.meta.id) && groupOf(it.meta.defaultOccasion) === g.id) })),
  ].filter((g) => g.items.length);
  const premium = PREMIUM_DESIGNS.map((id) => all.find((it) => it.meta.id === id)).filter((it): it is GalleryItem => !!it);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      <TemplatesHero count={CATALOG.length} items={loved} links={[PREMIUM_LINK, ...grouped.map((g) => ({ id: g.id, label: g.id === "new" ? "New" : g.title.split(",")[0].split(" &")[0] }))]} />


      <PremiumDesigns items={premium} />

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
