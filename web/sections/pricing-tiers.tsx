"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { Tier, TierGroup } from "../content/conversion"
import type { Link } from "../content/site"
import { ArrowLink } from "../lib/arrow-link"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

export type PricingTiersProps = SectionProps & {
  // grid: tiers side by side in a hairline grid, with a toggle between groups. enterprise: wide cards with
  // labeled lists, for deployment options sold through sales.
  layout?: "grid" | "enterprise"
  header?: HeaderProps & { secondaryAction?: Link }
  // One group per tab (Managed, On-Premise). The toggle shows when there are two or more.
  groups: TierGroup[]
  // A line under the tiers that points to the calculator.
  calculator?: { text: string; prefix?: string; link: Link }
}

const cols = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" } as const

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((f) => (
        <li key={f} className={cn(type.small, "flex items-start gap-2.5 text-foreground")}>
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-(--web-indigo)" />
          {f}
        </li>
      ))}
    </ul>
  )
}

function GroupedLists({ tier }: { tier: Tier }) {
  return (
    <>
      {tier.features && <FeatureList items={tier.features} />}
      {tier.featureGroups?.map((g) => (
        <div key={g.label} className="flex flex-col gap-3">
          <p className={cn(type.xsmall, "font-mono uppercase")}>{g.label}</p>
          <FeatureList items={g.items} />
        </div>
      ))}
    </>
  )
}

// A tier in the hairline grid: name, price line, who it's for, the action, then what's included. The highlighted
// tier carries an indigo mark on its top edge and the primary button.
function TierCell({ tier }: { tier: Tier }) {
  return (
    <li className="relative flex flex-col gap-8 px-6 py-10">
      {tier.highlight && <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-(--web-indigo)" />}
      <div className="flex flex-col gap-3">
        <h3 className={heading.card}>{tier.name}</h3>
        {tier.price && <p className="font-mono text-lg text-foreground">{tier.price}</p>}
        {tier.description && <p className={type.small}>{tier.description}</p>}
      </div>
      <LinkButton href={tier.cta.href} variant={tier.highlight ? "default" : "secondary"} className="w-full">
        {tier.cta.label}
      </LinkButton>
      <div className="flex flex-col gap-6 border-t border-(--web-line) pt-8">
        <GroupedLists tier={tier} />
        {tier.note && <p className={cn(type.xsmall, "font-mono")}>{tier.note}</p>}
      </div>
    </li>
  )
}

// Pricing tiers (2026-11-21): the price lines exactly as the site writes them, never a figure made up for the
// layout. Tiers sit side by side split by hairlines, not on floating cards; a toggle switches the group.
export function PricingTiers({ layout = "grid", header, groups, calculator, theme, surface, pattern, cardPattern, id, className }: PricingTiersProps) {
  const [active, setActive] = React.useState(0)
  const group = groups[active] ?? groups[0]
  const tabsId = React.useId()

  const headerEl = header ? (
    <SectionHeader
      align="center"
      kicker={header.kicker}
      title={header.title}
      description={header.description}
      actions={
        header.action || header.secondaryAction ? (
          <>
            {header.action && <LinkButton href={header.action.href}>{header.action.label}</LinkButton>}
            {header.secondaryAction && (
              <LinkButton href={header.secondaryAction.href} variant="secondary">
                {header.secondaryAction.label}
              </LinkButton>
            )}
          </>
        ) : undefined
      }
    />
  ) : null

  const calculatorEl = calculator ? (
    <p className={cn(type.body, "flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center")}>
      <span className="text-foreground">{calculator.text}</span>
      {calculator.prefix && <span>{calculator.prefix}</span>}
      <ArrowLink href={calculator.link.href}>{calculator.link.label}</ArrowLink>
    </p>
  ) : null

  if (layout === "enterprise") {
    const tiers = groups.flatMap((g) => g.tiers)
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
        {headerEl}
        <ul className="grid gap-(--qd-layout-column-gap) lg:grid-cols-2">
          {tiers.map((tier) => (
            <Plate as="li" key={tier.name} className="flex flex-col gap-8 rounded-xl p-6 md:p-8">
              <div className="flex flex-col gap-3">
                <h3 className={heading.card}>{tier.name}</h3>
                {tier.price && <p className="font-mono text-lg text-foreground">{tier.price}</p>}
                {tier.description && <p className={type.body}>{tier.description}</p>}
              </div>
              <div className="grid flex-1 gap-6 border-t border-(--web-line) pt-6 sm:grid-cols-2">
                {tier.features && <FeatureList items={tier.features} />}
                {tier.featureGroups?.map((g) => (
                  <div key={g.label} className="flex flex-col gap-3">
                    <p className={cn(type.xsmall, "font-mono uppercase")}>{g.label}</p>
                    <FeatureList items={g.items} />
                  </div>
                ))}
              </div>
              <LinkButton href={tier.cta.href} variant={tier.highlight ? "default" : "secondary"} className="self-start">
                {tier.cta.label}
              </LinkButton>
            </Plate>
          ))}
        </ul>
        {calculatorEl}
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      {headerEl}
      <div className="flex flex-col gap-10">
        {groups.length > 1 && (
          <div role="tablist" aria-label="Deployment" className="web-tray inline-flex gap-1 self-center rounded-lg">
            {groups.map((g, i) => (
              <button
                key={g.label}
                type="button"
                role="tab"
                id={`${tabsId}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${tabsId}-panel`}
                onClick={() => setActive(i)}
                className={cn(
                  "relative rounded-md px-4 py-1.5 font-mono text-sm outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)",
                  i === active ? "web-plate text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {g.label}
                {i === active && <span aria-hidden className="absolute inset-x-3 -bottom-px h-px bg-(--web-indigo)" />}
              </button>
            ))}
          </div>
        )}
        {group && (
          <ul
            id={`${tabsId}-panel`}
            role={groups.length > 1 ? "tabpanel" : undefined}
            aria-labelledby={groups.length > 1 ? `${tabsId}-tab-${active}` : undefined}
            className={cn("web-grid grid-cols-1", cols[Math.min(group.tiers.length, 4) as keyof typeof cols])}
          >
            {group.tiers.map((tier) => (
              <TierCell key={tier.name} tier={tier} />
            ))}
          </ul>
        )}
      </div>
      {calculatorEl}
    </Section>
  )
}
