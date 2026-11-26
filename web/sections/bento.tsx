import type * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@qdrant/design-system/lib/utils"

import { LinkButton } from "../lib/link-button"
import { MediaFrame } from "../lib/media-frame"
import { Plate } from "../lib/plate"
import { PatternLayers } from "../patterns"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { Feature } from "../content/sections"
import type { HeaderProps } from "../lib/section-props"
import { IconTile, toneAt, type Tone } from "../lib/tone"
import { heading, type } from "../lib/type"

export type BentoProps = SectionProps & {
  header: HeaderProps
  // checklist: a large tile with a checklist beside three captioned media tiles (list and tiles). cards
  // (2026-11-24): 4, 5 or 6 cards (cards), arranged by how many there are.
  layout?: "checklist" | "cards"
  // The large tile: a title and a checklist.
  list?: { title?: string; items: string[] }
  // The small tiles: a caption each, over a media slot, or over its own visual (web/visuals) when a page gives one
  // (2026-11-26, the home page's enterprise tiles).
  tiles?: (string | { title: string; visual?: React.ReactNode })[]
  // Cards for the cards layout: an icon, a title and a line each, 4 to 6 of them.
  cards?: Feature[]
}

// The cards layout's arrangement on a 6-column grid, by count (design lead, 2026-11-24), and which cards are large
// enough for a media slot above their text:
// - 4: wide and narrow, then narrow and wide; the wide ones have media.
// - 5: two halves, then three thirds; the halves have media.
// - 6: a wide card and a tall one beside it, two small cards under the wide one, then two halves; the wide and the
//   tall ones have media.
const arrangements: Record<number, { span: string; media?: boolean }[]> = {
  4: [
    { span: "lg:col-span-4", media: true },
    { span: "lg:col-span-2" },
    { span: "lg:col-span-2" },
    { span: "lg:col-span-4", media: true },
  ],
  5: [
    { span: "lg:col-span-3", media: true },
    { span: "lg:col-span-3", media: true },
    { span: "lg:col-span-2" },
    { span: "lg:col-span-2" },
    { span: "lg:col-span-2" },
  ],
  6: [
    { span: "lg:col-span-4", media: true },
    { span: "lg:col-span-2 lg:row-span-2", media: true },
    { span: "lg:col-span-2" },
    { span: "lg:col-span-2" },
    { span: "lg:col-span-3" },
    { span: "lg:col-span-3" },
  ],
}

// Tiles of different sizes in one grid (2026-11-21). checklist: a large tile with a checklist beside smaller tiles,
// each a caption over a media slot. cards: 4 to 6 cards arranged by count (see arrangements). Every tile is a
// plate; the media slots are placeholders until a page supplies them.
export function Bento({
  header,
  layout = "checklist",
  list,
  tiles = [],
  cards = [],
  tones = "mixed",
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: BentoProps & { tones?: Tone | "mixed" }) {
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
      <SectionHeader
        layout="action"
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
      {layout === "cards" ? (
        <ul className="grid gap-(--web-card-gap) md:grid-cols-2 lg:grid-cols-6">
          {cards.map((card, i) => {
            const place = arrangements[cards.length]?.[i] ?? {
              span: "lg:col-span-2",
            }
            const tone =
              (card.tone as Tone) ?? (tones === "mixed" ? toneAt(i) : tones)
            // On tablets two columns: the first card, and the last when the rest don't pair up, take the full row.
            const fullOnMd =
              i === 0 ||
              (i === cards.length - 1 && (cards.length - 1) % 2 === 1)
            return (
              <Plate
                as="li"
                simple
                key={card.title}
                className={cn(
                  "flex flex-col gap-6 rounded-xl p-6",
                  place.span,
                  fullOnMd && "md:col-span-2"
                )}
              >
                {place.media && (
                  <MediaFrame
                    label="Image"
                    className="aspect-auto min-h-44 flex-1 rounded-lg border-0 bg-transparent"
                  />
                )}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    {card.icon && <IconTile name={card.icon} tone={tone} />}
                    <h3 className={heading.card}>{card.title}</h3>
                  </div>
                  {card.text && <p className={type.small}>{card.text}</p>}
                </div>
              </Plate>
            )
          })}
        </ul>
      ) : (
        <div className="grid gap-(--web-card-gap) md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
          <Plate className="relative flex flex-col gap-6 rounded-xl p-8 lg:row-span-2">
            {/* A subtle pattern fills the tall tile's empty bottom: Pixel drift, faded up into the list (design lead,
                2026-11-26). */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 [mask-image:linear-gradient(to_top,black,transparent)] opacity-70"
            >
              <PatternLayers ids="pixel-drift" />
            </span>
            {list?.title && (
              <h3 className={cn(heading.card, "relative")}>{list.title}</h3>
            )}
            <ul className="relative flex flex-col gap-4">
              {(list?.items ?? []).map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="web-icon-tile web-tone-indigo mt-0.5 grid size-5 shrink-0 place-items-center rounded-full">
                    <Check className="size-3" aria-hidden />
                  </span>
                  <span className={cn(type.body, "text-foreground")}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Plate>
          {tiles.map((entry, i) => {
            const tile = typeof entry === "string" ? entry : entry.title
            const visual = typeof entry === "string" ? undefined : entry.visual
            return (
              <Plate
                key={tile}
                className={cn(
                  "flex flex-col gap-4 rounded-xl p-4",
                  i === 0 && "lg:col-span-2"
                )}
              >
                {visual ? (
                  <div className="flex min-h-44 flex-1 items-center justify-center">
                    {visual}
                  </div>
                ) : (
                  <MediaFrame
                    label="Image"
                    className="aspect-auto min-h-44 flex-1 rounded-lg border-0 bg-transparent"
                  />
                )}
                <p
                  className={cn(
                    type.small,
                    "px-2 pb-1 font-medium text-foreground"
                  )}
                >
                  {tile}
                </p>
              </Plate>
            )
          })}
        </div>
      )}
    </Section>
  )
}
