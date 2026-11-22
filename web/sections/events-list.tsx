import { ArrowUpRight } from "lucide-react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { EventItem } from "../content/listings"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"
import { Node } from "../lib/node"

export type EventsListProps = SectionProps & {
  // list: one event per row, reaching the rails. cards: events on plates in three columns.
  layout?: "list" | "cards"
  header?: HeaderProps
  upcomingTitle?: string
  upcoming?: EventItem[]
  pastTitle?: string
  past?: EventItem[]
}

// "2026-11-24" as its parts, in English, read in UTC so the day never shifts.
function dateParts(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`)
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { ...o, timeZone: "UTC" }).format(d)
  return { weekday: part({ weekday: "short" }), month: part({ month: "short" }), day: part({ day: "numeric" }), year: part({ year: "numeric" }) }
}

function DateBlock({ iso, className }: { iso: string; className?: string }) {
  const p = dateParts(iso)
  return (
    <time dateTime={iso} className={cn("flex w-16 shrink-0 flex-col items-center rounded-lg border border-(--web-line) py-2 font-mono leading-none", className)}>
      <span className="text-[11px] text-muted-foreground uppercase">{p.month}</span>
      <span className="py-1.5 text-2xl text-foreground tabular-nums">{p.day}</span>
      <span className="text-[11px] text-muted-foreground uppercase">{p.weekday}</span>
    </time>
  )
}

function TypeTag({ value }: { value: string }) {
  return <span className="rounded-sm border border-(--web-line) px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground uppercase">{value}</span>
}

const outside = (href: string) => href.startsWith("http")

// Events the site doesn't link (href "#") render without a link.
function Row({ event }: { event: EventItem }) {
  const link = event.href !== "#"
  const Tag = link ? "a" : "div"
  return (
    <li className="web-rule web-bleed">
      <Tag
        {...(link ? { href: event.href } : {})}
        {...(outside(event.href) ? { target: "_blank", rel: "noreferrer" } : {})}
        className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-3 py-6 outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color) md:grid-cols-[auto_minmax(0,1fr)_14rem_auto] md:items-center md:gap-x-8"
      >
        <DateBlock iso={event.date} />
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <TypeTag value={event.type} />
            <span className="font-mono text-xs text-muted-foreground">{dateParts(event.date).year}</span>
          </div>
          <h3 className={cn(heading.card, link && "group-hover:text-(--web-indigo)")}>{event.title}</h3>
          {event.text && <p className={cn(type.small, "line-clamp-2 max-w-2xl")}>{event.text}</p>}
        </div>
        <p className={cn(type.small, "col-start-2 md:col-start-auto")}>
          <span className="text-foreground">{event.location}</span>
          {event.time && <span className="ml-2 font-mono text-xs">{event.time}</span>}
        </p>
        {link && (
          <ArrowUpRight aria-hidden className="hidden size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-(--web-indigo) md:block" />
        )}
      </Tag>
    </li>
  )
}

function Card({ event }: { event: EventItem }) {
  const link = event.href !== "#"
  return (
    <li className="flex">
      <Plate
        as={link ? "a" : "div"}
        {...(link ? { href: event.href } : {})}
        {...(outside(event.href) ? { target: "_blank", rel: "noreferrer" } : {})}
        className="group flex flex-1 flex-col gap-4 rounded-xl p-6 outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)"
      >
        <div className="flex items-start justify-between gap-4">
          <DateBlock iso={event.date} />
          <TypeTag value={event.type} />
        </div>
        <h3 className={cn(heading.card, link && "group-hover:text-(--web-indigo)")}>{event.title}</h3>
        {event.text && <p className={cn(type.small, "line-clamp-3")}>{event.text}</p>}
        <p className={cn(type.small, "mt-auto flex items-center justify-between gap-4 border-t border-(--web-line) pt-4")}>
          <span className="text-foreground">{event.location}</span>
          {link && <ArrowUpRight aria-hidden className="size-4 shrink-0 group-hover:text-(--web-indigo)" />}
        </p>
      </Plate>
    </li>
  )
}

function Group({ title, events, layout }: { title?: string; events: EventItem[]; layout: "list" | "cards" }) {
  if (!events.length) return null
  return (
    <div className="flex flex-col gap-6">
      {title && (
        <h2 className={cn(type.kicker, "flex items-center gap-2.5")}>
          <Node />
          {title}
          <span className="font-mono tabular-nums">{events.length}</span>
        </h2>
      )}
      {layout === "list" ? (
        <ul className="flex flex-col [&>li:last-child]:border-b [&>li:last-child]:border-(--web-line)">
          {events.map((event) => (
            <Row key={event.date + event.title} event={event} />
          ))}
        </ul>
      ) : (
        <ul className="grid gap-(--qd-layout-column-gap) md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.date + event.title} event={event} />
          ))}
        </ul>
      )}
    </div>
  )
}

// Upcoming and past events (2026-11-21): each with a date block in mono, its type, title, place and a link out.
// Rows reach the rails, like the page's own lines; cards suit a short list.
export function EventsList({
  layout = "list",
  header,
  upcomingTitle,
  upcoming = [],
  pastTitle,
  past = [],
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: EventsListProps) {
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
      <div className="flex flex-col gap-16">
        <Group title={upcomingTitle} events={upcoming} layout={layout} />
        <Group title={pastTitle} events={past} layout={layout} />
      </div>
    </Section>
  )
}
