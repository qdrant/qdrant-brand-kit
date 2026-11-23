import type { ComponentType } from "react"

import { Clusters } from "./clusters"
import { DitherBands } from "./dither-bands"
import { DotBars } from "./dot-bars"
import { DotWave } from "./dot-wave"
import { Fiber } from "./fiber"
import { Gauge } from "./gauge"
import { Halftone } from "./halftone"
import { HexHalftone } from "./hex-halftone"
import { IsoHex } from "./iso-hex"
import { Perspective } from "./perspective"
import { Phyllotaxis } from "./phyllotaxis"
import { Plexus } from "./plexus"
import { Rings } from "./rings"
import { VectorRows } from "./vector-rows"
import { Voronoi } from "./voronoi"

// Each option in ./options.ts, by id, to the component that draws it.
export const scenes: Record<string, ComponentType> = {
  "bg-halftone": Halftone,
  "bg-phyllotaxis": Phyllotaxis,
  "bg-dot-bars": DotBars,
  "bg-fiber": Fiber,
  "bg-clusters": Clusters,
  "bg-perspective": Perspective,
  "bg-dither-bands": DitherBands,
  "bg-gauge": Gauge,
  "bg-plexus": Plexus,
  "bg-dot-wave": DotWave,
  "bg-rings": Rings,
  "bg-voronoi": Voronoi,
  "bg-vector-rows": VectorRows,
  "bg-iso-hex": IsoHex,
  "bg-hex-halftone": HexHalftone,
}
