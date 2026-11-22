import { cn } from "@qdrant/design-system/lib/utils"

import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

export type StepsProps = SectionProps & {
  header: HeaderProps
  steps: { label?: string; title?: string; text: string }[]
  // row: steps side by side on a line with a node each. list: steps down a line, beside the heading.
  layout?: "row" | "list"
}

// Steps in order (2026-11-21), joined by a line with a node at each step, the same node as where the page's lines
// meet. Each step has a mono label (Step 01), an optional title and its text.
export function Steps({ header, steps, layout = "row", theme, surface, id, className }: StepsProps) {
  const label = (s: StepsProps["steps"][number], i: number) => s.label ?? `Step ${String(i + 1).padStart(2, "0")}`

  if (layout === "list") {
    return (
      <Section theme={theme} surface={surface} id={id} className={className} innerClassName="grid gap-12 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)">
        <SectionHeader kicker={header.kicker} title={header.title} description={header.description} className="lg:sticky lg:top-24 lg:self-start" />
        <ol className="flex flex-col border-l border-(--web-line)">
          {steps.map((s, i) => (
            <li key={i} className="relative flex flex-col gap-2 pb-10 pl-8 last:pb-0">
              <span aria-hidden className="absolute top-1.5 -left-1 size-[7px] rounded-full border border-(--web-line-strong) bg-background" />
              <span className="font-mono text-xs text-muted-foreground uppercase">{label(s, i)}</span>
              {s.title && <h3 className={heading.card}>{s.title}</h3>}
              <p className={cn(type.body, !s.title && "text-foreground")}>{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader kicker={header.kicker} title={header.title} description={header.description} />
      <ol className={cn("grid gap-10 md:gap-(--qd-layout-column-gap)", steps.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3")}>
        {steps.map((s, i) => (
          <li key={i} className="relative flex flex-col gap-3 border-t border-(--web-line) pt-8">
            <span aria-hidden className="absolute -top-1 left-0 size-[7px] rounded-full border border-(--web-line-strong) bg-background" />
            <span className="font-mono text-xs text-muted-foreground uppercase">{label(s, i)}</span>
            {s.title && <h3 className={heading.card}>{s.title}</h3>}
            <p className={cn(type.body, !s.title && "text-foreground")}>{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
