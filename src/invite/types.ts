// The shape of one invitation. This is what the editor builds, what gets saved
// behind a share link, and what every template renders. Text fields set to null
// fall back to the default wording for the occasion in the guest's language, so
// an untouched invitation reads naturally in every language it offers.

export const LANGS = ["en", "ms", "id", "ur", "ar", "hi", "bn", "fa", "tr", "es", "fr", "pt"] as const;
export type Lang = (typeof LANGS)[number];

export const OCCASIONS = [
  "wedding",
  "nikah",
  "walima",
  "mehndi",
  "engagement",
  "reception",
  "birthday",
  "aqiqah",
  "babyshower",
  "eid",
  "graduation",
  "housewarming",
  "anniversary",
  "party",
] as const;
export type Occasion = (typeof OCCASIONS)[number];

export type Relation = "son" | "daughter" | "none";

export type Person = {
  /** The big name on the card, usually a first name. */
  name: string;
  /** Full name for the formal lines, e.g. "Zara Ahmed". Optional. */
  full: string;
  relation: Relation;
  /** "Mr & Mrs Tariq Ahmed". Shown as "Daughter of Mr & Mrs Tariq Ahmed". */
  parents: string;
};

export type EventItem = {
  id: string;
  /** "Nikah", "Mehndi", "Walima"… Empty uses the occasion's name. */
  title: string;
  /** YYYY-MM-DD in the event's own time zone. */
  date: string;
  /** HH:mm, 24-hour. Empty means "all day". */
  start: string;
  end: string;
  venue: string;
  address: string;
  /** A Google Maps / Waze / Apple Maps link. Optional; the address is searched otherwise. */
  mapUrl: string;
  note: string;
};

export type ScheduleItem = { time: string; title: string };
export type Contact = { name: string; phone: string };

export type Bismillah = "none" | "calligraphy" | "arabic";

export const MUSIC_TRACKS = ["harp", "piano", "musicbox", "strings", "oud", "dholki", "softkeys", "celebrate"] as const;
export type MusicTrack = (typeof MUSIC_TRACKS)[number];

export type InviteData = {
  v: 1;
  template: string;
  occasion: Occasion;

  look: {
    /** A palette id from the template, or "custom" for `colors`. */
    palette: string;
    colors: { bg: string; ink: string; accent: string } | null;
    /** Font key for the names, or "" for the template's own. */
    namesFont: string;
    /** Play the tap-to-open cover. */
    opening: boolean;
  };

  lang: Lang;
  /** Languages guests can switch to. Always includes `lang`. */
  langs: Lang[];

  bismillah: Bismillah;
  salam: boolean;

  title: string | null;
  hosts: string;
  inviteLine: string | null;
  people: Person[];
  /** Big number or phrase some occasions show: an age, "25 years", "Class of 2026". */
  milestone: string;
  message: string | null;

  events: EventItem[];
  timeZone: string;
  schedule: ScheduleItem[];

  dress: { title: string | null; note: string | null; colors: string[] };
  contacts: Contact[];
  prayer: { text: string | null; arabic: string | null };
  gifts: { title: string | null; note: string | null };
  closing: string | null;

  show: {
    countdown: boolean;
    calendar: boolean;
    map: boolean;
    schedule: boolean;
    dress: boolean;
    contacts: boolean;
    prayer: boolean;
    gifts: boolean;
    hijri: boolean;
  };

  music: { on: boolean; track: MusicTrack };
  autoScroll: { on: boolean; speed: 1 | 2 | 3 };
};

export type SectionId =
  | "invite"
  | "countdown"
  | "events"
  | "schedule"
  | "dress"
  | "contacts"
  | "prayer"
  | "gifts"
  | "closing";
