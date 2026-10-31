import type { Metadata } from "next";

export const metadata: Metadata = {
  // A plain title, so a 404 here doesn't reveal that an admin area exists.
  title: { absolute: "DWM Invite" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-paper text-ink">{children}</div>;
}
