import type { ComponentType } from "react"

// A pattern (Juan, 2026-11-21): a decorative layer the website draws behind a section's content (background) or
// inside each card of a section (surface). It's purely visual: aria-hidden, no pointer events, and it never holds
// text. Patterns are how the site's space, data and vector themes come in, one layer at a time, and they can be
// turned off as a whole (data-web-patterns="off", the studio's Patterns switch).
//
// To add one: write web/patterns/<id>.tsx exporting a PatternDefinition, and list it in web/patterns/index.ts. It
// then shows in the studio's Patterns tab, in the builder's pattern pickers, and on any section through its
// `pattern` (background) or `cardPattern` (surface) prop.
export type PatternKind = "background" | "surface"

export type PatternDefinition = {
  id: string
  name: string
  kind: PatternKind
  // One line on what it is and when to use it.
  description: string
  // The layer. It fills its parent (absolute, inset 0) and should read in both themes through the website's
  // variables (--web-line, --web-indigo, --foreground…), never a hex.
  Layer: ComponentType
}

export function definePattern(p: PatternDefinition) {
  return p
}
