import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal";
import { AUTHOR } from "@/lib/dwm";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms for using DWM Invite: visit limits, acceptable use, your content and Malaysian law.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro={`DWM Invite is run by me, ${AUTHOR.name}, an individual in ${AUTHOR.location}, not a company. By using the site or publishing an invitation you agree to these terms.`}
    >
      <h2>What the service is</h2>
      <p>
        DWM Invite lets you make an online invitation from a design, publish it at a link and send that link to your guests. You can use it without an account, or sign in with an emailed code to keep your invitations in one place.
      </p>

      <h2>Free, and provided as-is</h2>
      <p>
        Making and publishing an invitation is free. Each one includes 100 visits, and every opening of the link counts as one. When they&apos;re used up, guests see a message that the invitation is full instead of the card. Extra visits and custom designs are arranged with me directly, and any price is agreed before work starts.
      </p>
      <p>
        I provide the service as it is, and can change it or stop it at any time. Please check your invitation before you send it, and keep your event details somewhere else as well.
      </p>

      <h2>Acceptable use</h2>
      <p>Please don&apos;t use DWM Invite to:</p>
      <ul>
        <li>do anything illegal, or deceive people (for example a fake event or a scam)</li>
        <li>harass, threaten or abuse anyone</li>
        <li>publish content you don&apos;t have the right to use, including other people&apos;s private details without their permission</li>
        <li>abuse the site: spam, attacks, getting around the limits, or trying to get in where you aren&apos;t meant to</li>
        <li>scrape it, or copy its designs and artwork out of the service</li>
      </ul>

      <h2>Your content</h2>
      <p>
        What you write on your invitation stays yours. You give me only the permission I need to run the service: to store it, show it to anyone with the link, make its preview image and keep it working. You&apos;re responsible for what you publish and for checking it&apos;s correct. Anyone with the link can see an invitation, and your private edit link lets whoever holds it change or delete it, so share it with care.
      </p>
      <p>The designs, artwork and site code remain mine or their licensors&apos;. You can use them for your invitations here.</p>

      <h2>Removing content and suspending accounts</h2>
      <p>
        I can remove an invitation or suspend an account that breaks these terms or that someone has reported with good reason, with or without notice. You can delete your own invitations at any time.
      </p>

      <h2>No warranties, and limited liability</h2>
      <p>
        I don&apos;t promise the service will always be available, free of errors, or that an invitation will open on every device or reach every guest. As far as the law allows, I give no warranties and I&apos;m not liable for any loss that comes from using the service, including a lost invitation or a guest missing an event. Nothing here takes away rights you have that the law says can&apos;t be removed.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of Malaysia.</p>

      <h2>Contact</h2>
      <p>
        Email <a href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a> or message me on <a href={AUTHOR.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp at +60 11-3986 5270</a>. See also the <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
