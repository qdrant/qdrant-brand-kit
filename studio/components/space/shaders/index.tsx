import type { ComponentType } from "react"

import { Aurora } from "./aurora"
import { CellEdges } from "./cells"
import { DataColumns } from "./data-rain"
import { MovingDither } from "./dither-light"
import { FlowLines } from "./flow"
import { HalftoneSphere } from "./halftone-sphere"
import { HexFisheye } from "./hex-fisheye"
import { HexPixelation } from "./hex-pixel"
import { HexPrisms } from "./hex-prisms"
import { HexPulse } from "./hex-pulse"
import { Hillshade } from "./hillshade"
import { InterferenceDots } from "./interference"
import { PlanetLimb } from "./limb"
import { Moire } from "./moire"
import { DepthHaze } from "./nebula"
import { PolarSweep } from "./polar-sweep"
import { Slices } from "./slices"
import { ParallaxStars } from "./starfield"

// Each option in ./options.ts, by id, to the component that draws it.
export const scenes: Record<string, ComponentType> = {
  "sh-halftone-sphere": HalftoneSphere,
  "sh-hex-pulse": HexPulse,
  "sh-hex-fisheye": HexFisheye,
  "sh-hex-prisms": HexPrisms,
  "sh-cells": CellEdges,
  "sh-nebula": DepthHaze,
  "sh-starfield": ParallaxStars,
  "sh-polar-sweep": PolarSweep,
  "sh-flow": FlowLines,
  "sh-dither-light": MovingDither,
  "sh-moire": Moire,
  "sh-interference": InterferenceDots,
  "sh-slices": Slices,
  "sh-aurora": Aurora,
  "sh-hex-pixel": HexPixelation,
  "sh-hillshade": Hillshade,
  "sh-limb": PlanetLimb,
  "sh-data-rain": DataColumns,
}
