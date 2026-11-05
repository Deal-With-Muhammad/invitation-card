import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal";
import { AUTHOR, DWM_ORIGIN } from "@/lib/dwm";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What DWM Invite collects, who can see an invitation, which services handle the data and how to have it removed.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`DWM Invite is run by me, ${AUTHOR.name}, an individual in ${AUTHOR.location}. It isn't a company. This page says plainly what the site collects and what happens to it.`}
    >
      <h2>How to contact me</h2>
      <p>
        Email <a href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a> or message me on <a href={AUTHOR.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp at +60 11-3986 5270</a>.
      </p>

      <h2>What I collect, and why</h2>
      <ul>
        <li>
          <strong>Your invitation:</strong> everything you type or choose when you publish, such as names, parents&apos; names, hosts, dates, venues, addresses, map links, messages, contact names and phone numbers, and your design choices. I store it so that guests can open it and you can edit it. No photos are uploaded.
        </li>
        <li>
          <strong>Where it was made:</strong> the country and city my host works out from your IP address, saved with the invitation.
        </li>
        <li>
          <strong>Accounts (optional):</strong> your email address, which invitations are yours, and when you signed up and last signed in. You don&apos;t need an account. If you sign in, I use your email to send sign-in codes.
        </li>
        <li>
          <strong>Guest visits:</strong> each time an invitation is opened I count one visit against its limit and record the time, approximate location (country, region and city, from the host), device type (phone, tablet or desktop) and where the link was tapped (for example WhatsApp, or a website&apos;s address). Guests don&apos;t sign in, and I don&apos;t save their IP address with the visit.
        </li>
        <li>
          <strong>Limits against abuse:</strong> short-lived counters that contain your IP address, and your email address when you ask for a sign-in code.
        </li>
        <li>
          <strong>Site analytics:</strong> a script from my main site counts page views on every page here, including invitations. It records the page address, where you came from, the address of links you click to leave the site, your country, and your device type, browser and operating system. It uses a scrambled daily ID, made from your IP address and browser details and kept for up to two days, to count each visitor once a day.
        </li>
        <li>
          <strong>Custom design requests:</strong> the form on the custom page sends nothing itself. It opens WhatsApp or your email app with your message filled in.
        </li>
      </ul>

      <h2>Who can see an invitation</h2>
      <ul>
        <li>Anyone with the link can open it. There&apos;s no password. Search engines are asked not to index it, and it isn&apos;t in the site&apos;s gallery or sitemap.</li>
        <li>
          The link preview in WhatsApp and other apps shows the names, the date and sometimes the venue.
        </li>
        <li>
          <strong>Public stats:</strong> the analytics numbers are public on my <a href={`${DWM_ORIGIN}/stats/invite`}>stats page</a>. Its lists of top pages and links clicked can show an invitation&apos;s address, which often contains the names, and the map links guests tap.
        </li>
        <li>
          Normally only you can edit it, using your private edit link or your account. If you turn on open editing, anyone who opens its edit address can change it.
        </li>
        <li>I can see every invitation, its visit numbers and the email of the account it belongs to, because I run the site. I use that to run it, help people and deal with abuse.</li>
      </ul>
      <p>
        If you put other people&apos;s details on an invitation, please make sure they&apos;re happy with that. If you appear on an invitation and want something removed, contact me.
      </p>

      <h2>Who it&apos;s shared with</h2>
      <p>There are no ads on this site. These services handle data for it:</p>
      <ul>
        <li><strong>Supabase</strong> stores invitations, accounts, visit records and limit counters, and runs the sign-in.</li>
        <li><strong>Amazon Web Services (AWS Amplify)</strong> hosts this site. It receives visitors&apos; IP addresses and browser details and may keep them in its logs.</li>
        <li><strong>Google (Gmail)</strong> delivers sign-in emails and holds email you send me.</li>
        <li><strong>Namecheap</strong> forwards email sent to {AUTHOR.email}.</li>
        <li><strong>Vercel and Upstash</strong> host my main site and its analytics database, which receive the page view data above and serve the analytics script and app menu.</li>
        <li><strong>Google Maps</strong> loads inside an invitation when it shows a map, and receives the venue, the guest&apos;s IP address and browser details. Google may also use its own cookies there.</li>
        <li><strong>YouTube</strong> loads on an invitation only if I&apos;ve set it up to play a song at the host&apos;s request, using YouTube&apos;s privacy-enhanced address. YouTube receives the guest&apos;s IP address and browser details.</li>
        <li><strong>Google Fonts</strong> supplies letter shapes for link preview images. My server sends the words drawn on the image (names, date, venue), not anyone&apos;s IP address. Fonts on the pages themselves come from this site.</li>
      </ul>
      <p>
        These companies can run their servers outside Malaysia and outside your own country, and each has its own privacy policy. Buttons for Google Maps, Waze, Google Calendar, WhatsApp and phone calls only take you to those services when you tap them. I may also share information if the law requires me to.
      </p>

      <h2>Cookies and browser storage</h2>
      <ul>
        <li><strong>Cookies:</strong> if you sign in, Supabase cookies keep you signed in. My code sets no other cookies, and none for guests. Google Maps and YouTube may set their own, as above.</li>
        <li><strong>Your browser&apos;s local storage:</strong> the invitation you&apos;re drafting and, for invitations you published in that browser, their links and private edit keys. Clearing your browser data removes them, so keep your edit link somewhere safe.</li>
        <li>If you add ?dwm-ignore=1 to an address here, local storage also remembers not to count your visits in that browser.</li>
      </ul>

      <h2>How long it&apos;s kept</h2>
      <p>
        There&apos;s no automatic deletion: invitations and their visit records stay after the event, until you delete the invitation or I remove it. Deleting an invitation deletes its visit records. Accounts stay until you ask me to delete them; deleting an account doesn&apos;t delete its invitations unless you ask for that too. Limit counters are cleared from time to time once they&apos;re a day past expiry. The daily analytics ID lasts up to two days, while the analytics totals have no end date. Providers may keep logs and backups for their own periods, and email stays until I delete it.
      </p>

      <h2>Security</h2>
      <p>
        The site runs over HTTPS. Sign-in uses emailed codes, so there&apos;s no password to leak. Edit keys are stored only as hashes on the server. Browsers don&apos;t talk to the database directly; everything goes through the site&apos;s server. Requests are limited to slow down abuse. That said, an invitation is readable by anyone who has its link, this is a site run by one person, and it has no security certification or independent audit. No online service can promise perfect security. If a breach affected you, I&apos;d tell you and do what the law requires.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask me for a copy of your data, and ask me to correct or delete it. You can delete your own invitations in the editor, and for anything else email <a href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a>. Malaysia&apos;s Personal Data Protection Act 2010 applies to how I handle personal data, and if you&apos;re in the EU or UK you also have rights under the GDPR, including the right to complain to your data protection authority.
      </p>

      <h2>Children</h2>
      <p>DWM Invite isn&apos;t for children under 13. A parent can make an invitation for a child&apos;s party. If a child under 13 has given me their details, tell me and I&apos;ll delete them.</p>

      <h2>Changes</h2>
      <p>
        If what the site does changes, I&apos;ll update this page and the date at the top. See also the <Link href="/terms">Terms of Use</Link>.
      </p>
    </LegalPage>
  );
}
