import { cn } from "@qdrant/design-system/lib/utils"

import type { FormSpec } from "../content/conversion"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { IconTile, toneAt } from "../lib/tone"
import { heading, type } from "../lib/type"
import { SiteForm } from "./contact"

export type SignupFormProps = SectionProps & {
  // application: benefits on plates, each with an icon, beside the form. waitlist: numbered reasons on hairlines
  // beside the form.
  layout?: "application" | "waitlist"
  header: HeaderProps
  benefitsTitle?: string
  benefitsDescription?: string
  benefits: { title: string; text?: string; icon?: string }[]
  // A closing line under the benefits.
  aside?: string
  form: FormSpec
}

// An application or a waitlist (2026-11-21): what joining gets you on the left, the site's form on the right. The
// form isn't wired: a page connects it.
export function SignupForm({ layout = "application", header, benefitsTitle, benefitsDescription, benefits, aside, form, theme, surface, pattern, cardPattern, id, className }: SignupFormProps) {
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader kicker={header.kicker} title={header.title} description={header.description} />
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-(--qd-layout-column-gap)">
        <div className="flex flex-col gap-6">
          {(benefitsTitle || benefitsDescription) && (
            <div className="flex flex-col gap-2">
              {benefitsTitle && <h3 className={heading.card}>{benefitsTitle}</h3>}
              {benefitsDescription && <p className={type.body}>{benefitsDescription}</p>}
            </div>
          )}
          {layout === "application" ? (
            <ul className="flex flex-col gap-3">
              {benefits.map((b, i) => (
                <Plate as="li" simple key={b.title} className="flex items-start gap-4 rounded-xl p-5">
                  {b.icon && <IconTile name={b.icon} tone={toneAt(i)} />}
                  <div className="flex flex-col gap-1">
                    <h4 className={cn(heading.card, "text-lg")}>{b.title}</h4>
                    {b.text && <p className={type.small}>{b.text}</p>}
                  </div>
                </Plate>
              ))}
            </ul>
          ) : (
            <ol className="flex flex-col border-t border-(--web-line)">
              {benefits.map((b, i) => (
                <li key={b.title} className="flex gap-5 border-b border-(--web-line) py-6">
                  <span className="font-mono text-sm text-(--web-indigo-text)">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex flex-col gap-1">
                    <h4 className={cn(heading.card, "text-lg")}>{b.title}</h4>
                    {b.text && <p className={type.small}>{b.text}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {aside && <p className={cn(type.small, "font-mono")}>{aside}</p>}
        </div>
        <SiteForm form={form} />
      </div>
    </Section>
  )
}
