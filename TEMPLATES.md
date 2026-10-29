# Writing an invitation template

Every design lives in `src/invite/templates/<id>/` and plugs into one shared
invitation engine. The engine owns the data, languages, dates, sections, music,
auto-scroll and controls; a template owns how it looks and how it opens.

Read these first:

| File | What it gives you |
| --- | --- |
| `src/invite/templates/types.ts` | The contract (`Template`, `HeroProps`, `CoverProps`, phases) |
| `src/invite/templates/catalog.ts` | Each template's name, palettes, fonts, `openMs` |
| `src/invite/templates/jharokha/` | The reference template: `index.tsx`, `art.tsx`, `cover.tsx`, `jharokha.css` |
| `src/invite/runtime/sections.tsx` | Shared section markup and its `inv-*` classes, plus `Names`, `Blessing`, `Lines` |
| `src/invite/runtime/base.css` | Default styles for all of it, and the thumbnail rules |
| `src/invite/resolve.ts` | `Resolved`: exactly what a template prints (`r.title`, `r.names`, `r.when`, …) |
| `src/invite/runtime/effects.ts` | `petals`, `confetti`, `sparkles` for `celebrate` |
| `src/invite/fonts.ts` | Every font, usable in CSS as `var(--f-<key>)` |

## Files

```
templates/<id>/index.tsx   export const <id>: Template = { meta: metaFor("<id>"), Hero, Cover, … }; imports "./<id>.css"
templates/<id>/art.tsx     Hero, Divider, Ornament, Backdrop, section overrides. No hooks, no "use client".
templates/<id>/cover.tsx   Cover. Prefer no hooks: animate with CSS keyed off .inv[data-phase].
templates/<id>/<id>.css    Every selector scoped under .t-<id> or a class prefix unique to the template.
```

## Rules

**Phases.** `closed` → the cover is up. A tap calls `onOpen` → `opening` for
`meta.openMs` ms: the cover plays its exit and the hero animates in underneath →
`open`: the cover is unmounted. The cover sits `position: fixed` over the top of
the page, exactly where the hero is, so a cover can be "just the doors" over the
hero's own frame (that's what Jharokha does).

**Units.** Size the hero and cover in phone pixels: `calc(48 * var(--u))` is 48px
on a 390px-wide phone and scales with the card (also in gallery thumbnails).
`var(--sh)` is the screen height; the hero has `min-height: var(--sh)`. It must
look right from 320×568 to 430×932, in a 480px desktop column, and as a 9:16
thumbnail. Body sections below the hero use normal px.

**Long names.** `<Names>` sets `--len` (longest name in characters). Shrink with
`font-size: min(calc(48 * var(--u)), calc(100cqi / (var(--len) * 0.5)))` inside a
`container-type: inline-size` box.

**What the hero shows.** `<Blessing r={r} />` (renders nothing when off),
`r.title`, `<Names r={r} />`, `r.milestone` when set, `r.when` (`weekday`, `date`,
`time`; for several days `date` is a range and the others are empty), and
`r.main?.venue` when `r.oneVenue`. One or two people. RTL-safe: Urdu, Arabic and
Persian flip the page, so use logical properties and never bake text into art.

**Colour.** Only `--bg`, `--ink`, `--accent`, `--soft`, `--on-accent` and
`color-mix()` of them, so every palette and the host's custom colours work. Check
every palette, light and dark. No black anywhere (shadows mix `--ink`, not #000).

**Thumbnails.** The gallery renders Hero + Backdrop on the server, many on one
page, with all animation switched off. So:
- no hooks in Hero/Divider/Ornament/Backdrop/section overrides;
- no SVG `id`s there (copies would clash): use CSS `mask` with a data-URL SVG
  for patterns and CSS gradients for gradients. Ids are fine inside Cover;
- base styles are the final visible state; entrance animations start *from*
  hidden (`animation-fill-mode: both`) and only run under `.inv[data-phase="opening"]`,
  finishing before `openMs`.

**Look.** It has to look like a stationery designer made it: hand-built SVG with
consistent stroke weights and real detail, a clear typographic hierarchy, generous
spacing. Avoid the generic "AI" look: no glassmorphism, no rainbow gradients, no
emoji, no stock icons as decoration.

**Sections.** Restyle the shared sections (headings, countdown, event cards,
venue and map, buttons, programme, swatches, contacts, prayer, closing) under
`.t-<id>` so the whole page belongs to the design. Replace a section through
`sections` only when the concept needs different markup.

**Motion.** Transform and opacity only, eased, nothing that loops fast. Reduced
motion is handled globally.

## Stationery wedding cards

The wedding cards modelled on printed stationery (Gilded Blossom, Rose Study,
Midnight Orchid, Wildflower Lane, Ivory Lace, Gilded Wreath, Lily of the Valley,
Peony Arch, Rose Shower, Red Velvet) share one kit in `templates/stationery/`:

| File | What it gives you |
| --- | --- |
| `stationery/kit.tsx` | `makeStationery(id, { Card, Liner, surface, seal })`: the envelope, the opening, the marble / linen / velvet surface and the enclosure cards below |
| `stationery/flora.ts` | Seeded botanical drawing: roses, peonies, blossoms, orchids, lily-of-the-valley bells, wildflowers, leaves, stems, and `svgUrl` for foil masks |
| `stationery/stationery.css` | Scene geometry, the opening timeline, painted-tone classes (`fa`…`fd`, `la`, `lb`, `lv`, `sm`) and `.st-foil` |

A new card only draws its face (`Card`, sized in `calc(N * var(--k))` on a 280 × 392
card) and its envelope liner (`Liner`). Painted art is inline SVG coloured by
`--f1…--f4` and `--g1…--g3`; foil and lace are CSS masks made with `svgUrl`, so
thumbnails never carry SVG ids.
