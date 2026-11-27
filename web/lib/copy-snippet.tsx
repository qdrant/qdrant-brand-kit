"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@qdrant/design-system/components/ui/button"
import { cn } from "@qdrant/design-system/lib/utils"

import { ASSETS } from "./assets"
import { Code, type CodeLanguage } from "./code"
import { MonoImage } from "./mono-image"

// The coding agents a prompt is for, as one-color marks in web/assets/logos/agents (design lead, 2026-11-24):
// Claude and Cursor from Simple Icons (CC0, traced from claude.ai and cursor.com/brand), Codex as OpenAI's symbol
// from Wikimedia Commons (public domain, trademarked).
export const agents = {
  claude: { name: "Claude", src: `${ASSETS}/logos/agents/claude.svg` },
  codex: { name: "Codex", src: `${ASSETS}/logos/agents/codex.svg` },
  cursor: { name: "Cursor", src: `${ASSETS}/logos/agents/cursor.svg` },
} as const

export type AgentId = keyof typeof agents

// One line of text to copy, like an install command: a quiet label, the text in mono, and a copy button that
// confirms for two seconds. A prompt for agents (`agents`) shows only the agents' marks and its label; the button
// still copies the text, which shows when you hover it (design lead, 2026-11-24).
export function CopySnippet({
  label,
  text,
  agents: agentIds,
  language,
  className,
}: {
  label?: string
  text: string
  agents?: AgentId[]
  // The text's language, for its syntax colors (lib/code.tsx), like "shell" for an install command.
  language?: CodeLanguage
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const forAgents = agentIds && agentIds.length > 0
  const button = (
    <Button
      variant="ghost"
      size="icon-sm"
      // Beside the agents' divider the icon sits evenly between the line and the outline, 10px each side (design
      // lead, 2026-11-26).
      className={forAgents ? "-ml-1.5" : undefined}
      aria-label={copied ? "Copied" : forAgents ? `Copy: ${text}` : "Copy"}
      title={forAgents ? text : undefined}
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

  if (forAgents) {
    return (
      // Tight (design lead, 2026-11-26): the agents' marks close together, less padding all round. No fill, only a
      // hairline, so it doesn't compete with the secondary buttons (design lead, 2026-11-26).
      <div className={cn("inline-flex max-w-full items-center gap-2 rounded-lg border border-(--web-line) py-0.5 pr-0.5 pl-2.5", className)}>
        {/* The marks and the label in the text color (design lead, 2026-11-26). */}
        <span className="flex items-center gap-1.5 text-foreground">
          {agentIds.map((id) => (
            <MonoImage key={id} src={agents[id].src} label={agents[id].name} className="size-4" />
          ))}
        </span>
        {label && <span className="text-sm text-foreground">{label}</span>}
        <span aria-hidden className="h-4 w-px bg-(--web-line)" />
        {button}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "web-plate flex w-full max-w-2xl items-center gap-3 rounded-lg py-1.5 pr-1.5 pl-4 text-left",
        className
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
        {label && <span className="shrink-0 text-sm text-muted-foreground">{label}</span>}
        {language ? (
          <Code code={text} language={language} className="truncate font-mono text-sm text-foreground" />
        ) : (
          <code className="truncate font-mono text-sm text-foreground">{text}</code>
        )}
      </span>
      {button}
    </div>
  )
}
