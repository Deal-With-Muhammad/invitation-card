import type { CoverProps } from "../templates/types";

/** Fallback tap-to-open screen for templates without their own cover. */
export function SimpleCover({ r, onOpen }: CoverProps) {
  return (
    <div className="inv-simple-cover" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}>
      <p className="inv-eyebrow">{r.title}</p>
      <p className="inv-simple-names">{r.names}</p>
      <span className="inv-btn is-primary">{r.t.openInvitation}</span>
    </div>
  );
}
