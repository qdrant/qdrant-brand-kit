import { cn } from "@qdrant/design-system/lib/utils"

import type { Feature } from "../content/sections"
import { ArrowLink } from "../lib/arrow-link"
import { FeaturePoints, FeatureTag } from "../lib/feature-parts"
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
          const body = (
            <>
            {marker === "icon" && item.icon && (
              <IconTile name={item.icon} tone={(item.tone as Tone) ?? (tones === "mixed" ? toneAt(i) : tones)} />
            )}
            {marker === "number" && (
              <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            )}
            <div className="flex flex-1 flex-col items-start gap-2">
              <FeatureTag tag={item.tag} className="mb-2" />
              <h3 className={heading.card}>{item.title}</h3>
              {item.text && <p className={type.small}>{item.text}</p>}
            </div>
            {item.visual && <div className="py-4">{item.visual}</div>}
            <FeaturePoints points={item.points} />
            {item.link && (
              <ArrowLink href={item.link.href} className="text-sm">
                {item.link.label}
              </ArrowLink>
            )}
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
