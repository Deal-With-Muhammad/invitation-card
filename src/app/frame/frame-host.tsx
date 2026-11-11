"use client";

import { useEffect, useState, type ComponentType } from "react";

import { CUSTOM_PAGES, EDITABLE_CUSTOM } from "@/custom/pages";
import { Invitation } from "@/invite/runtime/invitation";
import type { InviteData } from "@/invite/types";

type CustomPage = ComponentType<{ data?: InviteData | null; preview?: boolean }>;

/** The custom invitation being edited (/edit/<slug> in the editor around this frame), if its page takes its details. */
function editedCustom() {
  try {
    const slug = window.parent.location.pathname.match(/^\/edit\/([a-z0-9-]+)/)?.[1];
    return slug && EDITABLE_CUSTOM.has(slug) && CUSTOM_PAGES[slug] ? CUSTOM_PAGES[slug] : null;
  } catch {
    return null;
  }
}

/** Runs inside the editor's preview iframe and renders whatever the editor sends. A custom
 *  invitation whose details are editable shows its own page instead of a standard design. */
export function FrameHost() {
  const [data, setData] = useState<InviteData | null>(null);
  const [Custom, setCustom] = useState<CustomPage | null>(null);

  useEffect(() => {
    const load = editedCustom();
    if (load) void load().then((C) => setCustom(() => C));
  }, []);
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
  if (Custom) return <Custom key={replay} data={data} preview />;
  return <Invitation data={data} replay={replay} focus={focus} credit={false} />;
}
