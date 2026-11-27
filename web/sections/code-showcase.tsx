"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import { Code, languageOf } from "../lib/code"
import { LinkButton } from "../lib/link-button"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { type } from "../lib/type"

export type CodeShowcaseProps = SectionProps & {
  header: HeaderProps
  // The same call in each language, one tab each.
  tabs: { label: string; file?: string; code: string }[]
  // What the call returns, beside the code.
  result?: { label?: string; code: string }
  // split: code and result side by side under the heading. aside: the heading on the left, the code on the right.
  layout?: "split" | "aside"
}

// Code beside what it returns (2026-11-21): language tabs over one code panel, and the response next to it, on
// plates in one tray, so a developer sees the call and its result together.
export function CodeShowcase({ header, tabs, result, layout = "split", theme, surface, pattern, cardPattern, id, className }: CodeShowcaseProps) {
  const [active, setActive] = React.useState(0)
  const tab = tabs[active] ?? tabs[0] ?? { label: "", code: "" }

  const panel = (
    <div className={cn("web-tray grid gap-1.5 rounded-[calc(var(--radius-xl)+6px)]", result && layout === "split" && "lg:grid-cols-2")}>
      <figure className="web-plate flex min-w-0 flex-col overflow-hidden rounded-xl">
        <div role="tablist" className="flex items-center gap-1 border-b border-(--web-line) px-2 py-1.5">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "rounded-md px-3 py-1.5 font-mono text-xs outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)",
                i === active ? "web-selected" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
          {tab.file && <span className="ml-auto pr-2 font-mono text-xs text-muted-foreground">{tab.file}</span>}
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-foreground">
          <Code code={tab.code} language={languageOf(tab.file) !== "text" ? languageOf(tab.file) : languageOf(tab.label)} />
        </pre>
      </figure>
      {result && (
        <figure className="web-plate flex min-w-0 flex-col overflow-hidden rounded-xl">
          <figcaption className="border-b border-(--web-line) px-4 py-3 font-mono text-xs text-muted-foreground">
            Response
          </figcaption>
          <pre className="flex-1 overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-foreground">
            <Code code={result.code} language="json" />
          </pre>
          {result.label && <p className={cn(type.xsmall, "border-t border-(--web-line) px-4 py-3")}>{result.label}</p>}
        </figure>
      )}
    </div>
  )

  const action = header.action ? (
    <LinkButton href={header.action.href} variant="secondary">
      {header.action.label}
    </LinkButton>
  ) : undefined

  if (layout === "aside") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="grid items-start gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-(--qd-layout-column-gap)">
        <SectionHeader kicker={header.kicker} title={header.title} description={header.description} actions={action} />
        {panel}
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader layout={action ? "action" : "stacked"} kicker={header.kicker} title={header.title} description={header.description} actions={action} />
      {panel}
    </Section>
  )
}
