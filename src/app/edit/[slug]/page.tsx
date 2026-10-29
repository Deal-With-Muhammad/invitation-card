import { EditLoader } from "./edit-loader";

export const metadata = { title: "Edit invitation", robots: { index: false, follow: false } };

export default async function EditPage(props: PageProps<"/edit/[slug]">) {
  const { slug } = await props.params;
  return <EditLoader slug={slug} />;
}
