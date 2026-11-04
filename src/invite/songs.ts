// A real song for one invitation, instead of its synthesised music. Plays through
// YouTube's own player, so no audio file of someone's song lives on this site.

export type Song = {
  /** The YouTube video id. */
  video: string;
  /** Seconds into the video: the part between these repeats. */
  start: number;
  end: number;
};

const SONGS: Record<string, Song> = {
  // Shukran Allah (Kurbaan), requested by the host.
  "aleem-and-mussera": { video: "z_B0PF8Ug00", start: 0, end: 23 },
};

export const songFor = (slug: string): Song | undefined => SONGS[slug];
