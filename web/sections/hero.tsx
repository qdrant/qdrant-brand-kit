import * as React from "react"

import { Badge } from "@qdrant/design-system/components/ui/badge"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import { CodePanel, quickstartQuery } from "../lib/code-panel"
import { CopySnippet } from "../lib/copy-snippet"
import { IconTile, toneAt } from "../lib/tone"
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
  // The real image or product screen for the media slot (web/visuals), instead of the placeholder.
  visual?: React.ReactNode
  // One small line under the buttons, with a link in it: "Need more? Talk to our team about Enterprise."
  note?: { text: string; link: Link; after?: string }
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
  visual,
  note,
  theme,
  surface, pattern, cardPattern,
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
          <LinkButton href={secondary.href} size="lg" variant="secondary">
            {secondary.label}
          </LinkButton>
        )}
      </>
    ) : undefined

  // Media sits on a plate inside a tray (web.css).
  // A visual's frame hugs it, on the right of a split hero when there's room.
  const mediaEl = visual ? (
    <div className={cn("web-tray w-fit max-w-full rounded-[calc(var(--radius-xl)+6px)]", centered ? "mx-auto" : "justify-self-center lg:justify-self-end")}>
      <div className="web-plate overflow-hidden rounded-xl">{visual}</div>
    </div>
  ) : media === "none" ? null : (
      <div className="web-tray w-full rounded-[calc(var(--radius-xl)+6px)]">
        {media === "code" ? (
          <CodePanel title="quickstart.py" code={quickstartQuery} className="web-plate w-full" />
        ) : (
          <MediaFrame label={mediaLabel ?? "Product screenshot"} className="web-plate" />
        )}
      </div>
    )

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
      {note && (
        <p className={cn("text-sm text-muted-foreground", centered && "text-center")}>
          {note.text}{" "}
          <a href={note.link.href} className="web-link underline underline-offset-4">
            {note.link.label}
          </a>
          {note.after && ` ${note.after}`}
        </p>
      )}
    </>
  )

  const trustEl =
    trust && trust.length > 0 ? (
      <ul className="web-cells web-bleed grid grid-cols-2 text-sm text-muted-foreground md:grid-cols-4">
        {trust.map((item, i) => (
          <li key={item.label} className="flex items-center justify-center gap-3 px-4 py-5 text-center">
            <IconTile name={item.icon} tone={toneAt(i)} size="sm" />
            {item.label}
          </li>
        ))}
      </ul>
    ) : null

  if (centered) {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col items-center gap-10">
        <SectionHeader as="h1" align="center" kicker={kicker} title={title} description={description} actions={actions} />
        {(pills || snippet || note) && <div className="flex w-full flex-col items-center gap-6">{extras}</div>}
        {mediaEl && <div className="w-full max-w-4xl">{mediaEl}</div>}
        {trustEl && <div className="w-full">{trustEl}</div>}
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-12">
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
