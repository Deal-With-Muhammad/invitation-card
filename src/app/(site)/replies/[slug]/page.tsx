import { RepliesView } from "./replies-view";

export const metadata = { title: "Replies", robots: { index: false, follow: false } };

export default async function RepliesPage(props: PageProps<"/replies/[slug]">) {
  const { slug } = await props.params;
  return <RepliesView slug={slug} />;
}
