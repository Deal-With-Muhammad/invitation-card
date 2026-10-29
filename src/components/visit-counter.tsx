"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

import { DWM_ORIGIN } from "@/lib/dwm";
import { site } from "@/lib/site";

const nf = new Intl.NumberFormat("en");

// Public visitor counter from the shared DWM analytics. Renders nothing until the
// numbers arrive (or at all, if the request is blocked).
export function VisitCounter() {
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${DWM_ORIGIN}/api/views?site=${site.id}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.ready === true && Number.isFinite(data.visitors)) setVisitors(data.visitors);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  if (visitors == null) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      <Eye className="size-3.5" aria-hidden />
      <span>
        <span className="font-medium text-ink/80 tabular-nums">{nf.format(visitors)}</span>{" "}
        {visitors === 1 ? "visitor" : "visitors"}
      </span>
      <span aria-hidden>·</span>
      <a
        href={`${DWM_ORIGIN}/stats/${site.id}`}
        target="_blank"
        rel="noopener"
        className="underline-offset-2 hover:text-brand hover:underline"
      >
        Live stats
      </a>
    </span>
  );
}
