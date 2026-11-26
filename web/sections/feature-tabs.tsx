"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { Feature } from "../content/sections"
import { ArrowLink } from "../lib/arrow-link"
import { LinkButton } from "../lib/link-button"
import { MediaFrame } from "../lib/media-frame"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"
import { Node } from "../lib/node"

export type FeatureTabsProps = SectionProps & {
  header: HeaderProps
  items: Feature[]
  // vertical: the list on the left, the media on the right.
  // Proposals (2026-11-24): top, the titles as a row of tabs on a tray above the media, the active one's text
  // beside them; window, one app window, the titles as its sidebar and the media as its content, like the product.
  layout?: "vertical" | "top" | "window"
}

// The active item's media: its visual (a product screen or diagram from web/visuals) on a plate in a tray that hugs
// it, bare for a visual with its own look (visualFrame "none"), or a placeholder until a page supplies one, like
// feature rows (2026-11-26: the home page's tabs).
function TabMedia({ item, framed = true }: { item?: Feature; framed?: boolean }) {
  if (item?.visual && item.visualFrame === "none") return <div className="mx-auto w-fit max-w-full min-w-0">{item.visual}</div>
  if (item?.visual) {
    const plate = <Plate className="overflow-hidden rounded-xl">{item.visual}</Plate>
    return framed ? <div className="web-tray mx-auto w-fit max-w-full min-w-0 rounded-[calc(var(--radius-xl)+6px)]">{plate}</div> : <div className="mx-auto w-fit max-w-full min-w-0">{plate}</div>
  }
  const frame = <MediaFrame label={item?.title ?? "Image"} className="web-plate" />
  return framed ? <div className="web-tray rounded-[calc(var(--radius-xl)+6px)]">{frame}</div> : frame
}

// Features as a list on the left that switches the media on the right (2026-11-21). The active item shows its
// text, its link and a node on the rail beside the list; the others show their title only. On phones the list
// stacks above the media.
export function FeatureTabs({ header, items, layout = "vertical", theme, surface, pattern, cardPattern, id, className }: FeatureTabsProps) {
  const [active, setActive] = React.useState(0)
  const current = items[active]
  const headerAction = header.action ? (
    <LinkButton href={header.action.href} variant="secondary">
      {header.action.label}
    </LinkButton>
  ) : undefined

  if (layout === "top") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
        <SectionHeader kicker={header.kicker} title={header.title} description={header.description} actions={headerAction} align="center" className="mx-auto" />
        <div className="flex flex-col gap-8">
          <div role="tablist" className="web-tray mx-auto flex max-w-full gap-1 overflow-x-auto rounded-xl">
            {items.map((item, i) => {
              const on = i === active
              return (
                <button
                  key={item.title}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                  className={cn(
                    "shrink-0 rounded-lg px-4 py-2 text-sm whitespace-nowrap outline-none focus-visible:underline",
                    on ? "web-plate text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.title}
                </button>
              )
            })}
          </div>
          {(current?.text || current?.link) && (
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
              {current.text && <p className={type.body}>{current.text}</p>}
              {current.link && (
                <ArrowLink href={current.link.href} className="text-sm">
                  {current.link.label}
                </ArrowLink>
              )}
            </div>
          )}
          <TabMedia item={current} />
        </div>
      </Section>
    )
  }

  if (layout === "window") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
        <SectionHeader kicker={header.kicker} title={header.title} description={header.description} actions={headerAction} layout="split" />
        <div className="web-tray rounded-[calc(var(--radius-xl)+6px)]">
          <div className="web-plate overflow-hidden rounded-xl">
            <div className="flex items-center gap-2 border-b border-(--web-line) px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span key={i} aria-hidden className="web-window-dot size-2.5 rounded-full" />
              ))}
              <span className="ml-3 truncate font-mono text-xs text-muted-foreground">{current?.title}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[16rem_minmax(0,1fr)]">
              <ul role="tablist" aria-orientation="vertical" className="flex flex-col gap-0.5 border-b border-(--web-line) p-2 md:border-r md:border-b-0">
                {items.map((item, i) => {
                  const on = i === active
                  return (
                    <li key={item.title}>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => setActive(i)}
                        className={cn(
                          "flex w-full flex-col gap-1.5 rounded-md px-3 py-2.5 text-left text-sm outline-none focus-visible:underline",
                          on ? "web-selected" : "text-muted-foreground hover:bg-(--web-tray) hover:text-foreground"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <Node solid active={on} />
                          {item.title}
                        </span>
                        {on && item.text && <span className={cn(type.xsmall, "pl-[17px]")}>{item.text}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="flex min-w-0 items-center justify-center p-4">
                <TabMedia item={current} framed={false} />
              </div>
            </div>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader kicker={header.kicker} title={header.title} description={header.description} actions={headerAction} layout={headerAction ? "split" : undefined} />
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-(--qd-layout-column-gap)">
        <ul role="tablist" aria-orientation="vertical" className="flex flex-col border-l border-(--web-line)">
          {items.map((item, i) => {
            const on = i === active
            return (
              <li key={item.title} className="relative">
                <Node solid active={on} className="absolute top-5 -left-1" />
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                  className="flex w-full flex-col gap-2 py-3.5 pl-6 text-left outline-none focus-visible:underline"
                >
                  <span className={cn(heading.card, "text-lg transition-colors", !on && "text-muted-foreground hover:text-foreground")}>
                    {item.title}
                  </span>
                  {on && item.text && <span className={type.small}>{item.text}</span>}
                </button>
                {on && item.link && (
                  <ArrowLink href={item.link.href} className="mb-3.5 ml-6 text-sm">
                    {item.link.label}
                  </ArrowLink>
                )}
              </li>
            )
          })}
        </ul>
        <TabMedia item={items[active]} />
      </div>
    </Section>
  )
}
