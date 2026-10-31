import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in", robots: { index: false, follow: false }, alternates: { canonical: "/login" } };

export default async function LoginPage(props: PageProps<"/login">) {
  const q = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return (
    <main className="mx-auto max-w-md px-4 pt-12 pb-16 sm:px-6">
      <LoginForm next={one(q.next) ?? "/my"} reauth={one(q.reauth) === "1"} linkFailed={one(q.error) === "link"} />
    </main>
  );
}
