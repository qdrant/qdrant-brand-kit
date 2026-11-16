"use client"

import * as React from "react"

import { NativeSelect, NativeSelectOption } from "@qdrant/design-system/components/ui/native-select"

import Preview from "@/examples/preview"
import { useProductContext } from "@/components/product-context"
import { PrototypeToggles } from "@/components/prototype-toggles"

// shadcn's preview lays its cards out 2,600px wide (plus its padding). It opens at 100%, the real size;
// "Fit" scales it to the window, so you see almost every component at once.
const PREVIEW_WIDTH = 2648
const zooms = [
  { value: "fit", label: "Fit" },
  { value: "0.5", label: "50%" },
  { value: "0.75", label: "75%" },
  { value: "1", label: "100%" },
]

// The canvas's width, read from the page and kept up to date as the window or panels resize.
function useWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const el = ref.current
      if (!el) return () => {}
      const observer = new ResizeObserver(onChange)
      observer.observe(el)
      window.addEventListener("resize", onChange)
      return () => {
        observer.disconnect()
        window.removeEventListener("resize", onChange)
      }
    },
    [ref]
  )
  return React.useSyncExternalStore(
    subscribe,
    () => ref.current?.clientWidth ?? 0,
    () => 0
  )
}

// In the product context, so the accent is indigo (Juan, 2026-11-15).
export function OverviewCanvas() {
  useProductContext()
  const ref = React.useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = React.useState("1")
  const width = useWidth(ref)
  const fit = width ? Math.min(1, width / PREVIEW_WIDTH) : 0.5
  // The cards render in the browser only: some show today's date in the browser's locale, which the
  // server can't know.
  const mounted = width > 0

  return (
    <div data-context="product" className="flex flex-col">
      <header className="flex flex-wrap items-center gap-4 px-4 py-3">
        <h1 className="text-sm font-semibold">Overview</h1>
        {/* Space-theme prototypes to compare on the real components (lib/prototypes.ts). */}
        <PrototypeToggles />
        <div className="ml-auto">
          <NativeSelect aria-label="Zoom" value={zoom} onChange={(e) => setZoom(e.target.value)}>
            {zooms.map((z) => (
              <NativeSelectOption key={z.value} value={z.value}>
                {z.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </header>
      <div ref={ref} className="min-w-0">
        <div style={{ zoom: zoom === "fit" ? fit : Number(zoom) }}>{mounted && <Preview />}</div>
      </div>
    </div>
  )
}
