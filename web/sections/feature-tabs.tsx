"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { Feature } from "../content/sections"
import { MediaFrame } from "../lib/media-frame"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"
import { Node } from "../lib/node"

export type FeatureTabsProps = SectionProps & {
  header: HeaderProps
  items: Feature[]
}

// Features as a list on the left that switches the media on the right (2026-11-21). The active item shows its
// text and a node on the rail beside the list; the others show their title only. On phones the list stacks above
// the media.
export function FeatureTabs({ header, items, theme, surface, pattern, cardPattern, id, className }: FeatureTabsProps) {
  const [active, setActive] = React.useState(0)
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader kicker={header.kicker} title={header.title} description={header.description} />
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-(--qd-layout-column-gap)">
        <ul role="tablist" aria-orientation="vertical" className="flex flex-col border-l border-(--web-line)">
          {items.map((item, i) => {
            const on = i === active
            return (
              <li key={item.title} className="relative">
                <Node solid active={on} className="absolute top-5 -left-1" />
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                  className="flex w-full flex-col gap-2 py-3.5 pl-6 text-left outline-none focus-visible:underline"
                >
                  <span className={cn(heading.card, "text-lg transition-colors", !on && "text-muted-foreground hover:text-foreground")}>
                    {item.title}
                  </span>
                  {on && item.text && <span className={type.small}>{item.text}</span>}
                </button>
              </li>
            )
          })}
        </ul>
        <div className="web-tray rounded-[calc(var(--radius-xl)+6px)]">
          <MediaFrame label={items[active]?.title ?? "Image"} className="web-plate" />
        </div>
      </div>
    </Section>
  )
}
