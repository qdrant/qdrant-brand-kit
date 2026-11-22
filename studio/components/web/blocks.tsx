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
  overrides?: Record<string, unknown>
}

export type WebPage = {
  id: string
  name: string
  theme: "dark" | "light"
  // The website's lines and material (web/styles/web.css), on unless set to false.
  style?: { lines?: boolean; material?: boolean }
  blocks: Block[]
}

// The frame query for the lines and material switches: only what's off.
export function styleQuery(style: { lines: boolean; material: boolean }): Record<string, string> {
  return { ...(style.lines ? {} : { lines: "0" }), ...(style.material ? {} : { material: "0" }) }
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
    />
  )
}

export const uid = () => Math.random().toString(36).slice(2, 10)
