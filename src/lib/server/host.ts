import "server-only";

import { isAdminRequest } from "@/lib/server/admin";
import { tokenMatches, type InviteRecord } from "@/lib/server/store";
import { currentUser } from "@/lib/supabase/server";

/** The host of an invitation: the private edit key (header x-edit-token), the account it's saved to, or the admin. */
export async function isHost(req: Request, rec: InviteRecord) {
  if (tokenMatches(req.headers.get("x-edit-token"), rec.tokenHash)) return true;
  if (rec.ownerId) {
    const user = await currentUser();
    if (user?.id === rec.ownerId) return true;
  }
  return isAdminRequest();
}
