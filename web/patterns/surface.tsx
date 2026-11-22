import { definePattern } from "./types"

// Surface patterns: layers inside a card (a plate), under its content.

const grainSvg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

function GrainLayer() {
  return <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay light:opacity-[0.05]" style={{ backgroundImage: grainSvg }} />
}

function DotsLayer() {
  return (
    <div className="absolute inset-0 [background-image:radial-gradient(var(--web-line-strong)_1px,transparent_1px)] [background-size:12px_12px] [mask-image:radial-gradient(circle_at_100%_0%,black,transparent_55%)]" />
  )
}

function TintLayer() {
  return (
    <div className="absolute inset-0 [background-image:radial-gradient(120%_90%_at_0%_0%,color-mix(in_oklab,var(--web-indigo)_10%,transparent),transparent_60%)] light:[background-image:radial-gradient(120%_90%_at_0%_0%,color-mix(in_oklab,var(--web-indigo)_7%,transparent),transparent_60%)]" />
  )
}

function SurfaceGridLayer() {
  return (
    <div className="absolute inset-0 [background-image:linear-gradient(var(--web-line)_1px,transparent_1px),linear-gradient(90deg,var(--web-line)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_top,black,transparent_70%)]" />
  )
}

export const grain = definePattern({ id: "grain", name: "Grain", kind: "surface", description: "Fine noise over the card, a touch of material.", Layer: GrainLayer })
export const dots = definePattern({ id: "dots", name: "Dot corner", kind: "surface", description: "A dot matrix fading from the top right corner.", Layer: DotsLayer })
export const tint = definePattern({ id: "tint", name: "Indigo tint", kind: "surface", description: "A faint indigo light from the top left corner.", Layer: TintLayer })
export const surfaceGrid = definePattern({ id: "surface-grid", name: "Card grid", kind: "surface", description: "A 24px grid rising from the bottom of the card.", Layer: SurfaceGridLayer })
