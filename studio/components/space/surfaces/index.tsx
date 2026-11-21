import type { ComponentType } from "react"

import { Blueprint } from "./blueprint"
import { Chamfer } from "./chamfer"
import { DitherFill } from "./dither-fill"
import { DotMetric } from "./dot-metric"
import { DotRibbon } from "./dot-ribbon"
import { HalftoneCorner } from "./halftone-corner"
import { HexBadge } from "./hex-badge"
import { HexMesh } from "./hex-mesh"
import { HorizonHeader } from "./horizon-header"
import { OrbGlass } from "./orb-glass"
import { OrbitBorder } from "./orbit-border"
import { Scanline } from "./scanline"
import { Spotlight } from "./spotlight"
import { Stack } from "./stack"
import { Telemetry } from "./telemetry"
import { Ticket } from "./ticket"

// Each option in ./options.ts, by id, to the component that draws it.
export const scenes: Record<string, ComponentType> = {
  "sf-halftone-corner": HalftoneCorner,
  "sf-hex-mesh": HexMesh,
  "sf-dot-metric": DotMetric,
  "sf-orbit-border": OrbitBorder,
  "sf-blueprint": Blueprint,
  "sf-ticket": Ticket,
  "sf-orb-glass": OrbGlass,
  "sf-horizon-header": HorizonHeader,
  "sf-stack": Stack,
  "sf-spotlight": Spotlight,
  "sf-chamfer": Chamfer,
  "sf-scanline": Scanline,
  "sf-dot-ribbon": DotRibbon,
  "sf-hex-badge": HexBadge,
  "sf-telemetry": Telemetry,
  "sf-dither-fill": DitherFill,
}
