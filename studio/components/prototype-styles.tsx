"use client"

import { prototypes, useActivePrototypes } from "@/lib/prototypes"

// The CSS of the prototypes that are on (lib/prototypes.ts), on every page of the studio.
export function PrototypeStyles() {
  const active = useActivePrototypes()
  const css = prototypes
    .filter((p) => active.includes(p.id))
    .map((p) => p.css)
    .join("\n")
  return css ? <style id="studio-prototypes">{css}</style> : null
}
