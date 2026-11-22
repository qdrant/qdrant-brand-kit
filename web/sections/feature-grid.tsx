import { cn } from "@qdrant/design-system/lib/utils"

import type { Feature } from "../content/sections"
import { ArrowLink } from "../lib/arrow-link"
import { Icon } from "../lib/icon"
import { LinkButton } from "../lib/link-button"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

export type FeatureGridProps = SectionProps & {
  header: HeaderProps
  items: Feature[]
  columns?: 2 | 3 | 4
  // cards: each feature on a plate. cells: features in a hairline grid, no cards.
  appearance?: "cards" | "cells"
  // icon: a Lucide icon on a small plate. number: 01, 02… in mono. none: the title alone.
  marker?: "icon" | "number" | "none"
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
  theme,
  surface,
  id,
  className,
}: FeatureGridProps) {
  return (
    <Section theme={theme} surface={surface} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
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
      <ul
        className={cn(
          appearance === "cells" ? "web-grid grid-cols-1" : "grid grid-cols-1 gap-(--qd-layout-column-gap)",
          cols[columns]
        )}
      >
        {items.map((item, i) => (
          <li
            key={item.title}
            className={cn("flex flex-col gap-4", appearance === "cards" ? "web-plate rounded-xl p-6" : "px-6 py-8")}
          >
            {marker === "icon" && item.icon && (
              <span className="web-plate grid size-10 place-items-center rounded-lg text-foreground/80">
                <Icon name={item.icon} className="size-5" />
              </span>
            )}
            {marker === "number" && (
              <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            )}
            <div className="flex flex-1 flex-col gap-2">
              <h3 className={heading.card}>{item.title}</h3>
              {item.text && <p className={type.small}>{item.text}</p>}
            </div>
            {item.link && (
              <ArrowLink href={item.link.href} className="text-sm">
                {item.link.label}
              </ArrowLink>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}
