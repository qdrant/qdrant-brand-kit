import { cn } from "@qdrant/design-system/lib/utils"

import type { Feature } from "../content/sections"
import { ArrowLink } from "../lib/arrow-link"
import { FeaturePoints, FeatureTag } from "../lib/feature-parts"
import { LinkButton } from "../lib/link-button"
import { MediaFrame } from "../lib/media-frame"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { IconTile, type Tone } from "../lib/tone"
import { heading, type } from "../lib/type"

export type FeatureRowsProps = SectionProps & {
  // Optional (2026-11-26): without it, each row's title is the section's heading (an h2), and a single row is the
  // whole section: its tag as the kicker, its title at section size, its points, and its link as a button.
  header?: HeaderProps
  rows: Feature[]
  // Which side the first row's media is on; the rows alternate from there.
  start?: "media-right" | "media-left"
}

// Features one per row, text beside media, alternating sides (2026-11-21). Each row's media sits on a plate in a
// tray: the row's `visual` (a product screen or diagram from web/visuals), or a placeholder until a page supplies
// one. A row starts with its icon on a tile, or its number; it can carry a tag, labeled points and an id to jump to.
export function FeatureRows({ header, rows, start = "media-right", theme, surface, pattern, cardPattern, id, className }: FeatureRowsProps) {
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      {header && (
        <SectionHeader
          layout="split"
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
      <div className="flex flex-col gap-16 lg:gap-24">
        {rows.map((row, i) => {
          const mediaLeft = (i % 2 === 0) === (start === "media-left")
          const single = !header && rows.length === 1
          return (
            <div key={row.title} id={row.id} className="grid scroll-mt-24 grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)">
              {single ? (
                <div className={cn("flex flex-col items-start gap-8 lg:max-w-lg", mediaLeft ? "lg:order-2 lg:justify-self-end" : "")}>
                  <SectionHeader kicker={row.tag} title={row.title} description={row.text} />
                  <FeaturePoints points={row.points} className="w-full" />
                  {row.link && (
                    <LinkButton href={row.link.href} variant="secondary">
                      {row.link.label}
                    </LinkButton>
                  )}
                </div>
              ) : (
              <div className={cn("flex flex-col items-start gap-4 lg:max-w-md", mediaLeft ? "lg:order-2 lg:justify-self-end" : "")}>
                {row.icon ? (
                  <IconTile name={row.icon} tone={(row.tone as Tone) ?? "indigo"} />
                ) : (
                  <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                )}
                <FeatureTag tag={row.tag} />
                {header ? <h3 className={heading.card}>{row.title}</h3> : <h2 className={heading.card}>{row.title}</h2>}
                {row.text && <p className={type.body}>{row.text}</p>}
                <FeaturePoints points={row.points} className="w-full" />
                {row.link && (
                  <ArrowLink href={row.link.href} className="text-sm">
                    {row.link.label}
                  </ArrowLink>
                )}
              </div>
              )}
              {row.visual && row.visualFrame === "none" ? (
                <div className={cn("w-fit max-w-full justify-self-center", mediaLeft ? "lg:order-1 lg:justify-self-start" : "lg:justify-self-end")}>
                  {row.visual}
                </div>
              ) : row.visual ? (
                <div
                  className={cn(
                    "web-tray w-fit max-w-full justify-self-center rounded-[calc(var(--radius-xl)+6px)]",
                    mediaLeft ? "lg:order-1 lg:justify-self-start" : "lg:justify-self-end"
                  )}
                >
                  <Plate className="overflow-hidden rounded-xl">{row.visual}</Plate>
                </div>
              ) : (
                <div className={cn("web-tray rounded-[calc(var(--radius-xl)+6px)]", mediaLeft && "lg:order-1")}>
                  <MediaFrame label="Illustration" className="web-plate" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Section>
  )
}
