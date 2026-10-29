import { CATALOG } from "@/invite/templates/catalog";
import { LANGS } from "@/invite/types";

// Single source of truth for this site's copy. Every claim must match what the
// product does today (no RSVP yet, no photo uploads).

const DESIGNS = CATALOG.length;
const LANG_COUNT = LANGS.length;

export const site = {
  id: "invite",
  name: "DWM Invite",
  url: "https://invite.dealwithmuhammad.com",
  host: "invite.dealwithmuhammad.com",
  title: "DWM Invite: Free Online Invitation Maker for Weddings & Parties",
  description: `Make a beautiful digital invitation in minutes. Pick one of ${DESIGNS} designs, add names, date and venue, and share one link on WhatsApp. Weddings, nikah, birthdays, aqiqah. Free.`,
  tagline: "Invitations you send as a link",
  answer: `DWM Invite is a free online invitation maker. Choose one of ${DESIGNS} animated designs, type your names, dates and venue, pick your colours and language, and get a link to send on WhatsApp. Guests tap it to open the invitation, see a countdown, the map and every function, and add it to their calendar. No app and no sign-up.`,
  appDescription: `A free web app for making animated digital invitations for weddings, nikah, walima, mehndi, engagements, receptions, birthdays, aqiqah, baby showers, graduations, housewarmings, anniversaries and parties. Hosts choose from ${DESIGNS} designs, each with its own tap-to-open animation and several colour palettes or their own colours, then edit every word: names, parents, hosts, the message, and any number of days or functions with their own date, time and venue. Optional extras include Bismillah, salam and a dua, a Hijri date, a countdown, Google Maps and Waze directions, add to calendar, a programme, a dress code with colour swatches, WhatsApp and call buttons, soft background music and auto-scroll. Invitations can be shown in ${LANG_COUNT} languages including Urdu, Malay and Arabic. Publishing gives a short link and a QR code, plus a private link to edit it later.`,
  color: "#1c5652",
  keywords: [
    "online invitation maker",
    "digital invitation card",
    "wedding invitation maker",
    "online wedding card",
    "nikah invitation card",
    "walima invitation card",
    "mehndi invitation card",
    "kad kahwin digital",
    "birthday invitation maker",
    "aqiqah invitation card",
    "e-invite",
    "whatsapp invitation link",
    "animated wedding invitation",
    "free invitation maker",
  ],
  featureList: [
    `${DESIGNS} designs, each with its own tap-to-open animation`,
    "Every word is editable: names, parents, hosts, message and closing",
    "Add as many days or functions as you need, each with its own venue",
    "Choose a colour palette or your own colours, and the font for the names",
    `${LANG_COUNT} languages including Urdu, Malay, Arabic and Bengali; guests can switch`,
    "Optional Bismillah, salam, dua and Hijri date",
    "Countdown, Google Maps and Waze, and add to calendar",
    "Programme, dress code with colours, WhatsApp and call buttons",
    "Soft background music and auto-scroll, both optional",
    "A short link and a QR code to share, and a private link to edit it later",
    "Free, no sign-up, no ads",
  ],
  howTo: {
    name: "How to make an online invitation",
    description: "Make a digital invitation and share it as a link.",
    steps: [
      {
        name: "Pick a design",
        text: "Browse the designs and filter by occasion: wedding, nikah, mehndi, birthday, aqiqah and more. Open any of them to see the full animated invitation.",
      },
      {
        name: "Add your details",
        text: "Type the names, date, time and venue. Add more days for mehndi, nikah or walima, choose colours and language, and turn on the extras you want. The preview updates as you type.",
      },
      {
        name: "Publish and share the link",
        text: "Choose your link, publish, and send it on WhatsApp or anywhere else. Keep the private edit link to change details later; guests always see the latest version.",
      },
    ],
  },
  faqs: [
    {
      q: "Is DWM Invite free?",
      a: "Yes. Making, publishing and sharing an invitation is free, with no sign-up and no ads. A small “Made with DWM Invite” line sits at the very bottom of each invitation.",
    },
    {
      q: "How do guests open the invitation?",
      a: "You send them your link on WhatsApp, Instagram, SMS or email. They tap it and the invitation opens in their phone's browser with its opening animation. Nobody needs to install an app.",
    },
    {
      q: "Can I change the details after I've shared it?",
      a: "Yes. When you publish you get a private edit link (it's also saved on your device). Open it, change anything, save, and everyone who has your link sees the update straight away.",
    },
    {
      q: "Can one invitation have the mehndi, nikah and walima?",
      a: "Yes. Add each function as its own day with a date, time, venue and map. The invitation lists them all, shows the date range on the first screen and counts down to the first one.",
    },
    {
      q: "Which languages can the invitation be in?",
      a: `${LANG_COUNT}: English, Bahasa Melayu, Bahasa Indonesia, Urdu, Arabic, Hindi, Bengali, Persian, Turkish, Spanish, French and Portuguese. Pick the main language and which ones guests can switch to. Words you write yourself stay as you typed them.`,
    },
    {
      q: "Can I add Bismillah and a dua?",
      a: "Yes, if you want them. You can show Bismillah as calligraphy or Arabic text, the salam greeting, a dua for the couple or the baby, and the Hijri date. All of them are optional and off for non-religious occasions.",
    },
    {
      q: "Can guests RSVP?",
      a: "Not yet. For now guests can message or call the contacts you add, straight from the invitation on WhatsApp. Online RSVP is planned.",
    },
    {
      q: "Can I upload photos?",
      a: "Not at the moment. Each design comes with its own artwork, and you can change its colours and fonts.",
    },
    {
      q: "Can you make a custom design for us?",
      a: "Yes. If you want your own artwork, colours or a design that isn't in the gallery, send a request from the Custom design page and we'll reply on WhatsApp or email.",
    },
    {
      q: "Who made DWM Invite?",
      a: "DWM Invite was made by Muhammad Ahmad, a web and mobile app developer in Kuala Lumpur, Malaysia. See more of his work at dealwithmuhammad.com or email me@dealwithmuhammad.com.",
    },
  ],
  updated: { iso: "2026-10-29", label: "October 2026" },
};

export type Site = typeof site;
