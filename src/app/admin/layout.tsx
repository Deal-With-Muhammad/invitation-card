import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Admin · DWM Invite" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-paper text-ink">{children}</div>;
}
