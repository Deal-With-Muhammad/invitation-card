import type { Metadata } from "next";

import { Eyebrow } from "@/components/sections";

import { CustomForm } from "./custom-form";

export const metadata: Metadata = {
  title: "Custom Invitation Design",
  description: "Want an invitation designed just for you? Your own colours, monogram, artwork or theme. Send a request and get a reply on WhatsApp or email.",
  alternates: { canonical: "/custom" },
};

export default function CustomPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-12 px-4 pt-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:pt-16">
      <div>
        <Eyebrow>Custom design</Eyebrow>
        <h1 className="font-serif text-[42px] leading-[1.06] sm:text-[52px]">An invitation made just for you</h1>
        <p className="mt-5 max-w-md text-[16.5px] leading-relaxed text-muted">
          If none of the designs feels quite right, we can make one around your event: your colours and theme, a monogram, a custom opening, wording in your languages, or
          matching cards for every function.
        </p>
        <ul className="mt-8 space-y-4 text-[15px]">
          {[
            ["Tell us about it", "Send a few lines about the occasion and the look you want."],
            ["Get ideas and a quote", "We'll reply on WhatsApp or email with a direction and a price before any work starts."],
            ["Share your link", "You get your own invitation link, editable like every other DWM Invite card."],
          ].map(([t, d], i) => (
            <li key={t} className="grid grid-cols-[32px_1fr] gap-3">
              <span className="grid size-7 place-items-center rounded-full bg-paper-2 text-[13px] font-semibold">{i + 1}</span>
              <span>
                <span className="block font-medium">{t}</span>
                <span className="text-muted">{d}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <CustomForm />
    </main>
  );
}
