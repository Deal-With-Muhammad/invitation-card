import { buttonVariants } from "@heroui/styles";
import Link from "next/link";

import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-sm">
        <LogoMark className="mx-auto size-12" />
        <h1 className="mt-6 font-serif text-[32px] leading-tight">This invitation isn&apos;t here</h1>
        <p className="mt-3 text-muted">The link may have a typo, or the host may have removed it. Check with whoever sent it to you.</p>
        <Link href="/" className={buttonVariants({ className: "mt-8" })}>
          Make your own invitation
        </Link>
      </div>
    </main>
  );
}
