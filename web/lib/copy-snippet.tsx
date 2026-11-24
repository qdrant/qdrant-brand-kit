"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@qdrant/design-system/components/ui/button"
import { cn } from "@qdrant/design-system/lib/utils"

// One line of text to copy, like a prompt for an agent or an install command: a quiet label, the text in mono,
// and a copy button that confirms for two seconds.
export function CopySnippet({ label, text, className }: { label?: string; text: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)
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
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={copied ? "Copied" : "Copy"}
        onClick={() => {
          navigator.clipboard?.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          })
        }}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  )
}
