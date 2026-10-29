"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { newInvite } from "@/invite/defaults";
import { Thumb } from "@/invite/runtime/thumb";
import { metaFor } from "@/invite/templates/catalog";

const DESIGNS = ["envelope", "jharokha", "marigold"] as const;

/** Type two names and see a real design update: the product, on the home page. */
export function TryIt() {
  const [a, setA] = useState("Zara");
  const [b, setB] = useState("Ibrahim");
  const [id, setId] = useState<(typeof DESIGNS)[number]>("envelope");
  const meta = metaFor(id);

  const data = useMemo(() => {
    const d = newInvite(id, "wedding", meta.palettes[0].id);
    d.people = [
      { ...d.people[0], name: a, full: a },
      { ...d.people[1], name: b, full: b },
    ];
    d.events = d.events.slice(1, 2);
    return d;
  }, [a, b, id, meta]);

  const q = new URLSearchParams({ occasion: "wedding" }).toString();

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="relative rounded-[28px] bg-paper-2 p-5 sm:p-6">
        <div className="mx-auto w-[74%] overflow-hidden rounded-[18px] shadow-[0_24px_50px_-28px_rgb(31_28_25/0.55)] ring-1 ring-black/5">
          <Thumb id={id} data={data} />
        </div>
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <label className="block">
            <span className="mb-1 block text-[12.5px] text-muted">Name</span>
            <input className="field h-10 py-0" value={a} maxLength={18} onChange={(e) => setA(e.target.value)} aria-label="First name" />
          </label>
          <span className="pb-2.5 text-muted">&amp;</span>
          <label className="block">
            <span className="mb-1 block text-[12.5px] text-muted">Name</span>
            <input className="field h-10 py-0" value={b} maxLength={18} onChange={(e) => setB(e.target.value)} aria-label="Second name" />
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-1.5" role="radiogroup" aria-label="Design">
            {DESIGNS.map((d) => {
              const p = metaFor(d).palettes[0];
              return (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={id === d}
                  aria-label={metaFor(d).name}
                  onClick={() => setId(d)}
                  className={`size-8 rounded-full ring-offset-2 ring-offset-paper-2 transition-shadow duration-150 ${id === d ? "ring-2 ring-ink" : "ring-1 ring-ink/15"}`}
                  style={{ background: `linear-gradient(135deg, ${p.bg} 55%, ${p.accent} 55%)` }}
                />
              );
            })}
          </div>
          <Link href={`/create/${id}?${q}`} className="text-[14px] font-medium text-brand underline-offset-4 hover:underline">
            Continue with {meta.name} →
          </Link>
        </div>
      </div>
    </div>
  );
}
