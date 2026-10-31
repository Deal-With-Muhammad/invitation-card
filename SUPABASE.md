# Supabase setup

DWM Invite keeps invitations, visit counts, rate limits and the admin log in
Supabase, and uses Supabase Auth for accounts (sign in with an emailed code, no
passwords, no Google). Do these once per Supabase project.

## 1. Create the tables

Supabase dashboard → **SQL Editor** → New query → paste all of
`supabase/schema.sql` → **Run**. It's safe to run again after it changes.

Every table has row-level security on with no policies, so the public key can't
read or write anything. Only the server (service-role key) can.

## 2. Environment variables

In `.env` locally and in Vercel → Project → Settings → Environment Variables:

| Name | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → Data API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys → Publishable key |
| `SUPABASE_ANON_KEY` | Legacy anon key (only a fallback, can be left out) |
| `SUPABASE_SERVICE_ROLE` | API Keys → Secret key (or legacy service_role). Server only |
| `ADMIN_EMAILS` | Your email. Comma-separate several |

## 3. Redirect URLs

Authentication → **URL Configuration**

- Site URL: `https://invite.dealwithmuhammad.com`
- Redirect URLs: `https://invite.dealwithmuhammad.com/**` and `http://localhost:3000/**`

## 4. Put the code in the emails

By default Supabase emails only a link. Authentication → **Emails** → Templates.
Replace both **Magic Link** and **Confirm signup** with this (subject:
`Your DWM Invite code: {{ .Token }}`):

```html
<div style="font-family:Georgia,serif;max-width:440px;margin:0 auto;padding:32px 24px;background:#f5f0e6;color:#2a2520">
  <p style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#806235;margin:0">DWM Invite</p>
  <h1 style="font-weight:400;font-size:26px;margin:12px 0 8px">Your sign-in code</h1>
  <p style="font-size:15px;line-height:1.5;margin:0 0 20px">Enter this code on the sign-in page. It works for 10 minutes.</p>
  <p style="font-family:monospace;font-size:34px;letter-spacing:.35em;background:#1c5652;color:#f5f0e6;text-align:center;padding:16px;border-radius:14px;margin:0 0 20px">{{ .Token }}</p>
  <p style="font-size:14px;line-height:1.5;margin:0 0 24px">Or <a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email" style="color:#1c5652">sign in with this link</a> on this device.</p>
  <p style="font-size:12px;color:#6b635a;margin:0">Didn't ask for this? You can ignore this email.</p>
</div>
```

Authentication → Sign In / Providers → **Email**: keep it enabled, set *Email
OTP expiration* to 600 seconds and *Email OTP length* to 6.

## 5. Send email from your own address (needed before launch)

Supabase's built-in mailer only delivers to members of your Supabase team, a
couple of times an hour. That's enough for the admin login, but not for
customers. Authentication → Emails → **SMTP Settings** → enable custom SMTP.
No code (and no Nodemailer) is needed; Supabase sends the emails itself.

With Gmail:

- Turn on 2-Step Verification for the account, then make an app password at
  https://myaccount.google.com/apppasswords
- Host `smtp.gmail.com`, port `465`, username = the Gmail address, password =
  the 16-letter app password, sender name `DWM Invite`

(Resend, Brevo or Zoho work too and look more professional with a
`@dealwithmuhammad.com` sender.) Then raise Authentication → **Rate Limits** →
emails per hour (for example to 100).

## How the admin area is protected

- `/admin` only opens for emails in `ADMIN_EMAILS`, checked on the server with
  Supabase (not just the cookie) on every page load and every action.
- Anyone else who is signed in gets a 404; signed-out visitors are sent to sign in.
- Admin access needs a sign-in with an emailed code within the last 12 hours.
- The service-role key never reaches the browser, and the tables refuse the public key.
- Admin sign-ins and actions (add visits, reset, delete) are recorded in the
  **Admin log** tab with the IP address.
