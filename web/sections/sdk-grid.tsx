"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { Sdk } from "../content/platform"
import { ArrowLink } from "../lib/arrow-link"
import { CopySnippet } from "../lib/copy-snippet"
import { LinkButton } from "../lib/link-button"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading } from "../lib/type"

export type SdkGridProps = SectionProps & {
  header: HeaderProps
  items: Sdk[]
  // grid: every library in a hairline cell grid. tabs: one tab per language over its install line.
  layout?: "grid" | "tabs"
}

// The library's name set as text on a small tile, until the languages' logos are exported.
function NameTile({ name }: { name: string }) {
  return (
    <h3 className={cn(heading.card, "inline-flex h-10 w-fit items-center rounded-lg border border-(--web-line-strong) bg-muted px-3 text-base")}>
      {name}
    </h3>
  )
}

// The install line to copy, or, for a library the docs give no line for, its registry link.
function Install({ sdk }: { sdk: Sdk }) {
  if (sdk.install) return <CopySnippet text={sdk.install} language="shell" className="max-w-none" />
  if (sdk.registry)
    return (
      <ArrowLink href={sdk.registry.href} className="text-sm">
        {sdk.registry.label}
      </ArrowLink>
    )
  return null
}

function Links({ sdk }: { sdk: Sdk }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {[sdk.repo, sdk.docs, sdk.release].filter(Boolean).map((l) => (
        <ArrowLink key={l!.href} href={l!.href} className="text-sm">
          {l!.label}
        </ArrowLink>
      ))}
    </div>
  )
}

// Qdrant's official client libraries (2026-11-21): each language with its install line as the docs give it, and
// links to its repository, docs and releases. Names stand as text until the languages' logos are exported.
export function SdkGrid({ header, items, layout = "grid", theme, surface, pattern, cardPattern, id, className }: SdkGridProps) {
  const [active, setActive] = React.useState(0)
  const current = items[active] ?? items[0]

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
      {layout === "tabs" ? (
        <div className="web-tray rounded-[calc(var(--radius-xl)+6px)]">
          <div className="web-plate flex flex-col overflow-hidden rounded-xl">
            <div role="tablist" aria-label="Language" className="flex gap-1 overflow-x-auto border-b border-(--web-line) px-2">
              {items.map((sdk, i) => {
                const on = i === active
                return (
                  <button
                    key={sdk.name}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setActive(i)}
                    className={cn(
                      "relative shrink-0 px-3 py-3.5 font-mono text-xs whitespace-nowrap outline-none focus-visible:underline",
                      on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {sdk.name}
                    {on && <span aria-hidden className="absolute inset-x-3 -bottom-px h-0.5 bg-(--web-indigo)" />}
                  </button>
                )
              })}
            </div>
            {current && (
              <div role="tabpanel" className="flex flex-col gap-5 p-5 md:p-6">
                <h3 className={heading.card}>{current.name}</h3>
                <Install sdk={current} />
                <Links sdk={current} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <ul className="web-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {items.map((sdk) => (
            <li key={sdk.name} className="flex min-w-0 flex-col gap-5 px-6 py-8">
              <NameTile name={sdk.name} />
              <div className="flex min-h-10 items-center">
                <Install sdk={sdk} />
              </div>
              <Links sdk={sdk} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
