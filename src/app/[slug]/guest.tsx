"use client";

import { useEffect } from "react";

import { Invitation } from "@/invite/runtime/invitation";
import type { InviteData } from "@/invite/types";

// Slugs already counted in this page load, so a remount (or React's dev double
// effect) doesn't count the same visit twice. A reload starts afresh.
const counted = new Set<string>();

/** A shared invitation, as guests see it. Every opening counts as one visit. */
export function Guest({ slug, data }: { slug: string; data: InviteData }) {
  useEffect(() => {
    if (counted.has(slug)) return;
    counted.add(slug);
    // The referrer says where the link was tapped (only its host is kept).
    fetch(`/api/invites/${slug}/view`, {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ref: document.referrer }),
    }).catch(() => {});
  }, [slug]);
  return <Invitation data={data} />;
}
