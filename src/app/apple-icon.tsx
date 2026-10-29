import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The app icon, full-bleed (iOS rounds the corners itself).
export default async function AppleIcon() {
  const svg = (await readFile(join(process.cwd(), "public/icon.svg"), "utf8")).replace('rx="112"', 'rx="0"');
  return new ImageResponse(
    <img src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`} width={180} height={180} alt="" />,
    size,
  );
}
