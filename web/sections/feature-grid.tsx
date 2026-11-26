import { cn } from "@qdrant/design-system/lib/utils"

import type { Feature } from "../content/sections"
import { ArrowLink } from "../lib/arrow-link"
import { FeaturePoint, FeaturePoints, FeatureTag } from "../lib/feature-parts"
import { Plate } from "../lib/plate"
import { IconTile, toneAt, type Tone } from "../lib/tone"
import { LinkButton } from "../lib/link-button"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

export type FeatureGridProps = SectionProps & {
  // Left out when the grid continues the section before it.
  header?: HeaderProps
  items: Feature[]
  columns?: 2 | 3 | 4
  // cards: each feature on a plate. cells: features in a hairline grid, no cards.
  appearance?: "cards" | "cells"
  // icon: a Lucide icon on a tinted tile. number: 01, 02… in mono. none: the title alone.
  marker?: "icon" | "number" | "none"
  // The icons' color: one family for all (indigo by default), or mixed, each item the next family (web.css, Tones).
  tones?: Tone | "mixed"
}

const cols = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" }

// A grid of features (2026-11-21): a heading block, then features as cards or cells, each with a marker, a title,
// a line or two and an optional link. The header's action sits on the right of the heading.
export function FeatureGrid({
  header,
  items,
  columns = 3,
  appearance = "cards",
  marker = "icon",
  tones = "indigo",
  theme,
  surface, pattern, cardPattern,
  id,
  className,
}: FeatureGridProps) {
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      {header && (
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
      )}
      <ul
        className={cn(
          appearance === "cells" ? "web-grid grid-cols-1" : "grid grid-cols-1 gap-(--qd-layout-column-gap)",
          cols[columns]
        )}
      >
        {items.map((item, i) => {
          const tone = (item.tone as Tone) ?? (tones === "mixed" ? toneAt(i) : tones)
          const markerEl = (
            <>
              {marker === "icon" && item.icon && (
                <IconTile name={item.icon} tone={tone} />
              )}
              {marker === "number" && (
                <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              )}
            </>
          )
          const textEl = (
            <div className="flex flex-1 flex-col items-start gap-2">
              <FeatureTag tag={item.tag} className="mb-2" />
              <h3 className={heading.card}>{item.title}</h3>
              {item.text && <p className={type.small}>{item.text}</p>}
            </div>
          )
          const linkEl = item.link && (
            <ArrowLink href={item.link.href} className="text-sm">
              {item.link.label}
            </ArrowLink>
          )
          const points = item.points ?? []
          const half = Math.ceil(points.length / 2)
          // From lg, each side sits close to the visual and mirrors the other: the left one aligned toward it.
          const side = (list: typeof points, className?: string, toward?: boolean) => (
            <div className={cn("flex flex-col gap-10 lg:max-w-64 lg:gap-16", className)}>
              {list.map((p) => (
                <FeaturePoint key={p.text} point={p} tone={tone} className={cn(toward && "lg:items-end lg:text-right")} />
              ))}
            </div>
          )
          // A wide card with its visual in the center (design lead, 2026-11-22): the title above, the points around the
          // visual, half on each side, each with its icon and facing it, and the link under it. On phones: title, visual, points.
          // A wide card with a visual beside it: the text on the left, the visual on the right, from lg.
          const body =
            item.wide && item.visual && item.visualPlacement === "center" ? (
              <div className="flex flex-col items-center gap-10">
                <div className="flex flex-col items-center gap-4 text-center">
                  {markerEl}
                  <FeatureTag tag={item.tag} />
                  <h3 className={heading.card}>{item.title}</h3>
                  {item.text && <p className={cn(type.small, "max-w-xl")}>{item.text}</p>}
                </div>
                <div className="grid w-full grid-cols-1 items-center gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] lg:gap-(--qd-layout-column-gap)">
                  <div className="w-fit max-w-full justify-self-center sm:col-span-2 lg:order-2 lg:col-span-1">{item.visual}</div>
                  {side(points.slice(0, half), "lg:order-1 lg:justify-self-end", true)}
                  {side(points.slice(half), "lg:order-3 lg:justify-self-start")}
                </div>
                {linkEl}
              </div>
            ) : item.wide && item.visual ? (
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)">
                <div className="flex flex-col items-start gap-4">
                  {markerEl}
                  {textEl}
                  <FeaturePoints points={item.points} className="w-full" />
                  {linkEl}
                </div>
                <div className="w-fit max-w-full justify-self-center lg:justify-self-end">{item.visual}</div>
              </div>
            ) : (
              <>
                {markerEl}
                {textEl}
                {item.visual && <div className="py-4">{item.visual}</div>}
                <FeaturePoints points={item.points} />
                {linkEl}
              </>
            )
          return appearance === "cards" ? (
            <Plate as="li" key={item.id ?? `${item.title}-${i}`} id={item.id} className={cn("flex scroll-mt-24 flex-col gap-4 rounded-xl p-6", item.wide && "col-span-full")}>
              {body}
            </Plate>
          ) : (
            <li key={item.id ?? `${item.title}-${i}`} id={item.id} className={cn("flex scroll-mt-24 flex-col gap-4 px-6 py-8", item.wide && "col-span-full")}>
              {body}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
