import { NextResponse } from "next/server";

import { parseInvite } from "@/invite/schema";
import { clientIp, getStore, hashToken, newToken, seenCookieName, seenCookieOptions, seenCookieValue, VISIT_LIMIT } from "@/lib/server/store";
import { currentUser } from "@/lib/supabase/server";
import { randomSuffix, suggestSlug, validSlug } from "@/lib/slug";

// Publishes a new invitation and returns its link plus a private edit token.
// Signed in, it is also saved to the account; otherwise it is a guest invitation.

const CREATES_PER_HOUR = 15;
const MAX_BODY = 40_000;

export async function POST(req: Request) {
  const store = getStore();
  if (!store) return NextResponse.json({ error: "Sharing is not available right now." }, { status: 503 });

  const raw = await req.text();
  if (raw.length > MAX_BODY) return NextResponse.json({ error: "This invitation is too long." }, { status: 413 });
  let body: { data?: unknown; slug?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ip = clientIp(req.headers);
  const n = await store.hit(`inv:rl:create:${ip}`, 3600);
  if (n > CREATES_PER_HOUR) return NextResponse.json({ error: "Too many invitations from here. Try again in an hour." }, { status: 429 });

  const parsed = parseInvite(body.data);
  if (!parsed.ok) return NextResponse.json({ error: `Please check the details (${parsed.error}).` }, { status: 400 });
  const data = parsed.data;

  const wanted = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (wanted && !validSlug(wanted)) return NextResponse.json({ error: "That link isn't allowed. Use 3–48 letters, numbers and dashes." }, { status: 400 });

  const base = wanted || suggestSlug(data.people.map((p) => p.name)) || "invite";
  const token = newToken();
  const now = Date.now();
  const owner = await currentUser();
  const rec = { data, tokenHash: hashToken(token), ownerId: owner?.id ?? null, views: 0, maxViews: VISIT_LIMIT, createdAt: now, updatedAt: now };

  // The chosen link if it's free; otherwise (only for auto-made links) add a short suffix.
  const candidates = wanted ? [wanted] : [validSlug(base) ? base : `${base}-${randomSuffix()}`, ...Array.from({ length: 4 }, () => `${base}-${randomSuffix()}`)];
  for (const slug of candidates) {
    if (!validSlug(slug)) continue;
    if (!(await store.create(slug, rec))) continue;
    // The maker's own device never uses up a visit and can always open it.
    const res = NextResponse.json({ slug, token, maxViews: rec.maxViews, saved: Boolean(owner) });
    res.cookies.set(seenCookieName(slug), seenCookieValue(slug), seenCookieOptions);
    return res;
  }
  return NextResponse.json({ error: wanted ? "That link is already taken. Try another one." : "Couldn't make a link. Please try again." }, { status: 409 });
}
