import { Unlocked } from "./unlocked";

export const metadata = { title: "Unlimited visits", robots: { index: false, follow: false } };

/** Where Lemon Squeezy sends the buyer back after paying for unlimited visits. */
export default async function UnlockedPage(props: PageProps<"/unlocked/[slug]">) {
  const { slug } = await props.params;
  return (
    <main className="mx-auto max-w-md px-4 pt-14 pb-20 text-center sm:px-6">
      <Unlocked slug={slug} />
    </main>
  );
}
