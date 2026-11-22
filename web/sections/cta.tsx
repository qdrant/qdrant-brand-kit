import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import { LinkButton } from "../lib/link-button"
import { Section, type SectionProps } from "../lib/section"
import { heading, type } from "../lib/type"

export type CtaProps = SectionProps & {
  // centered: a closing statement with room around it. panel: a framed card, heading left and actions right.
  // band: one slim line between sections.
  layout?: "centered" | "panel" | "band"
  title: string
  description?: string
  primary: Link
  secondary?: Link
}

// A call to action (2026-11-21). Use one centered CTA to close a page, a panel or a band inside it. No glows or
// patterns for now: the library sets layouts and the baseline first, and effects come in a later style stage.
export function Cta({ layout = "centered", title, description, primary, secondary, theme, surface, id, className }: CtaProps) {
  const actions = (
    <div className={cn("flex flex-wrap gap-3", layout === "centered" && "justify-center")}>
      <LinkButton href={primary.href} size="lg">
        {primary.label}
      </LinkButton>
      {secondary && (
        <LinkButton href={secondary.href} size="lg" variant="outline">
          {secondary.label}
        </LinkButton>
      )}
    </div>
  )

  if (layout === "band") {
    return (
      <Section theme={theme} surface={surface} spacing="compact" id={id} className={className}>
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

  if (layout === "panel") {
    return (
      <Section theme={theme} surface={surface} spacing="compact" id={id} className={className}>
        <div className="web-plate grid gap-8 rounded-2xl p-8 md:p-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className={heading.section}>{title}</h2>
            {description && <p className={type.lead}>{description}</p>}
          </div>
          {actions}
        </div>
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} id={id} className={className} innerClassName="flex flex-col items-center gap-8 text-center">
      <h2 className={cn(heading.statement, "max-w-4xl text-balance")}>{title}</h2>
      {description && <p className={cn(type.lead, "max-w-2xl")}>{description}</p>}
      {actions}
    </Section>
  )
}
