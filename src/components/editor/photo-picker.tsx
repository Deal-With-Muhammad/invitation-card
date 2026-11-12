"use client";

import { Button } from "@heroui/react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { photoUrl, shrinkPhoto } from "@/invite/photo";
import type { InviteData } from "@/invite/types";

import { groupLabel } from "./fields";
import type { Set } from "./panels";

/** "Your photo", for designs that show one: pick, see it, move it up or down in the frame, remove. */
export function PhotoPicker({ data, set, sample }: { data: InviteData; set: Set; sample: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photo = data.photo;

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const blob = await shrinkPhoto(file);
      const res = await fetch("/api/photos", { method: "POST", headers: { "content-type": "image/jpeg" }, body: blob });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.id) throw new Error(j.error || "Couldn't save the photo. Please try again.");
      set((d) => ({ ...d, photo: { id: j.id, y: d.photo?.y ?? 35 } }));
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "This file couldn't be read as a photo. Try a JPEG or PNG.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="block h-[124px] w-[94px] flex-none overflow-hidden rounded-[50%] bg-paper-2 ring-1 ring-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo ? photoUrl(photo.id) : sample} alt="" className="size-full object-cover" style={{ objectPosition: `50% ${photo?.y ?? 35}%`, opacity: photo ? 1 : 0.55 }} />
        </span>
        <div className="min-w-0">
          <p className="text-[14.5px] leading-snug">{photo ? "Your photo is on the card." : "The card shows a sample photo until you add yours."}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Button variant="outline" className="h-10 px-4 text-[14px]" isDisabled={busy} onPress={() => input.current?.click()}>
              <ImagePlus className="size-4" aria-hidden /> {busy ? "Adding…" : photo ? "Change photo" : "Add your photo"}
            </Button>
            {photo && (
              <Button variant="ghost" className="h-10 px-3 text-[14px] text-muted hover:text-wax" onPress={() => set((d) => ({ ...d, photo: undefined }))}>
                <Trash2 className="size-4" aria-hidden /> Remove
              </Button>
            )}
          </div>
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => void pick(e.target.files?.[0])} />
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-wax">
          {error}
        </p>
      )}
      {photo && (
        <label className="mt-4 block">
          <span className={groupLabel}>Move the photo up or down in the frame</span>
          <input
            type="range"
            min={0}
            max={100}
            value={photo.y}
            onChange={(e) => set((d) => (d.photo ? { ...d, photo: { ...d.photo, y: Number(e.target.value) } } : d))}
            className="w-full accent-[var(--brand)]"
          />
        </label>
      )}
      <p className="mt-3 text-[12.5px] text-muted">A portrait photo works best. It is made smaller before it is saved, and anyone with your invitation link can see it.</p>
    </div>
  );
}
