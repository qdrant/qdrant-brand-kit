import { definePattern } from "./types"

// Orbits: concentric ellipses around a point beyond the top right, with a node on two of them, like vectors on a
// path. Hairlines in the line color; the nodes in indigo.
function OrbitsLayer() {
  const rings = [260, 420, 600, 820]
  return (
    <svg
      className="absolute inset-0 size-full [mask-image:radial-gradient(ellipse_80%_80%_at_85%_0%,black,transparent_75%)]"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <g transform="translate(1240 -40) rotate(-18)">
        {rings.map((r) => (
          <ellipse key={r} cx="0" cy="0" rx={r} ry={r * 0.62} stroke="var(--web-line-strong)" strokeWidth="1" />
        ))}
        <circle cx={-420 * Math.cos(0.9)} cy={420 * 0.62 * Math.sin(0.9)} r="4" fill="var(--web-indigo)" />
        <circle cx={-600 * Math.cos(1.25)} cy={600 * 0.62 * Math.sin(1.25)} r="3" fill="var(--background)" stroke="var(--web-indigo)" />
      </g>
    </svg>
  )
}

export const orbits = definePattern({
  id: "orbits",
  name: "Orbits",
  kind: "background",
  description: "Concentric orbits from the top right with indigo nodes on them. Pair with the starfield in heroes.",
  Layer: OrbitsLayer,
})
