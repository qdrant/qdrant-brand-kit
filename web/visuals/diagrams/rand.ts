// A small seeded random number generator (mulberry32), so a scene draws the same stars on every load.
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Point = { x: number; y: number }

// n points in a w x h box, spread more evenly than plain random: each new point is the best of k
// candidates, the one farthest from the points already placed. For nodes that shouldn't clump.
export function spread(
  n: number,
  w: number,
  h: number,
  rand: () => number,
  k = 10
) {
  const points: Point[] = []
  for (let i = 0; i < n; i++) {
    let best: Point = { x: rand() * w, y: rand() * h }
    let bestDistance = -1
    for (let c = 0; c < k; c++) {
      const candidate = { x: rand() * w, y: rand() * h }
      let nearest = Infinity
      for (const p of points)
        nearest = Math.min(
          nearest,
          (p.x - candidate.x) ** 2 + (p.y - candidate.y) ** 2
        )
      if (nearest > bestDistance) {
        bestDistance = nearest
        best = candidate
      }
    }
    points.push(best)
  }
  return points
}

// The k nearest points to each point, as index pairs with no duplicates: a small neighbor graph.
export function neighborGraph(points: Point[], k: number) {
  const edges = new Set<string>()
  const adjacency: number[][] = points.map(() => [])
  points.forEach((p, i) => {
    const nearest = points
      .map((q, j) => [(p.x - q.x) ** 2 + (p.y - q.y) ** 2, j] as const)
      .filter(([, j]) => j !== i)
      .sort((a, b) => a[0] - b[0])
      .slice(0, k)
    for (const [, j] of nearest) {
      if (!adjacency[i]!.includes(j)) adjacency[i]!.push(j)
      if (!adjacency[j]!.includes(i)) adjacency[j]!.push(i)
      edges.add(i < j ? `${i}-${j}` : `${j}-${i}`)
    }
  })
  return {
    adjacency,
    edges: [...edges].map((e) => e.split("-").map(Number) as [number, number]),
  }
}

export const ease = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x))
export const clamp = (x: number, lo = 0, hi = 1) =>
  Math.min(hi, Math.max(lo, x))
