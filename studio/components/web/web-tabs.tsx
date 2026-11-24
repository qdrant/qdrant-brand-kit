"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@qdrant/design-system/lib/utils"

// The Web page's views (Juan, 2026-11-21): Canvas, every section side by side like a Figma page; Docs, one
// section at a time with its variants, modes and how to use it; Pages, whole pages; Builder, to put pages
// together from the sections.
const tabs = [
  { href: "/web/canvas", label: "Canvas" },
  { href: "/web/docs", label: "Docs" },
  { href: "/web/patterns", label: "Patterns" },
  { href: "/web/pages", label: "Pages" },
  { href: "/web/builder", label: "Builder" },
]

export function WebTabs() {
  const pathname = usePathname()
  return (
    <nav aria-label="Web" className="flex items-center gap-1 border-b px-6 py-2">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm hover:bg-muted",
              active ? "bg-muted font-semibold text-foreground" : "text-muted-foreground"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
