import { Button } from "@qdrant/design-system/components/ui/button"
import { Input } from "@qdrant/design-system/components/ui/input"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import { ASSETS } from "../lib/assets"
import { Logo } from "../lib/logo"
import { MonoImage } from "../lib/mono-image"
import { Section, type SectionProps } from "../lib/section"
import { type } from "../lib/type"

// The social marks in web/assets, each in its own proportions, drawn in the text color. Only GitHub's link is
// confirmed (the site's menu); the others get theirs when someone gives them.
const social: { name: string; file: string; href?: string; className: string }[] = [
  { name: "GitHub", file: "github", href: "https://github.com/qdrant/qdrant", className: "h-[19.5px] w-5" },
  { name: "LinkedIn", file: "linkedin", className: "size-[18.75px]" },
  { name: "X", file: "x", className: "h-[17.5px] w-[19.3px]" },
  { name: "Discord", file: "discord", className: "size-5" },
  { name: "YouTube", file: "youtube", className: "h-[14.2px] w-5" },
]

const badges = [
  { name: "SOC 2", file: "soc-2" },
  { name: "GDPR", file: "gdpr" },
  { name: "HIPAA", file: "hipaa" },
]

export type FooterProps = SectionProps & {
  // full: the brand block, link columns, newsletter, badges and the legal bar. minimal: the legal bar only, for
  // landing pages.
  variant?: "full" | "minimal"
  tagline?: string
  columns?: { title: string; links: Link[] }[]
  newsletter?: { title: string; description?: string }
  legal?: string[]
  copyright: string
}

// The site's footer (2026-11-21). It follows the page theme; the link columns stack two by two on phones.
export function Footer({
  variant = "full",
  tagline,
  columns = [],
  newsletter,
  legal = [],
  copyright,
  theme,
  surface,
  id,
  className,
}: FooterProps) {
  const legalBar = (
    <div className="flex flex-col gap-4 pt-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
      <p>{copyright}</p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {legal.map((item) => (
          <li key={item}>
            <a className="hover:text-foreground">{item}</a>
          </li>
        ))}
      </ul>
    </div>
  )

  if (variant === "minimal") {
    return (
      <Section theme={theme} surface={surface} spacing="none" id={id} className={className} innerClassName="pb-8">
        {legalBar}
      </Section>
    )
  }

  return (
    <Section
      theme={theme}
      surface={surface}
      spacing="compact"
      id={id}
      className={cn("pb-8 lg:pb-8", className)}
      innerClassName="flex flex-col gap-12"
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-6">
          <Logo className="h-8" />
          {tagline && <p className={type.body}>{tagline}</p>}
          <ul className="flex items-center gap-4 text-muted-foreground">
            {social.map((s) => (
              <li key={s.name}>
                <a href={s.href} className="flex hover:text-foreground" aria-label={s.name}>
                  <MonoImage src={`${ASSETS}/social/${s.file}.svg`} label={s.name} className={s.className} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">{col.title}</p>
              <ul className="flex flex-col gap-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-foreground/85 hover:text-foreground">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="web-rule web-bleed grid gap-8 pt-10 lg:grid-cols-2 lg:items-end">
        {newsletter && (
          <form className="web-plate flex flex-col gap-4 rounded-xl p-6" action="#">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-foreground">{newsletter.title}</p>
              {newsletter.description && <p className={cn(type.small, "max-w-md")}>{newsletter.description}</p>}
            </div>
            <div className="flex max-w-md gap-2">
              <Input type="email" placeholder="Enter your email" aria-label="Email" />
              <Button type="submit">Subscribe</Button>
            </div>
          </form>
        )}
        <ul className="flex items-center gap-6 text-muted-foreground lg:justify-end">
          {badges.map((b) => (
            <li key={b.name}>
              <MonoImage src={`${ASSETS}/badges/${b.file}.svg`} label={b.name} className="size-12" />
            </li>
          ))}
        </ul>
      </div>

      <div className="web-rule web-bleed">{legalBar}</div>
    </Section>
  )
}
