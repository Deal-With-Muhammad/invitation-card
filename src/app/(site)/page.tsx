import { Faq } from "@/components/faq";
import type { GalleryItem } from "@/components/gallery";
import { galleryItems } from "@/components/gallery-items";
import { CustomCta, Features, HowItWorks, OccasionLinks } from "@/components/sections";
import { Reveal, TemplateRow, VideoHero } from "@/components/templates-showcase";
import { TryIt } from "@/components/try-it";
import { GROUPS, groupOf, NEW_DESIGNS } from "@/lib/groups";
import { buildHomeJsonLd, jsonLdString } from "@/lib/seo";
import { site } from "@/lib/site";

/** The fan under the hero film; the middle one plays its opening. */
const FAN = ["goldink", "riad", "noor", "silkribbon", "blossom"];

export default function Home() {
  const all = galleryItems();
  const fan = FAN.map((id) => all.find((it) => it.meta.id === id)).filter((it): it is GalleryItem => !!it);
  const rows = [
    { id: "new", title: "New: light and modern", blurb: "Soft daylight, cotton paper and silk, each one opening on film.", items: all.filter((it) => NEW_DESIGNS.includes(it.meta.id)) },
    ...GROUPS.map((g) => ({ ...g, items: all.filter((it) => !NEW_DESIGNS.includes(it.meta.id) && groupOf(it.meta.defaultOccasion) === g.id) })),
  ].filter((g) => g.items.length);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(buildHomeJsonLd()) }} />

      <VideoHero
        items={fan}
        kicker="Free to make · no sign-up · no app"
        lines={[
          ["Invitations", "that", "open"],
          ["like", "a", "film."],
        ]}
        lede="Pick a design, add your names and venues, and send one link on WhatsApp. Guests tap it and the card opens like a little film, then the music starts and every function and map is inside."
        secondary={{ href: "#try", label: "Try it with your names" }}
        links={rows.map((g) => ({ id: g.id, label: g.id === "new" ? "New" : g.title.split(",")[0].split(" &")[0] }))}
      />

      {rows.map((g) => (
        <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-8 border-t border-line pt-10 pb-12">
          <Reveal className="mb-6">
            <h2 id={`${g.id}-h`} className="font-serif text-[28px] leading-tight sm:text-[32px]">
              {g.title}
            </h2>
            <p className="mt-1 text-[15.5px] text-muted">
              {g.blurb} <span className="text-muted/70">· tap any card to watch it open</span>
            </p>
          </Reveal>
          <TemplateRow items={g.items} />
        </section>
      ))}

      <section id="try" className="grid scroll-mt-8 items-center gap-10 border-t border-line py-14 md:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="font-serif text-[30px] leading-tight sm:text-[38px]">Type your names, see your card</h2>
          <p className="mt-3 max-w-md text-[16px] leading-relaxed text-muted">
            Every design prints your names, dates and venues as real text, in English, Urdu, Malay, Arabic and more. Change a name and the card changes with it.
          </p>
        </div>
        <TryIt />
      </section>

      <section className="scroll-mt-8 border-t border-line py-14" id="how">
        <h2 className="mb-8 font-serif text-[30px] leading-tight sm:text-[36px]">How it works</h2>
        <HowItWorks />
      </section>

      <section className="grid gap-10 border-t border-line py-14 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <h2 className="font-serif text-[30px] leading-tight sm:text-[36px]">What guests get</h2>
          <p className="mt-3 max-w-sm text-[15.5px] leading-relaxed text-muted">Switch any of it on or off in the editor. Guests never need an account or an app.</p>
        </div>
        <Features />
      </section>

      <section className="border-t border-line py-14">
        <CustomCta />
      </section>

      <section className="mx-auto max-w-3xl pt-6 pb-16">
        <h2 className="mb-6 font-serif text-[30px] leading-tight sm:text-[36px]">Questions</h2>
        <Faq faqs={site.faqs} />
        <p className="mt-10 mb-3 text-[14px] text-muted">Make an invitation for</p>
        <OccasionLinks />
      </section>
    </main>
  );
}
