import { Sparkles } from "lucide-react"

import { Badge } from "@qdrant/design-system/components/ui/badge"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Profile } from "../content/company"
import { ArrowLink } from "../lib/arrow-link"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { heading, type } from "../lib/type"

export type ProfileGridProps = SectionProps & {
  header: HeaderProps
  profiles: Profile[]
  // The badge's words for a distinguished profile, as the site writes them.
  badge?: string
  columns?: 3 | 4
  layout?: "grid"
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

const cols = { 3: "md:grid-cols-2 lg:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" }

// Community profiles (2026-11-21): a round photo slot, the name, the role in mono and a short bio as written, with
// a badge where the site gives one. The header's link sits on the right. Photos stay initials until supplied.
export function ProfileGrid({ header, profiles, badge = "Distinguished", columns = 3, theme, surface, pattern, cardPattern, id, className }: ProfileGridProps) {
  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <SectionHeader
        layout={header.action ? "action" : "stacked"}
        kicker={header.kicker}
        title={header.title}
        description={header.description}
        actions={header.action ? <ArrowLink href={header.action.href}>{header.action.label}</ArrowLink> : undefined}
      />
      <ul className={cn("grid grid-cols-1 gap-(--web-card-gap)", cols[columns])}>
        {profiles.map((profile) => (
          <Plate as="li" key={profile.name} className="flex flex-col gap-5 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <span
                role="img"
                aria-label={`Photo of ${profile.name}`}
                className="grid size-16 shrink-0 place-items-center rounded-full border border-(--web-line) bg-muted font-mono text-lg text-muted-foreground"
              >
                {initials(profile.name)}
              </span>
              {profile.distinguished && (
                <Badge variant="outline" className="h-auto max-w-full shrink whitespace-normal text-left">
                  <Sparkles className="text-(--web-indigo)" aria-hidden />
                  {badge}
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className={heading.card}>{profile.name}</h3>
              <p className={cn(type.small, "font-mono")}>{profile.role}</p>
            </div>
            <p className={type.small}>{profile.bio}</p>
          </Plate>
        ))}
      </ul>
    </Section>
  )
}
