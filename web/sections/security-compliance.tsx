import { Badge } from "@qdrant/design-system/components/ui/badge"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import type { SecurityFeature } from "../content/platform"
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

export type SecurityComplianceProps = SectionProps & {
  header: HeaderProps
  // grid: security features in a hairline cell grid, then the badges and the Trust Center. split: a checklist on
  // the left, the badges and the Trust Center on the right.
  layout?: "grid" | "split"
  // For grid: each feature with an icon, a title, a line, an optional tag (a tier) and a link.
  features?: SecurityFeature[]
  // For split: short items, each with a check.
  checklist?: string[]
  // The certification badges, files in web/assets/badges.
  badges: { name: string; file: string }[]
  // The Trust Center: a title, a line and its link.
  compliance: { title?: string; text?: string; action: Link }
  tones?: Tone | "mixed"
}

// The badges in a row, drawn in the text color so they follow the theme.
function Badges({ badges, className }: { badges: SecurityComplianceProps["badges"]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-6 text-muted-foreground", className)}>
      {badges.map((b) => (
        <li key={b.name}>
          <MonoImage src={`${ASSETS}/badges/${b.file}.svg`} label={b.name} className="size-14" />
        </li>
      ))}
    </ul>
  )
}

// The Trust Center block: badges, a title and line, and the action.
function TrustCenter({
  badges,
  compliance,
  row = false,
  className,
}: {
  badges: SecurityComplianceProps["badges"]
  compliance: SecurityComplianceProps["compliance"]
  // Everything on one line from lg, for under a grid.
  row?: boolean
  className?: string
}) {
  return (
    <Plate className={cn("flex flex-col gap-6 rounded-xl p-6 md:p-8", row && "lg:flex-row lg:items-center lg:gap-10", className)}>
      <Badges badges={badges} className="shrink-0" />
      {(compliance.title || compliance.text) && (
        <div className="flex flex-1 flex-col gap-2">
          {compliance.title && <h3 className={heading.card}>{compliance.title}</h3>}
          {compliance.text && <p className={type.small}>{compliance.text}</p>}
        </div>
      )}
      <div className="shrink-0">
        <LinkButton href={compliance.action.href}>{compliance.action.label}</LinkButton>
      </div>
    </Plate>
  )
}

// Enterprise security (2026-11-21): what protects the data, the certifications as badges, and the way to the Trust
// Center for the reports. Only controls and certifications the site names.
export function SecurityCompliance({
  header,
  layout = "grid",
  features = [],
  checklist = [],
  badges,
  compliance,
  tones = "indigo",
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: SecurityComplianceProps) {
  const action = header.action ? (
    <LinkButton href={header.action.href} variant="secondary">
      {header.action.label}
    </LinkButton>
  ) : undefined

  if (layout === "split") {
    return (
      <Section
        theme={theme}
        surface={surface}
        pattern={pattern}
        cardPattern={cardPattern}
        id={id}
        className={className}
        innerClassName="grid items-start gap-12 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)"
      >
        <div className="flex flex-col gap-10">
          <SectionHeader kicker={header.kicker} title={header.title} description={header.description} actions={action} />
          <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                <IconTile name="Check" tone="teal" size="sm" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <TrustCenter badges={badges} compliance={compliance} className="lg:mt-12" />
      </Section>
    )
  }

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
      <ul className="web-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <li key={f.title} className="flex flex-col gap-4 px-6 py-8">
            <IconTile name={f.icon} tone={tones === "mixed" ? toneAt(i) : tones} />
            <div className="flex flex-1 flex-col gap-2">
              {f.tag && (
                <Badge variant="outline" className="font-mono">
                  {f.tag}
                </Badge>
              )}
              <h3 className={heading.card}>{f.title}</h3>
              <p className={type.small}>{f.text}</p>
            </div>
            {f.link && (
              <ArrowLink href={f.link.href} className="text-sm">
                {f.link.label}
              </ArrowLink>
            )}
          </li>
        ))}
      </ul>
      <TrustCenter badges={badges} compliance={compliance} row />
    </Section>
  )
}
