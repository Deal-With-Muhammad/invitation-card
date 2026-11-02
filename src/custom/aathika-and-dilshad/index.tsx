"use client";

import { BISMILLAH, BismillahScene, calendarUrl, Countdown, Credit, Detail, INSHALLAH, maps, QuboolScene, Relief, RumScene, Scene } from "../relief/kit";

// Custom invitation for Aathika & Dilshad's Nikah (Vellore, 20 November 2026), on the
// ivory relief design (../relief). Details from her own invite (/aathika).

const SLUG = "aathika-and-dilshad";

/** The Nikah, India time. */
const START = "2026-11-20T16:30:00+05:30";
const END = "2026-11-20T17:00:00+05:30";

const MASJID = { name: "Masjid-E-Azam", address: "Kaspa, Vellore", maps: maps("Masjid-E-Azam, Kaspa, Vellore") };

const HALL = {
  name: "Khanna Fiesta Banquet Hall",
  address: "Vellore",
  maps: "https://www.google.com/maps/place/Khanna+Fiesta,+A+Bergamont+Hotel+-+Vellore/@12.909297,79.1287891,17z/data=!4m9!3m8!1s0x3bad3890ebc7dde9:0xd2d8720815504e77!5m2!4m1!1i2!8m2!3d12.909297!4d79.131364!16s%2Fg%2F12hkwp02w",
};

const CONTACTS = [
  { name: "Abdul Shuckoor", phone: "9944650008" },
  { name: "Abdul Sathiq", phone: "9566916207" },
];

const CALENDAR = calendarUrl({
  title: "Nikah · Aathika & Dilshad",
  start: START,
  end: END,
  details: `Nikah at ${MASJID.name}, ${MASJID.address}\nVenue: ${HALL.name}, ${HALL.address}\n\nhttps://invite.dealwithmuhammad.com/${SLUG}`,
  location: `${MASJID.name}, ${MASJID.address}`,
});

export function Invite() {
  return (
    <Relief
      slug={SLUG}
      music="harp"
      labels={["Bismillah", "Qubool Hai", "Invitation", "Nikah", "Ar-Rum"]}
      footer={
        <footer className="rl-foot">
          <p className="rl-caps">With warm regards</p>
          <p className="rl-family">BMS Family</p>
          <span className="rl-orn" aria-hidden />
          <p className="rl-small">For any queries</p>
          <div className="rl-calls">
            {CONTACTS.map((c) => (
              <a key={c.phone} href={`tel:+91${c.phone}`}>
                <span>{c.name}</span>
                <small>{c.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}</small>
              </a>
            ))}
          </div>
          <Credit />
        </footer>
      }
    >
      <BismillahScene />

      <QuboolScene initials={["A", "D"]} first="Aathika" second="Dilshad" when="Friday · 20th November 2026 · Vellore" />

      <Scene art="frame">
        <p className="rl-bism-sm" lang="ar" dir="rtl">
          {BISMILLAH}
        </p>
        <p className="rl-caps">Mr &amp; Mrs Abdul Shuckoor Majeed</p>
        <p className="rl-body">request the pleasure of your gracious presence on the auspicious occasion of the Nikah of their beloved daughter</p>
        <p className="rl-person rl-write">Aathika Tharannum S</p>
        <p className="rl-with">with</p>
        <p className="rl-person rl-write">Dilshad Backer K</p>
        <p className="rl-body">son of Mr &amp; Mrs Abu Backer</p>
      </Scene>

      <Scene art="frame" className="is-details">
        <p className="rl-insha" lang="ar" dir="rtl">
          {INSHALLAH}
        </p>
        <h2 className="rl-title rl-write">Nikah Ceremony</h2>
        <div className="rl-pair">
          <Detail icon="calendar">
            Friday
            <small>20th November 2026</small>
          </Detail>
          <Detail icon="clock">
            4:30 PM
            <small>Nikah</small>
          </Detail>
        </div>
        <div className="rl-pair">
          <Detail icon="pin">
            {MASJID.name}
            <small>{MASJID.address}</small>
            <a href={MASJID.maps} target="_blank" rel="noopener">
              Directions
            </a>
          </Detail>
          <Detail icon="hall">
            {HALL.name}
            <small>{HALL.address}</small>
            <a href={HALL.maps} target="_blank" rel="noopener">
              Directions
            </a>
          </Detail>
        </div>
        <Countdown to={START} />
        <a className="rl-btn" href={CALENDAR} target="_blank" rel="noopener">
          Add to calendar
        </a>
      </Scene>

      <RumScene />
    </Relief>
  );
}
