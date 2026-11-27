import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { heading, type } from "../lib/type"

export type CtaProps = SectionProps & {
  // centered: a closing statement with room around it. panel: a framed card, heading left and actions right.
  // band: one slim line between sections.
  // Proposal (2026-11-24): command, the title as a command at a prompt in a terminal window, with a blinking caret,
  // the description as a comment under it and the actions below.
  layout?: "centered" | "panel" | "band" | "command"
  title: string
  description?: string
  primary: Link
  secondary?: Link
}

// A call to action (2026-11-21). Use one centered CTA to close a page, a panel or a band inside it. No glows or
// patterns for now: the library sets layouts and the baseline first, and effects come in a later style stage.
export function Cta({ layout = "centered", title, description, primary, secondary, theme, surface, pattern, cardPattern, id, className }: CtaProps) {
  const actions = (
    <div className={cn("flex flex-wrap gap-3", layout === "centered" && "justify-center")}>
      <LinkButton href={primary.href} size="lg">
        {primary.label}
      </LinkButton>
      {secondary && (
        <LinkButton href={secondary.href} size="lg" variant="secondary">
          {secondary.label}
        </LinkButton>
      )}
    </div>
  )

  if (layout === "band") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} spacing="compact" id={id} className={className}>
        <div className="web-cells web-bleed flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p className={heading.card}>{title}</p>
            {description && <p className={type.body}>{description}</p>}
          </div>
          {actions}
        </div>
      </Section>
    )
  }

  if (layout === "command") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex justify-center">
        <Plate className="flex w-full max-w-4xl flex-col rounded-2xl">
          <div className="flex items-center gap-2 border-b border-(--web-line) px-5 py-3.5">
            {[0, 1, 2].map((i) => (
              <span key={i} aria-hidden className="web-window-dot size-2.5 rounded-full" />
            ))}
            <span className="ml-3 font-mono text-xs text-muted-foreground">qdrant</span>
          </div>
          <div className="flex flex-col gap-10 p-8 md:p-12">
            <div className="flex flex-col gap-4">
              <h2 className={cn(heading.section, "text-balance")}>
                <span aria-hidden className="mr-4 font-mono text-[0.6em] text-(--web-indigo)">
                  &gt;
                </span>
                {title}
                <span aria-hidden className="web-caret ml-2 inline-block h-[0.8em] w-[0.45em] translate-y-[0.08em] bg-foreground" />
              </h2>
              {description && <p className={cn(type.lead, "font-mono text-base")}># {description}</p>}
            </div>
            {actions}
          </div>
        </Plate>
      </Section>
    )
  }

  if (layout === "panel") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} spacing="compact" id={id} className={className}>
        <Plate className="grid gap-8 rounded-2xl p-8 md:p-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className={heading.section}>{title}</h2>
            {description && <p className={type.lead}>{description}</p>}
          </div>
          {actions}
        </Plate>
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col items-center gap-8 text-center">
      <h2 className={cn(heading.statement, "max-w-4xl text-balance")}>{title}</h2>
      {description && <p className={cn(type.lead, "max-w-2xl")}>{description}</p>}
      {actions}
    </Section>
  )
}
