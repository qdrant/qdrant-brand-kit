import { Arrow, Box, CardSvg, Label, Segment, Shard } from "./edge-card-parts"

// "Analyze across the whole fleet." (qdrant.tech/edge, "Search Locally, Sync Centrally"): many devices' Edge Shards
// send their data to one server collection, each device with its own shard there ("Update a Server Collection from an
// Edge Shard", qdrant.tech/documentation/edge/edge-data-synchronization-patterns), so one query covers the fleet.

const ROWS = [44, 78, 112, 146, 180]
const MERGE = { x: 150, y: 112 }

export function EdgeAnalyzeDrawing() {
  return (
    <CardSvg label="Data from many devices' Edge Shards flows into one server, where it can be analyzed across the whole fleet.">
      <Label x={16} y={16} anchor="start">
        EDGE SHARDS
      </Label>
      {ROWS.map((y) => (
        <Arrow
          key={y}
          d={`M58 ${y} H94 C124 ${y} 120 ${MERGE.y} ${MERGE.x} ${MERGE.y}`}
        />
      ))}
      <Arrow
        d={`M${MERGE.x} ${MERGE.y} H170`}
        end={{ x: 170, y: MERGE.y, angle: 0 }}
      />
      {ROWS.map((y) => (
        <Shard key={y} cx={40} cy={y} segments={["data", "data"]} />
      ))}

      <Box x={172} y={88} w={92} h={48} />
      <Label x={218} y={102}>
        SERVER
      </Label>
      {ROWS.map((y, i) => (
        <Segment key={y} x={196 + i * 9} y={113} w={6} h={12} />
      ))}
    </CardSvg>
  )
}
