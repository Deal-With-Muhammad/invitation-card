import { trackFor } from "./music-tracks";
import { isPremium } from "@/lib/groups";

import { metaFor } from "./templates/catalog";
import { addDays, guessTimeZone, sampleDate } from "./time";
import type { EventItem, InviteData, Lang, Occasion, Person } from "./types";

// Sample details for each occasion, used when someone opens a template. They are
// realistic but made up, so the preview looks finished from the first second.

export const uid = () => Math.random().toString(36).slice(2, 9);

const person = (name: string, full = "", relation: Person["relation"] = "none", parents = ""): Person => ({
  name,
  full,
  relation,
  parents,
});

const ev = (p: Partial<EventItem>): EventItem => ({
  id: uid(),
  title: "",
  date: sampleDate(),
  start: "19:00",
  end: "22:30",
  venue: "The Grand Ballroom",
  address: "Jalan Ampang, 50450 Kuala Lumpur, Malaysia",
  mapUrl: "",
  note: "",
  ...p,
});

type Sample = Pick<InviteData, "people" | "hosts" | "milestone" | "events" | "schedule" | "contacts"> & {
  bismillah: InviteData["bismillah"];
  salam: boolean;
  dressColors: string[];
  show?: Partial<InviteData["show"]>;
  music?: boolean;
};

const couple = (a: string, af: string, ap: string, b: string, bf: string, bp: string) => [
  person(a, af, "son", ap),
  person(b, bf, "daughter", bp),
];

export function sampleFor(occasion: Occasion): Sample {
  const d = sampleDate();
  const islamic = { bismillah: "calligraphy" as const, salam: true };
  const plain = { bismillah: "none" as const, salam: false };
  const contacts = [
    { name: "Hamid (family)", phone: "+60 12-345 6789" },
    { name: "Sara (family)", phone: "+60 17-654 3210" },
  ];
  switch (occasion) {
    case "wedding":
      return {
        ...islamic,
        people: couple("Ibrahim", "Ibrahim Siddiqui", "Mr & Mrs Tariq Siddiqui", "Zara", "Zara Malik", "Mr & Mrs Faisal Malik"),
        hosts: "Mr & Mrs Tariq Siddiqui\nMr & Mrs Faisal Malik",
        milestone: "",
        events: [
          ev({ title: "Mehndi", date: addDays(d, -1), start: "19:30", end: "23:30", venue: "Malik Residence", address: "Jalan Setiabakti 5, Bukit Damansara, 50490 Kuala Lumpur" }),
          ev({ title: "Nikah & Baraat", date: d, start: "11:00", end: "15:00", venue: "Masjid Wilayah Persekutuan", address: "Jalan Tuanku Abdul Halim, 50480 Kuala Lumpur" }),
          ev({ title: "Walima", date: addDays(d, 1), start: "19:30", end: "23:00", venue: "The Grand Ballroom", address: "Jalan Ampang, 50450 Kuala Lumpur" }),
        ],
        schedule: [],
        contacts,
        dressColors: ["#1f5c4a", "#b8893b", "#e9dcc3", "#8c2f39"],
      };
    case "nikah":
      return {
        ...islamic,
        people: couple("Yusuf", "Yusuf Rahman", "Mr & Mrs Abdul Rahman", "Maryam", "Maryam Iqbal", "Mr & Mrs Javed Iqbal"),
        hosts: "Mr & Mrs Abdul Rahman\nMr & Mrs Javed Iqbal",
        milestone: "",
        events: [ev({ start: "15:00", end: "17:00", venue: "Masjid As-Salam", address: "Jalan Damai, 47301 Petaling Jaya, Selangor" })],
        schedule: [
          { time: "3:00 PM", title: "Arrival of guests" },
          { time: "3:30 PM", title: "Nikah ceremony" },
          { time: "4:15 PM", title: "Dua and hi-tea" },
        ],
        contacts,
        dressColors: ["#f3ecdf", "#c9b48a", "#7d8f7a"],
        music: false,
      };
    case "walima":
      return {
        ...islamic,
        people: couple("Omar", "Omar Farooq", "Mr & Mrs Khalid Farooq", "Hania", "Hania Qureshi", "Mr & Mrs Imran Qureshi"),
        hosts: "Mr & Mrs Khalid Farooq",
        milestone: "",
        events: [ev({ title: "Walima", start: "19:30", end: "23:00" })],
        schedule: [
          { time: "7:30 PM", title: "Guests arrive" },
          { time: "8:15 PM", title: "Arrival of the couple" },
          { time: "8:45 PM", title: "Dinner is served" },
        ],
        contacts,
        dressColors: ["#e9dcc3", "#c7a46b", "#5c6b5a", "#2f4b66"],
      };
    case "mehndi":
      return {
        ...plain,
        people: couple("Danish", "Danish Ali", "", "Aiza", "Aiza Sheikh", ""),
        hosts: "The Sheikh family",
        milestone: "",
        events: [ev({ title: "Mehndi Night", start: "20:00", end: "", venue: "Sheikh Residence", address: "Lorong Maarof, Bangsar, 59000 Kuala Lumpur" })],
        schedule: [
          { time: "8:00 PM", title: "Dholki and songs" },
          { time: "9:00 PM", title: "Mehndi rasm" },
          { time: "10:00 PM", title: "Dance performances" },
        ],
        contacts,
        dressColors: ["#f2a11f", "#e2557a", "#2f8f5b", "#f4d35e"],
      };
    case "engagement":
      return {
        ...islamic,
        people: couple("Rayan", "Rayan Haider", "Mr & Mrs Asad Haider", "Noor", "Noor Fatima", "Mr & Mrs Nadeem Akhtar"),
        hosts: "",
        milestone: "",
        events: [ev({ title: "Engagement", start: "18:00", end: "21:00", venue: "Lakeside Garden Hall", address: "Persiaran Tasik, 62000 Putrajaya" })],
        schedule: [
          { time: "6:00 PM", title: "Ring ceremony" },
          { time: "7:00 PM", title: "Dinner" },
        ],
        contacts,
        dressColors: ["#d9c7b0", "#a7b8a0", "#6e7f9b"],
      };
    case "reception":
      return {
        ...plain,
        people: [person("Daniel", "Daniel Lim"), person("Sofia", "Sofia Tan")],
        hosts: "",
        milestone: "",
        events: [ev({ title: "Reception", start: "19:00", end: "23:00", venue: "Rooftop at The Linden", address: "Jalan Sultan Ismail, 50250 Kuala Lumpur" })],
        schedule: [
          { time: "7:00 PM", title: "Cocktails" },
          { time: "8:00 PM", title: "Dinner and speeches" },
          { time: "9:30 PM", title: "First dance" },
        ],
        contacts: [],
        dressColors: ["#1f3a5f", "#c9a35f", "#efe6d8"],
      };
    case "birthday":
      return {
        ...plain,
        people: [person("Hana")],
        hosts: "",
        milestone: "7",
        events: [ev({ title: "Birthday party", start: "15:00", end: "18:00", venue: "Our place", address: "12 Jalan Bunga Raya, 47400 Petaling Jaya" })],
        schedule: [],
        contacts: [{ name: "Hana's mum", phone: "+60 12-345 6789" }],
        dressColors: [],
        show: { dress: false, gifts: false },
      };
    case "aqiqah":
      return {
        ...islamic,
        people: [person("Aleena", "Aleena Yusuf")],
        hosts: "Yusuf & Hira",
        milestone: "",
        events: [ev({ title: "Aqiqah", start: "12:30", end: "15:30", venue: "Our home", address: "Jalan SS 2/24, 47300 Petaling Jaya" })],
        schedule: [],
        contacts,
        dressColors: [],
        show: { dress: false },
        music: false,
      };
    case "babyshower":
      return {
        ...plain,
        people: [person("Sana", "Sana Bilal")],
        hosts: "Her sisters",
        milestone: "",
        events: [ev({ title: "Baby shower", start: "14:00", end: "17:00", venue: "The Tea Room", address: "Bangsar Village, 59100 Kuala Lumpur" })],
        schedule: [],
        contacts: [{ name: "Amna", phone: "+60 12-345 6789" }],
        dressColors: ["#f4d9c6", "#bfd8d2", "#f6efe3"],
        show: { dress: false },
      };
    case "eid":
      return {
        ...islamic,
        bismillah: "none",
        people: [person("The Rahman family")],
        hosts: "",
        milestone: "",
        events: [ev({ title: "Eid lunch", start: "13:00", end: "17:00", venue: "Rahman House", address: "Jalan Kiara 3, Mont Kiara, 50480 Kuala Lumpur" })],
        schedule: [],
        contacts: [],
        dressColors: [],
        show: { dress: false, gifts: false },
      };
    case "graduation":
      return {
        ...plain,
        people: [person("Ayaan", "Ayaan Malik")],
        hosts: "",
        milestone: "Class of 2026",
        events: [ev({ title: "Graduation party", start: "18:30", end: "22:00", venue: "The Courtyard", address: "Jalan Maarof, Bangsar, 59000 Kuala Lumpur" })],
        schedule: [],
        contacts: [],
        dressColors: [],
        show: { dress: false, gifts: false },
      };
    case "housewarming":
      return {
        ...plain,
        people: [person("Faisal"), person("Hira")],
        hosts: "",
        milestone: "",
        events: [ev({ title: "Housewarming", start: "16:00", end: "21:00", venue: "Our new home", address: "No. 8, Jalan Setia Murni, 47500 Subang Jaya" })],
        schedule: [],
        contacts: [],
        dressColors: [],
        show: { dress: false, gifts: false },
      };
    case "anniversary":
      return {
        ...plain,
        people: [person("Kamran"), person("Nadia")],
        hosts: "Their children",
        milestone: "25 years",
        events: [ev({ title: "Anniversary dinner", start: "19:30", end: "22:30", venue: "Olive Tree Restaurant", address: "Jalan Telawi, Bangsar, 59100 Kuala Lumpur" })],
        schedule: [],
        contacts: [],
        dressColors: ["#c9a35f", "#efe6d8"],
      };
    case "party":
    default:
      return {
        ...plain,
        people: [person("Laila")],
        hosts: "",
        milestone: "",
        events: [ev({ title: "Dinner party", start: "19:30", end: "23:00", venue: "Laila's place", address: "Jalan Kiara, Mont Kiara, 50480 Kuala Lumpur" })],
        schedule: [],
        contacts: [],
        dressColors: [],
        show: { dress: false, gifts: false },
      };
  }
}

const MUSIC_OFF: Occasion[] = ["nikah", "aqiqah"];

/** Special designs (every function in one link) start with all four functions. */
function allFunctions(): EventItem[] {
  const d = sampleDate();
  return [
    ev({ title: "Mayoun", date: addDays(d, -3), start: "16:00", end: "19:00", venue: "Malik Residence", address: "Jalan Setiabakti 5, Bukit Damansara, 50490 Kuala Lumpur" }),
    ev({ title: "Mehndi", date: addDays(d, -1), start: "19:30", end: "23:30", venue: "The Courtyard", address: "Jalan Tun Razak, 50400 Kuala Lumpur" }),
    ev({ title: "Baraat", date: d, start: "18:00", end: "22:30", venue: "Grand Marquee", address: "Jalan Ampang, 50450 Kuala Lumpur" }),
    ev({ title: "Walima", date: addDays(d, 1), start: "19:30", end: "23:00", venue: "The Grand Ballroom", address: "Jalan Sultan Ismail, 50250 Kuala Lumpur" }),
  ];
}

/** Yaadein (the 90s stage) reads like an old Urdu wedding card from the first second. */
function urduCard(): Pick<Sample, "people" | "hosts" | "events"> {
  const d = sampleDate();
  return {
    people: couple("ابراہیم", "محمد ابراہیم صدیقی", "جناب طارق صدیقی و بیگم", "زارا", "زارا ملک", "جناب فیصل ملک و بیگم"),
    hosts: "جناب طارق صدیقی و بیگم\nجناب فیصل ملک و بیگم",
    events: [
      ev({ title: "مہندی", date: addDays(d, -1), start: "19:30", end: "23:30", venue: "ملک ہاؤس", address: "گلبرگ، لاہور" }),
      ev({ title: "بارات", date: d, start: "19:00", end: "22:30", venue: "شالیمار ہال", address: "مال روڈ، لاہور" }),
      ev({ title: "ولیمہ", date: addDays(d, 1), start: "20:00", end: "23:00", venue: "پرل کانٹی نینٹل", address: "شاہراہِ قائدِ اعظم، لاہور" }),
    ],
  };
}

export function newInvite(template: string, occasion: Occasion, palette: string, lang: Lang = "en"): InviteData {
  const base = sampleFor(occasion);
  // Yaadein starts in Urdu (with Hindi and English to switch to) unless another language was asked for.
  const urdu = template === "yaadein" && lang === "en";
  if (urdu) lang = "ur";
  const sample = urdu ? { ...base, ...urduCard() } : metaFor(template).special ? { ...base, events: allFunctions() } : base;
  // Designs that aren't Islamic in style start without the Bismillah; the host can add it.
  const s = metaFor(template).islamic === false ? { ...sample, bismillah: "none" as const, salam: false } : sample;
  return {
    v: 1,
    template,
    occasion,
    look: { palette, colors: null, namesFont: "", opening: true },
    lang,
    langs: urdu ? ["ur", "hi", "en"] : lang === "en" ? ["en", "ms", "ur"] : ["en", lang],
    bismillah: s.bismillah,
    salam: s.salam,
    title: null,
    hosts: s.hosts,
    inviteLine: null,
    people: s.people,
    milestone: s.milestone,
    message: null,
    events: s.events,
    timeZone: typeof window === "undefined" ? "Asia/Kuala_Lumpur" : guessTimeZone(),
    schedule: s.schedule,
    dress: { title: null, note: null, colors: s.dressColors },
    contacts: s.contacts,
    prayer: { text: null, arabic: null },
    gifts: { title: null, note: null },
    closing: null,
    show: {
      countdown: true,
      calendar: true,
      map: true,
      schedule: s.schedule.length > 0,
      dress: s.dressColors.length > 0,
      contacts: s.contacts.length > 0,
      prayer: s.bismillah !== "none",
      gifts: true,
      hijri: false,
      // Premium designs start with guest replies on; the host can turn them off.
      ...(isPremium(template) ? { rsvp: true, wishes: true } : {}),
      ...s.show,
    },
    music: { on: s.music ?? !MUSIC_OFF.includes(occasion), track: trackFor(template) },
    autoScroll: { on: false, speed: 2 },
  };
}

/** Moves the main person first for occasions where that reads better, keeping the rest. */
export function retargetOccasion(data: InviteData, occasion: Occasion): InviteData {
  const s = sampleFor(occasion);
  const wantsTwo = s.people.length > 1;
  const people = [...data.people];
  if (wantsTwo && people.length < 2) people.push(...s.people.slice(people.length));
  if (!wantsTwo && people.length > 1) people.length = 1;
  return { ...data, occasion, people, milestone: data.milestone || s.milestone };
}

/** Sample names that should not go out on a real invitation by accident. */
export const SAMPLE_NAMES = [
  "Ibrahim", "Zara", "Yusuf", "Maryam", "Omar", "Hania", "Danish", "Aiza", "Rayan", "Noor",
  "Daniel", "Sofia", "Hana", "Aleena", "Sana", "The Rahman family", "Ayaan", "Faisal", "Hira",
  "Kamran", "Nadia", "Laila",
];
