import "server-only";

import { randomBytes } from "node:crypto";
import { connect } from "node:tls";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import { CODE_MINUTES } from "@/lib/server/session";

// Sign-in emails go out through Cloudflare Email Service: the `EMAIL` binding in wrangler.jsonc
// (dealwithmuhammad.com is onboarded under Email Service → Email Sending). That service gives a
// new account a small daily quota (200 emails, shared by every DWM site), and on a busy day it
// runs out. So when Cloudflare refuses an email, the same email goes out through Gmail instead
// (the Worker secrets SMTP_USER and SMTP_PASS: a Gmail address and an app password).

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

/** Thrown when neither service will take another email for now. */
export class MailLimitError extends Error {}

/** Cloudflare's "no more today" and Gmail's "550 5.4.5 Daily user sending limit exceeded". */
const isLimit = (e: unknown) => /LIMIT|QUOTA|5\.4\.5|too many/i.test(`${(e as { code?: string })?.code ?? ""} ${e instanceof Error ? e.message : String(e)}`);

/** After Cloudflare refuses for its quota, skip it for a while instead of asking on every email. */
let cloudflareFullUntil = 0;

// Values pasted into a host's settings often pick up quotes or a trailing space.
const clean = (v: string | undefined) => (v ?? "").trim().replace(/^(["'])(.*)\1$/, "$2").trim();

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
  const user = clean(process.env.SMTP_USER);
  const pass = clean(process.env.SMTP_PASS);
  const gmail = Boolean(user && pass);
  let refused: unknown = new MailLimitError("Cloudflare's daily quota is used up");
  if (Date.now() >= cloudflareFullUntil || !gmail) {
    try {
      await mail.send({ from: FROM, to, subject, text, html: page(code, link) });
      return;
    } catch (e) {
      refused = e;
      if (isLimit(e)) cloudflareFullUntil = Date.now() + 10 * 60_000;
      console.error("Cloudflare email refused", (e as { code?: string })?.code ?? "", e);
    }
  }
  if (!gmail) throw isLimit(refused) ? new MailLimitError(String(refused)) : refused;

  const boundary = randomBytes(12).toString("hex");
  const part = (type: string, body: string) => `--${boundary}\r\nContent-Type: ${type}; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${Buffer.from(body).toString("base64").replace(/.{76}/g, "$&\r\n")}\r\n`;
  const message = [
    `From: ${FROM.name} <${FROM.email}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${boundary}@dealwithmuhammad.com>`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    part("text/plain", text) + part("text/html", page(code, link)) + `--${boundary}--`,
    ".",
  ].join("\r\n");
  try {
    await smtp("smtp.gmail.com", [
      ["EHLO dealwithmuhammad.com", 250],
      [`AUTH PLAIN ${Buffer.from(`\0${user}\0${pass}`).toString("base64")}`, 235],
      [`MAIL FROM:<${user}>`, 250],
      [`RCPT TO:<${to}>`, 250],
      ["DATA", 354],
      [message, 250],
      ["QUIT", 221],
    ]);
  } catch (e) {
    console.error("Gmail email refused", e);
    // Both services said no: say so when either one was out of its daily allowance.
    if (isLimit(e) || isLimit(refused)) throw new MailLimitError(e instanceof Error ? e.message : String(e));
    throw e;
  }
}

/** A short SMTP conversation over TLS: each line sent must get the expected reply code. */
function smtp(host: string, steps: [line: string, expect: number][]) {
  return new Promise<void>((resolve, reject) => {
    const socket = connect({ host, port: 465, servername: host });
    const timer = setTimeout(() => done(new Error("SMTP timed out")), 15_000);
    let buffer = "";
    let step = -1; // Waiting for the server's greeting.
    function done(e?: Error) {
      clearTimeout(timer);
      socket.destroy();
      if (e) reject(e);
      else resolve();
    }
    socket.on("error", done);
    socket.on("data", (chunk: Buffer) => {
      buffer += chunk.toString();
      // A reply is complete at a line like "250 OK" (not "250-more to come").
      const last = buffer.split("\r\n").findLast((l) => /^\d{3} /.test(l));
      if (!last) return;
      buffer = "";
      const expected = step < 0 ? 220 : steps[step][1];
      if (Number(last.slice(0, 3)) !== expected) return done(new Error(`SMTP step ${step} got: ${last.slice(0, 120)}`));
      step++;
      if (step === steps.length) return done();
      socket.write(`${steps[step][0]}\r\n`);
    });
  });
}
