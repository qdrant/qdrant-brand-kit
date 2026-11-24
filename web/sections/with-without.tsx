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
  layout?: "columns"
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
      <div className="grid gap-(--qd-layout-column-gap) md:grid-cols-2">
        <FitColumn column={use} kind="use" />
        <FitColumn column={avoid} kind="avoid" />
      </div>
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
