import Script from "next/script";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DWM_ORIGIN } from "@/lib/dwm";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      {/* The 9-dot DWM app launcher, defined as <dwm-apps> by this script. */}
      <Script src={`${DWM_ORIGIN}/dwm-apps.js`} strategy="afterInteractive" />
    </div>
  );
}
