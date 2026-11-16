"use client"

import { Toggle } from "@qdrant/design-system/components/ui/toggle"

import { SampleDialog } from "@/components/sample-dialog"
import { prototypes, setPrototype, useActivePrototypes } from "@/lib/prototypes"

// One toggle per space-theme prototype (lib/prototypes.ts). They stay on across pages, so a dialog or a
// table elsewhere in the studio shows them too.
export function PrototypeToggles() {
  const active = useActivePrototypes()

  return (
    <div className="flex flex-wrap items-center gap-1" aria-label="Space theme prototypes">
      {prototypes.map((p) => (
        <Toggle
          key={p.id}
          variant="outline"
          size="sm"
          title={p.description}
          pressed={active.includes(p.id)}
          onPressedChange={(on) => setPrototype(p.id, on)}
        >
          {p.label}
        </Toggle>
      ))}
      {/* The Overview has no dialog of its own; this opens one over the cards. */}
      <SampleDialog />
    </div>
  )
}
