# DWM Invite

Free online invitations you send as a link: weddings, nikah, walima, mehndi,
engagements, birthdays, aqiqah, graduations, housewarmings and more.
Live at **invite.dealwithmuhammad.com**.

Pick one of 27 animated designs, type the names, days and venues, choose colours,
fonts and languages, and publish. Guests get a tap-to-open invitation with a
countdown, maps, calendar buttons and (optionally) music and auto-scroll.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run typecheck && npm run lint
```

Without Supabase keys, `next dev` saves published invitations to
`.data/invites.json` and accounts are switched off. With them (see
`.env.example`), invitations, visit counts and rate limits live in Supabase and
people can sign in with an emailed code. Set up the database once by running
`supabase/schema.sql` in the Supabase SQL editor; `SUPABASE.md` lists the
dashboard settings (email code template, SMTP, redirect URLs).

Handy dev pages: `/dev` (every template in every palette) and
`/preview/<template>?palette=<id>&occasion=<occasion>`.

## How it fits together

| Path | |
| --- | --- |
| `src/invite/types.ts` | The invitation data model (`InviteData`) |
| `src/invite/resolve.ts` | Data + guest language → exactly what a template prints |
| `src/invite/i18n/` | 12 languages: UI labels and default wording per occasion |
| `src/invite/templates/` | `catalog.ts` (names, palettes, fonts) and one folder per design. See `TEMPLATES.md` |
| `src/invite/runtime/` | The player: cover/opening phases, shared sections, music, auto-scroll, calendar |
| `src/components/editor/` | The editor, live preview (iframe at `/frame`), publish and share |
| `src/app/[slug]` | A shared invitation (noindex, with its own WhatsApp preview image) |
| `src/app/api/` | Publish, edit (edit token or the owner's account), delete, view counter, link check, sign-in |
| `src/app/admin` | Admin dashboard: insights (where guests and makers are, how guests arrive, devices, designs), invitations, accounts, log. Admin emails only, fresh email code every 12 hours |
| `src/lib/server/store.ts` | Supabase store (and the dev file store), visit limit, signed "seen" cookies |
| `src/lib/site.ts`, `pages.ts`, `seo.ts` | Site copy, keyword landing pages and JSON-LD |

Text fields set to `null` use the occasion's default wording in the guest's
language, so untouched invitations read naturally in every language they offer.

## Notes

- Edit tokens are only stored hashed. The token lives in the creator's browser
  and in their private edit link (`/edit/<slug>#k=<token>`).
- The only links a guest can follow from an invitation are map links on known
  map hosts and WhatsApp/phone links, so invitations can't be used for phishing.
- Each invitation includes 100 guest visits (one per phone; the maker's own
  devices don't count). After that, new visitors see "This invitation is full";
  phones that already opened it still can. Admins can add visits.
- Not built yet: RSVP and photo uploads.
