"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { Switch } from "@qdrant/design-system/components/ui/switch"
import { cn } from "@qdrant/design-system/lib/utils"

import Preview from "@/examples/preview"
import { useProductContext } from "@/components/product-context"
import { ServerlessSpace } from "@/product/serverless-space"
import { variationCss, variations } from "@/lib/variations"

export type VariationView = "components" | "app"

const subscribe = () => () => {}

// One variation of the design system (lib/variations.ts) on the Overview's components or on the App's
// serverless space. The variation's CSS applies to the whole studio while this page is open, so menus,
// popovers and dialogs (which open outside the canvas) follow it too. In the product context, so the accent
// is indigo (Juan, 2026-11-15).
export function VariationsCanvas({ id, view }: { id: string; view: VariationView }) {
  useProductContext()
  const router = useRouter()
  const pathname = usePathname()
  // The components render in the browser only: some show today's date in the browser's locale.
  const mounted = React.useSyncExternalStore(subscribe, () => true, () => false)
  const variation = variations.find((v) => v.id === id) ?? variations[0]
  const query = view === "app" ? "?view=app" : ""

  return (
    <div data-variation-canvas data-context="product" className="flex min-h-full flex-col">
      <style id="studio-variation">{variationCss(variation)}</style>
      <header className="flex flex-wrap items-center gap-4 px-4 py-3">
        <nav aria-label="Variations" className="flex flex-wrap items-center gap-1">
          {variations.map((v, i) => (
            <Link
              key={v.id}
              href={`/design-system/variations/${v.id}${query}`}
              title={`${v.description} From ${v.from}.`}
              aria-current={v.id === variation.id ? "page" : undefined}
              className={cn(
                "hover:bg-muted rounded-md px-3 py-1.5 text-sm",
                v.id === variation.id ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"
              )}
            >
              <span className="text-muted-foreground font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>{" "}
              {v.name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className={view === "components" ? "text-foreground" : "text-muted-foreground"}>Components</span>
          <Switch
            aria-label="Show the App screen"
            checked={view === "app"}
            onCheckedChange={(on) => router.replace(`${pathname}${on ? "?view=app" : ""}`, { scroll: false })}
          />
          <span className={view === "app" ? "text-foreground" : "text-muted-foreground"}>App</span>
        </div>
      </header>
      {view === "app" ? <ServerlessSpace /> : mounted && <Preview />}
    </div>
  )
}
