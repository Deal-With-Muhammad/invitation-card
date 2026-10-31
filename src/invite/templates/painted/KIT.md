# The painted kit

Every DWM Invite design is now built on painted or photographed art (generated
images in `public/art/<id>/`) instead of SVG drawn in code. The art does the look;
the code does the motion and prints all text live on top (names, dates, venues,
every language). Reference designs: `peony/` (veil), `petals/` (zoom + petal burst),
`velvetrose/` (hinged lid + initials in gold thread).

## Files for a design

```
src/invite/templates/<id>/index.tsx   export const <id> = makePainted("<id>", { … }); imports "./<id>.css"
src/invite/templates/<id>/<id>.css    only selectors under .t-<id>
public/art/<id>/<name>.webp           1080×1920 art (+ <name>-720.webp); usually hero + closed
src/invite/templates/catalog.ts       the design's entry (name, palettes, fonts, openMs, opening, islamic)
```

Delete the design's old `art.tsx` / `cover.tsx` if it has them; nothing else imports them.

## makePainted options (kit.tsx)

- `hero`: art name for the opened screen (default `"hero"`). `heroPos`: object-position.
- `cover.kind`: the opening. One of:
  `doors` (closed art splits at the centre and both halves swing open, warm light blooms),
  `slide` (halves slide apart, lift doors), `lift` (moves up and away), `zoom` (grows and
  fades; set `--zr` on `.t-<id> .pt-cover` to spin it, e.g. `--zr: 90deg`), `hinge` (lid
  hinged at the top), `swing` (cover hinged at the left edge: book, passport, a door),
  `veil` (a see-through layer over the hero drifts up; the cover blends with multiply),
  `strips` (vertical strips swing apart from the middle; `strips: 12`), `tear` (top and
  bottom halves tear apart), `envelope` (drops away while the card rises out of it),
  `glow` (light burns the cover away from the middle), `unroll` (the hero unrolls from the
  top), `wave` (foam washes up and back), `film` (a Veo first+last-frame video,
  public/art/<id>/open.webm|mp4, plays from the closed art into the hero; `openMs` = its length).
  Prefer `film` for weddings: no opening may crossfade between two different pictures. Make the
  first frame from the closed state and the last from the open state with text hidden, trim the
  still start, cut at the frame that best matches the hero, and check for one-frame jumps.
  On a film the names rise in over its second half (a twin of the hero text in the cover); a
  card whose film shows the card late sets `--twin-at` on `.t-<id>` (default `0.55` of `openMs`).
- `cover.art`: closed-state art name. `cover.pos`: object-position.
- `cover.seal`: initials laid over a seal/medallion in the art: `{ x: "50%", y: "48%", size: 90,
  look: "foil" | "wax" | "emboss" | "thread" | "ink" | "plain" }`. Measure x/y on the art.
- `cover.hint`: `"light"` (light text on a dark pill, for dark art) or `"dark"`.
- `cover.Extra`: a component for extra live text on the cover (an address, a ticket line, a
  masthead). `cover.onTap(root)`: an effect fired on the opening tap (see fx.ts).
- `text`: `{ top: "26%", width: 260 }` places the hero text block (top in % of the screen, width
  in phone px). Put it in the art's calm area. A soft radial glow of `--bg` sits behind it.
- `HeroArt`: component drawn over the hero art, under the text (lights, stars, stamps).
- `HeroAfter`: extra content after the date. `heroShow`: `{ title, venue, blessing }` toggles.
- `variants`: `{ <paletteId>: { hero?, cover?, film? } }` — a colourway that swaps the art (and,
  for a filmed opening, its own video, e.g. `film: "open-couple"`).
- `stripY`: background-position-y of a band of the hero art used as the painted divider between
  sections (e.g. `"97%"` = the bottom band, `"3%"` = the top band); `null` for no strip. `stripH`.
- `panels`: `"paper"` (default, translucent panels with a fine inner rule) or `"clear"`.
- `celebrate(root)`: runs once after opening. `fx.ts` has `fall`, `tapToThrow`, `GOLD`,
  `RED_PETALS`, `PINK_PETALS`; `runtime/effects.ts` has `confetti`, `sparkles`, `petals`.

Hero classes to restyle: `.pt-text .pt-bless .pt-title .pt-names .pt-milestone .pt-when .pt-sc
.pt-date .pt-venue .pt-scroll`. Sections keep the shared `inv-*` classes; the kit already gives
them panels, bigger type and accent colours, so only adjust what the design needs.

## Rules

- Phone first (390×844). Closed and opened screens are full-bleed art. Names at least 44 px on a
  390 px phone (`calc(N * var(--u))` units in the hero), body text at least 16 px.
- Text is always live, never baked into art. Check it reads over the art; move it (`text.top`,
  `width`) into the calm area rather than adding boxes.
- Colours: one palette per design (each colourway needs its own art). Pick `bg`, `ink`, `accent`,
  `soft` from the art itself (`magick public/art/<id>/hero.webp -crop … -resize 1x1 txt:-`). No
  pure black anywhere.
- Fonts: only keys from `src/invite/fonts.ts` (great-vibes pinyon parisienne allura alex-brush
  italianno delafield doulaise petit-formal caveat homemade sacramento cormorant cormorant-infant
  playfair cinzel marcellus italiana bodoni fraunces yeseva rozha gloock prata dm-serif poiret
  limelight abril shrikhand josefin montserrat jost dm-sans outfit quicksand nunito space-mono
  bricolage).
- `islamic: true` only for nikah/walima/desi-Islamic designs; `false` makes the sample start
  without Bismillah.
- Motion: transform/opacity, ease-out, nothing looping faster than every 4 s. Reduced motion is
  handled globally.
- Hero, HeroArt, Divider, Backdrop: no hooks (gallery thumbnails render them on the server).
