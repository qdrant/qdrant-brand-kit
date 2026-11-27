"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@qdrant/design-system/components/ui/button"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import type { TerminalLine } from "../content/platform"
import { ArrowLink } from "../lib/arrow-link"
import { Code } from "../lib/code"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { type } from "../lib/type"

export type InstallCommandProps = SectionProps & {
  header: HeaderProps
  // The commands in order, each with the docs' line before it as a comment.
  lines: TerminalLine[]
  // What the docs show once it runs, under the commands.
  output?: { title?: string; items: { label: string; value: string }[] }
  // The first is the main action, the rest text links.
  links?: Link[]
  // terminal: the heading centered over a terminal window. inline: the heading on the left, the commands on the right.
  layout?: "terminal" | "inline"
}

// The same copy button as CopySnippet (lib/copy-snippet.tsx), for a command that may run over several lines.
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={copied ? "Copied" : "Copy"}
      className="shrink-0"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}

// One command: a prompt sign, the command in mono (scrolling sideways in its own box when it's long), and a copy
// button.
function CommandLine({ line }: { line: TerminalLine }) {
  return (
    <div className="flex flex-col gap-1.5">
      {line.comment && <p className="font-mono text-xs text-muted-foreground"># {line.comment}</p>}
      <div className="flex items-start gap-3">
        <span aria-hidden className="pt-1 font-mono text-[13px] text-(--web-indigo-text) select-none">
          $
        </span>
        <pre className="min-w-0 flex-1 overflow-x-auto pt-1 font-mono text-[13px] leading-relaxed text-foreground">
          <Code code={line.command} language="shell" />
        </pre>
        <CopyButton text={line.command} />
      </div>
    </div>
  )
}

// A terminal-style call to action (2026-11-21): the docs' commands to run Qdrant, each line copyable, with what the
// docs say it serves, and links to the quickstart and the docs. Commands are copied exactly as documented.
export function InstallCommand({
  header,
  lines,
  output,
  links = [],
  layout = "terminal",
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: InstallCommandProps) {
  const [primary, ...rest] = links
  const actions =
    links.length > 0 ? (
      <>
        {primary && <LinkButton href={primary.href}>{primary.label}</LinkButton>}
        {rest.map((l) => (
          <LinkButton key={l.href} href={l.href} variant="secondary">
            {l.label}
          </LinkButton>
        ))}
      </>
    ) : undefined

  const outputEl = output ? (
    <div className="flex flex-col gap-2 border-t border-(--web-line) pt-5">
      {output.title && <p className="font-mono text-xs text-muted-foreground"># {output.title}</p>}
      <dl className="grid gap-x-6 gap-y-1.5 font-mono text-[13px] sm:grid-cols-[auto_minmax(0,1fr)]">
        {output.items.map((item) => (
          <React.Fragment key={item.label}>
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className="text-foreground">{item.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  ) : null

  if (layout === "inline") {
    return (
      <Section
        theme={theme}
        surface={surface}
        pattern={pattern}
        cardPattern={cardPattern}
        spacing="compact"
        id={id}
        className={className}
        innerClassName="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-(--qd-layout-column-gap)"
      >
        <div className="flex flex-col gap-6">
          <SectionHeader kicker={header.kicker} title={header.title} description={header.description} />
          {links.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {links.map((l) => (
                <ArrowLink key={l.href} href={l.href} className="text-sm">
                  {l.label}
                </ArrowLink>
              ))}
            </div>
          )}
        </div>
        <ul className="flex flex-col gap-2">
          {lines.map((line) => (
            <Plate as="li" key={line.command} className="rounded-xl py-4 pr-3 pl-5">
              <CommandLine line={line} />
            </Plate>
          ))}
        </ul>
      </Section>
    )
  }

  return (
    <Section
      theme={theme}
      surface={surface}
      pattern={pattern}
      cardPattern={cardPattern}
      id={id}
      className={className}
      innerClassName="flex flex-col items-center gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)"
    >
      <SectionHeader align="center" kicker={header.kicker} title={header.title} description={header.description} actions={actions} />
      <div className="web-tray w-full max-w-3xl rounded-[calc(var(--radius-xl)+6px)]">
        <Plate as="figure" className="flex flex-col rounded-xl text-left">
          <figcaption className="flex items-center gap-2 border-b border-(--web-line) px-4 py-2.5 font-mono text-xs text-muted-foreground">
            <span className="flex gap-1.5" aria-hidden>
              <span className="web-window-dot size-2.5 rounded-full" />
              <span className="web-window-dot size-2.5 rounded-full" />
              <span className="web-window-dot size-2.5 rounded-full" />
            </span>
            <span className="ml-2">Terminal</span>
          </figcaption>
          <div className={cn("flex flex-col gap-5 py-5 pr-3 pl-5", type.small)}>
            {lines.map((line) => (
              <CommandLine key={line.command} line={line} />
            ))}
            {outputEl}
          </div>
        </Plate>
      </div>
    </Section>
  )
}
