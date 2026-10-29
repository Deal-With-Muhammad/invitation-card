import type { Metadata } from "next";

import { Gallery } from "@/components/gallery";
import { galleryItems } from "@/components/gallery-items";
import { Eyebrow, OccasionLinks } from "@/components/sections";
import { CATALOG } from "@/invite/templates/catalog";

export const metadata: Metadata = {
  title: "Invitation Templates: Wedding, Nikah, Mehndi, Birthday & More",
  description: `Browse ${CATALOG.length} animated invitation templates for weddings, nikah, walima, mehndi, birthdays, aqiqah and parties. Free to use and share as a link.`,
  alternates: { canonical: "/templates" },
};

export default function TemplatesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <Eyebrow>{CATALOG.length} designs</Eyebrow>
      <h1 className="font-serif text-[40px] leading-[1.06] sm:text-[52px]">Invitation templates</h1>
      <p className="mt-4 mb-10 max-w-2xl text-[16.5px] leading-relaxed text-muted">
        Every template opens with its own animation and comes in several colour palettes. Open one to see it full screen, then make it yours. All free.
      </p>
      <Gallery items={galleryItems()} />
      <div className="mt-16">
        <p className="mb-3 text-[14px] text-muted">Looking for something specific?</p>
        <OccasionLinks />
      </div>
    </main>
  );
}
