import type { ComponentType } from "react"

// A pattern (design lead, 2026-11-21): a decorative layer the website draws behind a section's content (background) or
// inside each card of a section (surface). It's purely visual: aria-hidden, no pointer events, and it never holds
// text. Patterns are how the site's space, data and vector themes come in, one layer at a time, and they can be
// turned off as a whole (data-web-patterns="off", the studio's Patterns switch).
//
// To add one: write web/patterns/<id>.tsx exporting a PatternDefinition, and list it in web/patterns/index.tsx. It
// then shows in the studio's Patterns tab, in the builder's pattern pickers, and on any section through its
// `pattern` (background) or `cardPattern` (surface) prop. A pattern still being explored goes in
// web/patterns/explorations/ instead: it shows only in the Patterns tab, marked Exploring, until the design lead says yes.
export type PatternKind = "background" | "surface"

// Approved (in web/patterns/index.tsx, the design lead's yes) or exploring (web/patterns/explorations/).
export type PatternStatus = "approved" | "exploring"

// Where a pattern stretches or breaks a written rule, so it's raised before the design lead sees it.
export type PatternNote = {
  // The rule, in a few words.
  rule: string
  // The file the rule is written in.
  source: string
  // How this pattern differs from it.
  text: string
}

export type PatternDefinition = {
  id: string
  name: string
  kind: PatternKind
  // One line on what it is and when to use it.
  description: string
  // The layer. It fills its parent (absolute, inset 0) and should read in both themes through the website's
  // variables (--web-line, --web-indigo, --foreground…), never a hex.
  Layer: ComponentType
  // Approved when it's left out.
  status?: PatternStatus
  notes?: PatternNote[]
}

export function definePattern(p: PatternDefinition) {
  return p
}
