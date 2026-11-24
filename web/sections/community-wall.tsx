import { cn } from "@qdrant/design-system/lib/utils"

import type { CommunityQuote } from "../content/company"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { type } from "../lib/type"

export type CommunityWallProps = SectionProps & {
  header: HeaderProps
  quotes: CommunityQuote[]
  // masonry: quote cards in columns of uneven height, one on phones, two at md, three from lg.
  layout?: "masonry"
}

const initials = (name: string) =>
  name
    .replace(/^@/, "")
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

// What community members say (2026-11-21): short posts on cards in uneven columns, each with an avatar slot (the
// initials until a photo is supplied), the name and handle as written, and the quote, cut to its first full
// sentence.
export function CommunityWall({ header, quotes, theme, surface, pattern, cardPattern, id, className }: CommunityWallProps) {
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
      <ul className="columns-1 gap-(--qd-layout-column-gap) md:columns-2 lg:columns-3">
        {quotes.map((item) => (
          <Plate
            as="li"
            key={item.handle}
            className="mb-(--qd-layout-column-gap) flex break-inside-avoid flex-col gap-5 rounded-xl p-6"
          >
            <blockquote className={cn(type.lead, "text-foreground")}>{item.quote}</blockquote>
            <div className="flex items-center gap-3">
              <span
                role="img"
                aria-label={`Avatar of ${item.name}`}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-(--web-line) bg-muted font-mono text-xs text-muted-foreground"
              >
                {initials(item.name)}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
                <span className={cn(type.xsmall, "truncate font-mono")}>{item.handle}</span>
              </div>
            </div>
          </Plate>
        ))}
      </ul>
    </Section>
  )
}
