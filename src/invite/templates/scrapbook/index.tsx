import type { Resolved } from "../../resolve";
import { initials, makePainted } from "../painted/kit";

import "./scrapbook.css";

// Scrapbook: a worn leather memory journal with the couple's initials in gold foil.
// Its cover swings open on the spine, two kraft pages flutter over, and the spread
// inside has a pressed rose, washi tape, a ticket stub and the invitation written
// in by hand.

function Journal({ r }: { r: Resolved }) {
  const [a, b] = initials(r);
  return (
    <>
      <span className="sb-cover" aria-hidden>
        <span className="sb-foil">
          {a}
          {b && (
            <>
              <i>&amp;</i>
              {b}
            </>
          )}
        </span>
      </span>
      <span className="sb-page" aria-hidden />
      <span className="sb-page is-2" aria-hidden />
    </>
  );
}

function Tape({ index }: { index: number }) {
  return <span className={`sb-tape t${index % 3}`} aria-hidden />;
}

export const scrapbook = makePainted("scrapbook", {
  cover: { kind: "swing", art: "closed", hint: "light", Extra: Journal },
  text: { top: "21%", width: 252, glow: false },
  Divider: Tape,
});
