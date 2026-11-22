"use client"

import * as React from "react"

import { getSection, type SectionDefinition } from "@qdrant/web/registry"

// A page as the page builder and the frames see it: blocks of sections, each a variant of a section from the
// web registry, with the theme and surface it's shown on and any props changed in the builder.
export type Block = {
  uid: string
  section: string
  variant: string
  theme?: "dark" | "light"
  surface?: "default" | "raised"
  // Background patterns and the cards' surface pattern (web/patterns); unset uses the variant's.
  pattern?: string[]
  cardPattern?: string
  overrides?: Record<string, unknown>
}

export type WebPage = {
  id: string
  name: string
  theme: "dark" | "light"
  // The website's style switches, each on unless set to false.
  style?: Partial<Style>
  blocks: Block[]
}

// The website's style switches (web/styles/web.css and web/patterns), all on by default. Each is a query key for
// the frame and an attribute it sets when the switch is off. Add a switch here and it appears in the canvas, the
// docs and the builder.
export const styleSwitches = [
  { key: "lines", label: "Lines", title: "Rails, seams and nodes", query: ["lines", "0"], attr: ["data-web-lines", "off"] },
  { key: "material", label: "Material", title: "Plates and trays", query: ["material", "0"], attr: ["data-web-material", "off"] },
  { key: "patterns", label: "Patterns", title: "Space, data and vector patterns behind sections and in cards", query: ["patterns", "0"], attr: ["data-web-patterns", "off"] },
  { key: "indigo", label: "Indigo", title: "Indigo hints on nodes, links and pattern accents", query: ["indigo", "0"], attr: ["data-web-indigo", "off"] },
  { key: "trialType", label: "Trial type", title: "Headings from 60px in Medium; off shows today's type set", query: ["type", "current"], attr: ["data-web-type", "current"] },
] as const

export type StyleKey = (typeof styleSwitches)[number]["key"]
export type Style = Record<StyleKey, boolean>
export const defaultStyle: Style = { lines: true, material: true, patterns: true, indigo: true, trialType: true }

// The frame query for the switches: only what's off.
export function styleQuery(style: Partial<Style>): Record<string, string> {
  return Object.fromEntries(
    styleSwitches.filter((s) => style[s.key] === false).map((s) => [s.query[0], s.query[1]])
  )
}

// The switches a frame's query turns off.
export function styleFromQuery(params: URLSearchParams): Style {
  return Object.fromEntries(
    styleSwitches.map((s) => [s.key, params.get(s.query[0]) !== s.query[1]])
  ) as Style
}

// The attributes for a style: only what's off.
export function styleAttributes(style: Partial<Style>): Record<string, string> {
  return Object.fromEntries(styleSwitches.filter((s) => style[s.key] === false).map((s) => [s.attr[0], s.attr[1]]))
}

export function variantOf(def: SectionDefinition, id: string) {
  return def.variants.find((v) => v.id === id) ?? def.variants[0]
}

// One block, rendered from the registry.
export function RenderBlock({ block }: { block: Block }) {
  const def = getSection(block.section)
  if (!def) return null
  const variant = variantOf(def, block.variant)
  const Component = def.component as React.ComponentType<Record<string, unknown>>
  return (
    <Component
      {...(variant.props as Record<string, unknown>)}
      {...block.overrides}
      theme={block.theme ?? variant.theme}
      surface={block.surface ?? variant.surface}
      {...(block.pattern ? { pattern: block.pattern } : {})}
      {...(block.cardPattern !== undefined ? { cardPattern: block.cardPattern || undefined } : {})}
    />
  )
}

export const uid = () => Math.random().toString(36).slice(2, 10)
