import * as React from "react"

import { Badge } from "@qdrant/design-system/components/ui/badge"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import { CodePanel, quickstartQuery } from "../lib/code-panel"
import { CopySnippet, type AgentId } from "../lib/copy-snippet"
import { Icon } from "../lib/icon"
import { LinkButton } from "../lib/link-button"
import { MediaFrame } from "../lib/media-frame"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"

export type HeroProps = SectionProps & {
  // centered: everything on one axis, media below. split: text on the left, media on the right, from lg.
  // Proposal (2026-11-24): wide, the title on the left and the description and actions on the right on one line,
  // then the media across the whole container, then the proof points.
  layout?: "centered" | "split" | "wide"
  kicker?: string
  title: string
  description?: string
  primary?: Link
  secondary?: Link
  // One line to copy under the buttons, like a prompt for an agent.
  snippet?: { label?: string; text: string; agents?: AgentId[] }
  // Proof points under everything, each with a Lucide icon.
  trust?: { label: string; icon?: string }[]
  // Short claims as pills, under the buttons.
  pills?: string[]
  // What fills the media slot: nothing, Qdrant's quickstart search, or a placeholder for an image the page supplies.
  media?: "none" | "code" | "image"
  mediaLabel?: string
  // The real image or product screen for the media slot (web/visuals), instead of the placeholder.
  visual?: React.ReactNode
  // "none" shows the visual bare, with no tray or plate, for a visual that is the page's backdrop (2026-11-26, the
  // home page's planet).
  visualFrame?: "plate" | "none"
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
  visualFrame = "plate",
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
  const mediaEl = visual && visualFrame === "none" ? (
    <div className={cn("w-full max-w-full", centered ? "mx-auto [&>*]:mx-auto" : "justify-self-center lg:justify-self-end")}>{visual}</div>
  ) : visual ? (
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

  // The prompt for agents sits above the title, so the buttons under the text stand alone (design lead, 2026-11-26).
  const snippetEl = snippet ? <CopySnippet label={snippet.label} text={snippet.text} agents={snippet.agents} /> : null

  // Proof points as a plain row of an icon and a label each, no cells or tiles, under the hero's visual (design lead,
  // 2026-11-26). The text keeps the hero's default spacing; a bare visual gets more room around it, 64px above and below.
  const trustEl =
    trust && trust.length > 0 ? (
      <ul className={cn("flex flex-wrap items-center gap-x-12 gap-y-3 text-sm text-muted-foreground", centered ? "justify-center" : "justify-start")}>
        {trust.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <Icon name={item.icon} className="size-4 text-(--web-indigo)" />
            {item.label}
          </li>
        ))}
      </ul>
    ) : null

  if (layout === "wide") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} lines={false} id={id} className={className} innerClassName="flex flex-col gap-12 lg:gap-16">
        <div className="flex flex-col gap-8">
          {snippetEl && <div className="flex">{snippetEl}</div>}
          <SectionHeader as="h1" layout="split" kicker={kicker} title={title} description={description} actions={actions} />
          {(pills || note) && <div className="flex flex-col items-start gap-6 lg:items-end">{extras}</div>}
        </div>
        {mediaEl && <div className="w-full [&>.web-tray]:w-full">{mediaEl}</div>}
        {trustEl}
      </Section>
    )
  }

  if (centered) {
    return (
      <Section
        theme={theme}
        surface={surface}
        pattern={pattern}
        cardPattern={cardPattern}
        lines={false}
        id={id}
        className={className}
        innerClassName="flex flex-col items-center gap-10"
      >
        {/* The prompt reads like an eyebrow, so it sits close to the title: 16px (design lead, 2026-11-26). */}
        {snippetEl && <div className="-mb-6 flex justify-center">{snippetEl}</div>}
        <SectionHeader as="h1" align="center" kicker={kicker} title={title} description={description} actions={actions} />
        {(pills || note) && <div className="flex w-full flex-col items-center gap-6">{extras}</div>}
        {mediaEl && <div className={cn("w-full", visualFrame === "none" ? "pointer-events-none my-6 max-w-full" : "max-w-4xl")}>{mediaEl}</div>}
        {trustEl && <div className="w-full">{trustEl}</div>}
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} lines={false} id={id} className={className} innerClassName="flex flex-col gap-12">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)">
        <div className="flex flex-col items-start gap-6">
          {snippetEl}
          <SectionHeader as="h1" kicker={kicker} title={title} description={description} actions={actions} />
          {extras}
        </div>
        {mediaEl}
      </div>
      {trustEl}
    </Section>
  )
}
