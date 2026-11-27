import { Arrow, Box, CardSvg, Label, Segment, angle } from "./edge-card-parts"

// "Build the index where the compute is." (qdrant.tech/edge, "Search Locally, Sync Centrally"): points are written
// to the Edge Shard and to the server (the dual write); the server builds the index (Qdrant Edge has no background
// optimizer, so the device would run optimize() itself); then only the changed segments come back, as a partial
// snapshot (qdrant.tech/documentation/edge/edge-data-synchronization-patterns, edge-synchronization-guide). The
// changed segment is the key item, in amaranth.

const NODES = [
  [180, 114],
  [196, 128],
  [206, 108],
  [224, 124],
  [238, 106],
  [248, 128],
] as const
const EDGES = [
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 4],
  [3, 5],
  [4, 5],
] as const

export function EdgeIndexDrawing() {
  return (
    <CardSvg label="Points are written to the Edge Shard and to the server. The server builds the index, and only the changed segments are synced back to the device.">
      {/* The writes, to both. */}
      <Arrow
        d="M126 38 L76 76"
        end={{
          x: 76,
          y: 76,
          angle: angle({ x: 126, y: 38 }, { x: 76, y: 76 }),
        }}
      />
      <Arrow
        d="M154 38 L204 76"
        end={{
          x: 204,
          y: 76,
          angle: angle({ x: 154, y: 38 }, { x: 204, y: 76 }),
        }}
      />
      <Box x={108} y={14} w={64} h={24} />
      <Label x={140} y={26} tone="star">
        POINTS
      </Label>

      {/* The device: its segments, one waiting for the indexed one. */}
      <Box x={16} y={78} w={104} h={64} />
      <Label x={68} y={94}>
        EDGE SHARD
      </Label>
      {(["data", "data", "empty"] as const).map((fill, i) => (
        <Segment key={i} x={53 + i * 11} y={112} w={8} h={14} fill={fill} />
      ))}

      {/* The server, with the index it built. */}
      <Box x={160} y={78} w={104} h={64} />
      <Label x={212} y={94}>
        SERVER
      </Label>
      <g stroke="var(--web-scene-glow)" strokeWidth={1}>
        {EDGES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={NODES[a][0]}
            y1={NODES[a][1]}
            x2={NODES[b][0]}
            y2={NODES[b][1]}
          />
        ))}
      </g>
      {NODES.map(([x, y]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={2.5}
          fill="var(--web-scene-bright)"
        />
      ))}

      {/* Back to the device: only the changed segments. */}
      <Arrow d="M212 142 V176 H68 V146" end={{ x: 68, y: 146, angle: -90 }} />
      <Segment x={136} y={169} fill="key" />
      <Label x={140} y={198}>
        CHANGED SEGMENTS
      </Label>
    </CardSvg>
  )
}
