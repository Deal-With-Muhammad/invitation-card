"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requestIp, requireAdmin } from "@/lib/server/admin";
import { UNLIMITED_VISITS, VISIT_LIMIT } from "@/lib/server/store";
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

export async function setEditAccess(form: FormData) {
  const admin = await requireAdmin();
  const slug = slugFrom(form);
  const open = form.get("open") === "1";
  const { error } = await db().from("invites").update({ open_edit: open }).eq("slug", slug);
  if (error) throw new Error(`${error.message} (has supabase/schema.sql been run since open editing was added?)`);
  await logAdmin(admin.email!, open ? "open-editing" : "private-editing", slug, await requestIp());
  revalidatePath("/admin");
}

/** An invitation with no visit limit (on), or back to the usual 100 (off). */
export async function setUnlimited(form: FormData) {
  const admin = await requireAdmin();
  const slug = slugFrom(form);
  const on = form.get("on") === "1";
  const { error } = await db().from("invites").update({ max_views: on ? UNLIMITED_VISITS : VISIT_LIMIT }).eq("slug", slug);
  if (error) throw new Error(error.message);
  await logAdmin(admin.email!, on ? "unlimited-on" : "unlimited-off", slug, await requestIp());
  revalidatePath("/admin");
}

/**
 * An account whose invitations have no visit limit. Turning it on also lifts the
 * limit on the invitations it already has; turning it off only affects new ones.
 */
export async function setAccountUnlimited(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("Bad account");
  const on = form.get("on") === "1";
  const { data, error } = await db().auth.admin.getUserById(id);
  if (error || !data.user) throw new Error(error?.message ?? "No such account");
  const { error: e2 } = await db().auth.admin.updateUserById(id, { app_metadata: { ...data.user.app_metadata, unlimited: on } });
  if (e2) throw new Error(e2.message);
  if (on) {
    const { error: e3 } = await db().from("invites").update({ max_views: UNLIMITED_VISITS }).eq("owner_id", id);
    if (e3) throw new Error(e3.message);
  }
  await logAdmin(admin.email!, on ? "account-unlimited-on" : "account-unlimited-off", data.user.email ?? id, await requestIp());
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
