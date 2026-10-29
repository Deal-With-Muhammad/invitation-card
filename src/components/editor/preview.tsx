"use client";

import { useEffect, useRef, useState } from "react";

import type { InviteData } from "@/invite/types";

// The live preview: the real invitation running in an iframe (/frame), so it
// behaves exactly like a guest's phone. The editor talks to it with postMessage.

export type PreviewHandle = { replay: () => void; focus: (section: string) => void };

export function PreviewFrame({
  data,
  command,
  className = "",
  title = "Invitation preview",
}: {
  data: InviteData;
  /** { kind, nonce } — changes trigger a replay or a jump to a section. */
  command: { kind: "replay" | "focus"; section?: string; n: number } | null;
  className?: string;
  title?: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== ref.current?.contentWindow) return;
      if (e.data?.type === "frame-ready") setReady(true);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    if (!ready) return;
    ref.current?.contentWindow?.postMessage({ type: "invite", data }, window.location.origin);
  }, [data, ready]);

  useEffect(() => {
    if (!ready || !command) return;
    ref.current?.contentWindow?.postMessage(
      command.kind === "replay" ? { type: "replay" } : { type: "focus", section: command.section, n: command.n },
      window.location.origin,
    );
  }, [command, ready]);

  return <iframe ref={ref} src="/frame" title={title} className={className} />;
}

/** A phone-shaped box that scales a 390 × 844 screen to fit its parent. */
export function Phone({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setScale(Math.min(1, (width - 8) / 414, (height - 8) / 868));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="relative grid h-full w-full place-items-center">
      <div
        className="relative overflow-hidden rounded-[52px] bg-[#2a2520] p-3 shadow-[0_40px_80px_-40px_rgb(42_37_32/0.6)]"
        style={{ width: 414, height: 868, transform: `scale(${scale})`, transformOrigin: "center" }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[40px] bg-paper">{children}</div>
        <span className="pointer-events-none absolute top-5 left-1/2 h-6 w-28 -translate-x-1/2 rounded-full bg-[#2a2520]" aria-hidden />
      </div>
    </div>
  );
}
