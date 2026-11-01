"use client";

import { useState } from "react";

/** Copies an invitation's full link. */
export function CopyLink({ path }: { path: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="rounded-full border border-line px-3 py-1 text-[13px] hover:bg-paper-2"
      onClick={() => {
        navigator.clipboard?.writeText(`${location.origin}${path}`).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
    >
      {done ? "Copied" : "Copy link"}
    </button>
  );
}
