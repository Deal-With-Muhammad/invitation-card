"use client";

import { useMemo } from "react";

import { newInvite } from "../defaults";
import type { Occasion } from "../types";
import { Invitation } from "./invitation";

/** A template with its sample details, as a guest would see it. */
export function Demo({ id, palette, occasion }: { id: string; palette: string; occasion: Occasion }) {
  const data = useMemo(() => newInvite(id, occasion, palette), [id, palette, occasion]);
  return <Invitation data={data} credit={false} />;
}
