import { cn } from "@qdrant/design-system/lib/utils"

import { MediaFrame } from "../lib/media-frame"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

type Statement = { title: string; text: string }

export type AboutStoryProps = SectionProps & {
  header: HeaderProps
  // The story's passages, each a paragraph or two beside a photo slot; `media` labels the slot.
  chapters?: { text: string[]; media?: string }[]
  // A closing line set large, after the chapters or above the vision and mission.
  statement?: string
  vision?: Statement
  mission?: Statement
  // rows: the chapters alternating text and photo, then the statement and the vision and mission. mission: the
  // statement and the vision and mission side by side, without the chapters.
  layout?: "rows" | "mission"
}

function Pair({ vision, mission }: { vision?: Statement; mission?: Statement }) {
  const items = [vision, mission].filter((item): item is Statement => Boolean(item))
  if (!items.length) return null
  return (
    <ul className="grid grid-cols-1 gap-(--qd-layout-column-gap) md:grid-cols-2">
      {items.map((item) => (
        <Plate as="li" key={item.title} className="flex flex-col gap-4 rounded-xl p-8">
          <h3 className={heading.card}>{item.title}</h3>
          <p className={type.lead}>{item.text}</p>
        </Plate>
      ))}
    </ul>
  )
}

// A company's story (2026-11-21), from the About page: a heading, passages beside photo slots that alternate
// sides, a closing line, and the vision and mission. Photos stay placeholders until a page supplies them.
export function AboutStory({ header, chapters = [], statement, vision, mission, layout = "rows", theme, surface, pattern, cardPattern, id, className }: AboutStoryProps) {
  const statementEl = statement ? (
    <p className={cn(type.xl, "max-w-4xl text-pretty text-foreground")}>{statement}</p>
  ) : null

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader layout="split" kicker={header.kicker} title={header.title} description={header.description} />
      {layout === "rows" ? (
        <>
          <div className="flex flex-col gap-16 lg:gap-24">
            {chapters.map((chapter, i) => {
              const mediaLeft = i % 2 === 1
              return (
                <div key={i} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)">
                  <div className={cn("flex flex-col gap-4 lg:max-w-md", mediaLeft && "lg:order-2 lg:justify-self-end")}>
                    <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    {chapter.text.map((paragraph) => (
                      <p key={paragraph} className={type.body}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className={cn("web-tray rounded-[calc(var(--radius-xl)+6px)]", mediaLeft && "lg:order-1")}>
                    <MediaFrame label={chapter.media ?? "Photo"} className="web-plate" />
                  </div>
                </div>
              )
            })}
          </div>
          {(statementEl || vision || mission) && (
            <div className="web-rule web-bleed flex flex-col gap-10 pt-(--qd-layout-heading-to-content-min) lg:pt-(--qd-layout-heading-to-content-max)">
              {statementEl}
              <Pair vision={vision} mission={mission} />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-10">
          {statementEl}
          <Pair vision={vision} mission={mission} />
        </div>
      )}
    </Section>
  )
}
