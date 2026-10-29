// Temporary mark until the logo is chosen: a folded card with a wax seal.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#1c5652" />
      <path d="M8 11.5h16v11H8z" fill="none" stroke="#f5f0e6" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 11.5l8 6 8-6" fill="none" stroke="#f5f0e6" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="16" cy="18" r="3.2" fill="#d8be8a" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark className="size-8" />
      <span className="font-serif text-[22px] font-semibold tracking-[0.01em]">DWM Invite</span>
    </span>
  );
}
