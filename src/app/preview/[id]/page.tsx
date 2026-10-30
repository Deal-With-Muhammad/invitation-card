import { notFound } from "next/navigation";

import { Demo } from "@/invite/runtime/demo";
import { TEMPLATES } from "@/invite/templates";
import { OCCASIONS, type Occasion } from "@/invite/types";

export const metadata = { robots: { index: false, follow: true } };

export default async function PreviewPage(props: PageProps<"/preview/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const tpl = TEMPLATES[id];
  if (!tpl) notFound();
  const palette = typeof sp.palette === "string" && tpl.meta.palettes.some((p) => p.id === sp.palette) ? sp.palette : tpl.meta.palettes[0].id;
  const occasion = (typeof sp.occasion === "string" && (OCCASIONS as readonly string[]).includes(sp.occasion) ? sp.occasion : tpl.meta.defaultOccasion) as Occasion;
  // "Try it with your names": ?names=Ayesha,Hamza (two at most, short, plain text).
  const names =
    typeof sp.names === "string"
      ? sp.names
          .split(",")
          .map((n) => n.replace(/[<>{}|]/g, "").trim().slice(0, 24))
          .filter(Boolean)
          .slice(0, 2)
      : [];
  return <Demo id={tpl.meta.id} palette={palette} occasion={occasion} names={names} />;
}
