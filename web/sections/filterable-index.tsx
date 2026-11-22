"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, LayoutGrid, List, Search } from "lucide-react"

import { Button } from "@qdrant/design-system/components/ui/button"
import { Checkbox } from "@qdrant/design-system/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@qdrant/design-system/components/ui/input-group"
import { cn } from "@qdrant/design-system/lib/utils"

import type { DirectoryItem, FacetGroup } from "../content/listings"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { heading, type } from "../lib/type"

export type FilterableIndexProps = SectionProps & {
  // grid: the results start as cards; the reader can switch to a list.
  layout?: "grid"
  // The sidebar's title, the filter groups and their options.
  filterTitle?: string
  groups: FacetGroup[]
  searchPlaceholder?: string
  clearLabel?: string
  // What the count says after its number ("results"), and what shows when nothing matches.
  countLabel?: string
  emptyText?: string
  items: DirectoryItem[]
  // Cards per page.
  pageSize?: number
}

type Selection = Record<string, string[]>

// The numbers to show in the pagination: the first, the last, and the current page with its neighbors; null for a gap.
function pageList(current: number, total: number): (number | null)[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total))
  const sorted = [...pages].sort((a, b) => a - b)
  const out: (number | null)[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] ?? p) > 1) out.push(null)
    out.push(p)
  })
  return out
}

// A directory page's body (2026-11-21): filter groups with checkboxes on the left, then a search field, the result
// count, a grid or list toggle, the cards and numbered pages. Filtering runs in the browser over the items given:
// options in one group widen the results (any of them), groups narrow them (all groups).
export function FilterableIndex({
  filterTitle = "Filters",
  groups,
  searchPlaceholder = "Search",
  clearLabel = "Clear",
  countLabel = "results",
  emptyText = "No results",
  items,
  pageSize = 9,
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: FilterableIndexProps) {
  const [selected, setSelected] = React.useState<Selection>({})
  const [query, setQuery] = React.useState("")
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const [page, setPage] = React.useState(1)

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (q && !`${item.name} ${item.title}`.toLowerCase().includes(q)) return false
      return Object.entries(selected).every(
        ([group, values]) => values.length === 0 || values.some((v) => item.facets[group]?.includes(v))
      )
    })
  }, [items, query, selected])

  const pages = Math.max(1, Math.ceil(results.length / pageSize))
  const current = Math.min(page, pages)
  const shown = results.slice((current - 1) * pageSize, current * pageSize)
  const active = Object.values(selected).reduce((n, v) => n + v.length, 0)

  const toggle = (group: string, option: string, on: boolean) => {
    setSelected((s) => {
      const list = s[group] ?? []
      return { ...s, [group]: on ? [...list, option] : list.filter((o) => o !== option) }
    })
    setPage(1)
  }
  const clear = () => {
    setSelected({})
    setQuery("")
    setPage(1)
  }

  return (
    <Section
      theme={theme}
      surface={surface}
      pattern={pattern}
      cardPattern={cardPattern}
      id={id}
      className={cn("overflow-visible", className)}
      innerClassName="grid items-start gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12"
    >
      <aside className="flex flex-col gap-6 lg:sticky lg:top-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className={type.kicker}>{filterTitle}</h2>
          {active > 0 && (
            <Button variant="ghost" size="xs" onClick={clear}>
              {clearLabel}
            </Button>
          )}
        </div>
        {/* On phones the groups sit in a scrolling row of columns, so the results stay near the top. */}
        <div className="-mx-6 flex gap-8 overflow-x-auto px-6 pb-2 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
          {groups.map((group) => (
            <fieldset key={group.id} className="flex min-w-44 flex-col gap-3 lg:border-t lg:border-(--web-line) lg:py-5">
              <legend className="contents">
                <span className={cn(type.small, "font-medium text-foreground")}>{group.label}</span>
              </legend>
              <ul className="flex flex-col gap-2.5">
                {group.options.map((option) => {
                  const checked = selected[group.id]?.includes(option) ?? false
                  const count = items.filter((item) => item.facets[group.id]?.includes(option)).length
                  return (
                    <li key={option}>
                      <label className={cn(type.small, "flex cursor-pointer items-center gap-2.5 hover:text-foreground", checked && "text-foreground")}>
                        <Checkbox checked={checked} onCheckedChange={(on) => toggle(group.id, option, on === true)} />
                        <span className="flex-1">{option}</span>
                        <span className="font-mono text-xs tabular-nums">{count}</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </fieldset>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <InputGroup className="h-10 bg-card sm:max-w-sm">
            <InputGroupAddon>
              <Search className="size-4" aria-hidden />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={query}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />
          </InputGroup>
          <div className="flex items-center justify-between gap-4 sm:ml-auto">
            <p className={type.small} aria-live="polite">
              <span className="font-mono text-foreground tabular-nums">{results.length}</span> {countLabel}
            </p>
            <div role="group" aria-label="View" className="flex rounded-lg border border-(--web-line) p-0.5">
              {(["grid", "list"] as const).map((v) => {
                const Glyph = v === "grid" ? LayoutGrid : List
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={view === v}
                    aria-label={v === "grid" ? "Grid" : "List"}
                    onClick={() => setView(v)}
                    className={cn(
                      "grid size-8 place-items-center rounded-md outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)",
                      view === v ? "bg-muted text-(--web-indigo)" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Glyph className="size-4" aria-hidden />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {shown.length === 0 ? (
          <Plate className="flex flex-col items-center gap-4 rounded-xl px-6 py-16 text-center">
            <p className={type.body}>{emptyText}</p>
            <Button variant="secondary" onClick={clear}>
              {clearLabel}
            </Button>
          </Plate>
        ) : (
          <ul className={cn(view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3")}>
            {shown.map((item) => (
              <li key={item.href} className="flex">
                <Plate
                  as="a"
                  href={item.href}
                  className={cn(
                    "group flex flex-1 rounded-xl outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)",
                    view === "grid" ? "flex-col gap-4 p-5" : "flex-col gap-2 p-5 md:flex-row md:items-center md:gap-6"
                  )}
                >
                  {/* The company's name stands in for its logo until the file is exported. */}
                  <span className={cn("font-display text-lg font-medium tracking-tight text-foreground", view === "list" && "md:w-44 md:shrink-0")}>
                    {item.name}
                  </span>
                  <h3 className={cn(heading.card, "flex-1 text-(length:--qd-font-size-18) leading-snug group-hover:text-(--web-indigo)", view === "list" && "text-(length:--qd-font-size-16)")}>
                    {item.title}
                  </h3>
                  <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", type.xsmall, view === "grid" && "mt-auto border-t border-(--web-line) pt-3")}>
                    {item.facets.industry?.[0] && <span className="font-mono uppercase">{item.facets.industry[0]}</span>}
                    {item.meta && <span className="ml-auto font-mono">{item.meta}</span>}
                  </div>
                </Plate>
              </li>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav aria-label="Pages" className="flex items-center justify-center gap-1 pt-4">
            <Button variant="ghost" size="icon" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)}>
              <ChevronLeft />
            </Button>
            {pageList(current, pages).map((p, i) =>
              p === null ? (
                <span key={`gap-${i}`} aria-hidden className="w-6 text-center font-mono text-sm text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === current ? "outline" : "ghost"}
                  size="icon"
                  aria-current={p === current ? "page" : undefined}
                  onClick={() => setPage(p)}
                  className={cn("font-mono tabular-nums", p === current && "text-(--web-indigo)")}
                >
                  {p}
                </Button>
              )
            )}
            <Button variant="ghost" size="icon" aria-label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)}>
              <ChevronRight />
            </Button>
          </nav>
        )}
      </div>
    </Section>
  )
}
