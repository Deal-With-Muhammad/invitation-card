import "server-only";

// What a request says about where it came from: location from the headers
// Vercel adds (empty in local dev), the kind of device, and the source.

export type Origin = { country: string | null; region: string | null; city: string | null };
export type VisitInfo = Origin & { device: string; source: string };

const header = (h: Headers, name: string) => {
  const v = h.get(name);
  if (!v) return null;
  try {
    return decodeURIComponent(v).slice(0, 80);
  } catch {
    return v.slice(0, 80);
  }
};

export function origin(h: Headers): Origin {
  return {
    country: header(h, "x-vercel-ip-country")?.toUpperCase() ?? null,
    region: header(h, "x-vercel-ip-country-region"),
    city: header(h, "x-vercel-ip-city"),
  };
}

function device(ua: string) {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|Opera Mini|IEMobile/i.test(ua)) return "phone";
  return "desktop";
}

// In-app browsers identify themselves; otherwise the referrer's host says where
// the link was tapped. Links opened from WhatsApp in the phone's own browser
// arrive with no referrer at all, so they count as Direct.
const APPS: [RegExp, string][] = [
  [/WhatsApp/i, "WhatsApp"],
  [/Instagram/i, "Instagram"],
  [/FBAN|FBAV|FB_IAB|FBIOS|Messenger/i, "Facebook"],
  [/Snapchat/i, "Snapchat"],
  [/TikTok|musical_ly|BytedanceWebview/i, "TikTok"],
  [/Telegram/i, "Telegram"],
  [/\bLine\//i, "LINE"],
  [/MicroMessenger/i, "WeChat"],
];
const HOSTS: [RegExp, string][] = [
  [/(^|\.)whatsapp\.(com|net)$|^wa\.me$/, "WhatsApp"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)(facebook|fb|messenger)\.com$/, "Facebook"],
  [/(^|\.)google\./, "Google"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X"],
  [/(^|\.)telegram\.(org|me)$|^t\.me$/, "Telegram"],
  [/(^|\.)(mail\.google|outlook\.live|mail\.yahoo)\./, "Email"],
];

function source(ua: string, referrer: unknown, ownHost: string) {
  for (const [re, name] of APPS) if (re.test(ua)) return name;
  if (typeof referrer !== "string" || !referrer) return "Direct";
  let host: string;
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "Direct";
  }
  if (!host || host === ownHost) return "Direct";
  for (const [re, name] of HOSTS) if (re.test(host)) return name;
  return host.slice(0, 60);
}

export function visitInfo(req: Request, referrer: unknown): VisitInfo {
  const ua = req.headers.get("user-agent") ?? "";
  return { ...origin(req.headers), device: device(ua), source: source(ua, referrer, new URL(req.url).hostname.replace(/^www\./, "")) };
}
