"use client"

import * as React from "react"
import { DialRoot, useDialKitController } from "dialkit"
import { useTheme } from "next-themes"

import { toCss, toDialConfig } from "@/lib/dials"
import { controls } from "@/lib/overrides"

// True only in the browser, so server and browser render the same first frame: the saved values and
// the theme are only known in the browser.
const subscribe = () => () => {}
function useMounted() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}

const config = {
  ...toDialConfig(controls),
  copyCss: { type: "action" as const, label: "Copy CSS" },
  reset: { type: "action" as const, label: "Reset" },
}

// The right panel: DialKit's global controls for every component (lib/overrides.ts). Values are saved
// in this browser, and DialKit's versions let you save and compare looks.
export function StudioControls() {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const [copied, setCopied] = React.useState(false)
  const controllerRef = React.useRef<{ getValues: () => Record<string, unknown>; resetValues: () => void }>(null)

  const controller = useDialKitController("Design system", config, {
    id: "studio-design-system-v2",
    persist: true,
    onAction(action) {
      const current = controllerRef.current
      if (!current) return
      if (action === "reset") current.resetValues()
      if (action === "copyCss") {
        const css = toCss(controls, current.getValues())
        void navigator.clipboard.writeText(css || "/* No changes from the design system's defaults. */")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    },
  })
  React.useEffect(() => {
    controllerRef.current = controller
  }, [controller])

  const css = toCss(controls, controller.values as Record<string, unknown>)

  return (
    <aside className="bg-card text-card-foreground sticky top-0 flex h-svh w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l p-4">
      {/* Live overrides: only while you try values. Copy the ones to keep into the design system. */}
      {mounted && <style id="studio-overrides">{css}</style>}
      {mounted && <DialRoot mode="inline" theme={resolvedTheme === "light" ? "light" : "dark"} productionEnabled />}
      {mounted && (
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-xs font-medium uppercase">
            {copied ? "Copied" : css ? "Changes from the design system" : "No changes from the design system"}
          </span>
          {css && <pre className="bg-muted text-muted-foreground overflow-x-auto rounded-md p-2 font-mono text-xs">{css}</pre>}
        </div>
      )}
    </aside>
  )
}
