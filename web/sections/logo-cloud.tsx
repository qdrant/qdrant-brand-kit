import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import { ArrowLink } from "../lib/arrow-link"
import { Section, type SectionProps } from "../lib/section"
import { type } from "../lib/type"

export type LogoCloudProps = SectionProps & {
  // row: a quiet label above one row of logos. grid: logos in a hairline cell grid that reaches the rails.
  layout?: "row" | "grid"
  label?: string
  // Each logo: its company name and, when there is one, its file in web/assets/logos. Without a file the name
  // stands in, set as text, until the logo is exported from the Figma.
  logos: { name: string; src?: string }[]
  action?: Link
}

function Logo({ name, src }: { name: string; src?: string }) {
  return src ? (
    <img src={src} alt={name} className="h-7 w-auto max-w-32 opacity-80" />
  ) : (
    <span className="font-display text-lg font-medium tracking-tight text-muted-foreground">{name}</span>
  )
}

// Customer or partner logos (2026-11-21). A logo is never redrawn or recolored; until the files exist, the
// company name stands in as text.
export function LogoCloud({ layout = "row", label, logos, action, theme, surface, pattern, cardPattern, id, className }: LogoCloudProps) {
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} spacing="compact" id={id} className={className} innerClassName="flex flex-col gap-10">
      {(label || action) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {label && <p className={cn(type.small, "font-mono uppercase")}>{label}</p>}
          {action && (
            <ArrowLink href={action.href} className="text-sm">
              {action.label}
            </ArrowLink>
          )}
        </div>
      )}
      {layout === "grid" ? (
        <ul className="web-grid grid-cols-2 md:grid-cols-4">
          {logos.map((logo) => (
            <li key={logo.name} className="grid h-28 place-items-center px-6">
              <Logo {...logo} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
          {logos.map((logo) => (
            <li key={logo.name}>
              <Logo {...logo} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
