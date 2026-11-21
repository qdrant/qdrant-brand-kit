import type { ComponentType } from "react"

import { DashField } from "./dash-field"
import { FilterLens } from "./filter-lens"
import { Globe } from "./globe"
import { GridReveal } from "./grid-reveal"
import { HexParts } from "./hex-parts"
import { Horizon } from "./horizon"
import { Navigator } from "./navigator"
import { Orbits } from "./orbits"
import { ContourField, DitherHaze } from "./shaders"
import { StarChart } from "./star-chart"
import { AnnotatedCard, ConstellationCard, GlassCard, SweepCard } from "./surfaces"
import { scenes as backgroundScenes } from "./backgrounds/index"
import { scenes as shaderScenes } from "./shaders/index"
import { scenes as signatureScenes } from "./signatures/index"
import { scenes as surfaceScenes } from "./surfaces/index"

// Each option in lib/space.ts, by id, to the component that draws it.
export const spaceScenes: Record<string, ComponentType> = {
  "star-chart": StarChart,
  "dither-haze": DitherHaze,
  contours: ContourField,
  "dash-field": DashField,
  horizon: Horizon,
  "grid-reveal": GridReveal,
  "hex-parts": HexParts,
  navigator: Navigator,
  "filter-lens": FilterLens,
  orbits: Orbits,
  globe: Globe,
  "glass-card": GlassCard,
  "annotated-card": AnnotatedCard,
  "sweep-card": SweepCard,
  "constellation-card": ConstellationCard,
  ...backgroundScenes,
  ...signatureScenes,
  ...surfaceScenes,
  ...shaderScenes,
}
