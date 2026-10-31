import { LOGO_GREEN, MARK_PATH, SEAL_PATH } from "./logo-paths";

/** The seal on its own. It fills its box, so give it a size. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden>
      <path d={SEAL_PATH} fill={LOGO_GREEN} />
      <path d={MARK_PATH} fill="#fff" fillRule="evenodd" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark className="size-9" />
      <span className="font-serif text-[22px] font-semibold tracking-[0.01em]">DWM Invite</span>
    </span>
  );
}
