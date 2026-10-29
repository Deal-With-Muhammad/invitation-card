import type { Occasion } from "@/invite/types";

// The occasion chips above the gallery.
export const FILTERS: { id: string; label: string; occasions: Occasion[] }[] = [
  { id: "all", label: "All", occasions: [] },
  { id: "wedding", label: "Wedding", occasions: ["wedding", "reception"] },
  { id: "nikah", label: "Nikah & Walima", occasions: ["nikah", "walima"] },
  { id: "mehndi", label: "Mehndi", occasions: ["mehndi"] },
  { id: "engagement", label: "Engagement", occasions: ["engagement"] },
  { id: "birthday", label: "Birthday", occasions: ["birthday"] },
  { id: "baby", label: "Aqiqah & baby", occasions: ["aqiqah", "babyshower"] },
  { id: "eid", label: "Eid", occasions: ["eid"] },
  { id: "graduation", label: "Graduation", occasions: ["graduation"] },
  { id: "home", label: "Housewarming", occasions: ["housewarming"] },
  { id: "anniversary", label: "Anniversary", occasions: ["anniversary"] },
  { id: "party", label: "Party", occasions: ["party"] },
];

export const OCCASION_LABEL: Record<Occasion, string> = {
  wedding: "Wedding",
  nikah: "Nikah",
  walima: "Walima",
  mehndi: "Mehndi",
  engagement: "Engagement",
  reception: "Reception",
  birthday: "Birthday",
  aqiqah: "Aqiqah",
  babyshower: "Baby shower",
  eid: "Eid",
  graduation: "Graduation",
  housewarming: "Housewarming",
  anniversary: "Anniversary",
  party: "Party",
};
