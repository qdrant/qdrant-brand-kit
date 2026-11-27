import { Arrow, Box, CardSvg, Label, Segment, angle } from "./edge-card-parts"

// "Back up and restore a device." (qdrant.tech/edge, "Search Locally, Sync Centrally"): a device's Edge Shard is
// pushed to the server, and when the device is replaced, a new Edge Shard is restored from the server's snapshot
// ("Initialize Edge Shard from Existing Qdrant Collection", qdrant.tech/documentation/edge/
// edge-data-synchronization-patterns). The restored shard is the key item, in amaranth.

function Device({
  x,
  fill,
  dashed,
}: {
  x: number
  fill: "data" | "key"
  dashed?: boolean
}) {
  return (
    <g opacity={dashed ? 0.75 : 1}>
      <Box x={x} y={124} w={96} h={52} dashed={dashed} />
      <Label x={x + 48} y={140}>
        EDGE SHARD
      </Label>
      {[0, 1, 2].map((i) => (
        <Segment key={i} x={x + 33 + i * 11} y={152} w={8} h={14} fill={fill} />
      ))}
    </g>
  )
}

export function EdgeBackupDrawing() {
  return (
    <CardSvg label="A device's Edge Shard is backed up to the server. When the device is replaced, its shard is restored from the server onto the new device.">
      <Arrow
        d="M76 122 L112 74"
        end={{
          x: 112,
          y: 74,
          angle: angle({ x: 76, y: 122 }, { x: 112, y: 74 }),
        }}
      />
      <Arrow
        d="M168 74 L204 122"
        end={{
          x: 204,
          y: 122,
          angle: angle({ x: 168, y: 74 }, { x: 204, y: 122 }),
        }}
      />
      <Label x={84} y={96} anchor="end">
        BACK UP
      </Label>
      <Label x={196} y={96} anchor="start">
        RESTORE
      </Label>

      <Box x={90} y={16} w={100} h={56} />
      <Label x={140} y={32}>
        SERVER
      </Label>
      {[0, 1, 2].map((i) => (
        <Segment key={i} x={125 + i * 11} y={46} w={8} h={14} />
      ))}

      <Device x={20} fill="data" dashed />
      <Label x={68} y={194}>
        REPLACED
      </Label>
      <Device x={164} fill="key" />
    </CardSvg>
  )
}
