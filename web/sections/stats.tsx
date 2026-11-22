import { cn } from "@qdrant/design-system/lib/utils"

import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { type } from "../lib/type"

export type StatsProps = SectionProps & {
  // cells: numbers in a hairline grid. cards: a customer's result on a plate, with its line.
  layout?: "cells" | "cards"
  header?: HeaderProps
  items: { value: string; label?: string; company?: string; text?: string; href?: string }[]
}

// Numbers that prove a claim (2026-11-21): figures in mono, so they read as data, each with its label or source.
// Only real figures, with a source; never a round number made up for the layout.
export function Stats({ layout = "cells", header, items, theme, surface, id, className }: StatsProps) {
  return (
    <Section theme={theme} surface={surface} spacing="compact" id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min)">
      {header && (
        <SectionHeader kicker={header.kicker} title={header.title} description={header.description} layout="stacked" />
      )}
      {layout === "cells" ? (
        <ul className={cn("web-grid", items.length > 3 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3")}>
          {items.map((item) => {
            const inner = (
              <>
                <span className="font-mono text-4xl tracking-tight text-foreground tabular-nums md:text-5xl">{item.value}</span>
                {item.label && <span className={type.small}>{item.label}</span>}
              </>
            )
            return (
              <li key={item.value + item.label} className="flex flex-col gap-2 px-6 py-8">
                {item.href ? (
                  <a href={item.href} className="flex flex-col gap-2 hover:opacity-80">
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <ul className="grid gap-(--qd-layout-column-gap) sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.value} className="web-plate flex flex-col gap-6 rounded-xl p-6">
              {item.company && <p className={cn(type.small, "font-mono uppercase")}>{item.company}</p>}
              <p className="font-mono text-xl leading-snug tracking-tight text-foreground">{item.value}</p>
              {item.text && <p className={type.small}>{item.text}</p>}
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
