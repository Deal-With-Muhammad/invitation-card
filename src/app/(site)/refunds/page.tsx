import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal";
import { AUTHOR } from "@/lib/dwm";
import { usd, UNLOCK_PRICE_CENTS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "What you pay for on DWM Invite, how payments through Lemon Squeezy work, and when you can get your money back.",
  alternates: { canonical: "/refunds" },
};

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro={`DWM Invite is run by me, ${AUTHOR.name}, an individual in ${AUTHOR.location}, not a company. This page explains what you pay for, who processes the payment and when you can get a refund.`}
    >
      <h2>What you pay for</h2>
      <p>
        Making and publishing an invitation is free, with a limited number of visits. The only thing you can buy on the site is <strong>unlimited visits for one invitation</strong>: a one-time payment of{" "}
        {usd(UNLOCK_PRICE_CENTS.regular)} for an invitation in a regular design, or {usd(UNLOCK_PRICE_CENTS.premium)} for one in a premium design. It isn&apos;t a subscription and nothing renews.
      </p>
      <p>
        It switches on automatically, usually within a few seconds of paying. From then on the invitation&apos;s link opens for anyone, as often as they like, for as long as the invitation is on the site. It applies only to the invitation you paid for, not to others you make.
      </p>
      <p>
        Prices are set in US dollars. The site also shows roughly what that is in your own currency, from a daily exchange rate, but that&apos;s only a guide: you&apos;re charged in US dollars, and your bank or card decides the final amount in your currency and any fee of its own.
      </p>

      <h2>Who processes the payment</h2>
      <p>
        Payments are handled by <a href="https://www.lemonsqueezy.com" target="_blank" rel="noopener noreferrer">Lemon Squeezy</a>, which acts as the merchant of record: it sells you the unlock on my behalf, takes the payment, adds any sales tax or VAT your country requires, and emails you the receipt. Your card or payment details go to Lemon Squeezy and its payment partners. I never see them. Lemon Squeezy&apos;s own{" "}
        <a href="https://www.lemonsqueezy.com/buyer-terms" target="_blank" rel="noopener noreferrer">buyer terms</a> also apply to the purchase.
      </p>

      <h2>When you can get a refund</h2>
      <p>Ask within 14 days of paying and I&apos;ll refund you in full if:</p>
      <ul>
        <li>unlimited visits didn&apos;t switch on, and I couldn&apos;t fix it quickly after you told me;</li>
        <li>you paid twice for the same invitation, or paid for the wrong invitation;</li>
        <li>you paid by mistake and no one has opened the invitation since, beyond the visits it already had for free;</li>
        <li>the site stops working for your invitation for a long time, or I close the service, before your event.</li>
      </ul>
      <p>
        Unlimited visits start working the moment you pay, so once guests have opened the invitation beyond its free visits, the service has been delivered and I don&apos;t normally refund it. I&apos;ll still look at any request fairly, and nothing here takes away a refund right that the law in your country gives you and that can&apos;t be removed.
      </p>
      <p>
        If you&apos;re in the EU or UK: by paying, you ask for unlimited visits to start straight away, and you accept that this means the usual 14-day right to cancel a digital service ends once it has been fully provided. The cases above still apply.
      </p>

      <h2>What happens when you&apos;re refunded</h2>
      <p>
        The invitation goes back to its free number of visits. If it has already been opened more times than that, guests will see that it&apos;s full again. Refunds are made by Lemon Squeezy to the card or account you paid with, and usually arrive within 5 to 10 working days, depending on your bank.
      </p>

      <h2>If I remove an invitation</h2>
      <p>
        If I remove an invitation because it breaks the <Link href="/terms">Terms of Use</Link> (for example a scam or abusive content), the payment isn&apos;t refunded.
      </p>

      <h2>How to ask</h2>
      <p>
        Email <a href={`mailto:${AUTHOR.email}`}>{AUTHOR.email}</a> or message me on{" "}
        <a href={AUTHOR.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp at +60 11-3986 5270</a> with your invitation&apos;s link and the order number from your Lemon Squeezy receipt. I usually reply within two working days. Please talk to me before disputing a payment with your bank: it&apos;s faster for you, and a dispute can&apos;t be undone.
      </p>
    </LegalPage>
  );
}
