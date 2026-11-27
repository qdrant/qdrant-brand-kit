import { cn } from "@qdrant/design-system/lib/utils"

import type { Person } from "../content/company"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

export type TeamGridProps = SectionProps & {
  header: HeaderProps
  people: Person[]
  // grid: a card per person, a square photo slot on top, four columns from lg. compact: rows in a hairline grid,
  // a small round photo beside the name, two columns from md.
  layout?: "grid" | "compact"
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

// A team (2026-11-21): the people the site names, each with their role as written. Their photos stay a
// placeholder, the person's initials on a muted ground, until a page supplies them; never a stock face.
export function TeamGrid({ header, people, layout = "grid", theme, surface, pattern, cardPattern, id, className }: TeamGridProps) {
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
      {layout === "grid" ? (
        <ul className="grid grid-cols-1 gap-(--web-card-gap) sm:grid-cols-2 lg:grid-cols-4">
          {people.map((person) => (
            <Plate as="li" key={person.name} className="flex flex-col gap-5 rounded-xl p-2 pb-6">
              <div
                role="img"
                aria-label={`Photo of ${person.name}`}
                className="grid aspect-square w-full place-items-center rounded-lg border border-(--web-line) bg-muted"
              >
                <span className="font-mono text-3xl tracking-tight text-muted-foreground">{initials(person.name)}</span>
              </div>
              <div className="flex flex-col gap-1 px-4">
                <h3 className={heading.card}>{person.name}</h3>
                <p className={cn(type.small, "font-mono")}>{person.role}</p>
              </div>
            </Plate>
          ))}
        </ul>
      ) : (
        <ul className="web-grid grid-cols-1 md:grid-cols-2">
          {people.map((person) => (
            <li key={person.name} className="flex items-center gap-4 px-6 py-5">
              <span
                role="img"
                aria-label={`Photo of ${person.name}`}
                className="grid size-12 shrink-0 place-items-center rounded-full border border-(--web-line) bg-muted font-mono text-sm text-muted-foreground"
              >
                {initials(person.name)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h3 className={heading.card}>{person.name}</h3>
                <p className={cn(type.small, "font-mono")}>{person.role}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
