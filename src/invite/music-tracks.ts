import { MUSIC_TRACKS, type MusicTrack } from "./types";

// The music hosts can choose from (the sound itself is in runtime/music.ts), how
// the editor lays the list out, and which piece each design starts with.

export const TRACK_INFO: Record<MusicTrack, { name: string; mood: string }> = {
  harp: { name: "Garden harp", mood: "Rippling harp with soft bells. Gentle and romantic." },
  piano: { name: "Canon in D", mood: "Pachelbel's wedding classic on piano." },
  musicbox: { name: "Music box", mood: "A little waltz of bells. Sweet and light." },
  strings: { name: "Velvet strings", mood: "Slow, swelling strings. Grand and cinematic." },
  oud: { name: "Oud & daf", mood: "Oud in maqam Hijaz over a frame drum. Warm and Eastern." },
  dholki: { name: "Dholki night", mood: "A bright tune over a dholak beat and claps. For mehndi and baraat." },
  softkeys: { name: "Soft keys", mood: "Mellow electric piano. Modern and relaxed." },
  celebrate: { name: "Celebration", mood: "Upbeat marimba, claps and a bouncy bass. For parties." },
  waltz: { name: "First dance", mood: "A slow waltz for piano and soft strings. Tender and unhurried." },
  guitar: { name: "Spanish guitar", mood: "Fingerpicked nylon guitar in a minor key. Warm and Mediterranean." },
  koto: { name: "Koto & flute", mood: "Plucked koto with a soft bamboo flute. Calm and East Asian." },
  gamelan: { name: "Gamelan", mood: "Bronze chimes and a soft gong, in the Malay and Javanese way. Gentle and stately." },
  kalimba: { name: "Kalimba", mood: "Thumb piano and marimba over light hand drums. Bright and sunny." },
  santoor: { name: "Santoor & tabla", mood: "Santoor in raga Yaman over a tanpura drone and soft tabla. Serene and classical." },
  qanun: { name: "Qanun", mood: "Qanun in maqam Nahawand over a slow frame drum. Calm and elegant." },
  lullaby: { name: "Lullaby", mood: "A rocking celesta tune over a warm pad. For baby showers and aqiqah." },
  jazz: { name: "Lounge trio", mood: "Electric piano, walking bass and brushes. For cocktail hours and engagement parties." },
  aurora: { name: "Aurora", mood: "Slow, shifting pads and a few piano notes. Minimal and modern." },
};

/** The editor's list, by feel. The design's own piece is shown first, above these. */
export const TRACK_GROUPS: { title: string; tracks: MusicTrack[] }[] = [
  { title: "Romantic & classical", tracks: ["harp", "piano", "waltz", "strings", "guitar"] },
  { title: "From around the world", tracks: ["oud", "qanun", "dholki", "santoor", "koto", "gamelan", "kalimba"] },
  { title: "Modern & playful", tracks: ["softkeys", "jazz", "aurora", "celebrate", "musicbox", "lullaby"] },
];

/** The list as the editor shows it for one design. A track nobody put in a group still appears, at the end. */
export function trackSections(suggested: MusicTrack): { title: string; tracks: MusicTrack[] }[] {
  const grouped = new Set(TRACK_GROUPS.flatMap((g) => g.tracks));
  const stray = MUSIC_TRACKS.filter((t) => !grouped.has(t));
  return [
    { title: "Made for this design", tracks: [suggested] },
    ...TRACK_GROUPS.map((g, i) => ({ title: g.title, tracks: [...g.tracks, ...(i === TRACK_GROUPS.length - 1 ? stray : [])].filter((t) => t !== suggested) })),
  ].filter((s) => s.tracks.length > 0);
}

// The piece each design starts with. A new design goes in the row of the track that
// suits it; an id that is not a design (yet) is harmless here. Keep any one track to
// about six designs, so the gallery does not all sound the same.
const BY_DESIGN: Record<MusicTrack, string[]> = {
  // gardens and florals
  harp: ["gilded", "muguet", "peony", "arbour", "gulab", "glasshouse"],
  waltz: ["rosestudy", "orchid", "chandelier", "porcelain", "cypress", "aisle"],
  guitar: ["wildflower", "botanica", "seaside", "amalfi", "hacienda"],
  // stationery and grand rooms
  piano: ["lace", "filigree", "envelope", "blushletter", "nacre"],
  strings: ["shagun", "velvetrose", "zardozi", "velvet", "sheeshmahal"],
  // arches, courtyards and lanterns
  oud: ["zellige", "riad", "haveli", "lanterns", "aarsi"],
  qanun: ["kashi", "celestial", "noor", "hilal", "majlis"],
  // South Asia
  dholki: ["marigold", "doli", "ghoonghat", "shamiana", "yaadein"],
  santoor: ["petals", "jharokha", "bagh", "mor", "mangni", "mandap"],
  // East and South-East Asia, Africa
  koto: ["blossom", "sakura", "lacquer"],
  gamelan: ["songket"],
  kalimba: ["savanna"],
  // modern
  softkeys: ["boarding", "silkribbon"],
  jazz: ["deco", "openhouse", "emerald"],
  aurora: ["editorial", "goldink", "atelier"],
  // babies, keepsakes and parties
  musicbox: ["scrapbook", "ringbox"],
  lullaby: ["cloudnine"],
  celebrate: ["confetti", "scroll", "aatishbazi"],
};

const DEFAULT = new Map(Object.entries(BY_DESIGN).flatMap(([track, ids]) => ids.map((id) => [id, track as MusicTrack])));

/** The piece a design starts with. */
export const trackFor = (template: string): MusicTrack => DEFAULT.get(template) ?? "harp";
