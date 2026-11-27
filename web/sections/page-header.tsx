import { Search } from "lucide-react"

import { InputGroup, InputGroupAddon, InputGroupInput } from "@qdrant/design-system/components/ui/input-group"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import { LinkButton } from "../lib/link-button"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"

export type PageHeaderProps = SectionProps & {
  // simple: left-aligned, the opener of an inner page. search: centered, with a search field, for an index page.
  layout?: "simple" | "search"
  kicker?: string
  title: string
  description?: string
  // A search field: its placeholder, and where it sends the query (as ?q=).
  search?: { placeholder: string; action?: string }
  primary?: Link
  secondary?: Link
}

// The opener of an index or inner page (2026-11-21): a kicker, the page's H1, a line, and a search
// field or actions. Smaller than a hero: it names the page and gets out of the way.
export function PageHeader({
  layout = "simple",
  kicker,
  title,
  description,
  search,
  primary,
  secondary,
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: PageHeaderProps) {
  const centered = layout === "search"
  const actions =
    primary || secondary ? (
      <>
        {primary && <LinkButton href={primary.href}>{primary.label}</LinkButton>}
        {secondary && (
          <LinkButton href={secondary.href} variant="secondary">
            {secondary.label}
          </LinkButton>
        )}
      </>
    ) : undefined

  const searchEl = search ? (
    <form role="search" action={search.action} className={cn("w-full max-w-xl", centered && "mx-auto")}>
      <InputGroup className="h-12 bg-card">
        <InputGroupAddon>
          <Search className="size-4" aria-hidden />
        </InputGroupAddon>
        <InputGroupInput name="q" type="search" placeholder={search.placeholder} aria-label={search.placeholder} />
      </InputGroup>
    </form>
  ) : null

  return (
    <Section
      theme={theme}
      surface={surface}
      pattern={pattern}
      cardPattern={cardPattern}
      spacing="compact"
      id={id}
      className={className}
      innerClassName={cn("flex flex-col gap-8", centered ? "items-center" : "items-start")}
    >
      <SectionHeader
        as="h1"
        align={centered ? "center" : "left"}
        kicker={kicker}
        title={title}
        description={description}
        actions={actions}
        className={centered ? undefined : "max-w-3xl"}
      />
      {searchEl}
    </Section>
  )
}
