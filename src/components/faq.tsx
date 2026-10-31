"use client";

import { Accordion } from "@heroui/react";

export function Faq({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <Accordion allowsMultipleExpanded className="border-y border-line">
      {faqs.map((f) => (
        <Accordion.Item key={f.q} id={f.q} className="py-1">
          <Accordion.Heading>
            <Accordion.Trigger className="gap-4 px-0 py-4 text-[16.5px] font-medium hover:bg-transparent">
              {f.q}
              <Accordion.Indicator className="grid size-7 flex-none place-items-center rounded-full border border-line text-muted data-[expanded=true]:rotate-45">
                <span aria-hidden>
                  <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M6 1.5v9M1.5 6h9" />
                  </svg>
                </span>
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="max-w-[62ch] px-0 pb-5 text-[15px] leading-relaxed">{f.a}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
