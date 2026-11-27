import { cn } from "@qdrant/design-system/lib/utils"

import type { Channel } from "../content/company"
import { ArrowLink } from "../lib/arrow-link"
import { ASSETS } from "../lib/assets"
import { LinkButton } from "../lib/link-button"
import { MonoImage } from "../lib/mono-image"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { IconTile, toneAt, type Tone } from "../lib/tone"
import { heading, type } from "../lib/type"

export type CommunityChannelsProps = SectionProps & {
  header: HeaderProps
  items: Channel[]
  // cards: programs on plates in three columns. list: channels as rows in a hairline list, the link on the right.
  layout?: "cards" | "list"
  // The tiles' color: one family for all, or mixed, each item the next family.
  tones?: Tone | "mixed"
}

// The social marks in web/assets/social, in their own proportions (as in footer.tsx).
const marks: Record<string, { label: string; className: string }> = {
  github: { label: "GitHub", className: "h-[19.5px] w-5" },
  discord: { label: "Discord", className: "size-5" },
  x: { label: "X", className: "h-[17.5px] w-[19.3px]" },
  linkedin: { label: "LinkedIn", className: "size-[18.75px]" },
  youtube: { label: "YouTube", className: "h-[14.2px] w-5" },
}

// A Lucide icon on its tile, or a social mark on the same tile, in the tile's color.
function ChannelTile({ item, tone }: { item: Channel; tone: Tone }) {
  const mark = item.mark ? marks[item.mark] : undefined
  if (mark && item.mark) {
    return (
      <span className={cn("web-icon-tile grid size-10 shrink-0 place-items-center rounded-lg", `web-tone-${tone}`)}>
        <MonoImage src={`${ASSETS}/social/${item.mark}.svg`} label={mark.label} className={mark.className} />
      </span>
    )
  }
  return <IconTile name={item.icon} tone={tone} />
}

// The ways to join a community (2026-11-21): programs or channels, each with an icon tile, a title, a line and a
// link, under a heading with one primary action.
export function CommunityChannels({ header, items, layout = "cards", tones = "mixed", theme, surface, pattern, cardPattern, id, className }: CommunityChannelsProps) {
  const toneFor = (i: number) => (tones === "mixed" ? toneAt(i) : tones)
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader
        layout="action"
        kicker={header.kicker}
        title={header.title}
        description={header.description}
        actions={header.action ? <LinkButton href={header.action.href}>{header.action.label}</LinkButton> : undefined}
      />
      {layout === "cards" ? (
        <ul className="grid grid-cols-1 gap-(--web-card-gap) md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Plate as="li" simple key={item.title} className="flex flex-col gap-4 rounded-xl p-6">
              <ChannelTile item={item} tone={toneFor(i)} />
              <div className="flex flex-1 flex-col gap-2">
                <h3 className={heading.card}>{item.title}</h3>
                <p className={type.small}>{item.text}</p>
              </div>
              {item.link && (
                <ArrowLink href={item.link.href} className="text-sm">
                  {item.link.label}
                </ArrowLink>
              )}
            </Plate>
          ))}
        </ul>
      ) : (
        <ul className="web-bleed flex flex-col divide-y divide-(--web-line) border-y border-(--web-line)">
          {items.map((item, i) => (
            <li key={item.title} className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:gap-6">
              <ChannelTile item={item} tone={toneFor(i)} />
              <div className="flex flex-1 flex-col gap-1">
                <h3 className={heading.card}>{item.title}</h3>
                <p className={type.small}>{item.text}</p>
              </div>
              {item.link && (
                <ArrowLink href={item.link.href} className="shrink-0 text-sm">
                  {item.link.label}
                </ArrowLink>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
