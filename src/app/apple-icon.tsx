import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The app icon: the seal on ivory, full-bleed (iOS rounds the corners itself).
export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "public/icon.svg"), "utf8");
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f0e6" }}>
      <img src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`} width={144} height={144} alt="" />
    </div>,
    size,
  );
}
