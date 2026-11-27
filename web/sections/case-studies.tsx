import type * as React from "react"

import { Avatar, AvatarFallback } from "@qdrant/design-system/components/ui/avatar"
import { cn } from "@qdrant/design-system/lib/utils"

import type { CaseStudy, Quote } from "../content/conversion"
import type { Link } from "../content/site"
import { ArrowLink } from "../lib/arrow-link"
import { LinkButton } from "../lib/link-button"
import { MediaFrame } from "../lib/media-frame"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

export type FeaturedStory = {
  company: string
  summary?: string
  quote?: Quote
  metrics?: { value: string; label: string }[]
  link: Link
  mediaLabel?: string
  // The real image for the media slot (a customer's logo on a plate, a photo), instead of the placeholder.
  visual?: React.ReactNode
}

export type CaseStudiesProps = SectionProps & {
  // cards: three result cards. featured: one large story with a media slot.
  layout?: "cards" | "featured"
  header?: HeaderProps
  items?: CaseStudy[]
  story?: FeaturedStory
}

// A company name set as a text logo, until its logo is exported from the Figma.
function CompanyMark({ name, className }: { name: string; className?: string }) {
  return <span className={cn("font-display text-lg font-medium tracking-tight text-muted-foreground", className)}>{name}</span>
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

// Customer stories with their results (2026-11-21): the company, the figure it reached, the line it comes from and
// a link to the case study. Only figures and lines the site states.
export function CaseStudies({ layout = "cards", header, items = [], story, theme, surface, pattern, cardPattern, id, className }: CaseStudiesProps) {
  const headerEl = header ? (
    <SectionHeader
      layout={header.action ? "action" : "stacked"}
      kicker={header.kicker}
      title={header.title}
      description={header.description}
      actions={
        header.action ? (
          <LinkButton href={header.action.href} variant="secondary">
            {header.action.label}
          </LinkButton>
        ) : undefined
      }
    />
  ) : null

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      {headerEl}
      {layout === "featured" && story ? (
        <Plate as="article" className="grid gap-1.5 rounded-[calc(var(--radius-xl)+6px)] p-1.5 lg:grid-cols-2">
          <div className="web-tray rounded-xl">
            {story.visual ? (
              <div className="web-plate grid h-full min-h-64 place-items-center overflow-hidden rounded-xl p-10">{story.visual}</div>
            ) : (
              <MediaFrame label={story.mediaLabel ?? `${story.company} story`} className="web-plate h-full min-h-64" />
            )}
          </div>
          <div className="flex flex-col gap-8 p-6 lg:p-10">
            <CompanyMark name={story.company} className="text-2xl" />
            {story.summary && <p className={cn(type.xl, "text-foreground")}>{story.summary}</p>}
            {story.quote && (
              <figure className="flex flex-col gap-4 border-l border-(--web-indigo) pl-5">
                <blockquote className={type.body}>{story.quote.quote}</blockquote>
                {story.quote.name && (
                  <figcaption className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback className="font-mono text-[10px]">{initials(story.quote.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{story.quote.name}</span>
                    {story.quote.role && <span className={cn(type.xsmall, "font-mono")}>{story.quote.role}</span>}
                  </figcaption>
                )}
              </figure>
            )}
            {story.metrics && story.metrics.length > 0 && (
              <dl className="web-cells grid grid-cols-2">
                {story.metrics.map((m) => (
                  <div key={m.label} className="flex flex-col-reverse gap-1 px-4 py-5 first:pl-0">
                    <dt className={cn(type.xsmall, "font-mono uppercase")}>{m.label}</dt>
                    <dd className="font-mono text-3xl tracking-tight text-foreground tabular-nums">{m.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <ArrowLink href={story.link.href} className="mt-auto text-sm">
              {story.link.label}
            </ArrowLink>
          </div>
        </Plate>
      ) : (
        <ul className="grid gap-(--qd-layout-column-gap) md:grid-cols-3">
          {items.map((item) => (
            <Plate as="li" key={item.company} className="flex flex-col rounded-xl">
              <div className="flex flex-1 flex-col gap-6 p-6">
                <CompanyMark name={item.company} />
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-4xl tracking-tight text-foreground tabular-nums">{item.metric}</span>
                  {item.metricLabel && <h3 className={heading.card}>{item.metricLabel}</h3>}
                </div>
                <p className={cn(type.small, "flex-1")}>{item.text}</p>
                <ArrowLink href={item.link.href} className="text-sm">
                  {item.link.label}
                </ArrowLink>
              </div>
              {(item.category || item.detail) && (
                <div className="flex flex-col gap-1 border-t border-(--web-line) px-6 py-4 font-mono text-xs uppercase">
                  {item.category && <span className="text-foreground">{item.category}</span>}
                  {item.detail && <span className="text-muted-foreground">{item.detail}</span>}
                </div>
              )}
            </Plate>
          ))}
        </ul>
      )}
    </Section>
  )
}
