"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@qdrant/design-system/lib/utils"

// The Patterns tab's pages: Library, each pattern on its own; Component Explorations, the patterns on real sections
// (2026-11-24, renamed 2026-11-26); and Pages Explorations, whole pages built from the library with a few of them
// (2026-11-26).
const tabs = [
  { href: "/web/patterns", label: "Library" },
  { href: "/web/patterns/explorations", label: "Component Explorations" },
  { href: "/web/patterns/pages", label: "Pages Explorations" },
]

export function PatternsTabs() {
  const pathname = usePathname()
  return (
    <nav aria-label="Patterns" className="flex items-center gap-1 px-6 pt-4">
      {tabs.map((tab) => {
        // The Library is only its own page; the other tabs hold pages under them (Pages Explorations' pages).
        const active = tab.href === "/web/patterns" ? pathname === tab.href : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-b-2 px-2 py-1.5 text-sm hover:text-foreground",
              active ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
