// Variations of the design system, shown on /design-system/variations (components/variations-canvas.tsx). Each one keeps
// Qdrant's colors (the context accent, status and chart colors) and changes structure: buttons, borders,
// surfaces and depth, radius, type, density and motion. Only the neutrals may move: which neutral each
// background role uses, and the border steps. They draw on research into Supabase, Vercel, Neon, Exa,
// Mintlify, Cloudflare, Ramp and about 30 more products on Mobbin (design-system/DESIGN.md "References").
//
// Nothing here is decided. A variation is design-system tokens (styles/components/, styles/globals.css)
// overridden for the studio while its page is open. `css` holds the few looks no token covers yet (a tray
// inside cards, corner brackets, a texture behind the canvas): each one needs a token in the design system
// before it can be kept. A kept variation moves into design-system/ with a dated line in DESIGN.md, like the
// prototypes (lib/prototypes.ts).

export type Vars = Record<string, string>

export type Variation = {
  id: string
  name: string
  // One line: what it changes, shown when you point at its link.
  description: string
  // The products it borrows structure from.
  from: string
  // Both themes, then dark and light only.
  vars: Vars
  dark?: Vars
  light?: Vars
  css?: string
}

const n = (step: number) => `var(--qd-color-neutral-${step})`
const mix = (color: string, share: number) => `color-mix(in oklab, ${color} ${share}%, transparent)`
const fg = (share: number) => mix("var(--foreground)", share)
const black = (share: number) => mix("var(--qd-color-neutral-1000)", share)
const white = (share: number) => mix("var(--qd-color-neutral-0)", share)
const sp = (steps: number) => `calc(var(--spacing) * ${steps})`
// The line of light along a card's top edge. The design system's cards are flat (2026-11-16); the
// variations designed around a lit edge set it back.
const litTop = "0 1px 0 var(--qd-ui-top-light)"
const none = "0 0 transparent"
const full = "calc(infinity * 1px)"
const r = { none: "0px", xs: "var(--qd-radius-xs)", sm: "var(--qd-radius-sm)", md: "var(--qd-radius-md)", lg: "var(--qd-radius-lg)" }

// Where each neutral goes: the page, cards and the sidebar, popovers, and the highlight behind secondary,
// muted and hovered things; then the borders (outline buttons, separators, table rows).
function surfaces(page: number, card: number, popover: number, highlight: number, border: number): Vars {
  return {
    "--qd-ui-page": n(page),
    "--qd-ui-card": n(card),
    "--qd-ui-popover": n(popover),
    "--qd-ui-highlight": n(highlight),
    "--border": n(border),
    "--sidebar-border": n(border),
  }
}

// One radius for each role: controls (buttons, fields, toggles, tabs), containers (cards, menus) and dialogs.
function radii(control: string, container: string, dialog = container): Vars {
  return {
    "--qd-ui-control-radius": control,
    "--qd-ui-button-radius": control,
    "--qd-ui-tabs-radius": control,
    "--qd-ui-tabs-trigger-radius": control === full ? full : `max(0px, calc(${control} - 2px))`,
    "--qd-ui-tooltip-radius": control,
    "--qd-ui-card-radius": container,
    "--qd-ui-menu-radius": container,
    "--qd-ui-menu-item-radius": container === r.none ? r.none : `max(2px, calc(${container} - 4px))`,
    "--qd-ui-dialog-radius": dialog,
  }
}

// Shadows only on floating layers: menus and dialogs, in a few faint stacked layers.
const floating = (share: number) =>
  `0 1px 2px ${black(share)}, 0 8px 16px -4px ${black(share)}, 0 24px 32px -8px ${black(share * 1.5)}`

// Textures behind the canvas (the page area of this page), never under data: cards stay opaque.
const dotGrid = (size: number, share: number) => `[data-variation-canvas] {
  background-image: radial-gradient(${fg(share)} 1px, transparent 1px);
  background-size: ${size}px ${size}px;
}`
const lineGrid = (size: number, share: number) => `[data-variation-canvas] {
  background-image: linear-gradient(to right, ${fg(share)} 1px, transparent 1px),
    linear-gradient(to bottom, ${fg(share)} 1px, transparent 1px);
  background-size: ${size}px ${size}px;
}`
const starField = `[data-variation-canvas] {
  background-image: radial-gradient(${fg(7)} 1px, transparent 1px), radial-gradient(${fg(4)} 1px, transparent 1px);
  background-size: 64px 64px, 27px 27px;
  background-position: 0 0, 13px 19px;
}`

// Four 6px corner brackets just outside the primary button, like a target in a viewfinder.
const bracket = (x: string, y: string, w: string, h: string) =>
  `linear-gradient(var(--foreground), var(--foreground)) ${x} ${y} / ${w} ${h} no-repeat`
const brackets = `.qd-ui-button { position: relative; }
.qd-ui-button::before {
  content: "";
  position: absolute;
  inset: -4px;
  pointer-events: none;
  opacity: 0.55;
  background: ${["left top", "right top", "left bottom", "right bottom"]
    .flatMap((at) => {
      const [x, y] = at.split(" ")
      return [bracket(x, y, "6px", "1px"), bracket(x, y, "1px", "6px")]
    })
    .join(",\n    ")};
}`

// Hairline's neutrals: a pure black page with near-black cards in dark, all white in light. Plated Black
// uses them as they are; Hairline itself puts its page on neutral-975 and keeps the default's soft border
// (Juan, 2026-11-16).
const hairlineNeutrals = { dark: surfaces(1000, 950, 925, 900, 850), light: surfaces(0, 0, 0, 50, 100) }
// The same, without their border steps, so the default's soft border (globals.css) shows through.
const withoutBorders = (vars: Vars): Vars =>
  Object.fromEntries(Object.entries(vars).filter(([name]) => name !== "--border" && name !== "--sidebar-border"))

const plated: Variation = {
  id: "plated",
  name: "Plated",
  description:
    "Machined plates, lit from above: cards fade from a faint light at the top, with a bright inner top edge and 16px corners; buttons are raised with a dark outer ring; fields are recessed.",
  from: "Linear (site), Clerk, Supabase, Railway",
  vars: {
    ...radii(r.sm, r.md),
    "--qd-ui-button-press": "1px",
    "--qd-ui-button-press-scale": "1",
    "--qd-ui-card-border-color": fg(8),
    "--qd-ui-card-highlight": litTop,
  },
  dark: {
    ...surfaces(950, 950, 850, 800, 800),
    "--qd-ui-top-light": white(10),
    "--qd-ui-button-raised": `0 0 0 1px ${black(70)}, 0 1px 3px 0 ${black(50)}, inset 0 1px 0 0 ${white(14)}, inset 0 0 0 1px ${white(6)}`,
    "--qd-ui-card-shadow": `0 0 0 1px ${black(60)}, 0 2px 8px -2px ${black(60)}`,
    "--qd-ui-input-bg": black(35),
  },
  light: {
    ...surfaces(50, 0, 0, 50, 200),
    "--qd-ui-button-raised": `0 0 0 1px ${black(14)}, 0 1px 2px 0 ${black(12)}, inset 0 1px 0 0 ${white(25)}`,
    "--qd-ui-card-shadow": `0 1px 3px 0 ${black(8)}`,
    "--qd-ui-card-border-color": fg(6),
    "--qd-ui-input-bg": mix("var(--qd-color-neutral-100)", 60),
  },
  css: `[data-theme="dark"] [data-slot="card"] { background-image: linear-gradient(180deg, ${white(5)}, ${white(1.5)} 60%); }`,
}

export const variations: Variation[] = [
  {
    id: "hairline",
    name: "Hairline",
    description:
      "Near black and crisp: a neutral-975 page (halfway from neutral-950 to black), every edge one 1px soft line, the default's (the text color at 9% on dark, 10% on light), no resting shadows, small radii (4px controls, 8px containers), solid menus on faint stacked shadows, a light scrim with no blur.",
    from: "Vercel, Linear, OpenAI Platform",
    vars: {
      ...radii(r.xs, r.sm),
      "--qd-ui-tracking": "-0.005em",
      "--qd-ui-title-tracking": "-0.015em",
      "--qd-ui-title-weight": "var(--font-weight-semibold)",
      "--qd-ui-button-raised": "inset 0 0 0 1px var(--border)",
      "--qd-ui-button-press-scale": "0.98",
      "--qd-ui-button-duration": "150ms",
      "--qd-ui-card-highlight": none,
      "--qd-ui-menu-opacity": "100%",
      "--qd-ui-menu-blur": "0px",
      "--qd-ui-overlay": black(40),
      "--qd-ui-overlay-blur": "0px",
    },
    // Its lines are the default's soft border, like Deep's (Juan, 2026-11-16): they were the text color at 12% on
    // cards, menus and buttons (8% on light cards) and neutral-850 (100 on light) on dividers and the sidebar.
    dark: { ...withoutBorders(hairlineNeutrals.dark), "--qd-ui-page": n(975), "--qd-ui-menu-shadow": floating(30) },
    light: { ...withoutBorders(hairlineNeutrals.light), "--qd-ui-menu-shadow": floating(4) },
  },
  {
    id: "telemetry",
    name: "Telemetry",
    description:
      "An instrument console: 32px controls, 4px corners, mono readouts in badges, captions and table headers, a 2px accent rail on the active nav item, quick motion, a dot grid behind the canvas.",
    from: "PlanetScale, Supabase, Railway, Sentry",
    vars: {
      ...radii(r.xs, r.xs),
      "--qd-ui-control-height": sp(8),
      "--qd-ui-button-padding-x": sp(3),
      "--qd-ui-button-font-size": "var(--text-xs)",
      "--qd-ui-button-raised": "inset 0 0 0 1px var(--border)",
      "--qd-ui-button-press-scale": "1",
      "--qd-ui-button-duration": "100ms",
      "--qd-ui-card-border-color": fg(10),
      "--qd-ui-card-highlight": none,
      "--qd-ui-card-shadow": `0 1px 2px ${black(8)}`,
      "--qd-ui-badge-radius": "2px",
      "--qd-ui-badge-font": "var(--font-mono)",
      "--qd-ui-badge-case": "uppercase",
      "--qd-ui-badge-tracking": "0.06em",
      "--qd-ui-checkbox-radius": "2px",
      "--qd-ui-caption-tracking": "0.06em",
      "--qd-ui-table-head-height": sp(8),
      "--qd-ui-popup-duration": "100ms",
      "--qd-ui-title-weight": "var(--font-weight-semibold)",
    },
    dark: surfaces(1000, 950, 925, 900, 850),
    light: surfaces(25, 0, 0, 50, 200),
    css: `[data-slot="sidebar-menu-button"][data-active] { box-shadow: inset 2px 0 0 var(--sidebar-primary); }
${dotGrid(16, 9)}`,
  },
  {
    id: "capsule",
    name: "Capsule",
    description:
      "Pill controls on square surfaces: buttons, tabs and menu items fully round; cards and dialogs square on a pure black page, separated by opaque gray borders alone; tight tracking.",
    from: "Neon, Resend, Mercury",
    vars: {
      ...radii(full, r.none, r.xs),
      "--qd-ui-control-radius": r.xs,
      "--qd-ui-tooltip-radius": r.xs,
      "--qd-ui-button-padding-x": sp(5),
      "--qd-ui-button-raised": none,
      "--qd-ui-card-border-color": "var(--border)",
      "--qd-ui-card-highlight": none,
      "--qd-ui-menu-radius": r.sm,
      "--qd-ui-menu-item-radius": full,
      "--qd-ui-menu-border-color": "var(--border)",
      "--qd-ui-tracking": "-0.01em",
      "--qd-ui-title-tracking": "-0.02em",
      "--qd-ui-title-weight": "var(--font-weight-semibold)",
    },
    dark: surfaces(1000, 1000, 950, 900, 850),
    light: surfaces(0, 0, 0, 50, 100),
  },
  plated,
  {
    id: "tray",
    name: "Tray",
    description:
      "A tray holding a panel: each card is a tinted tray with its title on the band, and its content sits in an inner panel 6px in, its corners matching the tray's (16px outside, 10px inside).",
    from: "Cloudflare (Kumo), xAI console, Clerk, Mintlify",
    vars: {
      ...radii(r.sm, r.md),
      "--qd-ui-card-border-color": fg(6),
      "--qd-ui-card-highlight": none,
    },
    dark: { ...surfaces(1000, 900, 850, 800, 800), "--studio-tray": n(950) },
    light: { ...surfaces(0, 0, 0, 50, 200), "--studio-tray": n(50) },
    css: `[data-slot="card"] { background-color: var(--studio-tray); }
[data-slot="card-content"] {
  margin-inline: calc(6px - var(--card-spacing));
  padding: calc(var(--card-spacing) - 6px);
  border-radius: calc(var(--qd-ui-card-radius) - 6px);
  background-color: var(--card);
  box-shadow: 0 0 0 1px ${fg(8)}, 0 1px 2px ${black(10)};
}
[data-slot="card-content"]:last-child { margin-bottom: calc(6px - var(--card-spacing)); }`,
  },
  {
    id: "ledger",
    name: "Ledger",
    description:
      "Square and calm: no corners on buttons, fields, cards, menus or dialogs (4px only on menu items and badges), solid opaque borders, focus darkens the edge instead of a ring, roomy rows, layered shadows only on floating layers.",
    from: "Ramp, Midday, Stripe",
    vars: {
      ...radii(r.none, r.none),
      "--qd-ui-menu-item-radius": r.xs,
      "--qd-ui-badge-radius": r.xs,
      "--qd-ui-checkbox-radius": "2px",
      "--qd-ui-button-raised": `inset 0 0 0 1px ${fg(16)}`,
      "--qd-ui-button-press-scale": "1",
      "--qd-ui-button-duration": "200ms",
      "--qd-ui-button-ease": "ease-in-out",
      "--qd-ui-button-focus-offset": "0px",
      "--qd-ui-focus-width": "1px",
      "--qd-ui-focus-color": fg(70),
      "--qd-ui-card-border-color": "var(--border)",
      "--qd-ui-card-highlight": none,
      "--qd-ui-menu-border-color": "var(--border)",
      "--qd-ui-divider-color": "var(--border)",
      "--qd-ui-menu-opacity": "100%",
      "--qd-ui-menu-blur": "0px",
      "--qd-ui-table-head-height": sp(9),
      "--qd-ui-table-cell-padding": sp(3),
      "--qd-ui-caption-font": "var(--font-sans)",
      "--qd-ui-caption-tracking": "0.04em",
      "--qd-ui-label-weight": "400",
      "--qd-ui-overlay": black(40),
      "--qd-ui-overlay-blur": "0px",
    },
    dark: { ...surfaces(950, 950, 925, 900, 800), "--qd-ui-menu-shadow": floating(35) },
    light: { ...surfaces(0, 0, 0, 50, 200), "--qd-ui-menu-shadow": floating(6) },
  },
  {
    id: "deep-field",
    name: "Deep Field",
    description:
      "Spacious and quiet: 40px controls, 24px card padding, 16px corners, borderless cards set apart by tone alone, bigger titles in a wider Mona Sans, slower popups, stacked soft shadows in light.",
    from: "Mintlify, Mercury, Cursor",
    vars: {
      ...radii(r.sm, r.md, r.lg),
      "--qd-ui-control-height": sp(10),
      "--qd-ui-control-padding-x": sp(3),
      "--qd-ui-button-padding-x": sp(5),
      "--qd-ui-card-padding": sp(6),
      "--qd-ui-card-border-width": "0px",
      "--qd-ui-dialog-padding": sp(6),
      "--qd-ui-menu-item-height": sp(8),
      "--qd-ui-title-size": "1rem",
      "--qd-ui-title-leading": "1.5rem",
      "--qd-ui-title-weight": "var(--font-weight-semibold)",
      "--qd-ui-title-tracking": "-0.01em",
      "--studio-heading-stretch": "112.5%",
      "--qd-ui-card-highlight": litTop,
      "--qd-ui-popup-duration": "250ms",
      "--qd-ui-button-press-scale": "0.98",
    },
    dark: { ...surfaces(1000, 925, 900, 850, 850), "--qd-ui-top-light": white(7) },
    light: {
      ...surfaces(50, 0, 0, 50, 200),
      "--qd-ui-card-shadow": `0 1px 2px -0.5px ${black(12)}, 0 4px 2px -1px ${black(5)}, 0 8px 4px -2px ${black(2)}, 0 16px 8px -4px ${black(2)}`,
    },
  },
  {
    id: "nebula",
    name: "Nebula",
    description:
      "Frosted glass, the boldest one: cards are translucent with a blur and a bright top edge, 16px corners and 24px dialogs, menus float on a heavier blur, over a faint star field.",
    from: "Arc, Raycast, Perplexity",
    vars: {
      ...radii(r.sm, r.md, r.lg),
      "--qd-ui-card-border-color": fg(8),
      "--qd-ui-card-highlight": litTop,
      "--qd-ui-dialog-padding": sp(6),
      "--qd-ui-menu-opacity": "55%",
      "--qd-ui-menu-blur": "24px",
      "--qd-ui-overlay": mix("var(--background)", 50),
      "--qd-ui-overlay-blur": "24px",
      "--qd-ui-popup-duration": "220ms",
    },
    dark: {
      ...surfaces(950, 925, 850, 800, 800),
      "--card": mix("var(--qd-color-neutral-800)", 30),
      "--qd-ui-top-light": white(12),
    },
    light: {
      ...surfaces(50, 0, 0, 50, 200),
      "--card": white(65),
    },
    css: `[data-slot="card"] { backdrop-filter: blur(20px); }\n${starField}`,
  },
  {
    id: "blueprint",
    name: "Blueprint",
    description:
      "A technical drawing: square boxes (4px controls) on a line grid, card titles as tracked mono eyebrows, outlined secondary buttons, and corner brackets around the primary button.",
    from: "Hex, Cloudflare, Neon",
    vars: {
      ...radii(r.xs, r.none),
      "--qd-ui-button-raised": `inset 0 0 0 1px ${fg(18)}`,
      "--qd-ui-card-border-color": fg(12),
      "--qd-ui-card-highlight": none,
      "--qd-ui-menu-item-radius": "2px",
      "--qd-ui-badge-radius": "2px",
      "--qd-ui-badge-font": "var(--font-mono)",
      "--qd-ui-badge-case": "uppercase",
      "--qd-ui-badge-tracking": "0.06em",
      "--qd-ui-checkbox-radius": "0px",
      "--qd-ui-caption-tracking": "0.12em",
    },
    dark: surfaces(1000, 950, 925, 900, 800),
    light: surfaces(25, 0, 0, 50, 200),
    css: `[data-slot="card-title"] { font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; font-size: var(--text-xs); }
${brackets}
${lineGrid(32, 5)}`,
  },
  {
    id: "horizon",
    name: "Horizon",
    description:
      "Wide and editorial: titles in expanded Mona Sans, uppercase button labels tracked wide, a bright horizon line along every surface's top edge, 4px corners on black, captions tracked out further.",
    from: "Exa, Linear (site), Hex",
    vars: {
      ...radii(r.xs, r.xs),
      "--studio-heading-stretch": "125%",
      "--qd-ui-title-weight": "var(--font-weight-semibold)",
      "--qd-ui-button-case": "uppercase",
      "--qd-ui-button-tracking": "0.08em",
      "--qd-ui-button-font-size": "var(--text-xs)",
      "--qd-ui-button-padding-x": sp(5),
      "--qd-ui-button-raised": `inset 0 1px 0 0 ${fg(16)}`,
      "--qd-ui-card-border-color": fg(6),
      "--qd-ui-card-highlight": litTop,
      "--qd-ui-badge-case": "uppercase",
      "--qd-ui-badge-tracking": "0.08em",
      "--qd-ui-caption-tracking": "0.14em",
    },
    dark: { ...surfaces(1000, 950, 925, 900, 850), "--qd-ui-top-light": white(16) },
    light: { ...surfaces(0, 0, 0, 50, 100), "--qd-ui-top-light": black(12) },
  },
  // Plated's look on Hairline's neutrals (Juan, 2026-11-15).
  {
    ...plated,
    id: "plated-black",
    name: "Plated Black",
    description:
      "Plated on Hairline's neutrals: the same machined plates lit from above, raised buttons and recessed fields, on a pure black page with near-black cards (all white in light).",
    from: `${plated.from}, with Hairline's neutrals (Vercel, Linear)`,
    dark: { ...plated.dark, ...hairlineNeutrals.dark },
    light: { ...plated.light, ...hairlineNeutrals.light },
  },
  // The default look on a deeper page, toward Hairline but short of black (Juan, 2026-11-16). On dark the page
  // and the cards and sidebar (background-raised) each go one step down; menus, fields and edges keep the
  // default's steps, so they stand out more, like Hairline's surfaces. Every other token stays the default's.
  // (Juan tried every surface one step deeper, then only the page, the same day.)
  {
    id: "deep",
    name: "Deep",
    description:
      "Today's default, deeper: on dark the page drops to a new neutral-975 (halfway from neutral-950 to black) and cards and the sidebar to neutral-950, while menus, fields and edges keep their steps, so they stand out more. Light is the default.",
    from: "Hairline's depth (Vercel, Linear) on the default look",
    vars: {},
    dark: {
      "--qd-ui-page": n(975),
      "--qd-ui-card": n(950),
    },
  },
]

const scopes = {
  all: ":root,\n[data-theme],\n[data-context]",
  dark: '[data-theme="dark"],\n[data-theme="dark"] [data-context]',
  light: '[data-theme="light"],\n[data-theme="light"] [data-context]',
}

function block(selector: string, vars: Vars | undefined): string {
  const entries = Object.entries(vars ?? {})
  if (entries.length === 0) return ""
  return [`${selector} {`, ...entries.map(([k, v]) => `  ${k}: ${v};`), "}"].join("\n")
}

// The variation's CSS. Unlayered and after the design system's stylesheet, so it wins over the tokens; on
// :root, every theme and every context, like the tokens themselves, so nested sections follow it.
export function variationCss(v: Variation): string {
  return [block(scopes.all, v.vars), block(scopes.dark, v.dark), block(scopes.light, v.light), v.css ?? ""]
    .filter(Boolean)
    .join("\n")
}
