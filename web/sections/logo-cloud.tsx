import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import { ArrowLink } from "../lib/arrow-link"
import { customerLogos } from "../content/customer-logos"
import { CustomerLogo } from "../lib/customer-logo"
import { Section, type SectionProps } from "../lib/section"
import { type } from "../lib/type"

export type LogoCloudProps = SectionProps & {
  // row: a quiet label above one row of logos. grid: logos in a hairline cell grid that reaches the rails.
  // Proposals (2026-11-24): wall, a denser hairline grid of six across whose logos turn to their colors on hover;
  // marquee, one row that drifts slowly sideways, faded at both ends, still on hover and for reduced motion.
  layout?: "row" | "grid" | "wall" | "marquee"
  label?: string
  // Each logo: its company name and its id in the customer logo library (content/customer-logos.ts), or a file
  // in web/assets/logos. With neither, the name stands in, set as text.
  logos: { name: string; logo?: string; src?: string }[]
  action?: Link
}

// Logos are one color in the text's muted color, so a row blends in and follows the theme; the wall shows a logo's
// colors on hover.
// Logos share an optical size, not a height: a wide wordmark is 28px tall, a squarer mark up to 40px, so a row of
// them looks even.
function logoHeight(id: string) {
  const data = customerLogos.find((l) => l.id === id)
  const ratio = data ? data.width / data.height : 4
  return ratio < 1.6 ? "h-10" : ratio < 2.6 ? "h-9" : ratio < 3.6 ? "h-8" : "h-7"
}

function Logo({ name, logo, src, hoverColor }: { name: string; logo?: string; src?: string; hoverColor?: boolean }) {
  if (logo) {
    const h = logoHeight(logo)
    return hoverColor ? (
      <span className="relative grid place-items-center">
        <CustomerLogo
          id={logo}
          version="mono"
          className={cn(h, "max-w-32 text-muted-foreground transition-opacity duration-300 group-hover/logo:opacity-0")}
        />
        <CustomerLogo
          id={logo}
          version="color"
          className={cn(h, "absolute hidden max-w-32 opacity-0 transition-opacity duration-300 group-hover/logo:opacity-100 light:block")}
        />
        <CustomerLogo
          id={logo}
          version="light"
          className={cn(h, "absolute max-w-32 opacity-0 transition-opacity duration-300 group-hover/logo:opacity-100 light:hidden")}
        />
      </span>
    ) : (
      <CustomerLogo id={logo} version="mono" className={cn(h, "max-w-32 text-muted-foreground")} />
    )
  }
  return src ? (
    <img src={src} alt={name} className="h-7 w-auto max-w-32 opacity-80" />
  ) : (
    <span className="font-display text-lg font-medium tracking-tight text-muted-foreground">{name}</span>
  )
}

// Customer or partner logos (2026-11-21). A logo is never redrawn; it's shown in one color (the customer logo
// library's mono version) or in its own colors.
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
      ) : layout === "wall" ? (
        <ul className="web-grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((logo) => (
            <li key={logo.name} className="group/logo grid h-24 place-items-center px-5">
              <Logo {...logo} hoverColor />
            </li>
          ))}
        </ul>
      ) : layout === "marquee" ? (
        <div className="web-marquee web-bleed overflow-hidden">
          <ul className="web-marquee-track flex w-max items-center">
            {[...logos, ...logos].map((logo, i) => (
              <li key={`${logo.name}-${i}`} aria-hidden={i >= logos.length || undefined} className="shrink-0 px-8">
                <Logo {...logo} />
              </li>
            ))}
          </ul>
        </div>
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
