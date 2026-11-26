import { cn } from "@qdrant/design-system/lib/utils"

import type { Partner, PartnerGroup } from "../content/company"
import { ArrowLink } from "../lib/arrow-link"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

export type PartnerDirectoryProps = SectionProps & {
  header: HeaderProps
  groups: PartnerGroup[]
  // grouped: each category in its own row, its title and line on the left, its partners' cards on the right.
  // grid: every partner in one hairline grid, each tagged with its category.
  layout?: "grouped" | "grid"
}

// The partner's name set as text, standing in for its logo until the file is exported (as in logo-cloud.tsx).
function Wordmark({ name }: { name: string }) {
  return <span className="font-display text-xl font-medium tracking-tight text-foreground">{name}</span>
}

function PartnerBody({ partner, tag }: { partner: Partner; tag?: string }) {
  return (
    <>
      {tag && <p className={cn(type.xsmall, "font-mono uppercase")}>{tag}</p>}
      <Wordmark name={partner.name} />
      <p className={cn(type.small, "flex-1")}>{partner.text}</p>
      {partner.link && (
        <ArrowLink href={partner.link.href} className="text-sm">
          {partner.link.label}
        </ArrowLink>
      )}
    </>
  )
}

// The empty cells a row of `columns` needs after `count` items.
const pads = (count: number, columns: number) => Array.from({ length: (columns - (count % columns)) % columns }, (_, k) => k)

// A directory of partners by category (2026-11-21), in the site's categories and order. Logos are the partners'
// names as text until their files are exported; a card links out only where the site does.
export function PartnerDirectory({ header, groups, layout = "grouped", theme, surface, pattern, cardPattern, id, className }: PartnerDirectoryProps) {
  const count = groups.reduce((n, group) => n + group.partners.length, 0)
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
      {layout === "grouped" ? (
        <div className="flex flex-col">
          {groups.map((group, i) => (
            <div
              key={group.title}
              className={cn(
                "grid gap-8 py-10 lg:grid-cols-3 lg:gap-(--qd-layout-column-gap) lg:py-12",
                i > 0 && "web-rule web-bleed",
                i === 0 && "pt-0 lg:pt-0"
              )}
            >
              <div className="flex flex-col gap-2 lg:pr-8">
                <h3 className={heading.card}>{group.title}</h3>
                <p className={type.small}>{group.text}</p>
              </div>
              <ul className="grid grid-cols-1 gap-(--web-card-gap) md:grid-cols-2 lg:col-span-2">
                {group.partners.map((partner) => (
                  <Plate as="li" key={partner.name} className="flex flex-col gap-3 rounded-xl p-6">
                    <PartnerBody partner={partner} />
                  </Plate>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="web-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {groups.flatMap((group) =>
            group.partners.map((partner) => (
              <li key={group.title + partner.name} className="flex flex-col gap-3 px-6 py-8">
                <PartnerBody partner={partner} tag={group.title} />
              </li>
            ))
          )}
          {/* Empty cells fill the last row, so the grid's line color doesn't show through a gap. */}
          {pads(count, 2).map((k) => (
            <li key={`md-${k}`} aria-hidden className="hidden md:block lg:hidden" />
          ))}
          {pads(count, 3).map((k) => (
            <li key={`lg-${k}`} aria-hidden className="hidden lg:block" />
          ))}
        </ul>
      )}
    </Section>
  )
}
