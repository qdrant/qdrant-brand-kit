import { cn } from "@qdrant/design-system/lib/utils"

import type { Feature } from "../content/sections"
import { ArrowLink } from "../lib/arrow-link"
import { MediaFrame } from "../lib/media-frame"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

export type FeatureRowsProps = SectionProps & {
  header: HeaderProps
  rows: Feature[]
  // Which side the first row's media is on; the rows alternate from there.
  start?: "media-right" | "media-left"
}

// Features one per row, text beside media, alternating sides (2026-11-21). Each row's media sits on a plate in a
// tray; until a page supplies the image, a placeholder holds its place.
export function FeatureRows({ header, rows, start = "media-right", theme, surface, id, className }: FeatureRowsProps) {
  return (
    <Section theme={theme} surface={surface} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader layout="split" kicker={header.kicker} title={header.title} description={header.description} />
      <div className="flex flex-col gap-16 lg:gap-24">
        {rows.map((row, i) => {
          const mediaLeft = (i % 2 === 0) === (start === "media-left")
          return (
            <div key={row.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)">
              <div className={cn("flex flex-col items-start gap-4 lg:max-w-md", mediaLeft ? "lg:order-2 lg:justify-self-end" : "")}>
                <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <h3 className={heading.card}>{row.title}</h3>
                {row.text && <p className={type.body}>{row.text}</p>}
                {row.link && (
                  <ArrowLink href={row.link.href} className="text-sm">
                    {row.link.label}
                  </ArrowLink>
                )}
              </div>
              <div className={cn("web-tray rounded-[calc(var(--radius-xl)+6px)]", mediaLeft && "lg:order-1")}>
                <MediaFrame label="Illustration" className="web-plate" />
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
