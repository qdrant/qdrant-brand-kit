import { cn } from "@qdrant/design-system/lib/utils"

import { CustomerLogo } from "../lib/customer-logo"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { type } from "../lib/type"

export type StatsProps = SectionProps & {
  // cells: numbers in a hairline grid. cards: a customer's result on a plate, with its line.
  // Proposal (2026-11-24): lead, the first figure large across the width with the rest in cells under it.
  layout?: "cells" | "cards" | "lead"
  header?: HeaderProps
  // logo: the company's id in the customer logo library, shown instead of its name (2026-11-26, the home page).
  items: { value: string; label?: string; company?: string; logo?: string; text?: string; href?: string }[]
}

// Numbers that prove a claim (2026-11-21): figures in mono, so they read as data, each with its label or source.
// Only real figures, with a source; never a round number made up for the layout.
export function Stats({ layout = "cells", header, items, theme, surface, pattern, cardPattern, id, className }: StatsProps) {
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} spacing="compact" id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min)">
      {header && (
        <SectionHeader kicker={header.kicker} title={header.title} description={header.description} layout="stacked" />
      )}
      {layout === "lead" ? (
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
        // Five cards sit three over two on six columns, so none is left alone on a row (2026-11-26, the
        // home page's results).
        <ul
          className={cn(
            "grid gap-(--qd-layout-column-gap) sm:grid-cols-2",
            items.length === 5
              ? "lg:grid-cols-6 lg:[&>li:nth-child(-n+3)]:col-span-2 lg:[&>li:nth-child(n+4)]:col-span-3"
              : "lg:grid-cols-4"
          )}
        >
          {items.map((item) => {
            const body = (
              <>
                {item.logo ? (
                  <CustomerLogo
                    id={item.logo}
                    version="mono"
                    className="h-7 w-auto max-w-36 self-start text-muted-foreground transition-colors group-hover/card:text-foreground"
                  />
                ) : (
                  item.company && <p className={cn(type.small, "font-mono uppercase")}>{item.company}</p>
                )}
                <p className="text-xl leading-snug font-medium tracking-tight text-foreground">{item.value}</p>
                {item.text && <p className={type.small}>{item.text}</p>}
              </>
            )
            return (
              <Plate as="li" key={item.value} className="group/card rounded-xl">
                {item.href ? (
                  <a href={item.href} aria-label={item.company} className="flex h-full flex-col gap-6 p-6 outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)">
                    {body}
                  </a>
                ) : (
                  <div className="flex h-full flex-col gap-6 p-6">{body}</div>
                )}
              </Plate>
            )
          })}
        </ul>
      )}
    </Section>
  )
}
