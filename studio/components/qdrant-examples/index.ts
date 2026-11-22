import type { ComponentType } from "react"

// Demos of what Qdrant adds to a component (a variant, a state), shown on its page under shadcn's own demos,
// which are generated and never edited by hand (examples/). Keyed by the component's name in lib/catalog.ts.
export const qdrantExamples: Record<string, () => Promise<{ default: ComponentType }>> = {
  alert: () => import("./alert"),
}
