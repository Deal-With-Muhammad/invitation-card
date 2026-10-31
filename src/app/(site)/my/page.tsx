import { MyInvites } from "./my-invites";

export const metadata = { title: "My invitations", robots: { index: false, follow: true }, alternates: { canonical: "/my" } };

export default function MyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
      <h1 className="font-serif text-[40px] leading-tight">My invitations</h1>
      <p className="mt-2 mb-8 text-muted">Your invitations, how many guest visits each one has left, and where to edit them.</p>
      <MyInvites />
    </main>
  );
}
