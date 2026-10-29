import { notFound } from "next/navigation";

import { Thumb } from "@/invite/runtime/thumb";
import { TEMPLATE_LIST } from "@/invite/templates";

export const metadata = { robots: { index: false } };

/** Every template in every palette, for checking designs during development. */
export default function Dev() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4 lg:grid-cols-5">
      {TEMPLATE_LIST.flatMap((t) =>
        t.meta.palettes.map((p) => (
          <a key={t.meta.id + p.id} href={`/preview/${t.meta.id}?palette=${p.id}`} className="block">
            <Thumb id={t.meta.id} palette={p.id} className="rounded-xl shadow" />
            <p className="mt-1 text-xs">
              {t.meta.name} · {p.name}
            </p>
          </a>
        )),
      )}
    </div>
  );
}
