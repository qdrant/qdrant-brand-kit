import type { ComponentType } from "react"

import type { SectionProps, SectionSurface, SectionTheme } from "../lib/section"

// The section library's catalog (2026-11-21): what the studio's canvas, docs and page builder read. Each section
// has an entry here with its variants (ready-made props with real qdrant.tech copy), its docs, and the props the
// page builder can edit. Add a section's entry when you add the section.

export const categories = [
  { id: "navigation", label: "Navigation" },
  { id: "hero", label: "Hero" },
  { id: "logos", label: "Logos" },
  { id: "features", label: "Features" },
  { id: "proof", label: "Social proof" },
  { id: "stats", label: "Stats" },
  { id: "developers", label: "Developers" },
  { id: "enterprise", label: "Enterprise" },
  { id: "pricing", label: "Pricing" },
  { id: "comparison", label: "Comparison" },
  { id: "faq", label: "FAQ" },
  { id: "cta", label: "Call to action" },
  { id: "forms", label: "Forms" },
  { id: "listings", label: "Listings" },
  { id: "content", label: "Content" },
  { id: "people", label: "People" },
  { id: "company", label: "Company" },
  { id: "community", label: "Community" },
  { id: "events", label: "Events" },
  { id: "utility", label: "Utility" },
  { id: "footer", label: "Footer" },
] as const

export type CategoryId = (typeof categories)[number]["id"]

export type SectionVariant<P> = {
  id: string
  name: string
  description: string
  props: P
  // The theme and surface it's shown with in the canvas and the docs, when not the page's default.
  theme?: SectionTheme
  surface?: SectionSurface
  // Room below the section in previews, for panels that open past it (the navbar's menus).
  frameMinHeight?: number
  // A layout proposed for review (design lead, 2026-11-24), not a decision: what it adds and where the idea comes from.
  // The studio marks it "Proposal" and can show proposals alone. Keep it by removing this field; drop it by
  // deleting the variant and its layout in the section.
  proposal?: string
}

// A prop the page builder can edit, besides the variant, theme and surface every section has.
export type EditableField =
  | { prop: string; label: string; kind: "text" | "textarea" }
  | { prop: string; label: string; kind: "select"; options: { value: string; label: string }[] }
  | { prop: string; label: string; kind: "boolean" }

export type SectionDoc = {
  // When to reach for it, and when not to.
  use: string[]
  // Rules every use follows.
  rules: string[]
  // Its parts, top to bottom.
  anatomy: { part: string; note: string }[]
  // Its props, besides theme, surface, id and className, which every section has.
  props: { name: string; type: string; note: string }[]
}

export type SectionDefinition<P extends object = Record<string, unknown>> = {
  id: string
  name: string
  category: CategoryId
  summary: string
  // The file it lives in, for the docs and agents: web/sections/<file>.tsx.
  file: string
  component: ComponentType<P & SectionProps>
  variants: SectionVariant<P>[]
  docs: SectionDoc
  fields: EditableField[]
}

// Helps TypeScript check a definition against its component's props.
export function defineSection<P extends object>(definition: SectionDefinition<P>): SectionDefinition<P> {
  return definition
}
