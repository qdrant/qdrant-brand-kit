import { cn } from "@qdrant/design-system/lib/utils"

import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"
import { Node } from "../lib/node"
import { Plate } from "../lib/plate"

export type StepsProps = SectionProps & {
  header: HeaderProps
  steps: { label?: string; title?: string; text: string }[]
  // row: steps side by side on a line with a node each. list: steps down a line, beside the heading.
  // Proposals (2026-11-24): cells, each step a cell of a hairline grid led by a large mono number; pipeline, each
  // step on a plate, the plates joined by a line through a node, like stages in a deploy pipeline.
  layout?: "row" | "list" | "cells" | "pipeline"
}

// Steps in order (2026-11-21), joined by a line with a node at each step, the same node as where the page's lines
// meet. Each step has a mono label (Step 01), an optional title and its text.
export function Steps({ header, steps, layout = "row", theme, surface, pattern, cardPattern, id, className }: StepsProps) {
  const label = (s: StepsProps["steps"][number], i: number) => s.label ?? `Step ${String(i + 1).padStart(2, "0")}`

  if (layout === "list") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="grid gap-12 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)">
        <SectionHeader kicker={header.kicker} title={header.title} description={header.description} className="lg:sticky lg:top-24 lg:self-start" />
        <ol className="flex flex-col border-l border-(--web-line)">
          {steps.map((s, i) => (
            <li key={i} className="relative flex flex-col gap-2 pb-10 pl-8 last:pb-0">
              <Node solid className="absolute top-1.5 -left-1" />
              <span className="font-mono text-xs text-muted-foreground uppercase">{label(s, i)}</span>
              {s.title && <h3 className={heading.card}>{s.title}</h3>}
              <p className={cn(type.body, !s.title && "text-foreground")}>{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>
    )
  }

  const cols = steps.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"

  if (layout === "cells") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
        <SectionHeader kicker={header.kicker} title={header.title} description={header.description} layout="split" />
        <ol className={cn("web-grid grid-cols-1", cols)}>
          {steps.map((s, i) => (
            <li key={i} className="flex flex-col gap-3 px-6 pt-8 pb-10">
              <span className="font-mono text-6xl tracking-tight text-muted-foreground/45 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-6 font-mono text-xs text-muted-foreground uppercase">{label(s, i)}</span>
              {s.title && <h3 className={heading.card}>{s.title}</h3>}
              <p className={cn(type.body, !s.title && "text-foreground")}>{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>
    )
  }

  if (layout === "pipeline") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
        <SectionHeader kicker={header.kicker} title={header.title} description={header.description} align="center" className="mx-auto" />
        <ol className={cn("grid gap-10 md:gap-12", cols)}>
          {steps.map((s, i) => (
            <li key={i} className="relative flex">
              {i < steps.length - 1 && (
                <span aria-hidden className="absolute top-1/2 -right-12 hidden w-12 items-center md:flex">
                  <span className="h-px flex-1 bg-(--web-line-strong)" />
                  <Node solid active={i === 0} className="mx-auto" />
                  <span className="h-px flex-1 bg-(--web-line-strong)" />
                </span>
              )}
              <Plate as="div" className="flex flex-1 flex-col gap-3 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground uppercase">{label(s, i)}</span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {i + 1}/{steps.length}
                  </span>
                </div>
                {s.title && <h3 className={heading.card}>{s.title}</h3>}
                <p className={cn(type.body, !s.title && "text-foreground")}>{s.text}</p>
              </Plate>
            </li>
          ))}
        </ol>
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader kicker={header.kicker} title={header.title} description={header.description} />
      <ol className={cn("grid gap-10 md:gap-(--web-card-gap)", steps.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3")}>
        {steps.map((s, i) => (
          <li key={i} className="relative flex flex-col gap-3 border-t border-(--web-line) pt-8">
            <Node solid className="absolute -top-[4.5px] left-0" />
            <span className="font-mono text-xs text-muted-foreground uppercase">{label(s, i)}</span>
            {s.title && <h3 className={heading.card}>{s.title}</h3>}
            <p className={cn(type.body, !s.title && "text-foreground")}>{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
