"use client";

import { Button } from "@heroui/react";
import qrcode from "qrcode-generator";
import { useMemo } from "react";

/** A QR code as inline SVG, plus a PNG download for printing. */
export function QrCode({ url, name, color = "#2a2520" }: { url: string; name: string; color?: string }) {
  const { path, size } = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    const n = qr.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + 2} ${r + 2}h1v1h-1z`;
    return { path: d, size: n + 4 };
  }, [url]);

  const download = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#ffffff"/><path d="${path}" fill="${color}"/></svg>`;
    const img = new Image();
    img.onload = () => {
      const px = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = px;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, px, px);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${name}-qr.png`;
      a.click();
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} className="size-28 flex-none rounded-xl bg-white p-1 ring-1 ring-line" shapeRendering="crispEdges" role="img" aria-label="QR code for your invitation link">
        <path d={path} fill={color} />
      </svg>
      <div className="space-y-2">
        <p className="text-[13.5px] leading-snug text-muted">Print it on paper cards or show it at the door. It opens the same link.</p>
        <Button variant="outline" size="sm" onPress={download}>
          Download QR (PNG)
        </Button>
      </div>
    </div>
  );
}
