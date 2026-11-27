"use client"

import { DiagramFrame } from "./diagrams/frame"
import { ServerlessTenants } from "./diagrams/serverless-tenants"

// The Qdrant Serverless page's visuals (2026-11-26, the page is "Coming soon").

// The hero, bare and wide: many small, isolated tenants that wake when used and idle again, with no cluster around
// them, and a new one created, loaded and searched in turn (the page's own steps; checked against the page's copy,
// as serverless has no docs yet).
export function ServerlessHero() {
  return (
    <DiagramFrame width={1200} aspect="4 / 1">
      <ServerlessTenants />
    </DiagramFrame>
  )
}
