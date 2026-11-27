"use client"

import * as React from "react"
import { StarIcon } from "lucide-react"

import { cn } from "@qdrant/design-system/lib/utils"

// Favorites (2026-11-26): a star on each pattern in the Library and each pairing in the Component Explorations. A
// starred one moves to a Favorites group at the top of its page. Kept in this browser (localStorage, one list per
// page), like the saved page mixes: never shared, never committed. It can be missing or blocked, so every read and
// write is guarded.

const EVENT = "qd-favorites"

function read(store: string): string {
  try {
    return window.localStorage.getItem(store) ?? "[]"
  } catch {
    return "[]"
  }
}

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

function write(store: string, ids: string[]) {
  try {
    window.localStorage.setItem(store, JSON.stringify(ids))
  } catch {
    // Kept for this visit only.
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

// The starred ids for one page's list, and a toggle.
export function useFavorites(store: string) {
  const snapshot = React.useCallback(() => read(store), [store])
  const raw = React.useSyncExternalStore(subscribe, snapshot, () => "[]")
  const set = React.useMemo(() => new Set(parse(raw)), [raw])
  return {
    count: set.size,
    has: (id: string) => set.has(id),
    toggle: (id: string) => {
      const current = parse(read(store))
      write(store, current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
    },
  }
}

// The star: outlined, or filled when it's a favorite.
export function StarButton({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
      title={on ? "Remove from favorites" : "Add to favorites"}
      onClick={onToggle}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <StarIcon className={cn("size-4", on && "fill-current")} strokeWidth={1.5} />
    </button>
  )
}
