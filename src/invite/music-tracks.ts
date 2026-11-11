import type { MusicTrack } from "./types";

// The music hosts can choose from (the sound itself is in runtime/music.ts), and
// which piece each design starts with.

export const TRACK_INFO: Record<MusicTrack, { name: string; mood: string }> = {
  harp: { name: "Garden harp", mood: "Rippling harp with soft bells. Gentle and romantic." },
  piano: { name: "Canon in D", mood: "Pachelbel's wedding classic on piano." },
  musicbox: { name: "Music box", mood: "A little waltz of bells. Sweet and light." },
  strings: { name: "Velvet strings", mood: "Slow, swelling strings. Grand and cinematic." },
  oud: { name: "Oud & daf", mood: "Oud in maqam Hijaz over a frame drum. Warm and Eastern." },
  dholki: { name: "Dholki night", mood: "A bright tune over a dholak beat and claps. For mehndi and baraat." },
  softkeys: { name: "Soft keys", mood: "Mellow electric piano. Modern and relaxed." },
  celebrate: { name: "Celebration", mood: "Upbeat marimba, claps and a bouncy bass. For parties." },
};

const BY_DESIGN: Record<MusicTrack, string[]> = {
  harp: ["arbour", "gilded", "rosestudy", "orchid", "wildflower", "botanica", "muguet", "petals", "gulab", "mangni"],
  piano: ["lace", "filigree", "envelope", "editorial", "seaside", "blushletter"],
  musicbox: ["celestial", "cloudnine", "scrapbook", "ringbox"],
  strings: ["shagun", "velvetrose", "velvet", "deco", "chandelier", "kashi", "zardozi", "sheeshmahal"],
  oud: ["zellige", "jharokha", "haveli", "hilal", "lanterns", "aarsi", "bagh", "peony"],
  dholki: ["marigold", "doli", "ghoonghat", "mor", "shamiana"],
  softkeys: ["noor", "riad", "silkribbon", "blossom", "goldink", "boarding", "openhouse"],
  celebrate: ["confetti", "aatishbazi", "scroll"],
};

const DEFAULT = new Map(Object.entries(BY_DESIGN).flatMap(([track, ids]) => ids.map((id) => [id, track as MusicTrack])));

/** The piece a design starts with. */
export const trackFor = (template: string): MusicTrack => DEFAULT.get(template) ?? "harp";
