"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { ProseBlock } from "../content/listings"
import type { Link } from "../content/site"
import { ArrowLink } from "../lib/arrow-link"
import { Code, languageOf } from "../lib/code"
import { MediaFrame } from "../lib/media-frame"
import { Section, type SectionProps } from "../lib/section"
import { heading, type } from "../lib/type"
import { Inline } from "./blog-grid"

export type TocEntry = { id: string; label: string; level?: 2 | 3 | number }

export type ArticleProps = SectionProps & {
  title: string
  authors?: string
  date?: string
  // Show the hero image slot under the title.
  heroImage?: boolean
  // The "On this page" list, from lg; its title.
  toc?: TocEntry[]
  tocTitle?: string
  blocks: ProseBlock[]
  share?: Link[]
}

// Long-form text from blocks: headings (with ids for the contents), paragraphs, lists, code, a quote and a figure.
// Shared with the legal section.
export function Prose({ blocks, className }: { blocks: ProseBlock[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-5 [overflow-wrap:anywhere]", className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} id={block.id} className={cn(type.h6, "mt-8 scroll-mt-24 first:mt-0 md:text-(length:--qd-type-h5-size) md:leading-(--qd-type-h5-line-height)")}>
                <Inline text={block.text} />
              </h2>
            )
          case "h3":
            return (
              <h3 key={i} id={block.id} className={cn(heading.card, "mt-4 scroll-mt-24")}>
                <Inline text={block.text} />
              </h3>
            )
          case "p":
            return (
              <p key={i} className={cn(type.body, "text-pretty")}>
                <Inline text={block.text} />
              </p>
            )
          case "list": {
            const List = block.ordered ? "ol" : "ul"
            return (
              <List key={i} className={cn(type.body, "flex flex-col gap-2 pl-5", block.ordered ? "list-decimal" : "list-disc marker:text-(--web-indigo-text)")}>
                {block.items.map((item) => (
                  <li key={item} className="pl-1">
                    <Inline text={item} />
                  </li>
                ))}
              </List>
            )
          }
          case "code":
            return (
              <figure key={i} className="web-plate my-2 overflow-hidden rounded-xl">
                {block.title && (
                  <figcaption className="border-b border-(--web-line) px-4 py-2.5 font-mono text-xs text-muted-foreground">{block.title}</figcaption>
                )}
                <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-foreground">
                  <Code code={block.code} language={languageOf(block.title)} />
                </pre>
              </figure>
            )
          case "quote":
            return (
              <blockquote key={i} className="my-2 border-l-2 border-(--web-indigo) py-1 pl-6">
                <p className={cn(type.xl, "text-foreground")}>
                  <Inline text={block.text} />
                </p>
                {block.cite && <footer className={cn(type.small, "mt-3 font-mono")}>{block.cite}</footer>}
              </blockquote>
            )
          case "figure":
            return (
              <figure key={i} className="my-2 flex flex-col gap-3">
                <div className="web-tray rounded-[calc(var(--radius-xl)+6px)]">
                  <MediaFrame label={block.label ?? "Image"} className="web-plate" />
                </div>
                {block.caption && <figcaption className={cn(type.small, "text-center")}>{block.caption}</figcaption>}
              </figure>
            )
        }
      })}
    </div>
  )
}

// The id of the heading nearest the top of the screen, for the contents' active state.
function useActiveHeading(ids: string[]) {
  const [active, setActive] = React.useState(ids[0])
  React.useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!els.length || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "0px 0px -70% 0px" }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])
  return active
}

// A table of contents: the section's headings, the current one marked in indigo. Shared with the legal section.
export function Contents({ title, entries }: { title?: string; entries: TocEntry[] }) {
  const ids = React.useMemo(() => entries.map((e) => e.id), [entries])
  const active = useActiveHeading(ids)
  return (
    <nav aria-label={title ?? "Contents"} className="flex flex-col gap-4">
      {title && <p className={type.kicker}>{title}</p>}
      <ol className="flex flex-col border-l border-(--web-line)">
        {entries.map((entry) => {
          const on = entry.id === active
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={on ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1.5 text-sm leading-snug transition-colors",
                  entry.level === 3 ? "pl-7" : "pl-4",
                  on ? "border-(--web-indigo) text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Inline text={entry.label} />
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function Share({ links, className }: { links: Link[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-6 gap-y-2", className)}>
      {links.map((link) => (
        <li key={link.href}>
          <ArrowLink href={link.href} target="_blank" rel="noreferrer" className="text-sm">
            {link.label}
          </ArrowLink>
        </li>
      ))}
    </ul>
  )
}

// A blog post (2026-11-21): the title and who wrote it when, a hero image slot, then the prose with
// "On this page" beside it from lg, sticky as the reader scrolls, and share links.
export function Article({
  title,
  authors,
  date,
  heroImage = true,
  toc,
  tocTitle = "On this page",
  blocks,
  share,
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: ArticleProps) {
  const entries = toc ?? blocks.flatMap((b) => (b.type === "h2" || b.type === "h3" ? [{ id: b.id, label: b.text, level: b.type === "h2" ? 2 : 3 }] : []))
  return (
    <Section
      theme={theme}
      surface={surface}
      pattern={pattern}
      cardPattern={cardPattern}
      spacing="compact"
      id={id}
      className={cn("overflow-visible", className)}
      innerClassName="flex flex-col gap-10 lg:gap-14"
    >
      <header className="flex max-w-3xl flex-col gap-6">
        <h1 className={cn(type.h5, "text-balance md:text-(length:--qd-type-h4-size) md:leading-(--qd-type-h4-line-height) lg:text-(length:--qd-type-h3-size) lg:leading-(--qd-type-h3-line-height)")}>
          {title}
        </h1>
        {(authors || date) && (
          <p className={cn(type.small, "flex flex-wrap items-center gap-x-3 gap-y-1")}>
            {authors && <span className="text-foreground">{authors}</span>}
            {authors && date && <span aria-hidden className="size-1 rounded-full bg-(--web-line-strong)" />}
            {date && <time className="font-mono">{date}</time>}
          </p>
        )}
      </header>
      {heroImage && (
        <div className="web-tray rounded-[calc(var(--radius-xl)+6px)]">
          <MediaFrame label="Hero image" className="web-plate aspect-[21/9]" />
        </div>
      )}
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
        <article className="flex max-w-3xl min-w-0 flex-col gap-10">
          <Prose blocks={blocks} />
          {share && share.length > 0 && <Share links={share} className="web-rule pt-6" />}
        </article>
        {entries.length > 0 && (
          <aside className="hidden flex-col gap-8 lg:sticky lg:top-8 lg:flex">
            <Contents title={tocTitle} entries={entries} />
            {share && share.length > 0 && <Share links={share} className="web-rule flex-col pt-6" />}
          </aside>
        )}
      </div>
    </Section>
  )
}
