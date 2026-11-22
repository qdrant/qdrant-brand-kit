import { seeded } from "./rand"
import { definePattern } from "./types"

const W = 1440
const H = 900
const rnd = seeded(20261121)
// A sparse field: mostly faint points, a few brighter ones, about one in ten in indigo.
const points = Array.from({ length: 170 }, () => {
  const bright = rnd() > 0.9
  return {
    x: Math.round(rnd() * W),
    y: Math.round(rnd() * H),
    r: bright ? 1.2 + rnd() * 0.6 : 0.5 + rnd() * 0.6,
    o: bright ? 0.55 + rnd() * 0.3 : 0.15 + rnd() * 0.3,
    indigo: rnd() > 0.88,
  }
})

// A still starfield, drawn once from a fixed seed: no twinkle, no motion. On light it reads as faint dust.
function StarsLayer() {
  return (
    <svg
      className="absolute inset-0 size-full text-foreground [mask-image:linear-gradient(to_bottom,black_40%,transparent)] light:opacity-40"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={p.indigo ? "var(--web-indigo)" : "currentColor"}
          opacity={p.o}
        />
      ))}
    </svg>
  )
}

export const stars = definePattern({
  id: "stars",
  name: "Starfield",
  kind: "background",
  description: "A still, sparse starfield with a few indigo points, fading toward the bottom. Heroes and closing CTAs.",
  Layer: StarsLayer,
})
