import type { ComponentType } from "react"

import { Cosine } from "./cosine"
import { Discovery } from "./discovery"
import { DistanceMatrix } from "./distance-matrix"
import { FilterGates } from "./filter-gates"
import { GraphRoute } from "./graph-route"
import { Gyroscope } from "./gyroscope"
import { HexAssembly } from "./hex-assembly"
import { Hybrid } from "./hybrid"
import { KMeans } from "./kmeans"
import { LateInteraction } from "./late-interaction"
import { Projector } from "./projector"
import { Quantization } from "./quantization"
import { RingedPlanet } from "./ringed-planet"
import { Shards } from "./shards"
import { Sunflower } from "./sunflower"
import { ZoomLens } from "./zoom-lens"

// Each option in ./options.ts, by id, to the component that draws it.
export const scenes: Record<string, ComponentType> = {
  "sg-projector": Projector,
  "sg-sunflower": Sunflower,
  "sg-graph-route": GraphRoute,
  "sg-shards": Shards,
  "sg-quantization": Quantization,
  "sg-hybrid": Hybrid,
  "sg-cosine": Cosine,
  "sg-filter-gates": FilterGates,
  "sg-late-interaction": LateInteraction,
  "sg-gyroscope": Gyroscope,
  "sg-ringed-planet": RingedPlanet,
  "sg-hex-assembly": HexAssembly,
  "sg-zoom-lens": ZoomLens,
  "sg-distance-matrix": DistanceMatrix,
  "sg-kmeans": KMeans,
  "sg-discovery": Discovery,
}
