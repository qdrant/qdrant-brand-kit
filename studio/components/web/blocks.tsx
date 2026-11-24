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

// The website's style switches (web/styles/web.css and web/patterns). Each is a query key for the frame and an
// attribute it sets when the switch isn't in its default state. The first five are decisions, on by default; the
// ones marked `proposal` are visual enhancements to review (design lead, 2026-11-24), off by default: turn one on to see
// it, and keep it by making its CSS the default (web.css, "Proposals") and removing it from here, or drop it by
// deleting both. Add a switch here and it appears in the canvas, the docs and the builder.
export const styleSwitches = [
  { key: "lines", label: "Lines", title: "Rails, seams and nodes", query: ["lines", "0"], attr: ["data-web-lines", "off"], on: true },
  { key: "material", label: "Material", title: "Plates and trays", query: ["material", "0"], attr: ["data-web-material", "off"], on: true },
  { key: "patterns", label: "Patterns", title: "Space, data and vector patterns behind sections and in cards", query: ["patterns", "0"], attr: ["data-web-patterns", "off"], on: true },
  { key: "indigo", label: "Indigo", title: "Indigo hints on nodes, links and pattern accents", query: ["indigo", "0"], attr: ["data-web-indigo", "off"], on: true },
  { key: "trialType", label: "Trial type", title: "Headings from 56px in Medium; off shows today's type set", query: ["type", "current"], attr: ["data-web-type", "current"], on: true },
  { key: "topLight", label: "Top light", title: "Proposal: light from above. A lit top edge on plates, trays and seams, fading at the ends", query: ["toplight", "1"], attr: ["data-web-top-light", "on"], on: false, proposal: true },
  { key: "bevel", label: "Bevel", title: "Proposal: cards and trays with cut corners, the hexagon's angle, instead of rounded ones", query: ["bevel", "1"], attr: ["data-web-bevel", "on"], on: false, proposal: true },
] as const

export type StyleKey = (typeof styleSwitches)[number]["key"]
export type Style = Record<StyleKey, boolean>
export const defaultStyle = Object.fromEntries(styleSwitches.map((s) => [s.key, s.on])) as Style

const changed = (s: (typeof styleSwitches)[number], style: Partial<Style>) =>
  style[s.key] !== undefined && style[s.key] !== s.on

// The frame query for the switches: only what isn't in its default state.
export function styleQuery(style: Partial<Style>): Record<string, string> {
  return Object.fromEntries(styleSwitches.filter((s) => changed(s, style)).map((s) => [s.query[0], s.query[1]]))
}

// The switches a frame's query changes.
export function styleFromQuery(params: URLSearchParams): Style {
  return Object.fromEntries(
    styleSwitches.map((s) => [s.key, params.get(s.query[0]) === s.query[1] ? !s.on : s.on])
  ) as Style
}

// The attributes for a style: only what isn't in its default state.
export function styleAttributes(style: Partial<Style>): Record<string, string> {
  return Object.fromEntries(styleSwitches.filter((s) => changed(s, style)).map((s) => [s.attr[0], s.attr[1]]))
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
