"use client";

import { buttonVariants } from "@heroui/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Editor } from "@/components/editor/editor";
import { rememberInvite, tokenFor } from "@/components/editor/storage";
import { resolve } from "@/invite/resolve";
import type { InviteData } from "@/invite/types";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: InviteData; token: string; views: number; maxViews: number; openEdit: boolean; canManage: boolean };

/** Finds the edit token (link hash or this device), loads the invitation, then opens the editor. Open invitations load without one. */
export function EditLoader({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  // The key is read once: the link's hash is cleared straight after, so a second
  // run of the effect (React's dev double run) wouldn't see it again.
  const key = useRef<string | null>(null);

  useEffect(() => {
    const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("k");
    const token = (key.current ??= fromHash || tokenFor(slug));
    if (fromHash) history.replaceState(null, "", window.location.pathname);
    // Without a key on this device, the signed-in account it's saved to also works.
    fetch(`/api/invites/${slug}`, { headers: token ? { "x-edit-token": token } : {} })
      .then(async (res) => {
        const j = await res.json();
        if (res.status === 403 && !token) throw new Error("This device doesn't have the edit key for this invitation. Open your private edit link, sign in to the account it's saved to, or ask whoever made it to let anyone with the edit link edit it.");
        if (!res.ok) throw new Error(j.error || "Couldn't open this invitation.");
        const data = j.data as InviteData;
        if (token) rememberInvite({ slug, token, names: resolve(data).names, template: data.template, occasion: data.occasion, createdAt: j.createdAt });
        setState({ kind: "ready", data, token: token ?? "", views: j.views ?? 0, maxViews: j.maxViews ?? 100, openEdit: Boolean(j.openEdit), canManage: j.canManage !== false });
      })
      .catch((e) => setState({ kind: "error", message: e instanceof Error ? e.message : "Couldn't open this invitation." }));
  }, [slug]);

  if (state.kind === "ready") return <Editor mode="edit" slug={slug} token={state.token} initial={state.data} views={state.views} maxViews={state.maxViews} openEdit={state.openEdit} canManage={state.canManage} />;
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center">
      {state.kind === "loading" ? (
        <p className="text-muted">Opening your invitation…</p>
      ) : (
        <div className="max-w-sm">
          <h1 className="font-serif text-[28px]">Can&apos;t open the editor</h1>
          <p className="mt-2 text-muted">{state.message}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href={`/login?next=${encodeURIComponent(`/edit/${slug}`)}`} className={buttonVariants({ variant: "outline" })}>
              Sign in
            </Link>
            <Link href={`/${slug}`} className={buttonVariants()}>
              View invitation
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
