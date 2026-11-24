"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@qdrant/design-system/components/ui/button"
import { cn } from "@qdrant/design-system/lib/utils"

import { ASSETS } from "./assets"
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
  className,
}: {
  label?: string
  text: string
  agents?: AgentId[]
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const forAgents = agentIds && agentIds.length > 0
  const button = (
    <Button
      variant="ghost"
      size="icon-sm"
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
      <div className={cn("web-plate inline-flex max-w-full items-center gap-2.5 rounded-lg py-1 pr-1 pl-3", className)}>
        <span className="flex items-center gap-2.5 text-muted-foreground">
          {agentIds.map((id) => (
            <MonoImage key={id} src={agents[id].src} label={agents[id].name} className="size-4" />
          ))}
        </span>
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
        <span aria-hidden className="h-5 w-px bg-(--web-line)" />
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
        <code className="truncate font-mono text-sm text-foreground">{text}</code>
      </span>
      {button}
    </div>
  )
}
