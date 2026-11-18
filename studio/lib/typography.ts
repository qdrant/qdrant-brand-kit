import { readFileSync } from "node:fs"
import path from "node:path"
import type { CSSProperties } from "react"

// What the Typography page (/typography) shows, so the type primitives can be refined in one place (Juan,
// 2026-11-17). The page measures every sample in the browser, so its details are always what the CSS gives.

// One tab per family of the brand's type (the Mona Sans family, 2026-11-17), then the text in creatives. The
// proposed ladder had its own tab until it became the type set (2026-11-18).
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
] as const

export type TabId = (typeof tabs)[number]["id"]

export const groups = ["Display", "Headings", "Text"] as const

// The text styles: the --qd-type-<style>-<property> variables in primitives/typography/typography.css, in the
// file's order, each in every weight it comes in (qdrant.weights in typography.tokens.json). A style goes under
// the family it renders in, from its family variable: Condensed when it's condensed, then Mono, then Display;
// Mona Sans when it sets no family.
export type TextStyle = {
  /** The style's name in the CSS: `h1` is --qd-type-h1-size, --qd-type-h1-weight… */
  name: string
  typeface: TypefaceId
  group: (typeof groups)[number]
  /** The weights it comes in; the CSS weight is its default. */
  weights: number[]
}

export const weightNames: Record<number, string> = {
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
}

const STYLE_VARIABLE =
  /--qd-type-([a-z0-9-]+?)-(size|weight|line-height|letter-spacing|family|stretch|transform):\s*([^;]+);/g

function groupOf(name: string): TextStyle["group"] {
  if (name.startsWith("display")) return "Display"
  if (/^(mono-)?h\d$/.test(name)) return "Headings"
  return "Text"
}

function typefaceOf(v: Record<string, string>): TypefaceId {
  if (v.stretch === "75%" || v.family?.includes("condensed"))
    return "mona-sans-condensed"
  if (v.family?.includes("mono")) return "mona-sans-mono"
  if (v.family?.includes("display")) return "mona-sans-display"
  return "mona-sans"
}

const typography = (file: string) =>
  readFileSync(
    path.resolve(process.cwd(), "..", "primitives", "typography", file),
    "utf8"
  )

export function textStyles(): TextStyle[] {
  const byName = new Map<string, Record<string, string>>()
  for (const [, name, property, value] of typography(
    "typography.css"
  ).matchAll(STYLE_VARIABLE)) {
    byName.set(name, { ...byName.get(name), [property]: value.trim() })
  }
  const tokens: Record<
    string,
    { $value?: { fontWeight: number }; $extensions?: Record<string, unknown> }
  > = JSON.parse(typography("typography.tokens.json")).semantic.type
  return [...byName].map(([name, v]) => ({
    name,
    typeface: typefaceOf(v),
    group: groupOf(name),
    weights: (tokens[name]?.$extensions?.["qdrant.weights"] as
      | number[]
      | undefined) ?? [Number(v.weight)],
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
const titleShapes = [
  ["square", "portrait", "story"],
  ["wide", "ultrawide"],
]

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
  { name: "qd-supporting", className: "qd-supporting", shapes: allShapes },
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
