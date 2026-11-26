import { Arrow, Box, CardSvg, Label, Shard } from "./edge-card-parts"

// "Keep the fleet on the same data." (qdrant.tech/edge, "Search Locally, Sync Centrally"): every device's Edge Shard
// writes its changes to the server and takes the server's changes back as partial snapshots, so each holds the same
// data (qdrant.tech/documentation/edge/edge-data-synchronization-patterns).

const C = { x: 140, y: 105 }
const SERVER = { w: 84, h: 36 }
const SHARD = { w: 34, h: 24 }
const AROUND = [30, 90, 150, 210, 270, 330].map((deg) => {
  const a = (deg * Math.PI) / 180
  return { x: C.x + 100 * Math.cos(a), y: C.y + 70 * Math.sin(a), a: deg }
})

// Where a line from a box's center in direction (dx, dy) leaves the box, plus a gap.
function edge(
  cx: number,
  cy: number,
  w: number,
  h: number,
  dx: number,
  dy: number,
  gap = 4
) {
  const n = Math.hypot(dx, dy)
  const ux = dx / n
  const uy = dy / n
  const t = Math.min(
    ux ? w / 2 / Math.abs(ux) : Infinity,
    uy ? h / 2 / Math.abs(uy) : Infinity
  )
  return { x: cx + ux * (t + gap), y: cy + uy * (t + gap) }
}

export function EdgeSyncDrawing() {
  return (
    <CardSvg label="A central server synchronizes every device's Edge Shard, so the whole fleet works from the same data.">
      <g stroke="var(--web-scene-line)" opacity={0.6}>
        {[48, 80, 112].map((r) => (
          <circle key={r} cx={C.x} cy={C.y} r={r} />
        ))}
      </g>
      {AROUND.map((s) => {
        const a = edge(C.x, C.y, SERVER.w, SERVER.h, s.x - C.x, s.y - C.y)
        const b = edge(s.x, s.y, SHARD.w, SHARD.h, C.x - s.x, C.y - s.y)
        const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
        return (
          <Arrow
            key={s.a}
            d={`M${a.x} ${a.y} L${b.x} ${b.y}`}
            start={{ x: a.x, y: a.y, angle: deg + 180 }}
            end={{ x: b.x, y: b.y, angle: deg }}
          />
        )
      })}
      <Box
        x={C.x - SERVER.w / 2}
        y={C.y - SERVER.h / 2}
        w={SERVER.w}
        h={SERVER.h}
      />
      <Label x={C.x} y={C.y}>
        SERVER
      </Label>
      {AROUND.map((s) => (
        <Shard
          key={s.a}
          cx={s.x}
          cy={s.y}
          segments={["data", "data", "data"]}
        />
      ))}
    </CardSvg>
  )
}
