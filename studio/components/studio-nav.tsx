"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { Button } from "@qdrant/design-system/components/ui/button"
import { cn } from "@qdrant/design-system/lib/utils"

const nav = [
  { href: "/", label: "Overview" },
  { href: "/design-system", label: "Design system" },
  { href: "/color", label: "Color" },
  { href: "/typography", label: "Typography" },
  { href: "/web", label: "Web" },
  { href: "/app", label: "App" },
  { href: "/space", label: "Space" },
]

// The top menu: the pages, and the theme on the right.
export function StudioNav() {
  const pathname = usePathname()
  const { setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-6 overflow-x-auto border-b bg-card px-4 text-card-foreground">
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <Image
          src="/repo/brand-assets/logo/qdrant-logo-dark.svg"
          alt="Qdrant"
          width={96}
          height={28}
          loading="eager"
          className="h-5 w-auto light:hidden"
        />
        <Image
          src="/repo/brand-assets/logo/qdrant-logo-light.svg"
          alt="Qdrant"
          width={96}
          height={28}
          loading="eager"
          className="hidden h-5 w-auto light:block"
        />
        <span className="font-mono text-xs text-muted-foreground uppercase">
          Studio
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm whitespace-nowrap hover:bg-muted",
                active
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* The active theme is marked with CSS (dark:/light:), not from JS, so server and browser render the same. */}
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Dark theme"
          title="Dark theme"
          className="dark:bg-secondary dark:text-secondary-foreground"
          onClick={() => setTheme("dark")}
        >
          <Moon />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Light theme"
          title="Light theme"
          className="light:bg-secondary light:text-secondary-foreground"
          onClick={() => setTheme("light")}
        >
          <Sun />
        </Button>
      </div>
    </header>
  )
}
