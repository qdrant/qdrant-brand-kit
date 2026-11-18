import { readFileSync } from "node:fs"
import path from "node:path"
import type { CSSProperties } from "react"

// What the Typography page (/typography) shows, so the type primitives can be refined in one place (Juan,
// 2026-11-17). The page measures every sample in the browser, so its details are always what the CSS gives.

// One tab per family of the brand's type (the Mona Sans family, 2026-11-17), then the text in creatives and
// the proposed ladder.
export const typefaces = [
  { id: "mona-sans-display", label: "Mona Sans Display" },
  { id: "mona-sans", label: "Mona Sans" },
  { id: "mona-sans-mono", label: "Mona Sans Mono" },
  { id: "mona-sans-condensed", label: "Mona Sans Condensed" },
] as const

export type TypefaceId = (typeof typefaces)[number]["id"]

export const tabs = [
  ...typefaces,
  { id: "creatives", label: "Creatives" },
  { id: "proposed", label: "Proposed" },
] as const

export type TabId = (typeof tabs)[number]["id"]

export const groups = ["Display", "Headings", "Text", "Social"] as const

// The text styles: the --qd-type-<style>-<property> variables in primitives/typography/typography.css, in the
// file's order. A style goes under the family it renders in, from its family variable: Condensed when it's
// condensed, then Mono, then Display; Mona Sans when it sets no family.
export type TextStyle = {
  /** The style's name in the CSS: `h1` is --qd-type-h1-size, --qd-type-h1-weight… */
  name: string
  typeface: TypefaceId
  group: (typeof groups)[number]
}

const STYLE_VARIABLE =
  /--qd-type-([a-z0-9-]+?)-(size|weight|line-height|letter-spacing|family|stretch|transform):\s*([^;]+);/g

function groupOf(name: string): TextStyle["group"] {
  if (name.startsWith("display")) return "Display"
  if (/^(mono-)?h\d$/.test(name)) return "Headings"
  if (/^(text|mono)-(xl|lg|md|sm|xs)$/.test(name)) return "Text"
  return "Social"
}

function typefaceOf(v: Record<string, string>): TypefaceId {
  if (v.stretch === "75%" || v.family?.includes("condensed"))
    return "mona-sans-condensed"
  if (v.family?.includes("mono")) return "mona-sans-mono"
  if (v.family?.includes("display")) return "mona-sans-display"
  return "mona-sans"
}

export function textStyles(): TextStyle[] {
  const css = readFileSync(
    path.resolve(
      process.cwd(),
      "..",
      "primitives",
      "typography",
      "typography.css"
    ),
    "utf8"
  )
  const byName = new Map<string, Record<string, string>>()
  for (const [, name, property, value] of css.matchAll(STYLE_VARIABLE)) {
    byName.set(name, { ...byName.get(name), [property]: value.trim() })
  }
  return [...byName].map(([name, v]) => ({
    name,
    typeface: typefaceOf(v),
    group: groupOf(name),
  }))
}

// Renders a style through its own variables, so a change in typography.css shows here as it is.
export function styleOf({ name }: TextStyle): CSSProperties {
  const v = (property: string) => `var(--qd-type-${name}-${property})`
  return {
    fontFamily: `var(--qd-type-${name}-family, var(--qd-font-family-sans))`,
    fontSize: v("size"),
    fontWeight: v("weight"),
    lineHeight: v("line-height"),
    letterSpacing: v("letter-spacing"),
    fontStretch: `var(--qd-type-${name}-stretch, 100%)`,
    textTransform:
      `var(--qd-type-${name}-transform, none)` as CSSProperties["textTransform"],
  }
}

// The text in creatives and brand components: the creative classes in typography.css and the type in
// brand-components/ (button, headshot card, headshot circle). They set their sizes per canvas shape, so each
// one shows once per size, in a .qd-canvas of that shape at its reference size (1 canvas unit = 1px). The
// shapes that share a size are listed together, as the CSS groups them today: check here when that changes.
export type CreativeStyle = {
  /** The class, as a creative uses it. */
  name: string
  className: string
  /** Shapes that share a size; the first one renders the sample. */
  shapes: string[][]
  /** A button renders the sample as the button itself. */
  button?: boolean
}

const allShapes = [["square", "portrait", "wide", "ultrawide", "story"]]
const titleShapes = [["square", "portrait"], ["wide", "ultrawide"], ["story"]]

export const creativeStyles: CreativeStyle[] = [
  { name: "qd-title", className: "qd-title", shapes: titleShapes },
  {
    name: "qd-title--medium",
    className: "qd-title qd-title--medium",
    shapes: titleShapes,
  },
  {
    name: "qd-title--long",
    className: "qd-title qd-title--long",
    shapes: titleShapes,
  },
  {
    name: "qd-supporting",
    className: "qd-supporting",
    shapes: [
      ["square", "portrait"],
      ["wide", "ultrawide", "story"],
    ],
  },
  {
    name: "qd-button",
    className: "qd-button",
    shapes: [["square", "portrait", "wide"], ["ultrawide"], ["story"]],
    button: true,
  },
  {
    name: "qd-headshot-card__name",
    className: "qd-headshot-card__name",
    shapes: allShapes,
  },
  {
    name: "qd-headshot-card__role",
    className: "qd-headshot-card__role",
    shapes: allShapes,
  },
  {
    name: "qd-headshot-circle__name",
    className: "qd-headshot-circle__name",
    shapes: allShapes,
  },
  {
    name: "qd-headshot-circle__role",
    className: "qd-headshot-circle__role",
    shapes: allShapes,
  },
]

export const creativeCount = creativeStyles.reduce(
  (n, s) => n + s.shapes.length,
  0
)

// The proposed ladder (Juan, 2026-11-17), shown to compare with today's styles. Not adopted: when it is, its
// values go into primitives/typography and this list goes. One set of styles for brand, web and marketing,
// grouped by role: Text, Heading and Display, named as in Figma (Text/md/Regular, Heading/H4/Mono,
// Display/1/Condensed). Text is Mona Sans; Heading and Display are Mona Sans Display.
// Weights (Juan, 2026-11-17): Bold is retired and its uses move to SemiBold. Display is SemiBold only, and so is
// its Condensed variant; Text and Heading steps come in Regular, Medium and SemiBold. The other families are
// variants of a size: Condensed (Mona Sans Condensed, always uppercase, letter spacing 0) on Display steps only,
// and Mono (Mona Sans Mono, letter spacing 0) on every Text and Heading step, H1 included. Headings and Display
// take their letter spacing from trackingFor and their line height from lineHeightFor; Text keeps today's.
export const proposedRoles = ["Display", "Heading", "Text"] as const

export type ProposedStyle = {
  /** The Figma style name. */
  name: string
  role: (typeof proposedRoles)[number]
  style: CSSProperties
  /** Today's styles it would replace. */
  replaces: string
}

type Step = {
  name: string
  size: number
  lineHeight: number
  tracking: number
  /** Today's styles at this step, by variant. */
  replaces: Partial<Record<Variant, string>>
}

type Variant = "Regular" | "Medium" | "SemiBold" | "Mono" | "Condensed"

const weights: Record<Exclude<Variant, "Mono" | "Condensed">, number> = {
  Regular: 400,
  Medium: 500,
  SemiBold: 600,
}

// Letter spacing for every Heading and Display step, from one formula scaled from H1 (Juan, 2026-11-17), so the
// type system stays cohesive. Mona Sans Display already sets 2.5% of the size tighter than the text cut
// (measured), so the steps need little more: H1 (64px) gets H1_TRACKING (a share of its size), smaller headings
// less, on a log curve that reaches 0 at H6 (24px), because the Display cut, drawn for 72px, is already tight at
// small sizes, and the Display steps more, on the same curve. At the recommended -0.005, in px rounded to 0.01:
// H6 0, H5 -0.05, H4 -0.1, H3 -0.17, H2 -0.24, H1 -0.32, Display 1 -0.49, 2 -0.78, 3 -1.09, 4 -1.55, 5 -2.16.
// Condensed and Mono keep 0.
// Decided: 0 everywhere (Juan, 2026-11-17). Kept as a formula so the scale can be tuned from H1 later; the
// value Claude recommended was -0.005.
const H1_TRACKING = 0
const trackingFor = (size: number) =>
  Math.round(
    100 * H1_TRACKING * size * (Math.log(size / 24) / Math.log(64 / 24))
  ) / 100

// Line height for every Heading and Display step, from one curve (Juan, 2026-11-17): 1 + k / size^p, fitted
// through H6 (24px, 1.3) and H1 (64px, 1.1). It keeps about 6.4px of leading above the font size at every step,
// so the ratio shrinks as the type grows. Rounded to 0.01: H6 1.3, H5 1.22, H4 1.17, H3 1.14, H2 1.12, H1 1.1,
// Display 1 1.08, 2 1.06, 3 1.05, 4 1.04, 5 1.03. Mona Sans Display's ascenders plus descenders take 0.905em,
// so lines stay clear down to about 0.91.
const LEADING_POWER = Math.log(0.3 / 0.1) / Math.log(64 / 24)
const LEADING_K = 0.3 * Math.pow(24, LEADING_POWER)
const lineHeightFor = (size: number) =>
  Math.round(100 * (1 + LEADING_K / Math.pow(size, LEADING_POWER))) / 100

// Display sizes (Juan, 2026-11-17): about ×1.25 per step from H1 (64), on the 8px grid, so the jumps grow with
// the size (16, 24, 24, 32, 40). Picked from what the Figma brand file uses most above 64px: 80 (115 layers),
// 104 (67), 200 (32) and 160 (19); 128 is the wide creative title. 72, 88, 96, 112, 120, 144 and 240 go. The
// creative titles that sat between steps move to the nearest one (marked "today"). Display steps are numbered
// from the smallest, 1 (80) to 5 (200), so larger sizes can be added as 6, 7… (Juan, 2026-11-17).
const displaySteps: Step[] = [
  {
    name: "5",
    size: 200,
    lineHeight: lineHeightFor(200),
    tracking: trackingFor(200),
    replaces: {},
  },
  {
    name: "4",
    size: 160,
    lineHeight: lineHeightFor(160),
    tracking: trackingFor(160),
    replaces: { SemiBold: "social-post-hero (today 144)" },
  },
  {
    name: "3",
    size: 128,
    lineHeight: lineHeightFor(128),
    tracking: trackingFor(128),
    replaces: { SemiBold: "qd-title short (wide, ultrawide)" },
  },
  {
    name: "2",
    size: 104,
    lineHeight: lineHeightFor(104),
    tracking: trackingFor(104),
    replaces: {
      SemiBold:
        "display-2 and its Regular, Medium and Bold, social-post-title, luma-title, qd-title short (story), qd-title--medium (wide, ultrawide), qd-title short (square, portrait; today 96)",
      Condensed:
        "display-condensed-2 and its Medium and Bold, social-event-title",
    },
  },
  {
    name: "1",
    size: 80,
    lineHeight: lineHeightFor(80),
    tracking: trackingFor(80),
    replaces: {
      SemiBold:
        "display-1 and its Regular, Medium and Bold, qd-title--medium (square, portrait), qd-title--long (wide, ultrawide; today 88), qd-title--medium (story; today 88)",
      Condensed: "display-condensed-1 and its Medium and Bold",
    },
  },
]

const headingSteps: Step[] = [
  {
    name: "H1",
    size: 64,
    lineHeight: lineHeightFor(64),
    tracking: trackingFor(64),
    replaces: {
      Regular: "h1 in Regular",
      Medium: "h1 in Medium",
      SemiBold:
        "h1 and its Bold, qd-title--long (square, portrait), qd-title--long (story; today 72)",
      Mono: "mono-h1",
    },
  },
  {
    name: "H2",
    size: 56,
    lineHeight: lineHeightFor(56),
    tracking: trackingFor(56),
    replaces: {
      Regular: "h2 in Regular",
      Medium: "h2 in Medium",
      SemiBold: "h2 and its Bold, social-post-eyebrow",
      Mono: "mono-h2",
    },
  },
  {
    name: "H3",
    size: 48,
    lineHeight: lineHeightFor(48),
    tracking: trackingFor(48),
    replaces: {
      Regular: "h3 in Regular",
      Medium: "h3 in Medium",
      SemiBold: "h3 and its Bold, headshot card name",
      Mono: "mono-h3",
    },
  },
  {
    name: "H4",
    size: 40,
    lineHeight: lineHeightFor(40),
    tracking: trackingFor(40),
    replaces: {
      Regular: "h4 in Regular, qd-supporting (wide, ultrawide, story)",
      Medium: "h4 in Medium",
      SemiBold: "h4 and its Bold, social-event-speaker-name",
      Mono: "mono-h4, social-event-detail",
    },
  },
  {
    name: "H5",
    size: 32,
    lineHeight: lineHeightFor(32),
    tracking: trackingFor(32),
    replaces: {
      Regular:
        "h5 in Regular, social-post-body, social-event-speaker-role, headshot card and circle roles",
      Medium: "h5 in Medium, headshot circle name",
      SemiBold: "h5 and its Bold, social-event-series",
      Mono: "mono-h5",
    },
  },
  {
    name: "H6",
    size: 24,
    lineHeight: lineHeightFor(24),
    tracking: trackingFor(24),
    replaces: {
      Regular: "h6 in Regular",
      Medium: "h6 in Medium",
      SemiBold: "h6 and its Bold",
      Mono: "mono-h6",
    },
  },
]

const textSteps: Step[] = (
  [
    ["xl", 20, 0],
    ["lg", 18, 0],
    ["md", 16, 0],
    ["sm", 14, 0],
    ["xs", 12, 0],
  ] as const
).map(([name, size, tracking]) => ({
  name,
  size,
  lineHeight: 1.5,
  tracking,
  replaces: {
    Regular: `text-${name}`,
    Medium: `text-${name} in Medium`,
    SemiBold: `text-${name} in SemiBold and in Bold`,
    Mono: `mono-${name}`,
  },
}))

function ladder(role: ProposedStyle["role"], steps: Step[]): ProposedStyle[] {
  const family =
    role === "Text"
      ? "var(--qd-font-family-sans)"
      : "var(--qd-font-family-display)"
  return steps.flatMap((step): ProposedStyle[] => {
    const base = {
      fontSize: `${step.size}px`,
      lineHeight: step.lineHeight,
      letterSpacing: `${step.tracking}px`,
    }
    // Display steps come in SemiBold and Condensed (also SemiBold). Text and Heading steps come in Regular,
    // Medium, SemiBold and Mono.
    const variants: Variant[] =
      role === "Display"
        ? ["SemiBold", "Condensed"]
        : ["Regular", "Medium", "SemiBold", "Mono"]
    return variants.map((variant) => ({
      name: `${role}/${step.name}/${variant}`,
      role,
      style:
        variant === "Condensed"
          ? {
              ...base,
              fontFamily: "var(--qd-font-family-condensed)",
              fontWeight: 600,
              fontStretch: "75%",
              textTransform: "uppercase",
              // No tightening on condensed capitals (Juan, 2026-11-17).
              letterSpacing: "0px",
            }
          : variant === "Mono"
            ? {
                ...base,
                fontFamily: "var(--qd-font-family-mono)",
                fontWeight: 400,
                letterSpacing: "0px",
              }
            : { ...base, fontFamily: family, fontWeight: weights[variant] },
      replaces: step.replaces[variant] ?? "Nothing today",
    }))
  })
}

export const proposedStyles: ProposedStyle[] = [
  ...ladder("Display", displaySteps),
  ...ladder("Heading", headingSteps),
  ...ladder("Text", textSteps),
]
