"use client";

import type { ReactNode } from "react";

import { BISMILLAH, BismillahScene, calendarUrl, Countdown, Credit, Detail, maps, QuboolScene, Relief, RumScene, Scene } from "../relief/kit";

// Shifa & Arbaz, design 2: the ivory relief design (../relief) with all four
// celebrations (Vapi, 7–9 January 2027) as scenes. Details from the family's latest
// printed cards, with the client's corrections: the Nikah is at the party plot at
// 11:00 am, and the groom is the son of Mrs. Femida & Late Mr. Shaiyad Khan.

const SLUG = "shifa-and-arbaz-2";

const VENUE = {
  name: "Farhen Party Plot",
  area: "Chala, Vapi",
  address: "Mohid Bungalow, G-9, Vapi–Daman Main Road, Opp. GST Bhavan, Near Aditi Hospital, Chala, Vapi, Gujarat 396191",
  maps: maps("Farheen Party Plot, Mohid Bungalow, Vapi Daman Main Road, Chala, Vapi, Gujarat 396191"),
};

type Ev = { name: string; day: string; date: string; time: string; note: string; start: string; hours: number };

const NIKAH: Ev = { name: "Nikah", day: "Thursday", date: "7th January 2027", time: "11:00 AM", note: "Nikah", start: "2027-01-07T11:00:00+05:30", hours: 4 };
const MEHENDI: Ev = { name: "Mehendi", day: "Thursday", date: "7th January 2027", time: "7:00 PM", note: "Guest arrival", start: "2027-01-07T19:00:00+05:30", hours: 3 };
const PITHI: Ev = { name: "Pithi & Mosaru", day: "Friday", date: "8th January 2027", time: "6:00 PM", note: "Guest arrival", start: "2027-01-08T18:00:00+05:30", hours: 3 };
const DAAWAT: Ev = { name: "Daawat-e-Mehmani", day: "Saturday", date: "9th January 2027", time: "7:00 PM", note: "Guest arrival", start: "2027-01-09T19:00:00+05:30", hours: 3 };

function calendar(e: Ev) {
  const end = new Date(Date.parse(e.start) + e.hours * 3_600_000).toISOString();
  return calendarUrl({
    title: `${e.name} · Shifa & Arbaz`,
    start: e.start,
    end,
    details: `${e.note} ${e.time}\n${VENUE.name}, ${VENUE.address}\n\nhttps://invite.dealwithmuhammad.com/${SLUG}`,
    location: `${VENUE.name}, ${VENUE.address}`,
  });
}

/** The venue, with directions and (for a celebration) its add-to-calendar link. */
function Venue({ e }: { e?: Ev }) {
  return (
    <Detail icon="pin">
      {VENUE.name}
      <small>{VENUE.area}</small>
      <a href={VENUE.maps} target="_blank" rel="noopener">
        Directions
      </a>
      {e && (
        <>
          {" · "}
          <a href={calendar(e)} target="_blank" rel="noopener">
            Add to calendar
          </a>
        </>
      )}
    </Detail>
  );
}

/** One celebration from the printed cards: who invites, what, when, where. */
function EventScene({ e, hosts, invite, title, tagline, after }: { e: Ev; hosts: string; invite: string; title: string; tagline?: string; after?: ReactNode }) {
  return (
    <Scene art="frame" className="is-details is-event">
      <p className="rl-caps">{hosts}</p>
      <p className="rl-body">{invite}</p>
      <h2 className={`rl-title rl-write${title.length > 14 ? " is-long" : ""}`}>{title}</h2>
      {tagline && <p className="rl-en">{tagline}</p>}
      <div className="rl-pair">
        <Detail icon="calendar">
          {e.day}
          <small>{e.date}</small>
        </Detail>
        <Detail icon="clock">
          {e.time}
          <small>{e.note}</small>
        </Detail>
      </div>
      <div className="rl-one">
        <Venue e={e} />
      </div>
      {after}
      <Countdown to={e.start} compact />
    </Scene>
  );
}

export function Invite() {
  return (
    <Relief
      slug={SLUG}
      music="harp"
      labels={["Bismillah", "Qubool Hai", "Invitation", "Nikah", "Mehendi", "Pithi & Mosaru", "Daawat-e-Mehmani", "Ar-Rum"]}
      footer={
        <footer className="rl-foot">
          <p className="rl-caps">With love and duas</p>
          <p className="rl-family">The Vankalwala Family</p>
          <span className="rl-orn" aria-hidden />
          <p className="rl-small">All celebrations at</p>
          <p className="rl-foot-venue">{VENUE.name}</p>
          <p className="rl-small">{VENUE.address}</p>
          <iframe
            className="rl-map"
            title={`Map of ${VENUE.name}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent("Mohid Bungalow, Vapi Daman Main Road, Chala, Vapi, Gujarat 396191")}&z=15&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a className="rl-btn" href={VENUE.maps} target="_blank" rel="noopener">
            Open in Maps
          </a>
          <br />
          <Credit />
        </footer>
      }
    >
      <BismillahScene />

      <QuboolScene initials={["S", "A"]} first="Shifa" second="Arbaz" when="7 · 8 · 9 January 2027 · Vapi" />

      <Scene art="frame">
        <p className="rl-bism-sm" lang="ar" dir="rtl">
          {BISMILLAH}
        </p>
        <p className="rl-caps">Mrs.&nbsp;Yashmin &amp; Late&nbsp;Mr.&nbsp;Firoz&nbsp;Vankalwala</p>
        <p className="rl-body">request the pleasure of your gracious presence at the wedding celebrations of their beloved daughter</p>
        <p className="rl-person rl-write">Shifa</p>
        <p className="rl-with">with</p>
        <p className="rl-person rl-write">Arbaz</p>
        <p className="rl-body">son of Mrs. Femida &amp; Late Mr. Shaiyad Khan</p>
      </Scene>

      <Scene art="frame" className="is-details is-event">
        <p className="rl-caps">Mr.&nbsp;Salim &amp; Late&nbsp;Mrs.&nbsp;Mumtaz&nbsp;Vankalwala</p>
        <p className="rl-body">would like to invite you to the</p>
        <h2 className="rl-title rl-write">Nikah Ceremony</h2>
        <div className="rl-pair">
          <Detail icon="calendar">
            {NIKAH.day}
            <small>{NIKAH.date}</small>
          </Detail>
          <Detail icon="clock">
            {NIKAH.time}
            <small>Lunch from 2:00 PM</small>
          </Detail>
        </div>
        <div className="rl-one">
          <Venue e={NIKAH} />
        </div>
        <Countdown to={NIKAH.start} compact />
      </Scene>

      <EventScene e={MEHENDI} hosts="Arbaz, Neamat, Adnan, Sohaa & Hassan" invite="would like to invite you to" title="Shifa's Mehendi" />

      <EventScene
        e={PITHI}
        hosts="Yashmin Vankalwala & Late Firoz Vankalwala"
        invite="request the pleasure of your company for a special celebration of their daughter Shifa"
        title="Pithi & Mosaru"
        tagline="An evening of colour, family and celebration"
      />

      <EventScene
        e={DAAWAT}
        hosts="Aslam & Vahida Vankalwala"
        invite="request the pleasure of your company for"
        title="Daawat-e-Mehmani"
        tagline="to celebrate the wedding of their beloved niece Shifa & Arbaz"
      />

      <RumScene />
    </Relief>
  );
}
