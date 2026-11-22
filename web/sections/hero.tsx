import * as React from "react"

import { Badge } from "@qdrant/design-system/components/ui/badge"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import { CodePanel, quickstartQuery } from "../lib/code-panel"
import { CopySnippet } from "../lib/copy-snippet"
import { Icon } from "../lib/icon"
import { LinkButton } from "../lib/link-button"
import { MediaFrame } from "../lib/media-frame"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"

export type HeroProps = SectionProps & {
  // centered: everything on one axis, media below. split: text on the left, media on the right, from lg.
  layout?: "centered" | "split"
  kicker?: string
  title: string
  description?: string
  primary?: Link
  secondary?: Link
  // One line to copy under the buttons, like a prompt for an agent.
  snippet?: { label?: string; text: string }
  // Proof points under everything, each with a Lucide icon.
  trust?: { label: string; icon?: string }[]
  // Short claims as pills, under the buttons.
  pills?: string[]
  // What fills the media slot: nothing, Qdrant's quickstart search, or a placeholder for an image the page supplies.
  media?: "none" | "code" | "image"
  mediaLabel?: string
}

// The opening section of a page (2026-11-21): the page's H1 and its main actions, and optionally a media slot,
// a line to copy, pills and a row of proof points.
export function Hero({
  layout = "centered",
  kicker,
  title,
  description,
  primary,
  secondary,
  snippet,
  trust,
  pills,
  media = "none",
  mediaLabel,
  theme,
  surface,
  id,
  className,
}: HeroProps) {
  const centered = layout === "centered"
  const actions =
    primary || secondary ? (
      <>
        {primary && (
          <LinkButton href={primary.href} size="lg">
            {primary.label}
          </LinkButton>
        )}
        {secondary && (
          <LinkButton href={secondary.href} size="lg" variant="outline">
            {secondary.label}
          </LinkButton>
        )}
      </>
    ) : undefined

  const mediaEl =
    media === "code" ? (
      <CodePanel title="quickstart.py" code={quickstartQuery} className="w-full" />
    ) : media === "image" ? (
      <MediaFrame label={mediaLabel ?? "Product screenshot"} />
    ) : null

  const extras = (
    <>
      {pills && pills.length > 0 && (
        <ul className={cn("flex flex-wrap gap-2", centered && "justify-center")}>
          {pills.map((pill) => (
            <li key={pill}>
              <Badge variant="outline" className="h-7 px-3 text-xs">
                {pill}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      {snippet && <CopySnippet label={snippet.label} text={snippet.text} />}
    </>
  )

  const trustEl =
    trust && trust.length > 0 ? (
      <ul
        className={cn(
          "flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-8 text-sm text-muted-foreground",
          centered ? "justify-center" : "justify-start"
        )}
      >
        {trust.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <Icon name={item.icon} className="size-4 text-(--qd-color-primary-text)" />
            {item.label}
          </li>
        ))}
      </ul>
    ) : null

  if (centered) {
    return (
      <Section theme={theme} surface={surface} id={id} className={className} innerClassName="flex flex-col items-center gap-10">
        <SectionHeader as="h1" align="center" kicker={kicker} title={title} description={description} actions={actions} />
        {(pills || snippet) && <div className="flex w-full flex-col items-center gap-6">{extras}</div>}
        {mediaEl && <div className="w-full max-w-4xl">{mediaEl}</div>}
        {trustEl && <div className="w-full">{trustEl}</div>}
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} id={id} className={className} innerClassName="flex flex-col gap-12">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)">
        <div className="flex flex-col items-start gap-6">
          <SectionHeader as="h1" kicker={kicker} title={title} description={description} actions={actions} />
          {extras}
        </div>
        {mediaEl}
      </div>
      {trustEl}
    </Section>
  )
}
