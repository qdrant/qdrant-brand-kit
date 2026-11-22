import { definePattern } from "./types"

// A coordinate grid: hairlines every 48px with a brighter tick every fourth line, fading out from the center, like
// graph paper for vectors.
function GridLayer() {
  return (
    <div
      className="absolute inset-0 [background-image:linear-gradient(var(--web-line)_1px,transparent_1px),linear-gradient(90deg,var(--web-line)_1px,transparent_1px),linear-gradient(var(--web-line-strong)_1px,transparent_1px),linear-gradient(90deg,var(--web-line-strong)_1px,transparent_1px)] [background-position:center_top] [background-size:48px_48px,48px_48px,192px_192px,192px_192px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)] opacity-70"
    />
  )
}

export const grid = definePattern({
  id: "grid",
  name: "Coordinate grid",
  kind: "background",
  description: "Hairlines every 48px, stronger every 192px, fading out from the center. Behind heroes and code.",
  Layer: GridLayer,
})
