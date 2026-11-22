import { seeded } from "./rand"
import { definePattern } from "./types"

// A layered graph, like the levels of an HNSW index: points on three levels, sparser higher up, each joined to its
// nearest neighbours on its level and dropped to the level below. Hairlines and hollow nodes, a few in indigo.
const rnd = seeded(7)
const levels = [
  { y: 150, n: 4 },
  { y: 330, n: 8 },
  { y: 520, n: 14 },
]
const nodes = levels.flatMap((l, li) =>
  Array.from({ length: l.n }, (_, i) => ({
    x: 760 + ((i + 0.5) / l.n) * 620 + (rnd() - 0.5) * 30,
    y: l.y + (rnd() - 0.5) * 40,
    level: li,
    indigo: rnd() > 0.8,
  }))
)
const edges: [number, number][] = []
nodes.forEach((a, i) =>
  nodes.forEach((b, j) => {
    if (j <= i) return
    const same = a.level === b.level && Math.abs(a.x - b.x) < 140
    const down = b.level === a.level + 1 && Math.abs(a.x - b.x) < 50
    if (same || down) edges.push([i, j])
  })
)

function GraphLayer() {
  return (
    <svg
      className="absolute inset-0 size-full [mask-image:linear-gradient(to_right,transparent_45%,black)]"
      viewBox="0 0 1440 700"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {edges.map(([a, b], i) => {
        const p = nodes[a]
        const q = nodes[b]
        return p && q ? <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="var(--web-line-strong)" /> : null
      })}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.indigo ? 4 : 3}
          fill={n.indigo ? "var(--web-indigo)" : "var(--background)"}
          stroke={n.indigo ? "none" : "var(--web-line-strong)"}
        />
      ))}
    </svg>
  )
}

export const graph = definePattern({
  id: "graph",
  name: "Vector graph",
  kind: "background",
  description: "Points on three levels joined to their neighbours, like an HNSW index, on the right. Product and developer sections.",
  Layer: GraphLayer,
})
