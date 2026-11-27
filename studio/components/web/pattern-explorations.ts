// The Patterns tab's Explorations (2026-11-24): patterns on real sections from web/registry, each a fixed pairing
// with a code (EX-01) to point at while curating. A pairing is a trial, not a decision: the sections keep their
// own patterns until the design lead says yes to one.
//
// slot is where the pattern goes: "background" behind the section (a background pattern), "cards" inside its
// cards (a surface pattern). tone is the color it starts in; each pairing can switch it. No descriptions: the
// discussion is about the visual (2026-11-25).
// WebGL patterns (Dither haze, Depth haze) each hold a browser context, and a page keeps about 16, so they're used
// sparingly and never in a row of several cards.
//
// Small text stays clear (2026-11-25). Every pairing here keeps its pattern away from text of 16px or smaller (card
// copy, links, captions, the legal bar), measured in the frames (the share of the pattern's marks under each small
// text, at the layer's strength) and checked by eye. What works: a pattern with a calm side or a fade (Halftone
// field lights the top right, Halftone corner fades before a card's copy, Depth haze is soft), a
// background behind sections whose text sits on cards (the cards' fill covers it), and a word in its own room
// (Terminal under the footer). Taken out for noise under small text: Hex field, Dot field and Dither haze behind
// headers' subtitles and footers' links, Pixel drift, Hyperspace, Flow field, Hex pulse and Q monogram inside
// cards, Blueprint under card copy, Halftone corner on wide pricing cards, and Halftone field under the partner
// directory's cells. Case studies were left out too: their cards show figures, and a dot grid never sits under data.
//
// No letters at all over a pattern (2026-11-25, second round). Every pairing is measured again on all the text, any
// size (headings, subtitles, quote marks, labels), after the pattern has faded in: the share of each text's pixels
// over a visible mark. Text on a card is left out for a background, since the card's fill covers it. Taken out for
// that: Hex rings on the numbered feature cards (rings at the ends of the copy's lines) and Dot field behind the
// team grid (dots under its title). Tried and left out: Halftone field behind the hero's page header, the centered
// hero, page headers with actions or search, the centered CTA, the 404, the waitlist, the install command, feature
// rows, FAQ, the SDK, security, community and profile grids and a single quote (dots under a title, subtitle or
// link); Halftone corner on resource, event, team, footer and numbered cards (under kickers, tags or copy); Hex
// rings on values, community and resource cards; Dot field and Hex field around forms and community cards; Depth
// haze in the slim banner (a mottled haze under its line of text), and in forms and the calculator, where it
// doesn't show.
//
// From the references (2026-11-25): ten patterns in web/patterns/explorations/references.tsx, drawn from hubtown.co.in,
// izum.study and seven shared images, first on the page. Some follow the scroll (Trajectory, Light strands).
//
// Hex terrain (2026-11-25): a surface of hexagons in perspective from a reference's dotted surface, first on the
// page, in four hover variations (a constellation, a spanning tree, a nearest-neighbour search, a swell).
//
// The rocket pairings (Planet rise, Lunar surface, Rocket flight, Launch pad) were taken out on 2026-11-25.
// Planet rise, Moon side, Rocket flight, Moon phases, Lunar surface, Halftone horizon, Growth curve, Hex monolith
// and Wavy sphere were taken out of the library on 2026-11-26, with Wavy sphere's two pairings (a search page
// header and a newsletter band).
//
// The space set (2026-11-25): the patterns in web/patterns/explorations/cosmos.tsx, first on the page, on heroes,
// headers, calls to action, footers and cards. Each has a hover moment and a text guard (it clears itself from under
// every text, icon and control), so the previews take the pointer: only their Open chip takes clicks.
//
// More heroes and page headers (2026-11-25): patterns on a split hero's media side only (Dot field, Hex field and
// Terminal, side), and horizons in a band under a centered hero's or a header's content, in room the frame's pad adds.
// The horizons, made for the footer, were renamed without the footer.
//
// More footers (2026-11-25): six band patterns in the room under the footer's content, as Terminal, footer: QDRANT
// in halftone dots, in hexagons and as an outline, and three horizons with no word (dots, hexagons, characters).

// The groups below are how the pairings were made (by theme). The page shows them by component instead, and the
// codes follow that order (see the end of this file).

import { getSection, sections } from "@qdrant/web/registry"

export type Slot = "background" | "cards"

export type Exploration = {
  code: string
  section: string
  variant: string
  slot: Slot
  pattern: string
  // More background layers over it, like an easter egg on a pattern (Qbot peek over Dust halo, 2026-11-26).
  also?: string[]
  tone: "primary" | "secondary"
  // Extra px above the section's last row, for a pattern drawn in a band there (the frame's room), and how far the
  // band sits off the bottom, the last row's height (the frame's band-bottom).
  room?: number
  bandBottom?: number
  // The section's bottom padding in px, for a band under a hero's or a header's content (the frame's pad).
  pad?: number
}

export type ExplorationGroup = { title: string; hint: string; items: Exploration[] }

const groups: { title: string; hint: string; items: Omit<Exploration, "code">[] }[] = [
  {
    title: "Easter eggs",
    hint: "Small surprises that appear once, on hover. Hover the hero's main button to meet Qbot.",
    items: [{ section: "hero", variant: "home", slot: "background", pattern: "qbot-peek", tone: "secondary" }],
  },
  {
    title: "From the references",
    hint: "Drawn from hubtown.co.in, izum.study and the images the team shared, redrawn with hexagons. Hover a preview to find its moment.",
    items: [
      {
        section: "feature-rows",
        variant: "alternating",
        slot: "background",
        pattern: "ref-trajectory",
        tone: "secondary",
      },
      // The home hero in the vortex (2026-11-26): its centered title and prompt sit in the clear middle.
      { section: "hero", variant: "home", slot: "background", pattern: "ref-hex-vortex", tone: "secondary" },
      { section: "cta", variant: "centered", slot: "background", pattern: "ref-hex-vortex", tone: "secondary" },
      { section: "not-found", variant: "stars", slot: "background", pattern: "ref-hex-vortex", tone: "secondary" },
      { section: "hero", variant: "product", slot: "background", pattern: "ref-hex-ribbon", tone: "secondary" },
      { section: "page-header", variant: "simple", slot: "background", pattern: "ref-hex-ribbon", tone: "secondary" },
      {
        section: "page-header",
        variant: "simple",
        slot: "background",
        pattern: "ref-hex-ribbon-constellations",
        tone: "secondary",
      },
      {
        section: "page-header",
        variant: "simple-actions",
        slot: "background",
        pattern: "ref-half-planet",
        tone: "secondary",
      },
      { section: "cta", variant: "band", slot: "background", pattern: "ref-half-planet", tone: "secondary" },
      {
        section: "feature-grid",
        variant: "cards",
        slot: "background",
        pattern: "ref-light-strands",
        tone: "secondary",
      },
      { section: "testimonials", variant: "wall", slot: "background", pattern: "ref-light-strands", tone: "secondary" },
      {
        section: "page-header",
        variant: "simple",
        slot: "background",
        pattern: "ref-dust-halo",
        also: ["qbot-peek"],
        tone: "secondary",
      },
    ],
  },
  {
    title: "Hex terrain, with hover constellations",
    hint: "A surface of hexagons in perspective. Hover a preview: the hexagons near the pointer join and the rest dim.",
    items: [
      { section: "hero", variant: "home", slot: "background", pattern: "cosmos-hex-terrain", tone: "secondary" },
      { section: "hero", variant: "home", slot: "background", pattern: "cosmos-hex-terrain-tree", tone: "secondary" },
      { section: "hero", variant: "home", slot: "background", pattern: "cosmos-hex-terrain-search", tone: "secondary" },
      { section: "hero", variant: "home", slot: "background", pattern: "cosmos-hex-swell", tone: "secondary" },
      { section: "cta", variant: "centered", slot: "background", pattern: "cosmos-hex-terrain", tone: "secondary" },
      {
        section: "page-header",
        variant: "simple-actions",
        slot: "background",
        pattern: "cosmos-hex-terrain-tree",
        tone: "secondary",
      },
      {
        section: "newsletter",
        variant: "band",
        slot: "background",
        pattern: "cosmos-hex-terrain-search",
        tone: "secondary",
      },
      { section: "footer", variant: "full", slot: "background", pattern: "cosmos-hex-swell", tone: "secondary" },
    ],
  },
  {
    title: "Space set, with hover moments",
    hint: "Hexagons, planets, orbits, a rocket and noise, each clear of the text. Hover a preview to find its moment.",
    items: [
      { section: "hero", variant: "home", slot: "background", pattern: "cosmos-constellation", tone: "secondary" },
      { section: "hero", variant: "product", slot: "background", pattern: "cosmos-warp", tone: "secondary" },
      {
        section: "page-header",
        variant: "simple-actions",
        slot: "background",
        pattern: "cosmos-orbits",
        tone: "secondary",
      },
      { section: "cta", variant: "centered", slot: "background", pattern: "cosmos-hex-nebula", tone: "secondary" },
      { section: "cta", variant: "panel", slot: "background", pattern: "cosmos-constellation", tone: "secondary" },
      { section: "newsletter", variant: "card", slot: "background", pattern: "cosmos-hex-nebula", tone: "secondary" },
      { section: "footer", variant: "full", slot: "background", pattern: "cosmos-constellation", tone: "secondary" },
      { section: "feature-grid", variant: "cards", slot: "cards", pattern: "cosmos-noise-corner", tone: "secondary" },
      {
        section: "feature-grid",
        variant: "numbered",
        slot: "cards",
        pattern: "cosmos-orbit-corner",
        tone: "secondary",
      },
      {
        section: "community-channels",
        variant: "cards",
        slot: "cards",
        pattern: "cosmos-constellation-corner",
        tone: "secondary",
      },
      { section: "bento", variant: "checklist", slot: "cards", pattern: "cosmos-noise-corner", tone: "secondary" },
      {
        section: "testimonials",
        variant: "wall",
        slot: "background",
        pattern: "cosmos-constellation",
        tone: "secondary",
      },
    ],
  },
  {
    title: "Heroes and page headers",
    hint: "The top of a page, where the pattern keeps to the side the text isn't on, or to a band under it.",
    items: [
      { section: "hero", variant: "code", slot: "background", pattern: "halftone-field", tone: "secondary" },
      {
        section: "hero",
        variant: "code",
        slot: "background",
        pattern: "ref-halftone-field-constellations",
        tone: "secondary",
      },
      { section: "hero", variant: "product", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "page-header", variant: "simple", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "hero", variant: "code", slot: "background", pattern: "hex-field-side", tone: "secondary" },
      { section: "hero", variant: "code", slot: "background", pattern: "terminal-side", tone: "secondary" },
      { section: "hero", variant: "product", slot: "background", pattern: "dot-field-side", tone: "secondary" },
      { section: "hero", variant: "product", slot: "background", pattern: "hex-field-side", tone: "secondary" },
      { section: "hero", variant: "product", slot: "background", pattern: "terminal-side", tone: "secondary" },
      { section: "hero", variant: "home", slot: "background", pattern: "dot-horizon", tone: "secondary", pad: 380 },
      {
        section: "hero",
        variant: "home",
        slot: "background",
        pattern: "terminal-horizon",
        tone: "secondary",
        pad: 380,
      },
      { section: "hero", variant: "page", slot: "background", pattern: "dot-horizon", tone: "secondary", pad: 380 },
      {
        section: "page-header",
        variant: "simple-actions",
        slot: "background",
        pattern: "hex-horizon",
        tone: "secondary",
        pad: 360,
      },
      {
        section: "page-header",
        variant: "search",
        slot: "background",
        pattern: "terminal-horizon",
        tone: "secondary",
        pad: 360,
      },
    ],
  },
  {
    title: "Calls to action, newsletters and forms",
    hint: "A pattern around a panel, card or form, whose own fill keeps the text clear, or soft inside it.",
    items: [
      { section: "cta", variant: "panel", slot: "background", pattern: "hex-field", tone: "primary" },
      { section: "cta", variant: "panel", slot: "background", pattern: "dot-field", tone: "secondary" },
      { section: "cta", variant: "panel", slot: "cards", pattern: "depth-haze", tone: "secondary" },
      { section: "cta", variant: "panel", slot: "cards", pattern: "depth-haze-vivid", tone: "secondary" },
      { section: "cta", variant: "panel", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "promo-banner", variant: "split", slot: "cards", pattern: "depth-haze", tone: "secondary" },
      { section: "promo-banner", variant: "split", slot: "cards", pattern: "depth-haze-vivid", tone: "secondary" },
      { section: "promo-banner", variant: "split", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "newsletter", variant: "band", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "newsletter", variant: "card", slot: "background", pattern: "hex-field", tone: "secondary" },
      { section: "newsletter", variant: "card", slot: "background", pattern: "dot-field", tone: "secondary" },
      { section: "newsletter", variant: "card", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "contact", variant: "default", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "newsletter", variant: "card", slot: "cards", pattern: "depth-haze", tone: "secondary" },
      { section: "newsletter", variant: "card", slot: "cards", pattern: "depth-haze-vivid", tone: "secondary" },
    ],
  },
  {
    title: "Footers",
    hint: "The end of every page, where the links and the legal bar stay clear.",
    items: [
      {
        section: "footer",
        variant: "full",
        slot: "background",
        pattern: "terminal-footer",
        tone: "secondary",
        room: 320,
        bandBottom: 85,
      },
      {
        section: "footer",
        variant: "full",
        slot: "background",
        pattern: "footer-halftone-word",
        tone: "secondary",
        room: 320,
        bandBottom: 85,
      },
      {
        section: "footer",
        variant: "full",
        slot: "background",
        pattern: "footer-hex-word",
        tone: "secondary",
        room: 320,
        bandBottom: 85,
      },
      {
        section: "footer",
        variant: "full",
        slot: "background",
        pattern: "footer-contour-word",
        tone: "secondary",
        room: 320,
        bandBottom: 85,
      },
      {
        section: "footer",
        variant: "full",
        slot: "background",
        pattern: "dot-horizon",
        tone: "secondary",
        room: 320,
        bandBottom: 85,
      },
      {
        section: "footer",
        variant: "full",
        slot: "background",
        pattern: "hex-horizon",
        tone: "secondary",
        room: 320,
        bandBottom: 85,
      },
      {
        section: "footer",
        variant: "full",
        slot: "background",
        pattern: "terminal-horizon",
        tone: "secondary",
        room: 320,
        bandBottom: 85,
      },
      { section: "footer", variant: "full", slot: "cards", pattern: "depth-haze", tone: "secondary" },
      { section: "footer", variant: "full", slot: "cards", pattern: "depth-haze-vivid", tone: "secondary" },
    ],
  },
  {
    title: "Card sections",
    hint: "Patterns that fade before a card's copy, or behind a section whose text sits on cards or panels.",
    items: [
      // Depth haze, vivid, behind sections whose text sits on cards (2026-11-26); the top stays clear for the heading.
      {
        section: "feature-grid",
        variant: "cards",
        slot: "background",
        pattern: "depth-haze-vivid-background",
        tone: "secondary",
      },
      {
        section: "bento",
        variant: "checklist",
        slot: "background",
        pattern: "depth-haze-vivid-background",
        tone: "secondary",
      },
      {
        section: "blog-grid",
        variant: "grid",
        slot: "background",
        pattern: "depth-haze-vivid-background",
        tone: "secondary",
      },
      { section: "feature-grid", variant: "cards", slot: "cards", pattern: "halftone-corner", tone: "secondary" },
      { section: "feature-grid", variant: "cards", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "values", variant: "icons", slot: "cards", pattern: "halftone-corner", tone: "secondary" },
      { section: "values", variant: "icons", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "community-channels", variant: "cards", slot: "cards", pattern: "halftone-corner", tone: "secondary" },
      { section: "bento", variant: "checklist", slot: "cards", pattern: "halftone-corner", tone: "secondary" },
      {
        section: "community-wall",
        variant: "masonry",
        slot: "background",
        pattern: "halftone-field",
        tone: "secondary",
      },
      { section: "code-showcase", variant: "split", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "testimonials", variant: "wall", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "blog-grid", variant: "grid", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "resource-cards", variant: "grid", slot: "background", pattern: "halftone-field", tone: "secondary" },
      { section: "events-list", variant: "cards", slot: "background", pattern: "halftone-field", tone: "secondary" },
    ],
  },
]

// Shown by component (2026-11-26): one group per section, in the registry's order (the order of "Try your own"), its
// pairings by variant, with the variants it shows as its hint. The codes run in that order, so they read EX-01 to the
// last down the page (renumbered 2026-11-26; codes cited before then point elsewhere now).
const made = groups.flatMap((g) => g.items)
const variantName = (e: Omit<Exploration, "code">) =>
  getSection(e.section)?.variants.find((v) => v.id === e.variant)?.name ?? e.variant

let n = 0
export const explorationGroups: ExplorationGroup[] = [
  ...sections.map((s) => ({
    title: s.name,
    items: made
      .filter((e) => e.section === s.id)
      .sort(
        (a, b) => s.variants.findIndex((v) => v.id === a.variant) - s.variants.findIndex((v) => v.id === b.variant)
      ),
  })),
  { title: "Other", items: made.filter((e) => !getSection(e.section)) },
]
  .filter((g) => g.items.length)
  .map((g) => ({
    title: g.title,
    hint: [...new Set(g.items.map(variantName))].join(" · "),
    items: g.items.map((e) => ({ ...e, code: `EX-${String(++n).padStart(2, "0")}` })),
  }))
