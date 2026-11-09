// A real song for one invitation, instead of its synthesised music. Plays through
// YouTube's own player, so no audio file of someone's song lives on this site.

export type SongPart = {
  /** The YouTube video id. */
  video: string;
  /** Seconds into the video. Without them, the whole video. */
  start?: number;
  end?: number;
};

/** The part repeats for as long as music plays. The intro plays during the opening (from the tap) and the part once the card is open. */
export type Song = SongPart & { intro?: SongPart };

const SONGS: Record<string, Song> = {
  // Shukran Allah (Kurbaan), requested by the host.
  "aleem-and-mussera": { video: "z_B0PF8Ug00", start: 0, end: 23 },
  // A glitter sound during the opening, then Bi Saraha (sped-up piano) once the card is open, requested by the host.
  "ffarah-and-abid": { video: "wiKKkdMOGHc", intro: { video: "IZWL2gALgvM" } },
};

export const songFor = (slug: string): Song | undefined => SONGS[slug];
