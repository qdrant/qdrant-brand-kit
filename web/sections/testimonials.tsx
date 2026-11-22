import { Avatar, AvatarFallback } from "@qdrant/design-system/components/ui/avatar"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import type { Quote } from "../content/conversion"
import { ArrowLink } from "../lib/arrow-link"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { type } from "../lib/type"

export type TestimonialsProps = SectionProps & {
  // single: one large quote, centered. wall: quote cards in columns. metric: a quote beside a result figure.
  layout?: "single" | "wall" | "metric"
  header?: HeaderProps
  quotes: Quote[]
  // The result beside the quote, for the metric layout.
  metric?: { value: string; label: string; text?: string; link?: Link }
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

// The quote's author: an initials avatar (never a made-up photo), the name, and the role or handle in mono.
function Author({ quote, size = "default" }: { quote: Quote; size?: "default" | "lg" }) {
  if (!quote.name) return null
  const detail = quote.role ?? quote.handle ?? quote.company
  return (
    <figcaption className="flex items-center gap-3">
      <Avatar size={size}>
        <AvatarFallback className="font-mono text-xs">{initials(quote.name)}</AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-foreground">{quote.name}</span>
        {detail && <span className={cn(type.xsmall, "font-mono")}>{detail}</span>}
      </span>
    </figcaption>
  )
}

// A company name set as a text logo, until the logo file is exported from the Figma (logo-cloud.tsx does the same).
function CompanyMark({ name, className }: { name: string; className?: string }) {
  return <span className={cn("font-display text-xl font-medium tracking-tight text-muted-foreground", className)}>{name}</span>
}

// A quote large enough to carry a section: H6 on phones, H5 from md, H4 from lg, in the display face.
const largeQuote = cn(
  type.h6,
  "md:text-(length:--qd-type-h5-size) md:leading-(--qd-type-h5-line-height) lg:text-(length:--qd-type-h4-size) lg:leading-(--qd-type-h4-line-height)"
)

// What customers and the community say (2026-11-21): real quotes only, each with its person or company as the
// site shows them. Long quotes are cut to their first full sentence, never reworded.
export function Testimonials({ layout = "single", header, quotes, metric, theme, surface, pattern, cardPattern, id, className }: TestimonialsProps) {
  const headerEl = header ? (
    <SectionHeader
      layout={header.action ? "action" : "stacked"}
      align={layout === "single" ? "center" : "left"}
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

  if (layout === "wall") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
        {headerEl}
        <ul className="columns-1 gap-(--qd-layout-column-gap) md:columns-2 lg:columns-3">
          {quotes.map((q) => (
            <Plate as="li" key={q.quote} className="mb-(--qd-layout-column-gap) break-inside-avoid rounded-xl p-6">
              <figure className="flex flex-col gap-6">
                <blockquote className={cn(type.body, "text-foreground")}>{q.quote}</blockquote>
                <Author quote={q} />
              </figure>
            </Plate>
          ))}
        </ul>
      </Section>
    )
  }

  if (layout === "metric") {
    const q = quotes[0]
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
        {headerEl}
        <div className="web-grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {q && (
            <figure className="flex flex-col justify-between gap-10 px-6 py-10 lg:py-12 lg:pr-12">
              <blockquote className={cn(largeQuote, "text-pretty")}>{q.quote}</blockquote>
              <div className="flex flex-wrap items-center justify-between gap-6">
                <Author quote={q} size="lg" />
                {q.company && <CompanyMark name={q.company} />}
              </div>
            </figure>
          )}
          {metric && (
            <div className="flex flex-col justify-between gap-10 px-6 py-10 lg:py-12">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-5xl tracking-tight text-foreground tabular-nums md:text-6xl">{metric.value}</span>
                <span className={cn(type.small, "font-mono uppercase")}>{metric.label}</span>
              </div>
              <div className="flex flex-col items-start gap-4">
                {metric.text && <p className={type.body}>{metric.text}</p>}
                {metric.link && (
                  <ArrowLink href={metric.link.href} className="text-sm">
                    {metric.link.label}
                  </ArrowLink>
                )}
              </div>
            </div>
          )}
        </div>
      </Section>
    )
  }

  // single
  const q = quotes[0]
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col items-center gap-(--qd-layout-heading-to-content-min)">
      {headerEl}
      {q && (
        <figure className="flex max-w-4xl flex-col items-center gap-10 text-center">
          <span aria-hidden className="font-mono text-4xl leading-none text-(--web-indigo-text)">
            “
          </span>
          <blockquote className={cn(largeQuote, "-mt-6 text-balance")}>{q.quote}</blockquote>
          <div className="flex flex-col items-center gap-4">
            {q.name && <Author quote={q} size="lg" />}
            {q.company && <CompanyMark name={q.company} className="text-2xl" />}
          </div>
        </figure>
      )}
    </Section>
  )
}
