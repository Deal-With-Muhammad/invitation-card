import { notFound } from "next/navigation";

export const metadata = { robots: { index: false } };

const C = "#0e7c86";

// Three logo concepts for DWM Invite: white mark on a brand tile, mark at 72%.
const MARKS: { name: string; idea: string; mark: React.ReactNode }[] = [
  {
    name: "A · Sealed i",
    idea: "A lowercase i: the stem is a card standing up, the dot is a wax seal.",
    mark: (
      <>
        <rect x="206" y="214" width="100" height="232" rx="24" fill="#fff" />
        <path d="M256 58c30 0 46 12 60 30 16 2 30 16 28 34 12 14 10 36-4 48-2 22-22 36-44 34-14 12-40 14-56 2-22 2-42-12-44-34-14-12-16-34-4-48-2-18 12-32 28-34 14-18 30-32 36-32Z" fill="#fff" />
        <circle cx="256" cy="134" r="34" fill="none" stroke={C} strokeWidth="9" />
      </>
    ),
  },
  {
    name: "B · Open doors",
    idea: "An arched doorway with both doors swung open: an invitation to come in.",
    mark: (
      <>
        <path d="M136 448V230c0-66 54-120 120-120s120 54 120 120v218" fill="none" stroke="#fff" strokeWidth="30" strokeLinejoin="round" />
        <path d="M150 236l-68-34v226l68 20Z" fill="#fff" />
        <path d="M362 236l68-34v226l-68 20Z" fill="#fff" />
        <path d="M256 168l12 30 32 4-24 21 7 31-27-16-27 16 7-31-24-21 32-4Z" fill="#fff" />
      </>
    ),
  },
  {
    name: "C · Envelope spark",
    idea: "An opened envelope with a spark rising out of it: good news is inside.",
    mark: (
      <>
        <path d="M96 250l160 110 160-110v178a24 24 0 0 1-24 24H120a24 24 0 0 1-24-24Z" fill="#fff" />
        <path d="M96 250l160-112 160 112" fill="none" stroke="#fff" strokeWidth="26" strokeLinejoin="round" />
        <path d="M256 60c8 42 20 54 62 62-42 8-54 20-62 62-8-42-20-54-62-62 42-8 54-20 62-62Z" fill="#fff" />
      </>
    ),
  },
];

function Tile({ mark, size }: { mark: React.ReactNode; size: number }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} aria-hidden>
      <rect width="512" height="512" rx="112" fill={C} />
      <g transform="translate(72 72) scale(.72)">{mark}</g>
    </svg>
  );
}

export default function Logos() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-serif text-[34px]">DWM Invite: logo concepts</h1>
      <p className="mt-2 text-muted">White mark on a teal tile ({C}), sized like the other DWM apps.</p>
      <div className="mt-10 grid gap-10 sm:grid-cols-3">
        {MARKS.map((m) => (
          <figure key={m.name} className="rounded-3xl border border-line bg-card p-6">
            <Tile mark={m.mark} size={180} />
            <div className="mt-5 flex items-end gap-4">
              <Tile mark={m.mark} size={64} />
              <Tile mark={m.mark} size={32} />
              <Tile mark={m.mark} size={16} />
            </div>
            <figcaption className="mt-5">
              <p className="font-medium">{m.name}</p>
              <p className="mt-1 text-[14px] text-muted">{m.idea}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
