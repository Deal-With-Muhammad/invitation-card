import Link from "next/link";

import { Faq } from "@/components/faq";
import { Gallery } from "@/components/gallery";
import { galleryItems } from "@/components/gallery-items";
import { CustomCta, Eyebrow, Features, OccasionLinks } from "@/components/sections";
import { PAGES } from "@/lib/pages";
import { buildPageJsonLd, jsonLdString, pageMetadata } from "@/lib/seo";

export const landingMetadata = (slug: string) => pageMetadata(PAGES[slug]);

/** A keyword landing page: answer first, then the designs for that occasion. */
export function LandingPage({ slug }: { slug: string }) {
  const page = PAGES[slug];
  const ms = page.lang === "ms";
  const items = galleryItems(page.occasion, page.occasions, page.featured);
  return (
    <main lang={page.lang} className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(buildPageJsonLd(page)) }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-[13.5px] text-muted">
        <Link href="/" className="hover:text-ink">
          DWM Invite
        </Link>{" "}
        / <span className="text-ink">{page.label}</span>
      </nav>
      <Eyebrow>{ms ? "Percuma · Tanpa daftar" : "Free · No sign-up"}</Eyebrow>
      <h1 className="max-w-3xl font-serif text-[40px] leading-[1.06] text-balance sm:text-[54px]">{page.title}</h1>
      <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted">{page.answer}</p>
      <Link href={`/create/${page.featured}?occasion=${page.occasion}${page.lang === "ms" ? "&lang=ms" : ""}`} className="btn btn-primary mt-8 h-12 px-6 text-[16px]">
        {ms ? "Mula buat kad" : "Start with a design"}
      </Link>

      <section className="mt-16">
        <h2 className="mb-6 font-serif text-[30px]">{ms ? "Pilih reka bentuk" : "Designs for this occasion"}</h2>
        <Gallery items={items} occasion={page.occasion} showFilters={false} />
      </section>

      {page.sections.map((s) => (
        <section key={s.id} id={s.id} className="mt-20 scroll-mt-6">
          <h2 className="mb-8 font-serif text-[30px] sm:text-[36px]">{s.heading}</h2>
          {s.body && <p className="max-w-2xl text-[16px] leading-relaxed text-muted">{s.body}</p>}
          {s.items && (
            <ol className={`grid gap-8 ${s.items.length === 3 ? "md:grid-cols-3" : "sm:grid-cols-2"}`}>
              {s.items.map((it, i) => (
                <li key={it.term}>
                  {s.id === page.steps && <span className="grid size-8 place-items-center rounded-full bg-paper-2 text-[14px] font-semibold">{i + 1}</span>}
                  <h3 className="mt-2 font-serif text-[21px]">{it.term}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{it.text}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      ))}

      {!ms && (
        <section className="mt-20">
          <h2 className="mb-8 font-serif text-[30px] sm:text-[36px]">What guests get</h2>
          <Features />
        </section>
      )}

      <section className="mt-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="font-serif text-[30px] sm:text-[36px]">{ms ? "Soalan lazim" : "Questions"}</h2>
        <Faq faqs={page.faqs} />
      </section>

      <section className="mt-20">
        <CustomCta />
      </section>
      <section className="mt-16">
        <p className="mb-3 text-[14px] text-muted">{ms ? "Majlis lain" : "Other occasions"}</p>
        <OccasionLinks />
      </section>
    </main>
  );
}
