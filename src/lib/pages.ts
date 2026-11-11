import type { Occasion } from "@/invite/types";

import { site } from "./site";

// Keyword landing pages. Each answers its search in the first paragraph, shows the
// designs for that occasion, and links into the editor with the occasion preset.

export type LandingPage = {
  slug: string;
  /** Short anchor text for links and breadcrumbs. */
  label: string;
  title: string;
  description: string;
  answer: string;
  occasion: Occasion;
  /** The design shown first and opened by the main button. */
  featured: string;
  /** Gallery filter: templates that suit any of these. */
  occasions: Occasion[];
  lang: "en" | "ms";
  sections: { id: string; heading: string; body?: string; items?: { term: string; text: string }[] }[];
  /** Section id holding the numbered steps (HowTo). */
  steps: string;
  faqs: { q: string; a: string }[];
  dateModified: string;
};

const D = "2026-10-29";

const stepsEn = (what: string, extra: string) => ({
  id: "how",
  heading: `How to make a ${what} online`,
  items: [
    { term: "Choose a design", text: `Pick one of the designs below. Open any of them to see the whole animated ${what} before you start.` },
    { term: "Fill in your details", text: `Type the names, date, time and venue. ${extra} The preview updates as you type.` },
    { term: "Publish and share", text: "Choose your link, publish, and send it on WhatsApp or anywhere else. Keep the private edit link so you can change details later." },
  ],
});

export const PAGES: Record<string, LandingPage> = {
  "wedding-invitation-maker": {
    slug: "wedding-invitation-maker",
    featured: "cypress",
    label: "Wedding invitation maker",
    title: "Free Online Wedding Invitation Maker",
    description: "Make an animated wedding invitation online and share it as a link on WhatsApp. Add every function, maps, countdown and calendar. Free, no sign-up.",
    answer:
      "Make a wedding invitation online in a few minutes: pick a design, type the couple's and parents' names, add each function with its date and venue, and share one link. Guests tap to open it, see a countdown, get directions on Google Maps or Waze and save the dates to their calendar.",
    occasion: "wedding",
    occasions: ["wedding", "reception", "nikah", "walima"],
    lang: "en",
    sections: [
      stepsEn("wedding invitation", "Add the mehndi, nikah, baraat or walima as separate days if you like."),
      {
        id: "included",
        heading: "What every wedding invitation includes",
        items: [
          { term: "A real opening", text: "Doors, curtains, an envelope or a veil of flowers that opens when guests tap." },
          { term: "All your functions", text: "Each day with its own time, venue, map and calendar button." },
          { term: "Families first", text: "Hosts, parents' names and “Son of / Daughter of” lines, written your way." },
          { term: "Your language", text: "English, Urdu, Malay, Arabic and more, with a switch for guests." },
        ],
      },
    ],
    steps: "how",
    faqs: [
      { q: "How much does an online wedding invitation cost?", a: "Nothing. DWM Invite is free to use, with no sign-up and no ads." },
      { q: "Can I send the wedding invitation on WhatsApp?", a: "Yes. Publishing gives you a short link; paste it into WhatsApp and it shows a preview with the couple's names. There's also a QR code for printed cards." },
      { q: "Can I change the date or venue later?", a: "Yes. Use your private edit link, save, and the same link shows the new details." },
    ],
    dateModified: D,
  },
  "nikah-invitation-card": {
    slug: "nikah-invitation-card",
    featured: "majlis",
    label: "Nikah invitation card",
    title: "Nikah Invitation Card Maker, Free and Online",
    description: "Create a nikah invitation card online with Bismillah, salam and a dua for the couple. Share it on WhatsApp with maps and the Hijri date. Free.",
    answer:
      "Make a nikah invitation card online with Bismillah calligraphy, the salam and a dua for the couple, then share it as a link. Add the masjid or venue with directions, the time of the nikah, the Hijri date and the families' names. It's free and works on every phone.",
    occasion: "nikah",
    occasions: ["nikah", "walima", "wedding"],
    lang: "en",
    sections: [
      stepsEn("nikah invitation", "Turn on Bismillah, salam, the dua and the Hijri date if you want them."),
      {
        id: "touches",
        heading: "Islamic touches, all optional",
        items: [
          { term: "Bismillah", text: "As Nastaliq calligraphy or as Arabic text at the top of the card." },
          { term: "Salam", text: "Assalamu alaikum wa rahmatullah before the families' names." },
          { term: "Dua for the couple", text: "بَارَكَ اللَّهُ لَهُمَا with its meaning, or your own words." },
          { term: "Hijri date", text: "Shown under the date of each function." },
        ],
      },
    ],
    steps: "how",
    faqs: [
      { q: "Is music on by default for a nikah?", a: "No. For a nikah the background music starts off; you can turn it on if you want it." },
      { q: "Can I write the nikah card in Urdu?", a: "Yes. Choose Urdu as the main language and the card's wording, dates and labels appear in Urdu." },
      { q: "Can I add the walima on the same card?", a: "Yes. Add the walima as a second day with its own date, venue and map." },
    ],
    dateModified: D,
  },
  "walima-invitation-card": {
    slug: "walima-invitation-card",
    featured: "kashi",
    label: "Walima invitation card",
    title: "Walima Invitation Card, Online and Free",
    description: "Design a walima invitation card online and share it as a WhatsApp link with the venue map, programme and dress code. Free, in English or Urdu.",
    answer:
      "Create a walima invitation card online: pick a design, add the couple's and hosts' names, the dinner time and venue, and send one link to everyone. Guests get directions, a countdown, the programme for the evening and a calendar reminder.",
    occasion: "walima",
    occasions: ["walima", "reception", "wedding", "nikah"],
    lang: "en",
    sections: [stepsEn("walima invitation", "Add a programme (arrival, dinner) and a dress code with colour swatches if you like.")],
    steps: "how",
    faqs: [
      { q: "What should a walima invitation say?", a: "Usually the hosts' names, a line such as “request the pleasure of your company at the Walima of”, the couple's names, then the date, time and venue. DWM Invite fills this in for you and you can rewrite any of it." },
      { q: "Can I show the dress code?", a: "Yes. Turn on Dress code, write a note and add up to six colour swatches." },
    ],
    dateModified: D,
  },
  "mehndi-invitation-card": {
    slug: "mehndi-invitation-card",
    featured: "marigold",
    label: "Mehndi invitation card",
    title: "Mehndi Invitation Card Maker: Colourful and Free",
    description: "Make a bright mehndi or dholki invitation online with marigold designs, a programme and music. Share it on WhatsApp in a minute. Free.",
    answer:
      "Make a mehndi invitation online with marigolds, paisleys and mehndi green, add the night's programme and the venue, and share it as a link. It opens as a marigold toran lifts away and can play soft music; guests can message the family on WhatsApp straight from the card.",
    occasion: "mehndi",
    occasions: ["mehndi", "wedding", "party"],
    lang: "en",
    sections: [stepsEn("mehndi invitation", "Add the dholki and mehndi rasm to the programme.")],
    steps: "how",
    faqs: [
      { q: "Can the mehndi be part of the wedding invitation?", a: "Yes. Either make a separate mehndi card or add the mehndi as one of the days on the main wedding invitation." },
      { q: "Can I change the colours?", a: "Yes. Each design has several palettes, or pick your own colours." },
    ],
    dateModified: D,
  },
  "kad-kahwin-digital": {
    slug: "kad-kahwin-digital",
    featured: "songket",
    label: "Kad kahwin digital",
    title: "Kad Kahwin Digital Percuma",
    description: "Buat kad kahwin digital percuma dalam beberapa minit. Pilih reka bentuk, isi nama, tarikh dan lokasi, dan kongsi satu pautan di WhatsApp. Google Maps, Waze dan kalendar.",
    answer:
      "Buat kad kahwin digital secara percuma: pilih reka bentuk, isi nama pengantin dan ibu bapa, tarikh, masa dan lokasi majlis, kemudian kongsi satu pautan di WhatsApp. Tetamu boleh buka kad, lihat kiraan detik, dapatkan arah melalui Google Maps atau Waze dan simpan tarikh dalam kalendar.",
    occasion: "wedding",
    occasions: ["wedding", "nikah", "walima", "engagement"],
    lang: "ms",
    sections: [
      {
        id: "how",
        heading: "Cara buat kad kahwin digital",
        items: [
          { term: "Pilih reka bentuk", text: "Contohnya Red Velvet dengan sampul baldu dan bunga mawar emas, atau mana-mana reka bentuk lain. Buka dahulu untuk melihat animasinya." },
          { term: "Isi maklumat majlis", text: "Nama pengantin, ibu bapa, tarikh, masa, lokasi dan aturcara majlis. Pilih Bahasa Melayu sebagai bahasa utama." },
          { term: "Terbitkan dan kongsi", text: "Pilih pautan anda, terbitkan, dan hantar di WhatsApp. Simpan pautan edit peribadi untuk ubah maklumat kemudian." },
        ],
      },
      {
        id: "ciri",
        heading: "Apa yang ada dalam setiap kad",
        items: [
          { term: "Animasi pembukaan", text: "Sampul surat dibuka dan kad diangkat keluar, pintu atau tirai." },
          { term: "Lokasi", text: "Butang Google Maps dan Waze, serta peta." },
          { term: "Tambah ke kalendar", text: "Google Calendar, Apple dan Outlook." },
          { term: "Hubungi", text: "Butang WhatsApp dan panggilan untuk wakil keluarga." },
        ],
      },
    ],
    steps: "how",
    faqs: [
      { q: "Adakah kad kahwin digital ini percuma?", a: "Ya, percuma sepenuhnya. Tiada pendaftaran dan tiada iklan." },
      { q: "Boleh ubah maklumat selepas kad dikongsi?", a: "Boleh. Gunakan pautan edit peribadi anda; tetamu akan nampak maklumat terkini pada pautan yang sama." },
      { q: "Boleh tetamu RSVP?", a: "Belum lagi. Buat masa ini tetamu boleh menghubungi wakil keluarga melalui WhatsApp terus dari kad." },
    ],
    dateModified: D,
  },
  "birthday-invitation-maker": {
    slug: "birthday-invitation-maker",
    featured: "confetti",
    label: "Birthday invitation maker",
    title: "Online Birthday Invitation Maker, Free",
    description: "Make a fun birthday invitation online with confetti, a gift box that pops open and the age in big numbers. Share it as a link on WhatsApp. Free.",
    answer:
      "Make a birthday invitation online: pick a design, type the birthday person's name and age, the party time and place, and share the link. Kids' parties, milestone birthdays and surprise parties all work, with a countdown, directions and a calendar button.",
    occasion: "birthday",
    occasions: ["birthday", "party", "babyshower"],
    lang: "en",
    sections: [stepsEn("birthday invitation", "Put the age or a phrase like “turns 30” in the big number.")],
    steps: "how",
    faqs: [
      { q: "Can I make a kids' birthday invitation?", a: "Yes. Confetti Pop and Cloud Nine are made for kids' parties; add a parent's WhatsApp so other parents can reply." },
      { q: "Can I turn off the countdown?", a: "Yes. Every extra, including the countdown, map and music, can be switched off." },
    ],
    dateModified: D,
  },
  "aqiqah-invitation-card": {
    slug: "aqiqah-invitation-card",
    featured: "cloudnine",
    label: "Aqiqah invitation card",
    title: "Aqiqah Invitation Card Maker, Free",
    description: "Make an aqiqah invitation card online with the baby's name, Bismillah and a dua, and share it on WhatsApp. Soft designs, maps and calendar. Free.",
    answer:
      "Make an aqiqah invitation online: add your baby's name, the parents, the date and the venue, turn on Bismillah and a dua for the child if you like, and share one link with family and friends. Gentle designs with clouds, moons and stars.",
    occasion: "aqiqah",
    occasions: ["aqiqah", "babyshower"],
    lang: "en",
    sections: [stepsEn("aqiqah invitation", "Write the parents as hosts, for example “Yusuf & Hira”.")],
    steps: "how",
    faqs: [
      { q: "What is written on an aqiqah card?", a: "Usually a line of thanks to Allah, the baby's name, the parents' names, and the date, time and place. DWM Invite fills in gentle wording you can change." },
      { q: "Is there music?", a: "For aqiqah the music starts off; you can turn it on if you want it." },
    ],
    dateModified: D,
  },
  "engagement-invitation-card": {
    slug: "engagement-invitation-card",
    featured: "atelier",
    label: "Engagement invitation card",
    title: "Engagement Invitation Card Maker, Online and Free",
    description: "Create an engagement or ring ceremony invitation online and share it on WhatsApp. Starry, botanical and classic designs with maps and calendar. Free.",
    answer:
      "Make an engagement invitation online: pick a design, add the couple, the families and the ring ceremony details, and send one link. Guests open it with an animation, see the countdown and venue, and add it to their calendar.",
    occasion: "engagement",
    occasions: ["engagement", "wedding", "nikah"],
    lang: "en",
    sections: [stepsEn("engagement invitation", "Add the ring ceremony and dinner to the programme.")],
    steps: "how",
    faqs: [{ q: "Can I call it a mangni or baat pakki?", a: "Yes. Every word is editable, including the title on the first screen." }],
    dateModified: D,
  },
  "digital-invitation-card": {
    slug: "digital-invitation-card",
    featured: "editorial",
    label: "Digital invitation card",
    title: "Digital Invitation Card Maker for Any Occasion",
    description: `Make a digital invitation card for any occasion: weddings, birthdays, graduations, housewarmings, anniversaries and parties. ${site.name} is free.`,
    answer:
      "A digital invitation card is an invitation you send as a link instead of on paper. Make one here for any occasion: choose a design, add your details, and share the link on WhatsApp, Instagram or email. Guests open it on their phone, with directions, a countdown and a calendar button.",
    occasion: "party",
    occasions: ["party", "graduation", "housewarming", "anniversary", "birthday"],
    lang: "en",
    sections: [stepsEn("digital invitation", "Choose the occasion and the wording changes to match.")],
    steps: "how",
    faqs: [
      { q: "Is a digital invitation as nice as a printed one?", a: "It can be nicer: it opens with an animation, plays soft music if you want, shows the map and never gets lost. You also get a QR code if you print cards too." },
      { q: "Does it work on iPhone and Android?", a: "Yes. It opens in any modern phone browser, no app needed." },
    ],
    dateModified: D,
  },
};

export const PAGE_LIST = Object.values(PAGES);

export const pageFaqs = (page: LandingPage) => page.faqs;
