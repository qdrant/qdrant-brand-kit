"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import { Code, type CodeLanguage } from "./code"

// The same code in more than one form, one tab each (Python and Rust, an SDK and a CLI), in the code panel's frame:
// the tabs in its title bar, like the code showcase's (2026-11-26). For a section's visual slot; the frame around
// it (tray and plate) comes from the section.
export function CodeTabs({
  tabs,
  className,
}: {
  tabs: { label: string; code: string; language?: CodeLanguage }[]
  className?: string
}) {
  const [active, setActive] = React.useState(0)
  const tab = tabs[active] ?? tabs[0]
  return (
    <figure
      className={cn(
        "flex min-w-0 flex-col overflow-hidden bg-card text-left",
        className
      )}
    >
      <div
        role="tablist"
        className="flex items-center gap-1 border-b border-(--web-line) px-2 py-1.5"
      >
        {tabs.map((t, i) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-md px-3 py-1.5 font-mono text-xs outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)",
              i === active
                ? "web-selected"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-foreground">
        {tab && <Code code={tab.code} language={tab.language ?? "text"} />}
      </pre>
    </figure>
  )
}
