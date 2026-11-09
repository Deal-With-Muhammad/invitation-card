// A real song for one invitation, instead of its synthesised music. Plays through
// YouTube's own player, so no audio file of someone's song lives on this site.

export type SongPart = {
  /** The YouTube video id. */
  video: string;
  /** Seconds into the video. Without them, the whole video. */
  start?: number;
  end?: number;
};

/** The part repeats for as long as music plays; the intro plays once, on the tap that opens the card. */
export type Song = SongPart & { intro?: SongPart };

const SONGS: Record<string, Song> = {
  // Shukran Allah (Kurbaan), requested by the host.
  "aleem-and-mussera": { video: "z_B0PF8Ug00", start: 0, end: 23 },
  // A glitter sound as the card opens, then Bi Saraha (sped-up piano), requested by the host.
  "ffarah-and-abid": { video: "wiKKkdMOGHc", intro: { video: "IZWL2gALgvM" } },
};

export const songFor = (slug: string): Song | undefined => SONGS[slug];
