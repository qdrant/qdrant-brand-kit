"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

import { Button } from "@qdrant/design-system/components/ui/button"
import { Label } from "@qdrant/design-system/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@qdrant/design-system/components/ui/native-select"
import { Separator } from "@qdrant/design-system/components/ui/separator"
import { Slider } from "@qdrant/design-system/components/ui/slider"
import { cn } from "@qdrant/design-system/lib/utils"

import { accents, defaults, overrideCss, radii, type Controls } from "@/lib/overrides"

const nav = [
  { href: "/", label: "Overview" },
  { href: "/design-system", label: "Design system" },
  { href: "/web", label: "Web" },
]

export function StudioPanel() {
  const pathname = usePathname()
  const { setTheme } = useTheme()
  const [controls, setControls] = React.useState<Controls>(defaults)
  const [copied, setCopied] = React.useState(false)
  const css = overrideCss(controls)
  const set = <K extends keyof Controls>(key: K, value: Controls[K]) => setControls((c) => ({ ...c, [key]: value }))

  async function copyCss() {
    await navigator.clipboard.writeText(css || "/* No changes from the design system's defaults. */")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <aside className="bg-card text-card-foreground sticky top-0 flex h-svh w-72 shrink-0 flex-col gap-6 overflow-y-auto border-r p-6">
      {/* Live overrides: only while you try values. Copy the ones to keep into the design system. */}
      <style id="studio-overrides">{css}</style>

      <div className="flex items-center gap-2">
        <Image src="/repo/brand-assets/logo/qdrant-logo-dark.svg" alt="Qdrant" width={96} height={28} className="light:hidden h-6 w-auto" />
        <Image src="/repo/brand-assets/logo/qdrant-logo-light.svg" alt="Qdrant" width={96} height={28} className="light:block hidden h-6 w-auto" />
        <span className="text-muted-foreground font-mono text-xs uppercase">Studio</span>
      </div>

      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:bg-muted rounded-md px-2 py-2 text-sm",
                active ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          )
        })}
        <span className="text-muted-foreground/60 px-2 py-2 text-sm">Product (later)</span>
      </nav>

      <Separator />

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs font-medium uppercase">Theme</span>
        {/* The active theme is marked with CSS (dark:/light:), not from JS, so server and browser render the same. */}
        <div className="flex gap-2">
          <Button variant="ghost" className="dark:bg-secondary dark:text-secondary-foreground" onClick={() => setTheme("dark")}>
            Dark
          </Button>
          <Button variant="ghost" className="light:bg-secondary light:text-secondary-foreground" onClick={() => setTheme("light")}>
            Light
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-muted-foreground text-xs font-medium uppercase">Try values</span>

        <div className="flex flex-col gap-2">
          <Label htmlFor="studio-accent">Accent</Label>
          <NativeSelect id="studio-accent" value={controls.accent} onChange={(e) => set("accent", e.target.value)}>
            {accents.map((a) => (
              <NativeSelectOption key={a} value={a}>
                {a}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="studio-radius">Corner radius</Label>
          <NativeSelect id="studio-radius" value={controls.radius} onChange={(e) => set("radius", e.target.value)}>
            {radii.slice(0, 5).map((r) => (
              <NativeSelectOption key={r} value={r}>
                {r}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Heading width: {controls.headingWidth}%</Label>
          <Slider
            min={75}
            max={125}
            step={5}
            value={controls.headingWidth}
            onValueChange={(v) => set("headingWidth", Array.isArray(v) ? v[0]! : v)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Glow: {controls.glow}%</Label>
          <Slider
            min={0}
            max={100}
            step={5}
            value={controls.glow}
            onValueChange={(v) => set("glow", Array.isArray(v) ? v[0]! : v)}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={copyCss}>{copied ? "Copied" : "Copy CSS"}</Button>
          <Button variant="outline" onClick={() => setControls(defaults)}>
            Reset
          </Button>
        </div>
        {css && <pre className="bg-muted text-muted-foreground overflow-x-auto rounded-md p-2 font-mono text-xs">{css}</pre>}
      </div>
    </aside>
  )
}
