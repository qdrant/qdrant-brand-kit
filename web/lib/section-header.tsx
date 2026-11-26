import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import { heading, type } from "./type"
import { Node } from "./node"

// The heading block that opens most sections (2026-11-21): an optional kicker in mono capitals, the title, a
// line or two of text, and actions.
// - stacked: one column, left-aligned or centered.
// - split: the title on the left, the text and actions on the right, from lg.
// - action: the title and text on the left, one action pinned to the right on the same line, from md.
export function SectionHeader({
  kicker,
  title,
  description,
  actions,
  align = "left",
  layout = "stacked",
  as: Heading = "h2",
  titleSize,
  className,
}: {
  kicker?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  align?: "left" | "center"
  layout?: "stacked" | "split" | "action"
  as?: "h1" | "h2" | "h3"
  // The title's size, when it differs from its level: an H1 at a section's size for a page that opens on its content
  // (the blog, 2026-11-26). By default an H1 is page-sized and the rest section-sized.
  titleSize?: "page" | "section"
  className?: string
}) {
  const titleClass = cn((titleSize ?? (Heading === "h1" ? "page" : "section")) === "page" ? heading.page : heading.section, "text-balance")
  // The kicker starts with a node, the same hexagon as where the page's lines meet (web.css), centered on the
  // kicker's first line, however many lines it takes (design lead, 2026-11-24).
  const kickerEl = kicker ? (
    <p className={cn(type.kicker, "flex items-start gap-2.5")}>
      <span className="flex h-[1lh] shrink-0 items-center">
        <Node blink filled />
      </span>
      {kicker}
    </p>
  ) : null
  const descriptionEl = description ? (
    <p className={cn(type.lead, "text-pretty", align === "center" && "mx-auto max-w-2xl")}>{description}</p>
  ) : null

  if (layout === "split") {
    return (
      <div className={cn("grid gap-6 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)", className)}>
        <div className="flex flex-col gap-4">
          {kickerEl}
          <Heading className={titleClass}>{title}</Heading>
        </div>
        <div className="flex flex-col justify-end gap-6">
          {descriptionEl}
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>
    )
  }

  if (layout === "action") {
    return (
      <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
        <div className="flex max-w-2xl flex-col gap-4">
          {kickerEl}
          <Heading className={titleClass}>{title}</Heading>
          {descriptionEl}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start",
        className
      )}
    >
      {kickerEl}
      <Heading className={cn(titleClass, align === "center" && "max-w-4xl")}>{title}</Heading>
      {descriptionEl}
      {actions && (
        <div className={cn("mt-4 flex flex-wrap gap-3", align === "center" && "justify-center")}>{actions}</div>
      )}
    </div>
  )
}
