"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import { PatternLayers, useCardPattern } from "../patterns"

type PlateProps = React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "li" | "article" | "figure" | "a" | "form" | "section"
  // Link and form attributes, for a card that's a link or a form.
  href?: string
  target?: string
  rel?: string
  action?: string
  method?: string
  noValidate?: boolean
  // A surface pattern for this card only; otherwise the section's cardPattern.
  pattern?: string
  // A simple card (an icon, a title and a line of text): the material without its inner top light (design lead,
  // 2026-11-24). Panels, forms, media and quotes keep it.
  simple?: boolean
}

// A card on the website's material (web.css, web-plate), with the section's surface pattern under its content.
// Use it for every card, panel and tile, so a pattern set on a section reaches all its cards.
export function Plate({ as = "div", pattern, simple, className, children, ...props }: PlateProps) {
  const sectionPattern = useCardPattern()
  const id = pattern ?? sectionPattern
  const Tag = as as React.ElementType
  return (
    <Tag className={cn("web-plate relative isolate overflow-hidden", simple && "web-plate-simple", className)} {...props}>
      {id && (
        <span aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <PatternLayers ids={id} />
        </span>
      )}
      {children}
    </Tag>
  )
}
