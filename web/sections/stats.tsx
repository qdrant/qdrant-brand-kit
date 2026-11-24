import { cn } from "@qdrant/design-system/lib/utils"

import { Node } from "../lib/node"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { type } from "../lib/type"

export type StatsProps = SectionProps & {
  // cells: numbers in a hairline grid. cards: a customer's result on a plate, with its line.
  // Proposals (2026-11-24): readout, the figures as rows of an instrument board, label left and figure right on one
  // line; lead, the first figure large across the width with the rest in cells under it.
  layout?: "cells" | "cards" | "readout" | "lead"
  header?: HeaderProps
  items: { value: string; label?: string; company?: string; text?: string; href?: string }[]
}

// Numbers that prove a claim (2026-11-21): figures in mono, so they read as data, each with its label or source.
// Only real figures, with a source; never a round number made up for the layout.
export function Stats({ layout = "cells", header, items, theme, surface, pattern, cardPattern, id, className }: StatsProps) {
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} spacing="compact" id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min)">
      {header && (
        <SectionHeader kicker={header.kicker} title={header.title} description={header.description} layout="stacked" />
      )}
      {layout === "readout" ? (
        <Plate as="div" className="rounded-xl p-2">
          <ul className="flex flex-col">
            {items.map((item) => {
              const row = (
                <>
                  <span className="flex min-w-0 items-center gap-3">
                    <Node />
                    <span className="truncate font-mono text-sm tracking-[0.12em] text-muted-foreground uppercase">{item.label}</span>
                  </span>
                  <span aria-hidden className="h-px min-w-8 flex-1 border-t border-dashed border-(--web-line-strong)" />
                  <span className="font-mono text-3xl tracking-tight text-foreground tabular-nums md:text-4xl">{item.value}</span>
                </>
              )
              return (
                <li key={item.value + item.label} className="border-b border-(--web-line) last:border-b-0">
                  {item.href ? (
                    <a href={item.href} className="flex items-center gap-4 rounded-lg px-4 py-5 hover:bg-(--web-tray) md:px-6">
                      {row}
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 px-4 py-5 md:px-6">{row}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </Plate>
      ) : layout === "lead" ? (
        <ul className="web-grid grid-cols-1 md:grid-cols-3">
          {items.map((item, i) => (
            <li
              key={item.value + item.label}
              className={cn(
                "flex flex-col gap-2 px-6",
                i === 0 ? "py-12 md:col-span-3 md:flex-row md:items-end md:justify-between md:gap-10 md:py-14" : "py-8"
              )}
            >
              <span
                className={cn(
                  "font-mono tracking-tight text-foreground tabular-nums",
                  i === 0 ? "text-6xl md:text-8xl" : "text-4xl"
                )}
              >
                {item.value}
              </span>
              {item.label &&
                (item.href ? (
                  <a href={item.href} className={cn(type.small, "web-link-quiet", i === 0 && "md:pb-3 md:text-base")}>
                    {item.label}
                  </a>
                ) : (
                  <span className={cn(type.small, i === 0 && "md:pb-3 md:text-base")}>{item.label}</span>
                ))}
            </li>
          ))}
        </ul>
      ) : layout === "cells" ? (
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
            <Plate as="li" key={item.value} className="flex flex-col gap-6 rounded-xl p-6">
              {item.company && <p className={cn(type.small, "font-mono uppercase")}>{item.company}</p>}
              <p className="font-mono text-xl leading-snug tracking-tight text-foreground">{item.value}</p>
              {item.text && <p className={type.small}>{item.text}</p>}
            </Plate>
          ))}
        </ul>
      )}
    </Section>
  )
}
