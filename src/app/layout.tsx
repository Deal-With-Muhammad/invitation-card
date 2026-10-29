import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import Script from "next/script";

import { AUTHOR, DWM_ORIGIN } from "@/lib/dwm";
import { site } from "@/lib/site";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
// Headings: a light, high-contrast serif (the luxury-editorial look); everything else is Geist.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: site.keywords,
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  creator: AUTHOR.name,
  publisher: AUTHOR.name,
  category: "Design",
  alternates: { canonical: "/" },
  formatDetection: { email: false, telephone: false, address: false },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "default" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f5f0e6",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="me" href={AUTHOR.url} />
        <link rel="alternate" type="text/plain" title="LLM-friendly summary" href="/llms.txt" />
      </head>
      <body className={`${geist.variable} ${cormorant.variable} min-h-dvh overflow-x-clip`}>
        {children}
        {/* Shared DWM visitor analytics (cookie-free page views + window.dwm(event)).
            Only counts on *.dealwithmuhammad.com, so local dev is ignored. */}
        <Script src={`${DWM_ORIGIN}/dwm.js`} data-site={site.id} strategy="afterInteractive" />
      </body>
    </html>
  );
}
