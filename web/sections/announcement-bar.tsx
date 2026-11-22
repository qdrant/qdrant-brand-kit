import { ArrowRight } from "lucide-react"

import { Badge } from "@qdrant/design-system/components/ui/badge"

import { Section, type SectionProps } from "../lib/section"
import type { Link } from "../content/site"

export type AnnouncementBarProps = SectionProps & {
  // A short mono tag before the text, like a release number.
  tag?: string
  text: string
  link?: Link
}

// One line above the navbar for the news of the moment, usually a release (2026-11-21). The whole bar is the
// link. Keep the text to one line on desktop; on phones it wraps.
export function AnnouncementBar({ tag, text, link, theme, surface = "raised", id, className }: AnnouncementBarProps) {
  const content = (
    <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm">
      {tag && (
        <Badge variant="outline" className="font-mono">
          {tag}
        </Badge>
      )}
      <span className="text-foreground">{text}</span>
      {link && (
        <span className="inline-flex items-center gap-1 font-medium text-(--qd-color-primary-text)">
          {link.label}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      )}
    </span>
  )
  return (
    <Section
      theme={theme}
      surface={surface}
      spacing="none"
      id={id}
      className={className}
      innerClassName="py-2.5"
    >
      {link ? (
        <a href={link.href} className="group flex justify-center outline-none focus-visible:underline">
          {content}
        </a>
      ) : (
        <div className="flex justify-center">{content}</div>
      )}
    </Section>
  )
}
