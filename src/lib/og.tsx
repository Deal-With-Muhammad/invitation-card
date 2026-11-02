import { ImageResponse } from "next/og";

import type { Palette } from "@/invite/templates/types";

import { site } from "./site";

// Social share cards. Fonts come from Google Fonts as TTF, subset to the exact
// text drawn, so each card downloads only a few kilobytes of font.

export const OG_SIZE = { width: 1200, height: 630 };

async function font(family: string, text: string, weight = 400, italic = false): Promise<ArrayBuffer | null> {
  try {
    const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:${axis}&text=${encodeURIComponent(text + text.toUpperCase())}`;
    const css = await (await fetch(url, { cache: "force-cache" })).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src, { cache: "force-cache" });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

type F = { name: string; data: ArrayBuffer; weight: 400 | 500 | 600; style: "normal" | "italic" };

async function fonts(specs: [string, string, 400 | 500 | 600, boolean][]) {
  const out = await Promise.all(specs.map(async ([family, text, w, it]) => ({ family, w, it, data: await font(family, text, w, it) })));
  return out.filter((f) => f.data).map((f) => ({ name: f.family, data: f.data!, weight: f.w, style: f.it ? "italic" : "normal" }) as F);
}

const latin = (s: string) => !/[^\u0000-ɏ -⁯]/.test(s);

function Frame({ p, children }: { p: Pick<Palette, "bg" | "ink" | "accent">; children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: p.bg, color: p.ink, padding: 34 }}>
      <div style={{ flex: 1, display: "flex", border: `2px solid ${p.accent}`, padding: 10 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `1px solid ${p.accent}`, textAlign: "center" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** The design's art for share cards: a 420×630 JPEG slice of its painting (public/art/<id>/og.jpg). */
export async function ogArt(origin: string | null, id: string, path = `/art/${id}/og.jpg`): Promise<string | null> {
  if (!origin) return null;
  try {
    const res = await fetch(`${origin}${path}`, { cache: "force-cache" });
    if (!res.ok) return null;
    return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

/** The link preview for a shared invitation: the design's painting beside the title, names and date. */
export async function renderInviteOg({ p, title, names, date, venue, tap, art = null }: { p: Palette; title: string; names: string; date: string; venue: string; tap: string; art?: string | null }) {
  const showNames = latin(names);
  const showText = latin(title + date + venue);
  const textAll = `${title}${date}${venue}${tap}${site.host}`;
  const f = await fonts([
    ["Great Vibes", names || "x", 400, false],
    ["Cormorant Garamond", showText ? textAll : site.host, 500, false],
  ]);
  const card = (
    <Frame p={p}>
      {showText && title && (
        <div style={{ display: "flex", fontFamily: "Cormorant Garamond", fontSize: 30, letterSpacing: 6, textTransform: "uppercase", color: p.accent }}>{title}</div>
      )}
      <div style={{ display: "flex", fontFamily: showNames ? "Great Vibes" : "Cormorant Garamond", fontSize: art ? (names.length > 18 ? 72 : 96) : names.length > 22 ? 96 : 128, lineHeight: 1.15, marginTop: 6, padding: art ? "0 36px" : "0 60px" }}>
        {showNames ? names : "♥"}
      </div>
      {showText && (date || venue) && (
        <div style={{ display: "flex", fontFamily: "Cormorant Garamond", fontSize: 36, marginTop: 14 }}>{[date, venue].filter(Boolean).join("  ·  ")}</div>
      )}
      <div style={{ display: "flex", fontFamily: "Cormorant Garamond", fontSize: 22, marginTop: 34, color: p.accent, letterSpacing: 3 }}>
        {showText ? `${tap.toUpperCase()}  ·  ${site.host}` : site.host}
      </div>
    </Frame>
  );
  return new ImageResponse(
    art ? (
      <div style={{ display: "flex", width: "100%", height: "100%", background: p.bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art} width={420} height={630} alt="" style={{ width: 420, height: 630, objectFit: "cover" }} />
        <div style={{ display: "flex", flex: 1 }}>{card}</div>
      </div>
    ) : (
      card
    ),
    { ...OG_SIZE, fonts: f },
  );
}

const CARDS: Pick<Palette, "bg" | "ink" | "accent">[] = [
  { bg: "#e9ece2", ink: "#2f3b2f", accent: "#8a3b2a" },
  { bg: "#0f3b32", ink: "#f4ead6", accent: "#c9a45c" },
  { bg: "#fbe6b0", ink: "#1f4d2b", accent: "#e2552e" },
];

/** The share card for the site and its pages. */
export async function renderSiteOg({ eyebrow = "Free online invitation maker", headline = "Invitations worth opening.", sub = "Weddings · Nikah · Mehndi · Birthdays · Aqiqah", palette }: { eyebrow?: string; headline?: string; sub?: string; palette?: Palette } = {}) {
  const text = `${eyebrow}${headline}${sub}${site.host}DWM Invite`;
  const f = await fonts([
    ["Cormorant Garamond", text, 500, false],
    ["Great Vibes", "Zara&Ibrahim", 400, false],
  ]);
  const cards = palette ? [CARDS[0], palette, CARDS[2]] : CARDS;
  // The last word in brand italic, like the site's headline.
  const words = headline.split(" ");
  const last = words.length > 1 ? words.pop()! : "";
  const head = words.length ? `${words.join(" ")}${last ? "\u00a0" : ""}` : headline;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "radial-gradient(circle at 78% 55%, #3f6f64 0%, #17483f 48%, #12403c 100%)",
        color: "#f5f0e6",
        padding: "64px 72px",
        fontFamily: "Cormorant Garamond",
        fontWeight: 500,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", width: 46, height: 46, borderRadius: 12, background: "#1c5652", border: "2px solid #d8be8a" }} />
          <div style={{ display: "flex", fontSize: 34 }}>DWM Invite</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: "#d8be8a" }}>{eyebrow}</div>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: headline.length > 30 ? 64 : 82, lineHeight: 1.02, marginTop: 14, textTransform: "uppercase", letterSpacing: 1 }}>
            {head}
            {last && <span>{last}</span>}
          </div>
          <div style={{ display: "flex", fontSize: 28, marginTop: 22, color: "rgba(245,240,230,0.75)" }}>{sub}</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "rgba(216,190,138,0.85)" }}>{site.host}</div>
      </div>
      <div style={{ display: "flex", position: "relative", flex: 1 }}>
        {cards.map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: [10, 150, 70][i],
              top: [70, 60, 20][i],
              width: 230,
              height: 400,
              borderRadius: 26,
              background: c.bg,
              transform: `rotate(${[-9, 8, -1][i]}deg)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${c.accent}`,
              boxShadow: "0 30px 60px -20px rgba(20,14,8,0.7)",
            }}
          >
            <div style={{ display: "flex", width: 150, height: 260, borderRadius: "75px 75px 6px 6px", border: `2px solid ${c.accent}`, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <div style={{ display: "flex", fontFamily: "Great Vibes", fontSize: 40, color: c.ink }}>Zara</div>
              <div style={{ display: "flex", fontFamily: "Great Vibes", fontSize: 26, color: c.accent }}>&</div>
              <div style={{ display: "flex", fontFamily: "Great Vibes", fontSize: 40, color: c.ink }}>Ibrahim</div>
            </div>
          </div>
        ))}
      </div>
    </div>,
    { ...OG_SIZE, fonts: f },
  );
}
