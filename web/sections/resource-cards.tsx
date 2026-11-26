import { ChevronRight } from "lucide-react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { Resource } from "../content/listings"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { IconTile, type Tone } from "../lib/tone"
import { heading, type } from "../lib/type"

export type ResourceCardsProps = SectionProps & {
  // grid: cards in three columns. list: one resource per row, its facts on the right from md.
  layout?: "grid" | "list"
  header?: HeaderProps
  items: Resource[]
}

// The icon and color of each kind of resource. Anything else gets a file.
const kinds: Record<string, { icon: string; tone: Tone }> = {
  Article: { icon: "FileText", tone: "indigo" },
  Course: { icon: "GraduationCap", tone: "teal" },
  Guide: { icon: "BookOpen", tone: "blue" },
  Video: { icon: "Play", tone: "purple" },
}

function Tag({ item }: { item: Resource }) {
  return (
    <p className={cn(type.xsmall, "flex flex-wrap items-center gap-x-2 font-mono uppercase")}>
      <span className="text-foreground">{item.type}</span>
      {item.topic && (
        <>
          <span aria-hidden>/</span>
          <span>{item.topic}</span>
        </>
      )}
    </p>
  )
}

function Facts({ item, className }: { item: Resource; className?: string }) {
  return (
    <dl className={cn("flex flex-col gap-1", className)}>
      {item.meta.map((m) => (
        <div key={m.value} className={cn(type.xsmall, "flex flex-wrap gap-x-1.5")}>
          {m.label && <dt className="font-mono uppercase">{m.label}</dt>}
          <dd className="text-foreground">{m.value}</dd>
        </div>
      ))}
    </dl>
  )
}

// Guides, articles and courses to learn from (2026-11-21): each card says what it is (a tag in mono), its title, a
// line, and its facts (who wrote it when, or how long it takes and what it includes). The whole card is a link.
export function ResourceCards({ layout = "grid", header, items, theme, surface, pattern, cardPattern, id, className }: ResourceCardsProps) {
  const action = header?.action ? (
    <LinkButton href={header.action.href} variant="secondary">
      {header.action.label}
    </LinkButton>
  ) : undefined

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
      {header && (
        <SectionHeader
          layout={action ? "action" : "stacked"}
          kicker={header.kicker}
          title={header.title}
          description={header.description}
          actions={action}
        />
      )}
      {layout === "grid" ? (
        <ul className="grid gap-(--web-card-gap) md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const kind = kinds[item.type] ?? { icon: "File", tone: "indigo" as Tone }
            return (
              <li key={item.href} className="flex">
                <Plate as="a" href={item.href} className="group flex flex-1 flex-col gap-4 rounded-xl p-6 outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)">
                  <div className="flex items-center justify-between gap-4">
                    <IconTile name={kind.icon} tone={kind.tone} size="sm" />
                    <ChevronRight aria-hidden className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-(--web-indigo)" />
                  </div>
                  <Tag item={item} />
                  <div className="flex flex-col gap-2">
                    <h3 className={heading.card}>{item.title}</h3>
                    {item.text && <p className={cn(type.small, "line-clamp-3")}>{item.text}</p>}
                  </div>
                  <Facts item={item} className="mt-auto border-t border-(--web-line) pt-4" />
                </Plate>
              </li>
            )
          })}
        </ul>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const kind = kinds[item.type] ?? { icon: "File", tone: "indigo" as Tone }
            return (
              <li key={item.href}>
                <Plate
                  as="a"
                  href={item.href}
                  className="group grid items-center gap-4 rounded-xl p-5 outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color) md:grid-cols-[auto_minmax(0,1fr)_minmax(0,16rem)_auto] md:gap-6 md:p-6"
                >
                  <IconTile name={kind.icon} tone={kind.tone} />
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Tag item={item} />
                    <h3 className={heading.card}>{item.title}</h3>
                    {item.text && <p className={cn(type.small, "line-clamp-2")}>{item.text}</p>}
                  </div>
                  <Facts item={item} />
                  <ChevronRight aria-hidden className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-(--web-indigo) md:block" />
                </Plate>
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}
