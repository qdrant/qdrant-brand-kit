import { Check, Minus } from "lucide-react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { Cell, TableColumn, TableGroup } from "../content/conversion"
import type { Link } from "../content/site"
import { LinkButton } from "../lib/link-button"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { IconTile, toneAt } from "../lib/tone"
import { type } from "../lib/type"

export type ComparisonTableProps = SectionProps & {
  // plans: grouped rows of checks and dashes per plan, the header row sticks on desktop. versus: Qdrant beside
  // another option, text in every cell. matrix: capabilities by deployment option, each column with an icon.
  layout?: "plans" | "versus" | "matrix"
  header: HeaderProps
  // The label over the first column, when the site has one.
  rowHeader?: string
  columns: TableColumn[]
  groups: TableGroup[]
  // A button under each column (plans).
  actions?: (Link | null)[]
}

function CellValue({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <>
        <Check aria-hidden className="size-4 text-(--web-indigo)" />
        <span className="sr-only">Included</span>
      </>
    )
  }
  if (value === false || value === null) {
    return (
      <>
        <Minus aria-hidden className="size-4 text-muted-foreground/60" />
        <span className="sr-only">Not included</span>
      </>
    )
  }
  if (typeof value === "string") return <>{value}</>
  return (
    <>
      {value.text}{" "}
      <a href={value.link.href} className="web-link underline underline-offset-4">
        {value.link.label}
      </a>
    </>
  )
}

// A comparison in a real table (2026-11-21): hairline rows, the first column the label, values as checks,
// dashes or the site's own words. On phones the table scrolls sideways inside its own box; the page never does.
export function ComparisonTable({ layout = "plans", header, rowHeader, columns, groups, actions, theme, surface, pattern, cardPattern, id, className }: ComparisonTableProps) {
  const sticky = layout === "plans"
  const span = columns.length + 1
  // The section clips instead of hiding its overflow, so the plans' header row can stick to the page.
  return (
    <Section
      theme={theme}
      surface={surface}
      pattern={pattern}
      cardPattern={cardPattern}
      id={id}
      className={cn(sticky && "overflow-clip", className)}
      innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)"
    >
      <SectionHeader
        layout={header.action ? "action" : "stacked"}
        kicker={header.kicker}
        title={header.title}
        description={header.description}
        actions={
          header.action ? (
            <LinkButton href={header.action.href} variant="secondary">
              {header.action.label}
            </LinkButton>
          ) : undefined
        }
      />
      <div className={cn("overflow-x-auto border-y border-(--web-line) web-bleed", sticky && "lg:overflow-visible")}>
        <table className={cn("w-full border-collapse text-left", layout === "versus" ? "min-w-[820px]" : "min-w-[640px]")}>
          <thead className={cn(sticky && "lg:sticky lg:top-0 lg:z-10")}>
            <tr className="border-b border-(--web-line-strong) bg-background">
              <th scope="col" className={cn(type.xsmall, "w-[28%] py-4 pr-6 align-bottom font-mono font-normal uppercase")}>
                {rowHeader}
              </th>
              {columns.map((col, i) => (
                <th
                  key={col.label}
                  scope="col"
                  className={cn(
                    "relative px-4 py-4 align-bottom text-sm font-medium text-foreground",
                    col.highlight && "bg-(--web-tray)"
                  )}
                >
                  {col.highlight && <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-(--web-indigo)" />}
                  <span className="flex flex-col items-start gap-3">
                    {layout === "matrix" && col.icon && <IconTile name={col.icon} tone={toneAt(i)} size="sm" />}
                    {col.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((group, gi) => (
            <tbody key={group.title ?? gi}>
              {group.title && (
                <tr>
                  <th scope="colgroup" colSpan={span} className={cn(type.xsmall, "pt-8 pb-3 font-mono font-normal text-foreground uppercase")}>
                    {group.title}
                  </th>
                </tr>
              )}
              {group.rows.map((row) => (
                <tr key={row.label} className="border-b border-(--web-line) last:border-b-0">
                  <th scope="row" className={cn(type.small, "py-4 pr-6 align-top font-normal text-foreground")}>
                    {row.label}
                  </th>
                  {columns.map((col, ci) => (
                    <td
                      key={col.label}
                      className={cn(
                        type.small,
                        "px-4 py-4 align-top",
                        col.highlight && "bg-(--web-tray) text-foreground"
                      )}
                    >
                      <CellValue value={row.values[ci] ?? null} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
          {actions && (
            <tfoot>
              <tr className="border-t border-(--web-line-strong)">
                <td />
                {columns.map((col, i) => {
                  const a = actions[i]
                  return (
                    <td key={col.label} className={cn("px-4 py-5", col.highlight && "bg-(--web-tray)")}>
                      {a && (
                        <LinkButton href={a.href} variant={col.highlight ? "default" : "secondary"} size="sm">
                          {a.label}
                        </LinkButton>
                      )}
                    </td>
                  )
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Section>
  )
}
