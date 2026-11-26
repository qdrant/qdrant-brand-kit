"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@qdrant/design-system/lib/utils"

import { webPages } from "@/lib/web-pages"

// The Web page's Pages tab (design lead, 2026-11-26): one tab per whole page from web/pages (lib/web-pages.ts), in a
// row like the Web tabs above, names only so they're quick to scan.

export function PagesTabs() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Pages"
      className="flex items-center gap-1 border-b px-6 py-2"
    >
      {webPages.map((page) => {
        const active = pathname.startsWith(page.href)
        return (
          <Link
            key={page.href}
            href={page.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm hover:bg-muted",
              active
                ? "bg-muted font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {page.label}
          </Link>
        )
      })}
    </nav>
  )
}
