import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import { CODE_MINUTES } from "@/lib/server/session";

// Sign-in emails go out through Cloudflare Email Service: the `EMAIL` binding in wrangler.jsonc
// (dealwithmuhammad.com is onboarded under Email Service → Email Sending). Before this, Supabase
// sent them through Gmail, and Gmail's daily sending limit once stopped every sign-in.

const FROM = { email: "me@dealwithmuhammad.com", name: "DWM Invite" };

type EmailBinding = {
  send(message: { from: { email: string; name: string }; to: string; subject: string; text: string; html: string }): Promise<{ messageId: string }>;
};

function binding(): EmailBinding | null {
  try {
    const b = (getCloudflareContext().env as unknown as Record<string, unknown>).EMAIL;
    return b && typeof (b as EmailBinding).send === "function" ? (b as EmailBinding) : null;
  } catch {
    return null;
  }
}

/** Thrown when Cloudflare says we've sent too many emails for now. */
export class MailLimitError extends Error {}

const page = (code: string, link: string) => `<div style="background:#f5f0e6;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;color:#1e2a28">
  <div style="max-width:440px;margin:0 auto;background:#fffcf6;border-radius:20px;padding:32px 28px">
    <p style="font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#806235;margin:0">DWM Invite</p>
    <h1 style="font-weight:normal;font-size:28px;margin:12px 0 8px">Your sign-in code</h1>
    <p style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#5d6965;margin:0 0 20px">Enter this code on the sign-in page. It works for ${CODE_MINUTES} minutes.</p>
    <p style="font-family:ui-monospace,Menlo,monospace;font-size:34px;letter-spacing:.35em;background:#1c5652;color:#ffffff;text-align:center;padding:16px;border-radius:14px;margin:0 0 20px">${code}</p>
    <p style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;margin:0 0 24px">Or <a href="${link}" style="color:#1c5652">sign in with this link</a>.</p>
    <p style="font-family:system-ui,sans-serif;font-size:12px;color:#5d6965;margin:0">Didn't ask for this? You can ignore this email.</p>
  </div>
</div>`;

export async function sendCode(to: string, code: string, link: string) {
  const subject = `Your DWM Invite code: ${code}`;
  const text = `Your DWM Invite sign-in code is ${code}. It works for ${CODE_MINUTES} minutes.\n\nOr sign in with this link: ${link}\n\nDidn't ask for this? You can ignore this email.`;
  const mail = process.env.NODE_ENV === "production" ? binding() : null;
  if (!mail) {
    if (process.env.NODE_ENV === "production") throw new Error("The EMAIL binding is missing");
    console.log(`[dev] sign-in email to ${to}: ${subject}\n${link}`);
    return;
  }
  try {
    await mail.send({ from: FROM, to, subject, text, html: page(code, link) });
  } catch (e) {
    const codeName = (e as { code?: string }).code ?? "";
    if (/RATE_LIMIT|DAILY_LIMIT/.test(codeName)) throw new MailLimitError(codeName);
    throw e;
  }
}
