import { Check } from "lucide-react"

import { cn } from "@qdrant/design-system/lib/utils"

import { LinkButton } from "../lib/link-button"
import { MediaFrame } from "../lib/media-frame"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

export type BentoProps = SectionProps & {
  header: HeaderProps
  // The large tile: a title and a checklist.
  list: { title?: string; items: string[] }
  // The small tiles: a caption each, over a media slot.
  tiles: string[]
}

// Tiles of different sizes in one grid (2026-11-21): a large tile with a checklist beside smaller tiles, each a
// caption over a media slot. Every tile is a plate; the media slots are placeholders until a page supplies them.
export function Bento({ header, list, tiles, theme, surface, id, className }: BentoProps) {
  return (
    <Section theme={theme} surface={surface} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader
        layout="action"
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
      <div className="grid gap-(--qd-layout-column-gap) md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
        <div className="web-plate flex flex-col gap-6 rounded-xl p-8 lg:row-span-2">
          {list.title && <h3 className={heading.card}>{list.title}</h3>}
          <ul className="flex flex-col gap-4">
            {list.items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-(--web-line-strong)">
                  <Check className="size-3 text-foreground/80" aria-hidden />
                </span>
                <span className={cn(type.body, "text-foreground")}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {tiles.map((tile, i) => (
          <div key={tile} className={cn("web-plate flex flex-col gap-4 rounded-xl p-4", i === 0 && "lg:col-span-2")}>
            <MediaFrame label="Image" className="aspect-auto min-h-44 flex-1 rounded-lg border-0 bg-transparent" />
            <p className={cn(type.small, "px-2 pb-1 font-medium text-foreground")}>{tile}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
