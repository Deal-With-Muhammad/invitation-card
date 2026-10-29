import Link from "next/link";

import { Faq } from "@/components/faq";
import { Gallery } from "@/components/gallery";
import { galleryItems } from "@/components/gallery-items";
import { CustomCta, Features, HowItWorks, OccasionLinks, OccasionTiles } from "@/components/sections";
import { TryIt } from "@/components/try-it";
import { CATALOG } from "@/invite/templates/catalog";
import { buildHomeJsonLd, jsonLdString } from "@/lib/seo";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(buildHomeJsonLd()) }} />

      <section className="mx-auto max-w-6xl px-3 pt-4 pb-14 sm:px-6 md:pt-6">
        <div className="relative grid items-center gap-10 overflow-hidden rounded-[32px] bg-deep px-6 py-10 text-ivory sm:px-10 md:grid-cols-[1.1fr_1fr] md:py-14">
          {/* soft gold light behind the card, and a fine gold frame like printed stationery */}
          <div className="pointer-events-none absolute -end-24 top-1/2 size-[640px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(216_190_138/0.32),rgb(176_141_87/0.1)_45%,transparent_70%)]" aria-hidden />
          <div className="pointer-events-none absolute inset-3 rounded-[24px] border border-gold/35" aria-hidden />
          <div className="relative">
            <h1 className="font-serif text-[40px] leading-[1.02] font-normal tracking-[0.01em] text-balance uppercase sm:text-[58px]">
              Online invitations for weddings, nikah and birthdays
            </h1>
            <p className="mt-5 max-w-[32rem] text-[17px] leading-relaxed text-ivory/75">
              Choose a design, type your names, dates and venue, and send one link on WhatsApp. It opens like a real card, with the map, a countdown and every function.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/templates" className="btn h-12 bg-gold-light px-6 text-[16px] text-deep hover:bg-[#e3cc9d]">
                Browse {CATALOG.length} designs
              </Link>
              <Link href="/preview/jharokha" className="btn h-12 border border-ivory/35 px-6 text-[16px] text-ivory hover:border-ivory/70" target="_blank">
                Open an example
              </Link>
            </div>
            <p className="mt-5 text-[14px] text-gold-light/80">Free. No sign-up, no app, no ads.</p>
          </div>
          <div className="relative">
            <TryIt />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6" aria-labelledby="occasions">
        <h2 id="occasions" className="mb-4 font-serif text-[22px] font-semibold tracking-[-0.02em]">
          Browse by occasion
        </h2>
        <OccasionTiles />
      </section>

      <section id="designs" className="mx-auto mt-16 max-w-6xl scroll-mt-6 px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-[30px] leading-tight font-semibold tracking-[-0.03em] sm:text-[36px]">All designs</h2>
          <p className="text-[15px] text-muted">Each one opens with its own animation. Tap a card to see it live.</p>
        </div>
        <Gallery items={galleryItems()} />
      </section>

      <section className="mx-auto mt-24 max-w-6xl scroll-mt-6 px-4 sm:px-6" id="how">
        <h2 className="mb-8 font-serif text-[30px] leading-tight font-semibold tracking-[-0.03em] sm:text-[36px]">How it works</h2>
        <HowItWorks />
      </section>

      <section className="mx-auto mt-24 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <h2 className="font-serif text-[30px] leading-tight font-semibold tracking-[-0.03em] sm:text-[36px]">What guests get</h2>
          <p className="mt-3 max-w-sm text-[15.5px] leading-relaxed text-muted">Switch any of it on or off in the editor. Guests never need an account or an app.</p>
        </div>
        <Features />
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <CustomCta />
      </section>

      <section className="mx-auto mt-24 max-w-3xl px-4 sm:px-6">
        <h2 className="mb-6 font-serif text-[30px] leading-tight font-semibold tracking-[-0.03em] sm:text-[36px]">Questions</h2>
        <Faq faqs={site.faqs} />
        <p className="mt-10 mb-3 text-[14px] text-muted">Make an invitation for</p>
        <OccasionLinks />
      </section>
    </main>
  );
}
