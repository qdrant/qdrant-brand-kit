import { definePattern } from "./types"

// A planet's horizon: the edge of a very large circle rising at the bottom, with a thin indigo rim and a faint
// atmosphere above it. No glow beyond that.
function HorizonLayer() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-[62%] left-1/2 aspect-square w-[260%] -translate-x-1/2 rounded-full border-t border-(--web-indigo)/50 bg-background shadow-[0_-24px_80px_-20px_color-mix(in_oklab,var(--web-indigo)_22%,transparent)] light:shadow-[0_-24px_80px_-20px_color-mix(in_oklab,var(--web-indigo)_14%,transparent)]" />
    </div>
  )
}

export const horizon = definePattern({
  id: "horizon",
  name: "Horizon",
  kind: "background",
  description: "The edge of a planet rising at the bottom, with a thin indigo rim. Closing CTAs and section ends.",
  Layer: HorizonLayer,
})
