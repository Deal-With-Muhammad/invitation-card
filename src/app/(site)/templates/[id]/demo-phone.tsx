"use client";

import { Phone } from "@/components/editor/preview";

/** The template running live in a phone frame. */
export function DemoPhone({ src, title }: { src: string; title: string }) {
  return (
    <div className="h-[640px] w-full min-w-0 sm:h-[720px]">
      <Phone>
        <iframe src={src} title={title} className="h-full w-full border-0" loading="lazy" />
      </Phone>
    </div>
  );
}
