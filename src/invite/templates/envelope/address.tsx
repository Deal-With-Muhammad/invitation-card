"use client";

import { useSyncExternalStore } from "react";

import type { Resolved } from "../../resolve";
import { Art } from "../painted/kit";

// The cover's live pieces: the hand-written greeting on the front of the envelope
// (the guest's name from ?to= on the link) and the back of the envelope, which the
// front flips over to before its wax seal cracks.

const never = () => () => {};
const guestFromUrl = () => (new URLSearchParams(window.location.search).get("to") ?? "").replace(/\s+/g, " ").trim().slice(0, 48);

function useGuest() {
  return useSyncExternalStore(never, guestFromUrl, () => "");
}

export function EnvelopeFaces({ r }: { r: Resolved }) {
  const guest = useGuest();
  const en = r.lang === "en";
  return (
    <>
      <span className="env-table" aria-hidden />
      <span className="env-front">
        <span className="env-addr" dir="auto">
          {en && <span className="env-dear">Dear</span>}
          <span className="env-to">{guest || (en ? "friends" : r.t.youAreInvited)}</span>
        </span>
      </span>
      <span className="env-back" aria-hidden>
        <span className="env-box">
          <Art id="envelope" name="back" />
          <span className="env-gap" />
          <span className="env-half is-l">
            <Art id="envelope" name="back" />
          </span>
          <span className="env-half is-r">
            <Art id="envelope" name="back" />
          </span>
        </span>
      </span>
    </>
  );
}
