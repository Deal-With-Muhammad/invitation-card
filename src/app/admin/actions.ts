"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requestIp, requireAdmin } from "@/lib/server/admin";
import { logAdmin } from "@/lib/server/auth-helpers";
import { SLUG_RE } from "@/lib/slug";
import { auth, db } from "@/lib/supabase/server";

// Every action checks the admin session again: a server action is a public
// endpoint, whatever page its button sits on.

function slugFrom(form: FormData) {
  const slug = String(form.get("slug") ?? "");
  if (!SLUG_RE.test(slug)) throw new Error("Bad slug");
  return slug;
}

export async function addVisits(form: FormData) {
  const admin = await requireAdmin();
  const slug = slugFrom(form);
  const n = Math.round(Number(form.get("n")));
  if (!Number.isFinite(n) || n < 1 || n > 100_000) throw new Error("Bad amount");
  const { data, error } = await db().from("invites").select("max_views").eq("slug", slug).single();
  if (error) throw new Error(error.message);
  const { error: e2 } = await db().from("invites").update({ max_views: data.max_views + n }).eq("slug", slug);
  if (e2) throw new Error(e2.message);
  await logAdmin(admin.email!, "add-visits", `${slug} +${n}`, await requestIp());
  revalidatePath("/admin");
}

export async function resetVisits(form: FormData) {
  const admin = await requireAdmin();
  const slug = slugFrom(form);
  const { error } = await db().from("invites").update({ views: 0 }).eq("slug", slug);
  if (error) throw new Error(error.message);
  await logAdmin(admin.email!, "reset-visits", slug, await requestIp());
  revalidatePath("/admin");
}

export async function deleteInvite(form: FormData) {
  const admin = await requireAdmin();
  const slug = slugFrom(form);
  const { error } = await db().from("invites").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  await logAdmin(admin.email!, "delete-invite", slug, await requestIp());
  revalidatePath("/admin");
}

export async function signOut() {
  const admin = await requireAdmin();
  await logAdmin(admin.email!, "sign-out", undefined, await requestIp());
  await (await auth()).auth.signOut();
  redirect("/login?next=/admin");
}
