import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import { LinkButton } from "../lib/link-button"
import { Section, type SectionProps } from "../lib/section"
import { heading, type } from "../lib/type"

export type NotFoundProps = SectionProps & {
  // The big code in mono.
  code?: string
  title: string
  // A help line: text and links in order.
  help?: (string | Link)[]
  primary?: Link
  secondary?: Link
}

// The 404 page (2026-11-21): a big "404" in mono, what happened, where to look instead, and two ways out. It fills
// most of the screen.
export function NotFound({ code = "404", title, help, primary, secondary, theme, surface, pattern, cardPattern, id, className }: NotFoundProps) {
  return (
    <Section
      theme={theme}
      surface={surface}
      pattern={pattern}
      cardPattern={cardPattern}
      width="narrow"
      id={id}
      className={cn("grid min-h-[70vh] place-items-center", className)}
      innerClassName="flex flex-col items-center gap-8 text-center"
    >
      <p aria-hidden className="font-mono text-[96px] leading-none tracking-tight text-foreground tabular-nums md:text-[160px]">
        {code}
      </p>
      <div className="flex flex-col items-center gap-4">
        <h1 className={cn(heading.page, "max-w-2xl text-balance")}>{title}</h1>
        {help && help.length > 0 && (
          <p className={cn(type.lead, "max-w-xl text-pretty")}>
            {help.map((part, i) =>
              typeof part === "string" ? (
                <React.Fragment key={i}>{part}</React.Fragment>
              ) : (
                <a key={i} href={part.href} className="web-link underline underline-offset-4">
                  {part.label}
                </a>
              )
            )}
          </p>
        )}
      </div>
      {(primary || secondary) && (
        <div className="flex flex-wrap justify-center gap-3">
          {primary && (
            <LinkButton href={primary.href} size="lg">
              {primary.label}
            </LinkButton>
          )}
          {secondary && (
            <LinkButton href={secondary.href} size="lg" variant="secondary">
              {secondary.label}
            </LinkButton>
          )}
        </div>
      )}
    </Section>
  )
}
