import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { ArchitecturePart, ArchitectureRow } from "../content/platform"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { type } from "../lib/type"
import { Node } from "../lib/node"

export type ArchitectureDiagramProps = SectionProps & {
  header: HeaderProps
  // The two sides: Qdrant's control plane and the customer's data plane, each a title and a mono label.
  control: { title: string; label?: string }
  data: { title: string; label?: string }
  // Rows across the two sides; a link in a row joins them and points to a numbered note.
  rows: ArchitectureRow[]
  // The numbered notes, in the page's own words.
  legend: { note: string; text: string }[]
  // A note on the data plane as a whole, and a line under it.
  dataNote?: string
  footnote?: string
  // hybrid: the control plane on the left, the data plane on the right, joined by hairlines.
  layout?: "hybrid"
}


// An arrowhead in indigo, pointing right unless rotated.
function Arrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 8 8" className={cn("size-2 shrink-0 text-(--web-indigo)", className)}>
      <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
    </svg>
  )
}

function NoteMark({ note }: { note: string }) {
  return (
    <span className="inline-flex h-5 min-w-7 items-center justify-center rounded-sm border border-(--web-line-strong) bg-background px-1 font-mono text-[11px] text-muted-foreground">
      {note}
    </span>
  )
}

// A part of either plane: a tile on the plane's plate, with a node on the side its link leaves from.
function Part({ part, node }: { part: ArchitecturePart; node?: "left" | "right" }) {
  return (
    <Plate pattern="" className="flex min-h-14 flex-col justify-center gap-1 overflow-visible rounded-lg px-4 py-3">
      {node && <Node solid className={cn("absolute top-1/2 -translate-y-1/2", node === "left" ? "-left-1" : "-right-1")} />}
      <span className="text-sm text-foreground">{part.name}</span>
      {part.detail && <span className="font-mono text-xs break-words text-muted-foreground">{part.detail}</span>}
    </Plate>
  )
}

function PlaneTitle({ plane, note }: { plane: { title: string; label?: string }; note?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {plane.label && <span className={cn(type.xsmall, "font-mono uppercase")}>{plane.label}</span>}
      <span className="flex items-center gap-2 font-display text-lg text-foreground">
        {plane.title}
        {note && <NoteMark note={note} />}
      </span>
    </div>
  )
}

// A link across the gap between the planes: a hairline from tile to tile, the note's number on it, and an
// arrowhead at the end it goes to.
function HorizontalLink({ note, to }: { note: string; to: "control" | "data" }) {
  return (
    <div className="relative -mx-5 flex items-center">
      {to === "control" && <Arrow className="rotate-180" />}
      <span className="h-px flex-1 bg-(--web-line-strong)" />
      {to === "data" && <Arrow />}
      <span className="absolute left-1/2 -translate-x-1/2">
        <NoteMark note={note} />
      </span>
    </div>
  )
}

// The same link on phones, where the planes stack: a vertical hairline with its number.
function VerticalLink({ note, to }: { note: string; to: "control" | "data" }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {to === "control" && <Arrow className="-rotate-90" />}
      <span className="h-8 w-px bg-(--web-line-strong)" />
      <NoteMark note={note} />
      <span className="h-8 w-px bg-(--web-line-strong)" />
      {to === "data" && <Arrow className="rotate-90" />}
    </div>
  )
}

// A deployment's architecture (2026-11-21), drawn with the website's lines and plates: Qdrant's control plane on
// one side, the customer's Kubernetes data plane on the other, parts as tiles, connections as hairlines with nodes
// and a numbered note each, and a legend with the notes. Only the parts and relations the product page states.
export function ArchitectureDiagram({
  header,
  control,
  data,
  rows,
  legend,
  dataNote,
  footnote,
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: ArchitectureDiagramProps) {
  const links = rows.flatMap((r) => r.links ?? [])
  const action = header.action ? (
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
      <SectionHeader
        layout={action ? "action" : "stacked"}
        kicker={header.kicker}
        title={header.title}
        description={header.description}
        actions={action}
      />

      <figure className="flex flex-col gap-8">
        {/* Desktop: one grid, the two plates spanning every row behind their parts, links in the middle column. */}
        <div
          className="relative hidden grid-cols-[minmax(0,1fr)_10rem_minmax(0,1fr)] gap-y-3 lg:grid"
          style={{ gridTemplateRows: `auto repeat(${rows.length}, minmax(3.5rem, auto)) auto` }}
        >
          <Plate className="col-start-1 row-span-full rounded-xl" />
          <Plate className="col-start-3 row-span-full rounded-xl" />
          <div className="relative col-start-1 row-start-1 px-5 pt-5 pb-2">
            <PlaneTitle plane={control} />
          </div>
          <div className="relative col-start-3 row-start-1 px-5 pt-5 pb-2">
            <PlaneTitle plane={data} note={dataNote} />
          </div>
          {rows.map((row, i) => {
            const rowStart = { gridRowStart: i + 2 }
            const linked = (row.links?.length ?? 0) > 0
            return (
              <React.Fragment key={i}>
                {row.control && (
                  <div className="relative col-start-1 px-5" style={rowStart}>
                    <Part part={row.control} node={linked ? "right" : undefined} />
                  </div>
                )}
                {linked && (
                  <div className="relative col-start-2 flex flex-col justify-center gap-5" style={rowStart}>
                    {row.links!.map((l) => (
                      <HorizontalLink key={l.note} note={l.note} to={l.to} />
                    ))}
                  </div>
                )}
                {row.data && (
                  <div className={cn("relative col-start-3 grid gap-3 px-5", row.data.length > 1 && "grid-cols-2")} style={rowStart}>
                    {row.data.map((part, j) => (
                      <Part key={part.name} part={part} node={linked && j === 0 ? "left" : undefined} />
                    ))}
                  </div>
                )}
              </React.Fragment>
            )
          })}
          <div className="relative col-start-3 px-5 pt-2 pb-5" style={{ gridRowStart: rows.length + 2 }}>
            {footnote && <p className={cn(type.xsmall, "font-mono")}>{footnote}</p>}
          </div>
        </div>

        {/* Phones and tablets: the planes stack, the links between them. */}
        <div className="flex flex-col items-stretch lg:hidden">
          <Plate className="flex flex-col gap-3 rounded-xl p-5">
            <PlaneTitle plane={control} />
            {rows.map((r) => r.control).filter(Boolean).map((part) => (
              <Part key={part!.name} part={part!} />
            ))}
          </Plate>
          {links.length > 0 && (
            <div className="flex justify-center gap-10 py-1">
              {links.map((l) => (
                <VerticalLink key={l.note} note={l.note} to={l.to} />
              ))}
            </div>
          )}
          <Plate className="flex flex-col gap-3 rounded-xl p-5">
            <PlaneTitle plane={data} note={dataNote} />
            {rows.flatMap((r) => r.data ?? []).map((part) => (
              <Part key={part.name} part={part} />
            ))}
            {footnote && <p className={cn(type.xsmall, "font-mono")}>{footnote}</p>}
          </Plate>
        </div>

        {/* Legend */}
        <figcaption className="web-rule web-bleed grid gap-x-(--qd-layout-column-gap) gap-y-4 pt-8 md:grid-cols-2">
          {legend.map((item) => (
            <p key={item.note} className={cn(type.small, "flex items-start gap-3")}>
              <NoteMark note={item.note} />
              <span>{item.text}</span>
            </p>
          ))}
        </figcaption>
      </figure>
    </Section>
  )
}
