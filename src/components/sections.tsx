import { buttonVariants } from "@heroui/styles";
import Link from "next/link";

import { FONT_VARS } from "@/invite/fonts";
import { Thumb } from "@/invite/runtime/thumb";
import { PAGE_LIST } from "@/lib/pages";
import { site } from "@/lib/site";

/** A small label above a heading. Plain on purpose. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-[14px] font-medium text-brand">{children}</p>;
}

const OCCASION_TILES = [
  { href: "/wedding-invitation-maker", label: "Wedding", id: "gilded" },
  { href: "/nikah-invitation-card", label: "Nikah & Walima", id: "jharokha" },
  { href: "/mehndi-invitation-card", label: "Mehndi", id: "marigold" },
  { href: "/birthday-invitation-maker", label: "Birthday", id: "confetti" },
  { href: "/aqiqah-invitation-card", label: "Aqiqah & baby", id: "cloudnine" },
  { href: "/engagement-invitation-card", label: "Engagement", id: "celestial" },
];

export function OccasionTiles() {
  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {OCCASION_TILES.map((t) => (
        <li key={t.href}>
          <Link href={t.href} className="group block">
            <span className="block overflow-hidden rounded-2xl bg-paper-2 p-2.5 pb-0 transition-colors group-hover:bg-[#ebe6dd]">
              <span className="block aspect-[4/3] overflow-hidden rounded-t-[10px]">
                <Thumb id={t.id} />
              </span>
            </span>
            <span className="mt-2 block text-[14.5px] font-medium">{t.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** How it works, shown with the real pieces instead of icons. */
export function HowItWorks() {
  const [pick, fill, send] = site.howTo.steps;
  return (
    <div className="grid gap-4 md:grid-cols-3" id="steps">
      <article className="rounded-3xl bg-paper-2 p-6">
        <div className="relative h-44">
          {["rosestudy", "gilded", "peony"].map((id, i) => (
            <div
              key={id}
              className="absolute top-2 w-[30%] overflow-hidden rounded-xl shadow-[0_14px_30px_-18px_rgb(31_28_25/0.6)] ring-1 ring-black/5"
              style={{ left: `${10 + i * 28}%`, rotate: `${[-6, 0, 6][i]}deg`, zIndex: i === 1 ? 2 : 1 }}
            >
              <Thumb id={id} />
            </div>
          ))}
        </div>
        <h3 className="mt-4 font-serif text-[20px] font-semibold">{pick.name}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{pick.text}</p>
      </article>

      <article className="rounded-3xl bg-paper-2 p-6">
        <div className="h-44 space-y-2.5 rounded-2xl bg-card p-4 text-[13px] shadow-[0_14px_30px_-22px_rgb(31_28_25/0.5)]" aria-hidden>
          <div className="grid grid-cols-2 gap-2">
            <span className="rounded-lg border border-line px-2.5 py-1.5">Zara</span>
            <span className="rounded-lg border border-line px-2.5 py-1.5">Ibrahim</span>
          </div>
          <span className="block rounded-lg border border-line px-2.5 py-1.5 text-muted">Walima · Sat 26 Dec · 7:30 PM</span>
          <span className="block rounded-lg border border-line px-2.5 py-1.5 text-muted">The Grand Ballroom, Kuala Lumpur</span>
          <span className="flex items-center justify-between px-0.5 pt-1">
            Countdown
            <span className="relative h-5 w-9 rounded-full bg-brand">
              <span className="absolute end-0.5 top-0.5 size-4 rounded-full bg-white" />
            </span>
          </span>
        </div>
        <h3 className="mt-4 font-serif text-[20px] font-semibold">{fill.name}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{fill.text}</p>
      </article>

      <article className="rounded-3xl bg-paper-2 p-6">
        <div className={`flex h-44 flex-col justify-end rounded-2xl bg-[#e6ddd1] p-3 ${FONT_VARS}`} aria-hidden>
          <div className="ms-auto w-[86%] overflow-hidden rounded-2xl rounded-ee-md bg-[#d9fdd3] text-[12px] shadow-sm">
            <div className="flex items-center gap-2 bg-[#0f3b32] p-2.5 text-[#f4ead6]">
              <span className="font-[family-name:var(--f-pinyon)] text-[18px] leading-none">Zara &amp; Ibrahim</span>
            </div>
            <div className="px-2.5 py-1.5 text-[#1f1c19]">
              <p className="font-medium">The Walima of Zara &amp; Ibrahim</p>
              <p className="text-[#1f1c19]/60">invite.dealwithmuhammad.com</p>
            </div>
            <p className="px-2.5 pb-1.5 text-end text-[10.5px] text-[#1f1c19]/50">9:41 ✓✓</p>
          </div>
        </div>
        <h3 className="mt-4 font-serif text-[20px] font-semibold">{send.name}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{send.text}</p>
      </article>
    </div>
  );
}

const FEATURES = [
  ["A real opening", "Doors swing open, curtains part, an envelope unseals. Each design has its own."],
  ["Every function", "Mehndi, nikah and walima on one invitation, each with its own date, venue and map."],
  ["Directions", "Google Maps and Waze buttons, plus a map on the card."],
  ["Add to calendar", "Google Calendar, Apple and Outlook, with every day included."],
  ["Countdown", "Days, hours and minutes to the first function."],
  ["Bismillah and dua", "Calligraphy, salam, a dua for the couple and the Hijri date, if you want them."],
  ["Dress code and programme", "Colour swatches for what to wear, and when dinner is served."],
  ["Family contacts", "WhatsApp and call buttons for the people guests should ask."],
  ["12 languages", "English, Malay, Urdu, Arabic, Hindi, Bengali and more. Guests can switch."],
  ["Music and auto-scroll", "Soft harp, piano or music box, and an invitation that scrolls itself."],
];

export function Features() {
  return (
    <dl className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
      {FEATURES.map(([t, d]) => (
        <div key={t} className="border-t border-line pt-4">
          <dt className="text-[16px] font-medium">{t}</dt>
          <dd className="mt-1 text-[15px] leading-relaxed text-muted">{d}</dd>
        </div>
      ))}
    </dl>
  );
}

export function OccasionLinks() {
  return (
    <div className="flex flex-wrap gap-2">
      {PAGE_LIST.map((p) => (
        <Link key={p.slug} href={`/${p.slug}`} className="rounded-xl border border-line bg-card px-3.5 py-2 text-[14px] text-muted transition-colors hover:border-ink/25 hover:text-ink">
          {p.label}
        </Link>
      ))}
    </div>
  );
}

export function CustomCta() {
  return (
    <div className="grid items-center gap-6 rounded-3xl bg-brand px-6 py-10 text-white sm:grid-cols-[1fr_auto] sm:px-10">
      <div>
        <h2 className="font-serif text-[28px] leading-tight font-semibold sm:text-[32px]">Want a design made just for you?</h2>
        <p className="mt-2 max-w-lg text-[15.5px] leading-relaxed text-white/80">
          Your own colours, monogram or artwork, or a theme that isn&apos;t in the gallery. Tell us about your event and we&apos;ll reply with ideas and a price.
        </p>
      </div>
      <Link href="/custom" className={buttonVariants({ className: "bg-white text-brand-ink hover:bg-white/90" })}>
        Request a custom design
      </Link>
    </div>
  );
}
