"use client";

import type { InviteData } from "@/invite/types";

// What this browser remembers: the invitation being drafted, and the invitations
// published from here (with their private edit tokens).

const DRAFT = "dwm-invite:draft:v1";
const MINE = "dwm-invite:mine:v1";

export type MyInvite = { slug: string; token: string; names: string; template: string; occasion: string; createdAt: number };

const read = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or full: drafts just won't persist */
  }
};

export const loadDraft = () => read<{ data: InviteData; at: number } | null>(DRAFT, null);
export const saveDraft = (data: InviteData) => write(DRAFT, { data, at: Date.now() });
export const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT);
  } catch {}
};

export const loadMine = () => read<MyInvite[]>(MINE, []);
export const rememberInvite = (inv: MyInvite) => write(MINE, [inv, ...loadMine().filter((m) => m.slug !== inv.slug)].slice(0, 50));
export const forgetInvite = (slug: string) => write(MINE, loadMine().filter((m) => m.slug !== slug));
export const tokenFor = (slug: string) => loadMine().find((m) => m.slug === slug)?.token ?? null;
