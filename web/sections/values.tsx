import { cn } from "@qdrant/design-system/lib/utils"

import type { Principle } from "../content/company"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { IconTile, toneAt, type Tone } from "../lib/tone"
import { heading, type } from "../lib/type"
import { Node } from "../lib/node"

export type ValuesProps = SectionProps & {
  header: HeaderProps
  items: Principle[]
  // numbered: the items in a hairline grid of cells, each with its number in mono and a short line from the top.
  // icons: the items on plates, each with an icon tile.
  layout?: "numbered" | "icons"
  // The tiles' color in the icons layout: one family for all, or mixed.
  tones?: Tone | "mixed"
}

const cols = (n: number) => (n === 4 ? "md:grid-cols-2 lg:grid-cols-4" : n % 3 === 0 ? "md:grid-cols-3" : "md:grid-cols-2")

// A short set of principles, reasons or benefits (2026-11-21), three to six, each a title and a line: numbered in
// a cell grid when they read as a list, or on plates with icon tiles. The header's action sits on the right.
export function Values({ header, items, layout = "numbered", tones = "mixed", theme, surface, pattern, cardPattern, id, className }: ValuesProps) {
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
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
      {layout === "numbered" ? (
        <ol className={cn("web-grid grid-cols-1", cols(items.length))}>
          {items.map((item, i) => (
            <li key={item.title} className="flex flex-col gap-10 px-6 py-8 lg:gap-16">
              <span className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
                <Node />
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className={heading.card}>{item.title}</h3>
                <p className={type.small}>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <ul className={cn("grid grid-cols-1 gap-(--qd-layout-column-gap)", cols(items.length))}>
          {items.map((item, i) => (
            <Plate as="li" simple key={item.title} className="flex flex-col gap-4 rounded-xl p-6">
              <IconTile name={item.icon} tone={tones === "mixed" ? toneAt(i) : tones} />
              <div className="flex flex-col gap-2">
                <h3 className={heading.card}>{item.title}</h3>
                <p className={type.small}>{item.text}</p>
              </div>
            </Plate>
          ))}
        </ul>
      )}
    </Section>
  )
}
