import { Badge } from "@qdrant/design-system/components/ui/badge"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import type { EventFact, EventSession } from "../content/platform"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { IconTile, toneAt } from "../lib/tone"
import { heading, type } from "../lib/type"

export type EventAgendaProps = SectionProps & {
  header: HeaderProps
  // The event's hero facts (venue, date, hours), each with a Lucide icon, in a cell row under the heading.
  facts?: EventFact[]
  action?: Link
  // tracks: the agenda's tracks as numbered tiles. schedule: the sessions as rows, with times when they're out.
  layout?: "tracks" | "schedule"
  tracks?: { title: string; text?: string; icon?: string }[]
  sessions?: EventSession[]
}

// An event's agenda (2026-11-21): the event's facts in a cell row, then its tracks as tiles or its sessions as a
// schedule. Times, tracks and speakers only as the event page gives them; a session without a time shows none.
export function EventAgenda({
  header,
  facts = [],
  action,
  layout = "tracks",
  tracks = [],
  sessions = [],
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: EventAgendaProps) {
  const actionEl = action ? (
    <LinkButton href={action.href} variant="secondary">
      {action.label}
    </LinkButton>
  ) : undefined
  const timed = sessions.some((s) => s.time)

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
      <div className="flex flex-col gap-10">
        <SectionHeader
          layout={actionEl ? "action" : "stacked"}
          kicker={header.kicker}
          title={header.title}
          description={header.description}
          actions={actionEl}
        />
        {facts.length > 0 && (
          <ul className="web-grid grid-cols-1 sm:grid-cols-3">
            {facts.map((f) => (
              <li key={f.text} className="flex items-center gap-3 px-6 py-4 font-mono text-sm text-foreground">
                <IconTile name={f.icon} size="sm" />
                {f.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      {layout === "schedule" ? (
        <ol className="flex flex-col border-b border-(--web-line)">
          {sessions.map((s) => (
            <li
              key={s.title}
              className={cn(
                "grid gap-x-(--qd-layout-column-gap) gap-y-2 border-t border-(--web-line) py-6",
                timed ? "md:grid-cols-[7rem_10rem_minmax(0,1fr)]" : "md:grid-cols-[12rem_minmax(0,1fr)]"
              )}
            >
              {timed && <span className="font-mono text-sm text-foreground tabular-nums">{s.time}</span>}
              <span className="font-mono text-xs text-muted-foreground uppercase md:pt-1">{s.company}</span>
              <div className="flex flex-col gap-2">
                <h3 className={cn(heading.card, "text-lg")}>{s.title}</h3>
                <p className={type.small}>
                  {s.speakers.map((p, i) => (
                    <span key={p} className="block">
                      {p}
                      {i < s.speakers.length - 1 && <span className="sr-only">; </span>}
                    </span>
                  ))}
                </p>
                {s.track && (
                  <Badge variant="outline" className="font-mono">
                    {s.track}
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <ol className={cn("grid gap-(--qd-layout-column-gap) sm:grid-cols-2", tracks.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
          {tracks.map((t, i) => (
            <Plate as="li" key={t.title} className="flex min-h-48 flex-col justify-between gap-8 rounded-xl p-6">
              <div className="flex items-center justify-between">
                {t.icon && <IconTile name={t.icon} tone={toneAt(i)} />}
                <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className={heading.card}>{t.title}</h3>
                {t.text && <p className={type.small}>{t.text}</p>}
              </div>
            </Plate>
          ))}
        </ol>
      )}
    </Section>
  )
}
