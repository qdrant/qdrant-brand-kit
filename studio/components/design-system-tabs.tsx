"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@qdrant/design-system/lib/utils"

// The Design system page's two tabs (design lead, 2026-11-21): Components, the list of components and each one's page,
// and Variations, whole alternative looks of the design system.
const tabs = [
  { href: "/design-system", label: "Components" },
  { href: "/design-system/variations", label: "Variations" },
]

export function DesignSystemTabs() {
  const pathname = usePathname()
  const variations = pathname.startsWith("/design-system/variations")

  return (
    <nav aria-label="Design system" className="flex items-center gap-1 border-b px-6 py-2">
      {tabs.map((tab) => {
        const active = tab.label === "Variations" ? variations : !variations
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
