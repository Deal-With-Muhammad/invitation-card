import { FrameHost } from "./frame-host";

export const metadata = { title: "Preview", robots: { index: false, follow: false } };

export default function FramePage() {
  return <FrameHost />;
}
