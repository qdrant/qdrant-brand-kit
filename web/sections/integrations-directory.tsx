"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { InputGroup, InputGroupAddon, InputGroupInput } from "@qdrant/design-system/components/ui/input-group"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Integration } from "../content/listings"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

export type IntegrationsDirectoryProps = SectionProps & {
  header?: HeaderProps
  // The tab that shows everything, and the categories in order.
  allLabel?: string
  categories: string[]
  searchPlaceholder?: string
  // What shows when the search matches nothing.
  emptyText?: string
  items: Integration[]
}

function Card({ item, showCategory }: { item: Integration; showCategory: boolean }) {
  return (
    <li className="flex">
      <Plate
        as="a"
        href={item.href}
        className="group flex flex-1 flex-col gap-3 rounded-xl p-5 outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)"
      >
        <div className="flex items-start justify-between gap-3">
          {/* The integration's name stands in for its logo until the file is exported. */}
          <h3 className={cn(heading.card, "text-(length:--qd-font-size-18) leading-snug group-hover:text-(--web-indigo)")}>{item.name}</h3>
          {showCategory && (
            <span className="shrink-0 rounded-sm border border-(--web-line) px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground uppercase">
              {item.category}
            </span>
          )}
        </div>
        {item.text && <p className={cn(type.small, "line-clamp-3")}>{item.text}</p>}
      </Plate>
    </li>
  )
}

const grid = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"

// A directory of integrations (2026-11-21): category tabs with their counts, a search field, and cards with the
// name, a line and the category. All shows every category in its own group; a tab or a search shows one flat grid.
// Filtering runs in the browser over the items given.
export function IntegrationsDirectory({
  header,
  allLabel = "All",
  categories,
  searchPlaceholder = "Search",
  emptyText = "No results",
  items,
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: IntegrationsDirectoryProps) {
  const [active, setActive] = React.useState<string>("all")
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()

  const matches = (item: Integration) =>
    !q || `${item.name} ${item.text ?? ""} ${item.category}`.toLowerCase().includes(q)
  const inTab = items.filter((item) => active === "all" || item.category === active)
  const results = inTab.filter(matches)
  const count = (category: string) => items.filter((item) => item.category === category && matches(item)).length
  const tabs = [{ id: "all", label: allLabel, count: items.filter(matches).length }, ...categories.map((c) => ({ id: c, label: c, count: count(c) }))]

  return (
    <Section
      theme={theme}
      surface={surface}
      pattern={pattern}
      cardPattern={cardPattern}
      id={id}
      className={className}
      innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)"
    >
      {header && <SectionHeader kicker={header.kicker} title={header.title} description={header.description} />}

      <div className="flex flex-col gap-8">
        <div className="web-bleed flex flex-col gap-4 border-b border-(--web-line) lg:flex-row lg:items-end lg:justify-between">
          <div role="tablist" aria-label="Categories" className="-mb-px flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const on = tab.id === active
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 border-b-2 px-3 pt-2 pb-3 text-sm whitespace-nowrap outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)",
                    on ? "border-(--web-indigo) text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                  <span className={cn("font-mono text-xs tabular-nums", on ? "text-(--web-indigo)" : "text-muted-foreground")}>{tab.count}</span>
                </button>
              )
            })}
          </div>
          <InputGroup className="mb-3 h-10 bg-card lg:max-w-xs">
            <InputGroupAddon>
              <Search className="size-4" aria-hidden />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={query}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
        </div>

        {results.length === 0 ? (
          <Plate className="rounded-xl px-6 py-16 text-center">
            <p className={type.body}>{emptyText}</p>
          </Plate>
        ) : active === "all" && !q ? (
          <div className="flex flex-col gap-12">
            {categories.map((category) => {
              const list = items.filter((item) => item.category === category)
              if (!list.length) return null
              return (
                <section key={category} className="flex flex-col gap-5" aria-label={category}>
                  <div className="flex items-baseline gap-3">
                    <h2 className={heading.card}>{category}</h2>
                    <span className="font-mono text-sm text-muted-foreground tabular-nums">{list.length}</span>
                  </div>
                  <ul className={grid}>
                    {list.map((item) => (
                      <Card key={item.href} item={item} showCategory={false} />
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        ) : (
          <ul className={grid}>
            {results.map((item) => (
              <Card key={item.href} item={item} showCategory={active === "all"} />
            ))}
          </ul>
        )}
      </div>
    </Section>
  )
}
