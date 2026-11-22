import { cn } from "@qdrant/design-system/lib/utils"

import type { Crumb, ProseBlock } from "../content/listings"
import { Section, type SectionProps } from "../lib/section"
import { heading, type } from "../lib/type"
import { Contents, Prose } from "./article"
import { Crumbs } from "./page-header"

export type LegalProps = SectionProps & {
  breadcrumbs?: Crumb[]
  title: string
  // A line under the title, like the date it took effect, when the page has one.
  updated?: string
  contentsTitle?: string
  // Which headings the contents list: the numbered sections only (2), or their subsections too (3).
  contentsDepth?: 2 | 3
  blocks: ProseBlock[]
}

// A legal page (2026-11-21): the title, then numbered sections in a narrow column for reading, with the contents
// beside them from lg, sticky as the reader scrolls, and above them on smaller screens.
export function Legal({
  breadcrumbs,
  title,
  updated,
  contentsTitle = "Contents",
  contentsDepth = 3,
  blocks,
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: LegalProps) {
  const entries = blocks.flatMap((b) =>
    b.type === "h2" || (b.type === "h3" && Number(contentsDepth) === 3) ? [{ id: b.id, label: b.text, level: b.type === "h2" ? 2 : 3 }] : []
  )
  return (
    <Section
      theme={theme}
      surface={surface}
      pattern={pattern}
      cardPattern={cardPattern}
      spacing="compact"
      id={id}
      className={cn("overflow-visible", className)}
      innerClassName="flex flex-col gap-10 lg:gap-14"
    >
      <header className="flex flex-col gap-6">
        {breadcrumbs && <Crumbs items={breadcrumbs} />}
        <h1 className={heading.page}>{title}</h1>
        {updated && <p className={cn(type.small, "font-mono")}>{updated}</p>}
      </header>
      <div className="web-rule web-bleed" />
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
        <aside className="min-w-0 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <Contents title={contentsTitle} entries={entries} />
        </aside>
        <Prose blocks={blocks} className="max-w-3xl min-w-0" />
      </div>
    </Section>
  )
}
