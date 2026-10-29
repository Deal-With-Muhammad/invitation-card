"use client";

import { useEffect, useState } from "react";

import { Invitation } from "@/invite/runtime/invitation";
import type { InviteData } from "@/invite/types";

/** Runs inside the editor's preview iframe and renders whatever the editor sends. */
export function FrameHost() {
  const [data, setData] = useState<InviteData | null>(null);
  const [replay, setReplay] = useState(0);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const m = e.data;
      if (m?.type === "invite") setData(m.data as InviteData);
      else if (m?.type === "replay") setReplay((n) => n + 1);
      else if (m?.type === "focus" && typeof m.section === "string") setFocus(`${m.section}:${m.n}`);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "frame-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  if (!data) return null;
  return <Invitation data={data} replay={replay} focus={focus} credit={false} />;
}
