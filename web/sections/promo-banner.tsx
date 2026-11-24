import { cn } from "@qdrant/design-system/lib/utils"

import type { Promo } from "../content/platform"
import { ArrowLink } from "../lib/arrow-link"
import { LinkButton } from "../lib/link-button"
import { MediaFrame } from "../lib/media-frame"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { IconTile, type Tone } from "../lib/tone"
import { heading, type } from "../lib/type"

export type PromoBannerProps = SectionProps & {
  promo: Promo
  // split: a plate with the text on one side and a media slot on the other. slim: one line inside a plate.
  layout?: "split" | "slim"
  // For split: which side the media is on.
  media?: "right" | "left"
  mediaLabel?: string
  tone?: Tone
}

// A promo for a webinar, a guide or a report (2026-11-21): a kicker naming what it is, its title, a line and one
// action, on a plate. Split gives it a media slot for the cover; slim fits it on one line between sections.
export function PromoBanner({
  promo,
  layout = "split",
  media = "right",
  mediaLabel,
  tone = "purple",
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: PromoBannerProps) {
  const kicker = (
    <p className={cn(type.kicker, "flex items-center gap-3")}>
      {promo.icon && <IconTile name={promo.icon} tone={tone} size="sm" />}
      {promo.kicker}
    </p>
  )

  if (layout === "slim") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} spacing="compact" id={id} className={className}>
        <Plate className="flex flex-col gap-4 rounded-xl p-5 md:flex-row md:items-center md:gap-8 md:px-6">
          <div className="shrink-0">{kicker}</div>
          <p className="min-w-0 flex-1 text-base text-foreground">
            <span className="font-display">{promo.title}</span>
            {promo.text && <span className="hidden text-muted-foreground lg:inline"> {promo.text}</span>}
          </p>
          <ArrowLink href={promo.action.href} className="shrink-0 text-sm">
            {promo.action.label}
          </ArrowLink>
        </Plate>
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} spacing="compact" id={id} className={className}>
      <Plate className="grid items-center gap-8 rounded-2xl p-6 md:p-10 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)">
        <div className={cn("flex flex-col items-start gap-5", media === "left" && "lg:order-2")}>
          {kicker}
          <h2 className={cn(heading.card, "text-balance md:text-(length:--qd-type-h6-size) md:leading-(--qd-type-h6-line-height)")}>
            {promo.title}
          </h2>
          {promo.text && <p className={cn(type.body, "text-pretty")}>{promo.text}</p>}
          <LinkButton href={promo.action.href} className="mt-2">
            {promo.action.label}
          </LinkButton>
        </div>
        <div className={cn("web-tray rounded-[calc(var(--radius-xl)+6px)]", media === "left" && "lg:order-1")}>
          <MediaFrame label={mediaLabel ?? promo.kicker} className="web-plate" />
        </div>
      </Plate>
    </Section>
  )
}
