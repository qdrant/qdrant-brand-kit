import { cn } from "@qdrant/design-system/lib/utils"

import type { Release } from "../content/listings"
import { ArrowLink } from "../lib/arrow-link"
import { LinkButton } from "../lib/link-button"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"
import { Inline } from "./blog-grid"

export type ChangelogProps = SectionProps & {
  // timeline: entries down a line, a node each, the date and version on the left from md. compact: one row per
  // release, its first change only, for a page that links to the full notes.
  layout?: "timeline" | "compact"
  header?: HeaderProps
  items: Release[]
}

// "2026-11-16" as "Nov 16, 2026", in UTC so the day never shifts.
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`))

function Version({ value }: { value: string }) {
  return <span className="w-fit rounded-sm border border-(--web-line-strong) px-1.5 py-0.5 font-mono text-xs text-foreground">{value}</span>
}

// Changes grouped by their kind (Features, Improvements, Bug Fixes…), in the order they come.
function groupChanges(changes: Release["changes"]) {
  const groups: { kind: string; items: string[] }[] = []
  for (const c of changes) {
    const g = groups.find((x) => x.kind === c.kind)
    if (g) g.items.push(c.text)
    else groups.push({ kind: c.kind, items: [c.text] })
  }
  return groups
}

// Releases over time (2026-11-21): each a version tag in mono, its date, a title when it has one, its changes
// and links to the notes. Only real versions and dates.
export function Changelog({ layout = "timeline", header, items, theme, surface, pattern, cardPattern, id, className }: ChangelogProps) {
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
        <SectionHeader layout={action ? "action" : "stacked"} kicker={header.kicker} title={header.title} description={header.description} actions={action} />
      )}

      {layout === "compact" ? (
        <ul className="web-bleed flex flex-col border-b border-(--web-line)">
          {items.map((r) => (
            <li key={r.version} className="web-rule grid gap-2 py-5 md:grid-cols-[7rem_8rem_minmax(0,1fr)_auto] md:items-baseline md:gap-6">
              <Version value={r.version} />
              <time dateTime={r.date} className="font-mono text-sm text-muted-foreground">
                {formatDate(r.date)}
              </time>
              <p className={cn(type.small, "min-w-0 text-foreground")}>
                {r.title ?? <Inline text={r.changes[0]?.text ?? ""} />}
              </p>
              {r.links[0] && (
                <ArrowLink href={r.links[0].href} className="text-sm">
                  {r.links[0].label}
                </ArrowLink>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ol className="relative flex flex-col">
          {/* The line, through the nodes. */}
          <span aria-hidden className="absolute top-2 bottom-0 left-[3px] w-px bg-(--web-line) md:left-[calc(11rem+3px)]" />
          {items.map((r, i) => (
            <li key={r.version} className="relative grid gap-4 pb-14 pl-8 last:pb-0 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-0 md:pl-0">
              <span
                aria-hidden
                className={cn(
                  "absolute top-1.5 left-0 size-[7px] rounded-full border md:left-44",
                  i === 0 ? "border-(--web-indigo) bg-(--web-indigo)" : "border-(--web-node) bg-background"
                )}
              />
              <div className="flex flex-row items-center gap-3 md:flex-col md:items-start md:gap-2 md:pr-8">
                <Version value={r.version} />
                <time dateTime={r.date} className="font-mono text-sm text-muted-foreground">
                  {formatDate(r.date)}
                </time>
              </div>
              <div className="flex min-w-0 flex-col gap-5 md:pl-10">
                {r.title && <h3 className={heading.card}>{r.title}</h3>}
                {groupChanges(r.changes).map((g) => (
                  <div key={g.kind} className="flex flex-col gap-2">
                    <p className={cn(type.xsmall, "font-mono uppercase")}>{g.kind}</p>
                    <ul className={cn(type.small, "flex list-disc flex-col gap-1.5 pl-5 marker:text-(--web-line-strong)")}>
                      {g.items.map((t) => (
                        <li key={t}>
                          <Inline text={t} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {r.links.length > 0 && (
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {r.links.map((l) => (
                      <ArrowLink key={l.href} href={l.href} className="text-sm">
                        {l.label}
                      </ArrowLink>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Section>
  )
}
