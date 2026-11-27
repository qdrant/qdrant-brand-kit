"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@qdrant/design-system/lib/utils"

import { webPages } from "@/lib/web-pages"

// The Web page's views (design lead, 2026-11-21): Canvas, every section side by side like a Figma page; Docs, one
// section at a time with its variants, modes and how to use it; Patterns; Builder, to put pages together from the
// sections; and Pages, whole pages, last. One bar for all of it (design lead, 2026-11-26): while Pages is open, its
// pages follow it in the same row, after a divider (lib/web-pages.ts).
const tabs = [
  { href: "/web/canvas", label: "Canvas" },
  { href: "/web/docs", label: "Docs" },
  { href: "/web/patterns", label: "Patterns" },
  { href: "/web/builder", label: "Builder" },
  { href: "/web/pages", label: "Pages" },
]

function Tab({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "shrink-0 rounded-md px-3 py-1.5 text-sm hover:bg-muted",
        active
          ? "bg-muted font-semibold text-foreground"
          : "text-muted-foreground"
      )}
    >
      {label}
    </Link>
  )
}

export function WebTabs() {
  const pathname = usePathname()
  const inPages = pathname.startsWith("/web/pages")
  return (
    <nav
      aria-label="Web"
      className="flex items-center gap-1 overflow-x-auto border-b px-6 py-2"
    >
      {tabs.map((tab) => (
        <Tab key={tab.href} {...tab} active={pathname.startsWith(tab.href)} />
      ))}
      {inPages && (
        <>
          <span aria-hidden className="mx-2 h-5 w-px shrink-0 bg-border" />
          <ul aria-label="Pages" className="flex items-center gap-1">
            {webPages.map((page) => (
              <li key={page.href}>
                <Tab
                  {...page}
                  active={
                    pathname === page.href ||
                    pathname.startsWith(`${page.href}/`)
                  }
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </nav>
  )
}
