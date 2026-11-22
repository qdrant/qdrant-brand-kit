"use client"

import * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@qdrant/design-system/components/ui/accordion"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Faq as FaqItem } from "../content/conversion"
import { LinkButton } from "../lib/link-button"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { type } from "../lib/type"

export type FaqProps = SectionProps & {
  // narrow: a centered 800px column. split: the heading on the left, the questions on the right. categories: tabs
  // per category over the questions.
  layout?: "narrow" | "split" | "categories"
  header: HeaderProps
  items?: FaqItem[]
  categories?: { label: string; items: FaqItem[] }[]
}

// The questions on the website's hairlines: no box around the list, a line between questions, the answer in
// body text.
function Questions({ items }: { items: FaqItem[] }) {
  return (
    <Accordion className="rounded-none border-0 border-y border-(--web-line)">
      {items.map((item) => (
        <AccordionItem key={item.question} value={item.question} className="border-(--web-line) data-open:bg-transparent">
          <AccordionTrigger className="py-5 text-(length:--qd-font-size-16) leading-(--qd-line-height-150) font-medium text-foreground hover:no-underline hover:text-(--web-indigo) aria-expanded:text-foreground">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className={cn(type.body, "pb-6")}>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

// Questions and answers (2026-11-21): the site's own questions, word for word, in an accordion.
export function Faq({ layout = "narrow", header, items = [], categories = [], theme, surface, pattern, cardPattern, id, className }: FaqProps) {
  const [active, setActive] = React.useState(0)
  const tabsId = React.useId()
  const actions = header.action ? (
    <LinkButton href={header.action.href} variant="secondary">
      {header.action.label}
    </LinkButton>
  ) : undefined

  if (layout === "split") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-(--qd-layout-column-gap)">
        <SectionHeader kicker={header.kicker} title={header.title} description={header.description} actions={actions} />
        <Questions items={items} />
      </Section>
    )
  }

  if (layout === "categories") {
    const current = categories[active] ?? categories[0]
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
        <SectionHeader layout={actions ? "action" : "stacked"} kicker={header.kicker} title={header.title} description={header.description} actions={actions} />
        <div className="flex flex-col gap-8">
          <div role="tablist" aria-label="Categories" className="-mx-6 flex gap-1 overflow-x-auto border-b border-(--web-line) px-6 md:mx-0 md:flex-wrap md:px-0">
            {categories.map((c, i) => {
              const on = i === active
              return (
                <button
                  key={c.label}
                  type="button"
                  role="tab"
                  id={`${tabsId}-tab-${i}`}
                  aria-selected={on}
                  aria-controls={`${tabsId}-panel`}
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative shrink-0 px-3 py-3 text-sm whitespace-nowrap outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)",
                    on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c.label}
                  <span aria-hidden className={cn("absolute inset-x-3 -bottom-px h-0.5", on ? "bg-(--web-indigo)" : "bg-transparent")} />
                </button>
              )
            })}
          </div>
          {current && (
            <div role="tabpanel" id={`${tabsId}-panel`} aria-labelledby={`${tabsId}-tab-${active}`} className="mx-auto w-full max-w-(--qd-layout-narrow-content)">
              <Questions key={current.label} items={current.items} />
            </div>
          )}
        </div>
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} width="narrow" id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader align="center" kicker={header.kicker} title={header.title} description={header.description} actions={actions} />
      <Questions items={items} />
    </Section>
  )
}
