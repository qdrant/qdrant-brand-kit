import { cn } from "@qdrant/design-system/lib/utils"

import { LinkButton } from "../lib/link-button"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"

export type SponsorTiersProps = SectionProps & {
  header?: HeaderProps
  // Highest tier first. Each sponsor is its name, and its logo file in web/assets/logos when there is one; without
  // a file the name stands in, set as text.
  tiers: { name: string; sponsors: (string | { name: string; src?: string })[] }[]
  // tiers: one cell grid per tier, larger cells for higher tiers.
  layout?: "tiers"
}

// Cell size and columns by rank: the first tier gets the largest cells. One column on phones; from the breakpoint,
// empty cells fill the last row so the grid's lines stay whole.
const ranks = [
  { cols: "grid-cols-1 sm:grid-cols-2", count: 2, filler: "hidden sm:block", cell: "h-40 md:h-48", name: "text-2xl md:text-3xl" },
  { cols: "grid-cols-1 md:grid-cols-3", count: 3, filler: "hidden md:block", cell: "h-32", name: "text-xl" },
  { cols: "grid-cols-1 md:grid-cols-4", count: 4, filler: "hidden md:block", cell: "h-24", name: "text-lg" },
]

// An event's sponsors grouped by tier (2026-11-21): each tier a mono label over a hairline cell grid, the cells
// larger for higher tiers. Logos are never redrawn; until a file exists, the sponsor's name stands in as text.
export function SponsorTiers({ header, tiers, theme, surface, pattern, cardPattern, id, className }: SponsorTiersProps) {
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
      <div className="flex flex-col gap-12">
        {tiers.map((tier, t) => {
          const rank = ranks[Math.min(t, ranks.length - 1)]!
          const fillers = (rank.count - (tier.sponsors.length % rank.count)) % rank.count
          return (
            <section key={tier.name} aria-label={tier.name} className="flex flex-col gap-4">
              <h3 className="font-mono text-xs text-muted-foreground uppercase">{tier.name}</h3>
              <ul className={cn("web-grid", rank.cols)}>
                {tier.sponsors.map((s) => {
                  const sponsor = typeof s === "string" ? { name: s } : s
                  return (
                    <li key={sponsor.name} className={cn("grid place-items-center px-6", rank.cell)}>
                      {sponsor.src ? (
                        <img src={sponsor.src} alt={sponsor.name} className="h-1/3 w-auto max-w-[60%] opacity-90" />
                      ) : (
                        <span className={cn("font-display font-medium tracking-tight text-foreground", rank.name)}>{sponsor.name}</span>
                      )}
                    </li>
                  )
                })}
                {Array.from({ length: fillers }, (_, i) => (
                  <li key={`empty-${i}`} aria-hidden className={rank.filler} />
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </Section>
  )
}
