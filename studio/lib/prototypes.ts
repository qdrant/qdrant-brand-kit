// Space-theme prototypes (design-system/DESIGN.md, "References" and "Still to explore"): studio-only overrides
// of design-system tokens, switched on and off from the Overview heading so they can be compared on the real
// components. Nothing here is decided. A prototype that's kept moves into design-system/styles/components/ with
// a dated line in DESIGN.md, and leaves this file.

import * as React from "react"

export type Prototype = { id: string; label: string; description: string; css: string }

// Kept on 2026-11-14 and moved into the design system (DESIGN.md): light from above, telemetry captions,
// weightless motion and glass dialogs. Add the next ones here, one object each: { id, label, description, css }.
export const prototypes: Prototype[] = []

// Which prototypes are on: saved in this browser, shared by every page and tab of the studio.
const KEY = "studio-space-prototypes"
const listeners = new Set<() => void>()
let memory = "[]"

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? memory
  } catch {
    return memory
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onStorage)
  }
}

function parse(raw: string): string[] {
  try {
    const ids = JSON.parse(raw)
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : []
  } catch {
    return []
  }
}

// Switch one prototype on or off, from the saved state at the time of the click.
export function setPrototype(id: string, on: boolean) {
  const others = parse(read()).filter((a) => a !== id)
  setActivePrototypes(on ? [...others, id] : others)
}

function setActivePrototypes(ids: string[]) {
  memory = JSON.stringify(ids)
  try {
    localStorage.setItem(KEY, memory)
  } catch {
    // Private windows can refuse storage; the choice then lasts until the page reloads.
  }
  listeners.forEach((l) => l())
}

export function useActivePrototypes(): string[] {
  const raw = React.useSyncExternalStore(subscribe, read, () => "[]")
  return React.useMemo(() => parse(raw), [raw])
}
