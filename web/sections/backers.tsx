import type { Link } from "../content/site"
import { ArrowLink } from "../lib/arrow-link"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"

export type BackersProps = SectionProps & {
  header: HeaderProps
  // Each investor: its name and, when there is one, its logo file in web/assets/logos. Without a file the name
  // stands in, set as text, until the logo is exported.
  investors: { name: string; src?: string }[]
  // The funding line: links to the funding stories, under the grid.
  links?: Link[]
  layout?: "grid"
}

function Mark({ name, src }: { name: string; src?: string }) {
  return src ? (
    <img src={src} alt={name} className="h-8 w-auto max-w-36 opacity-80" />
  ) : (
    <span className="text-center font-display text-xl font-medium tracking-tight text-muted-foreground">{name}</span>
  )
}

// A company's investors (2026-11-21): their logos in a hairline cell grid that reaches the rails, and a funding
// line of links to the rounds' stories. Logos are never redrawn; until the files exist, the names stand in.
export function Backers({ header, investors, links = [], theme, surface, pattern, cardPattern, id, className }: BackersProps) {
  const lgPads = (3 - (investors.length % 3)) % 3
  const smPads = investors.length % 2
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader kicker={header.kicker} title={header.title} description={header.description} />
      <div className="flex flex-col gap-8">
        <ul className="web-grid grid-cols-2 md:grid-cols-3">
          {investors.map((investor) => (
            <li key={investor.name} className="grid h-28 place-items-center px-6 md:h-36">
              <Mark {...investor} />
            </li>
          ))}
          {/* Empty cells fill the last row, so the grid's line color doesn't show through a gap. */}
          {Array.from({ length: smPads }, (_, k) => (
            <li key={`sm-${k}`} aria-hidden className="md:hidden" />
          ))}
          {Array.from({ length: lgPads }, (_, k) => (
            <li key={`md-${k}`} aria-hidden className="hidden md:block" />
          ))}
        </ul>
        {links.length > 0 && (
          <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
            {links.map((link) => (
              <li key={link.href}>
                <ArrowLink href={link.href} className="text-sm">
                  {link.label}
                </ArrowLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  )
}
