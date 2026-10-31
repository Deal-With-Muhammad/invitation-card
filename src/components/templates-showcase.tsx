"use client";

import { Button, buttonVariants } from "@heroui/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { LiveThumb, ThumbPlayButton, type ThumbControl } from "@/components/live-thumb";
import { PreviewIconButton } from "@/components/preview-sheet";
import type { TemplateMeta } from "@/invite/templates/types";

const EASE = [0.16, 1, 0.3, 1] as const;

export type FanItem = { meta: TemplateMeta; thumb: ReactNode };

/** Where each card of the fan rests (percent of a card's width, degrees); the middle card sits highest. */
const SLOTS = [
  { x: -150, r: -14, y: 24, depth: 0.5 },
  { x: -75, r: -7, y: 7, depth: 0.8 },
  { x: 0, r: 0, y: -3, depth: 1.2 },
  { x: 75, r: 7, y: 7, depth: 0.8 },
  { x: 150, r: 14, y: 24, depth: 0.5 },
];

/** Phones show three bigger cards instead of five. */
const SLOTS_SMALL = [
  { x: -64, r: -8, y: 8, depth: 0.6 },
  { x: 0, r: 0, y: -3, depth: 1.2 },
  { x: 64, r: 8, y: 8, depth: 0.6 },
];

function useIsSmall() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(max-width: 639px)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 639px)").matches,
    () => false,
  );
}

function FanCard({ item, i, n, mx, my, still }: { item: FanItem; i: number; n: number; mx: MotionValue<number>; my: MotionValue<number>; still: boolean | null }) {
  const s = (n === 3 ? SLOTS_SMALL : SLOTS)[i];
  const mid = (n - 1) / 2;
  const px = useTransform(mx, (v) => v * 18 * s.depth);
  const py = useTransform(my, (v) => v * 8 * s.depth);
  return (
    <motion.div className="absolute top-1/2 left-1/2 w-[clamp(84px,15vw,190px)] max-sm:w-[36vw] -translate-x-1/2 -translate-y-1/2" style={{ x: px, y: py, zIndex: 10 - Math.abs(i - mid) }}>
      <motion.div
        initial={still ? false : { opacity: 0, y: 160, rotate: 0, x: 0 }}
        animate={{ opacity: 1, x: `${s.x}%`, y: `${s.y}%`, rotate: s.r }}
        whileHover={{ y: `${s.y - 6}%`, scale: 1.05, zIndex: 20, transition: { duration: 0.35, ease: EASE } }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.5 + Math.abs(i - mid) * 0.1 }}
        className="group relative"
      >
        <LiveThumb
          id={item.meta.id}
          name={item.meta.name}
          autoplay={i === Math.floor(mid)}
          compact
          indicatorClassName="bottom-2 left-2"
          barClassName="inset-x-2.5 bottom-2"
          className="overflow-hidden rounded-[12px] shadow-[0_34px_50px_-26px_rgb(18_64_60/0.55)] ring-1 ring-black/10"
        >
          {item.thumb}
        </LiveThumb>
        <PreviewIconButton id={item.meta.id} name={item.meta.name} className="absolute top-2 right-2 z-10 size-7" />
        <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-[12.5px] font-medium whitespace-nowrap text-ivory opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {item.meta.name}
        </span>
      </motion.div>
    </motion.div>
  );
}

/** The page's opening: a big centred headline, two buttons, then a fan of real designs that follows the pointer. */
export function TemplatesHero({
  count,
  items,
  links,
  lines = [
    ["Invitations", "worth"],
    ["opening", "twice."],
  ],
  lede = "Every design opens with its own little ceremony. Pick one, make it yours in a minute, send it as a link.",
  kicker,
  secondary = { href: "/custom", label: "Custom design" },
}: {
  count: number;
  items: FanItem[];
  links: { id: string; label: string }[];
  lines?: string[][];
  lede?: string;
  kicker?: string;
  secondary?: { href: string; label: string };
}) {
  const still = useReducedMotion();
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const small = useIsSmall();
  const fan = small ? items.slice(1, 4) : items.slice(0, 5);
  let n = 0;
  return (
    <header className="pt-6 pb-6 text-center sm:pt-20">
      <motion.p initial={still ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="mb-3 text-[13.5px] font-medium text-brand sm:mb-5 sm:text-[14px]">
        {kicker ?? `${count} designs · all free`}
      </motion.p>
      <h1 className="mx-auto max-w-4xl font-serif text-[42px] leading-[0.94] font-medium tracking-[-0.02em] sm:text-[84px]" aria-label={lines.flat().join(" ")}>
        {lines.map((line) => (
          <span key={line[0]} className="block" aria-hidden>
            {line.map((w) => {
              const d = 0.1 + n++ * 0.09;
              return (
                <span key={w} className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                  <motion.span className="inline-block" initial={still ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: d }}>
                    {w}&nbsp;
                  </motion.span>
                </span>
              );
            })}
          </span>
        ))}
      </h1>
      <motion.p initial={still ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.6 }} className="mx-auto mt-5 max-w-md text-[15.5px] leading-[1.5] text-balance text-ink/70 sm:mt-9 sm:text-[17px] sm:leading-[1.55]">
        {lede}
      </motion.p>
      <motion.div initial={still ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.75 }} className="mt-6 flex flex-wrap justify-center gap-2.5 sm:mt-8 sm:gap-3">
        <a href={`#${links[0]?.id ?? "weddings"}`} className={buttonVariants({ size: "lg", className: "h-11 px-4 text-[15px] sm:h-12 sm:px-6 sm:text-[16px]" })}>
          Browse designs
        </a>
        <Link href={secondary.href} className={buttonVariants({ variant: "tertiary", size: "lg", className: "h-11 px-4 text-[15px] sm:h-12 sm:px-6 sm:text-[16px]" })}>
          {secondary.label}
        </Link>
      </motion.div>
      <div
        className="relative mx-auto mt-3 h-[340px] w-full max-w-[900px] sm:mt-8 sm:h-[420px] lg:h-[470px]"
        onPointerMove={(e) => {
          const b = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - b.left) / b.width - 0.5);
          my.set((e.clientY - b.top) / b.height - 0.5);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
      >
        {fan.map((it, i) => (
          <FanCard key={it.meta.id} item={it} i={i} n={fan.length} mx={mx} my={my} still={still} />
        ))}
      </div>
      <nav aria-label="Jump to" className="mt-10 flex flex-wrap justify-center gap-2">
        {links.map((l) => (
          <a key={l.id} href={`#${l.id}`} className="rounded-full bg-paper-2 px-4 py-2 text-[14.5px] font-medium text-ink transition-colors duration-200 hover:bg-brand hover:text-ivory active:scale-[0.97]">
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

/** The film behind the homepage hero: a seamless Flow loop (public/hero/loop.*). With reduced
 * motion or data saver on, only its still frame shows. */
function HeroFilm() {
  const still = useReducedMotion();
  const saver = useSyncExternalStore(
    () => () => {},
    () => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true,
    () => false,
  );
  const cls = "absolute inset-0 -z-20 size-full object-cover object-[70%_20%] sm:object-center";
  if (still || saver) return <Image src="/hero/poster.webp" alt="" fill priority sizes="100vw" className={cls} />;
  return (
    <video className={cls} autoPlay muted loop playsInline preload="auto" poster="/hero/poster.webp" aria-hidden>
      <source src="/hero/loop.mp4" type="video/mp4" />
      <source src="/hero/loop.webm" type="video/webm" />
    </video>
  );
}

/** The homepage opening: a candlelit film of a card on teal velvet with the headline over its
 * dark side, and a fan of real designs rising out of its bottom edge. */
export function VideoHero({
  items,
  links,
  lines,
  lede,
  kicker,
  secondary,
}: {
  items: FanItem[];
  links: { id: string; label: string }[];
  lines: string[][];
  lede: string;
  kicker: string;
  secondary: { href: string; label: string };
}) {
  const still = useReducedMotion();
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const small = useIsSmall();
  const fan = small ? items.slice(1, 4) : items.slice(0, 5);
  let n = 0;
  return (
    <header className="pt-3 pb-6 sm:pt-6">
      <div className="relative isolate flex min-h-[540px] flex-col justify-end overflow-hidden rounded-[26px] bg-deep px-5 pt-[58vw] pb-36 text-ivory sm:min-h-[600px] sm:justify-center sm:rounded-[32px] sm:px-12 sm:pt-10 sm:pb-40 lg:min-h-[640px] lg:px-16">
        <HeroFilm />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(9_32_30/0.98)_0%,rgb(9_32_30/0.92)_58%,rgb(9_32_30/0.25)_80%,rgb(9_32_30/0)_92%)] sm:bg-[linear-gradient(90deg,rgb(9_32_30/0.94)_0%,rgb(9_32_30/0.78)_34%,rgb(9_32_30/0.1)_66%,transparent_80%)]"
        />
        <div className="max-w-[720px]">
          <motion.p initial={still ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="mb-3 text-[13.5px] font-medium text-gold-light sm:mb-5 sm:text-[14.5px]">
            {kicker}
          </motion.p>
          <h1 className="font-serif text-[clamp(30px,8.6vw,40px)] leading-[0.98] font-normal tracking-[-0.02em] whitespace-nowrap sm:text-[64px] lg:text-[76px]" aria-label={lines.flat().join(" ")}>
            {lines.map((line) => (
              <span key={line[0]} className="block" aria-hidden>
                {line.map((w) => {
                  const d = 0.1 + n++ * 0.09;
                  return (
                    <span key={w} className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                      <motion.span className="inline-block" initial={still ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: d }}>
                        {w}&nbsp;
                      </motion.span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>
          <motion.p initial={still ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.6 }} className="mt-4 max-w-md text-[15px] leading-[1.55] text-ivory/80 sm:mt-7 sm:text-[17px]">
            {lede}
          </motion.p>
          <motion.div initial={still ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.75 }} className="mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
            <a href={`#${links[0]?.id ?? "new"}`} className={buttonVariants({ size: "lg", className: "h-11 bg-gold-light px-5 text-[15px] text-deep hover:bg-[#e6d2a5] sm:h-12 sm:px-6 sm:text-[16px]" })}>
              Browse designs
            </a>
            <Link href={secondary.href} className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 border-ivory/30 bg-ivory/8 px-5 text-[15px] text-ivory backdrop-blur-sm hover:border-ivory/60 hover:bg-ivory/14 sm:h-12 sm:px-6 sm:text-[16px]" })}>
              {secondary.label}
            </Link>
          </motion.div>
        </div>
      </div>
      <div
        className="relative z-10 mx-auto -mt-32 h-[300px] w-full max-w-[900px] sm:-mt-40 sm:h-[400px] lg:h-[440px]"
        onPointerMove={(e) => {
          const b = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - b.left) / b.width - 0.5);
          my.set((e.clientY - b.top) / b.height - 0.5);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
      >
        {fan.map((it, i) => (
          <FanCard key={it.meta.id} item={it} i={i} n={fan.length} mx={mx} my={my} still={still} />
        ))}
      </div>
      <nav aria-label="Jump to" className="mt-8 flex flex-wrap justify-center gap-2">
        {links.map((l) => (
          <a key={l.id} href={`#${l.id}`} className="rounded-full bg-paper-2 px-4 py-2 text-[14.5px] font-medium text-ink transition-colors duration-200 hover:bg-brand hover:text-ivory active:scale-[0.97]">
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

/** Fades and lifts its children into view the first time they scroll on screen. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const still = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={still ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** One spotlight card: the invitation fills it, the name sits on a soft fade at the bottom, and it tilts toward the pointer. */
function SpotlightCard({ item }: { item: FanItem }) {
  const { meta, thumb } = item;
  const still = useReducedMotion();
  const [control, setControl] = useState<ThumbControl | null>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 140, damping: 16 });
  const ry = useSpring(useMotionValue(0), { stiffness: 140, damping: 16 });
  return (
    <motion.li
      className="group relative w-[min(72vw,280px)] flex-none snap-start [perspective:900px]"
      onPointerMove={(e) => {
        if (still || e.pointerType !== "mouse") return;
        const b = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - b.left) / b.width - 0.5) * 12);
        rx.set(-((e.clientY - b.top) / b.height - 0.5) * 10);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      <motion.div style={{ rotateX: rx, rotateY: ry }} className="relative overflow-hidden rounded-[22px] shadow-[0_1px_3px_rgb(0_0_0/0.08),0_16px_28px_-14px_rgb(0_0_0/0.4)] ring-1 ring-black/5 transition-shadow duration-500 group-hover:shadow-[0_1px_3px_rgb(0_0_0/0.1),0_24px_36px_-16px_rgb(0_0_0/0.5)]">
        <LiveThumb
          id={meta.id}
          name={meta.name}
          label={meta.filmed ? "Filmed opening" : undefined}
          indicatorClassName="top-3 left-3"
          barClassName="inset-x-6 bottom-[5px]"
          onControl={setControl}
        >
          {thumb}
        </LiveThumb>
        <PreviewIconButton id={meta.id} name={meta.name} className="absolute top-3 right-3 z-10" />
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-center gap-3 rounded-2xl bg-white/88 py-2.5 pr-2.5 pl-2.5 shadow-[0_8px_24px_-10px_rgb(0_0_0/0.35)] backdrop-blur-md">
          <ThumbPlayButton control={control} name={meta.name} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[16px] leading-tight font-medium text-ink">{meta.name}</h3>
            <p className="mt-0.5 truncate text-[12.5px] text-muted">{meta.tagline}</p>
          </div>
          <Link
            href={`/create/${meta.id}`}
            aria-label={`Use ${meta.name}`}
            className="pointer-events-auto grid size-9 flex-none place-items-center rounded-full bg-black text-[16px] text-white transition-transform duration-300 hover:scale-110 group-hover:translate-x-0.5"
          >
            →
          </Link>
        </div>
      </motion.div>
    </motion.li>
  );
}

/** A swipeable row of spotlight cards with arrow buttons on desktop. */
export function TemplateRow({ items }: { items: FanItem[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  return (
    <div className="relative">
      <ul ref={ref} className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pt-3 pb-8 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:[mask-image:linear-gradient(to_right,black_94%,transparent)] row-scroll">
        {items.map((it) => (
          <SpotlightCard key={it.meta.id} item={it} />
        ))}
      </ul>
      {items.length > 3 && (
        <div className="absolute -top-[88px] right-0 hidden gap-2 sm:flex">
          {([-1, 1] as const).map((d) => (
            <Button
              key={d}
              isIconOnly
              variant="tertiary"
              onPress={() => go(d)}
              aria-label={d < 0 ? "Scroll left" : "Scroll right"}
              className="rounded-full hover:bg-brand hover:text-ivory"
            >
              {d < 0 ? <ArrowLeft className="size-[18px]" aria-hidden /> : <ArrowRight className="size-[18px]" aria-hidden />}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
