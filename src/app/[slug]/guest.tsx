"use client";

import { useEffect } from "react";

import { Invitation } from "@/invite/runtime/invitation";
import type { InviteData } from "@/invite/types";

/** A shared invitation, as guests see it. Counts one open per device. */
export function Guest({ slug, data }: { slug: string; data: InviteData }) {
  useEffect(() => {
    const key = `dwm-invite:seen:${slug}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {}
    fetch(`/api/invites/${slug}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug]);
  return <Invitation data={data} />;
}
