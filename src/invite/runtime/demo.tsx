"use client";

import { useMemo } from "react";

import { newInvite } from "../defaults";
import type { Occasion } from "../types";
import { Invitation } from "./invitation";

/** A template with its sample details, as a guest would see it. `names` swaps in the visitor's own names. */
export function Demo({ id, palette, occasion, names = [] }: { id: string; palette: string; occasion: Occasion; names?: string[] }) {
  const key = names.join("|");
  const data = useMemo(() => {
    const d = newInvite(id, occasion, palette);
    key
      .split("|")
      .filter(Boolean)
      .forEach((n, i) => {
        if (d.people[i]) d.people[i] = { ...d.people[i], name: n, full: n };
      });
    return d;
  }, [id, palette, occasion, key]);
  return <Invitation data={data} credit={false} />;
}
