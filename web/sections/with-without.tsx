import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import type { FitItem } from "../content/platform"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { IconTile } from "../lib/tone"
import { heading, type } from "../lib/type"

type Column = { title: string; description?: string; items: FitItem[] }

export type WithWithoutProps = SectionProps & {
  header: HeaderProps
  // When to use it, each item with a check in a teal tile.
  use: Column
  // When not to, each item with an x in an orange tile.
  avoid: Column
  // A line under both columns, and an action.
  note?: string
  action?: Link
  // columns: the two lists side by side, each on a plate.
  // Proposal (2026-11-24): diff, both lists in one code window read as a diff, each list's title a hunk header,
  // the cases for it as added lines (+, teal) and the cases against it as removed ones (-, orange).
  layout?: "columns" | "diff"
}

function FitColumn({ column, kind }: { column: Column; kind: "use" | "avoid" }) {
  return (
    <Plate as="div" className="flex flex-col gap-6 rounded-xl p-6 md:p-8">
      <div className="flex flex-col gap-2">
        <h3 className={heading.card}>{column.title}</h3>
        {column.description && <p className={type.small}>{column.description}</p>}
      </div>
      <ul className="flex flex-col">
        {column.items.map((item) => (
          <li key={item.title} className="flex gap-4 border-t border-(--web-line) py-5 last:pb-0">
            <IconTile name={kind === "use" ? "Check" : "X"} tone={kind === "use" ? "teal" : "orange"} size="sm" />
            <div className="flex flex-col gap-1.5">
              <h4 className={cn(heading.card, "text-base")}>{item.title}</h4>
              <p className={type.small}>{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Plate>
  )
}

// When to use a product and when not to (2026-11-21): two lists side by side, checks in teal tiles and x marks in
// orange tiles, so a reader can rule themselves in or out. Both lists come from the product page, word for word.
export function WithWithout({
  header,
  use,
  avoid,
  note,
  action,
  layout = "columns",
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: WithWithoutProps) {
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
      <SectionHeader kicker={header.kicker} title={header.title} description={header.description} />
      {layout === "diff" ? (
        <div className="web-tray rounded-[calc(var(--radius-xl)+6px)]">
          <Plate as="div" className="overflow-hidden rounded-xl font-mono text-sm">
            <div className="flex items-center gap-2 border-b border-(--web-line) px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span key={i} aria-hidden className="web-window-dot size-2.5 rounded-full" />
              ))}
            </div>
            {([
              [use, "use"],
              [avoid, "avoid"],
            ] as const).map(([column, kind]) => (
              <div key={kind}>
                <p className="border-b border-(--web-line) bg-(--web-tray) px-5 py-2.5 text-xs text-muted-foreground">
                  <span className="text-(--web-indigo-text)">@@</span> {column.title}{" "}
                  <span className="text-(--web-indigo-text)">@@</span>
                  {column.description && <span className="ml-3 font-sans">{column.description}</span>}
                </p>
                <ul>
                  {column.items.map((item) => (
                    <li
                      key={item.title}
                      className={cn(
                        "grid grid-cols-[2rem_minmax(0,1fr)] border-b border-(--web-line) px-3 py-4 md:grid-cols-[2rem_minmax(0,2fr)_minmax(0,3fr)] md:gap-6",
                        kind === "use" ? "bg-(--web-tone-teal-bg)/40" : "bg-(--web-tone-orange-bg)/40"
                      )}
                    >
                      <span aria-label={kind === "use" ? "For" : "Against"} className={cn("text-center", kind === "use" ? "text-(--web-tone-teal-fg)" : "text-(--web-tone-orange-fg)")}>
                        {kind === "use" ? "+" : "-"}
                      </span>
                      <span className="font-sans font-medium text-foreground">{item.title}</span>
                      <span className="col-start-2 font-sans text-muted-foreground md:col-start-3">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Plate>
        </div>
      ) : (
        <div className="grid gap-(--qd-layout-column-gap) md:grid-cols-2">
          <FitColumn column={use} kind="use" />
          <FitColumn column={avoid} kind="avoid" />
        </div>
      )}
      {(note || action) && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {note && (
            <p className={cn(type.small, "flex items-center gap-3")}>
              <IconTile name="Info" size="sm" />
              {note}
            </p>
          )}
          {action && (
            <div className="shrink-0">
              <LinkButton href={action.href}>{action.label}</LinkButton>
            </div>
          )}
        </div>
      )}
    </Section>
  )
}
