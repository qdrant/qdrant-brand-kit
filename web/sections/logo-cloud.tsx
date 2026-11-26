import type * as React from "react"
import { ArrowRight, ArrowUpRight } from "lucide-react"

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
  // in web/assets/logos. With neither, the name stands in, set as text. href: the customer's case study; in the
  // grid its cell is a link, marked with an arrow (design lead, 2026-11-26).
  logos: { name: string; logo?: string; src?: string; href?: string }[]
  action?: Link
}

// Logos are one color in the text's muted color, so a row blends in and follows the theme; the wall shows a logo's
// colors on hover.
// Logos share an optical size, not a height: a wide wordmark is 28px tall, a squarer mark up to 40px, so a row of
// them looks even.
function logoSize(id: string): React.CSSProperties {
  const data = customerLogos.find((l) => l.id === id)
  const ratio = data ? data.width / data.height : 4
  // Optical balance (design lead, 2026-11-26): every logo gets about the same area, the area of a square mark 40px
  // across and of Disney and Bazaarvoice at their size (about 2,000 px²), so a wide wordmark is shorter than a squarer
  // mark and none looks louder; between 16 and 40px tall.
  const height = Math.round(Math.min(40, Math.max(16, Math.sqrt(2000 / ratio))))
  return { height, width: "auto" }
}

function Logo({ name, logo, src, hoverColor }: { name: string; logo?: string; src?: string; hoverColor?: boolean }) {
  if (logo) {
    const size = logoSize(logo)
    return hoverColor ? (
      <span className="relative grid place-items-center">
        <CustomerLogo
          id={logo}
          version="mono"
          style={size}
          className={cn("max-w-32 text-muted-foreground transition-opacity duration-300 group-hover/logo:opacity-0")}
        />
        <CustomerLogo
          id={logo}
          version="color"
          style={size}
          className={cn("absolute hidden max-w-32 opacity-0 transition-opacity duration-300 group-hover/logo:opacity-100 light:block")}
        />
        <CustomerLogo
          id={logo}
          version="light"
          style={size}
          className={cn("absolute max-w-32 opacity-0 transition-opacity duration-300 group-hover/logo:opacity-100 light:hidden")}
        />
      </span>
    ) : (
      <CustomerLogo
        id={logo}
        version="mono"
        style={size}
        className="block max-w-32 text-muted-foreground transition-colors duration-200 group-hover/cell:text-foreground"
      />
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
      {(label || (action && layout !== "grid")) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {label && <p className={cn(type.small, "font-mono uppercase")}>{label}</p>}
          {action && layout !== "grid" && (
            <ArrowLink href={action.href} className="text-sm">
              {action.label}
            </ArrowLink>
          )}
        </div>
      )}
      {layout === "grid" ? (
        // Every logo turns to the text color on hover. A logo with a case study is a link: the whole cell, with an
        // arrow in its corner and a subtle indigo light from the bottom on hover. The action is
        // the grid's last cell (design lead, 2026-11-26).
        <ul className="web-grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {logos.map((logo) => (
            <li key={logo.name} className="group/cell relative grid h-24 place-items-center px-6">
              {logo.href ? (
                <a href={logo.href} aria-label={`${logo.name} case study`} className="absolute inset-0 grid place-items-center px-6 outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color) focus-visible:ring-inset">
                  <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklab,var(--web-indigo)_16%,transparent),transparent_75%)] opacity-0 transition-opacity duration-300 group-hover/cell:opacity-100" />
                  <ArrowUpRight aria-hidden className="absolute top-3 right-3 size-3.5 text-(--web-link) opacity-0 transition-opacity duration-300 group-hover/cell:opacity-100" />
                  <span className="relative grid place-items-center"><Logo {...logo} /></span>
                </a>
              ) : (
                <Logo {...logo} />
              )}
            </li>
          ))}
          {action && (
            <li className="group/cell relative">
              {/* The label centered, its arrow kept with the last word, so it follows the text when it wraps
                  (design lead, 2026-11-26). */}
              <a href={action.href} className="absolute inset-0 grid place-items-center px-4 text-center text-sm text-muted-foreground transition-colors group-hover/cell:text-foreground">
                <span className="text-balance">
                  {action.label.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="whitespace-nowrap">
                    {action.label.split(" ").at(-1)}
                    <ArrowRight aria-hidden className="ml-1 inline size-4 align-[-3px]" />
                  </span>
                </span>
              </a>
            </li>
          )}
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
