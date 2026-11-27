"use client"

import * as React from "react"

import { definePattern, type PatternDefinition } from "../../types"
import type { StageKind, ThreeScene } from "./stage"

// three.js scenes for the website's animations and illustrations (marketing designer, 2026-11-27). Each scene is
// one file in this folder whose default export is a ThreeScene (see stage.tsx), loaded only when it's on the page:
// three.js (about 150 KB gzipped) and the scene's own code never reach a page that doesn't show one.
//
//   // ./my-scene.tsx
//   import { Mesh, PerspectiveCamera, Scene } from "three" // named imports only, never `import * as THREE`
//   import type { ThreeScene } from "./stage"
//   export default { build: ({ color }) => ({ scene: new Scene(), camera: new PerspectiveCamera(35) }) } satisfies ThreeScene
//
//   // a pattern, listed in ../index.ts like the others
//   export const myPattern = threePattern({ id, name, kind, description, load: () => import("./my-scene") })
//
//   // an illustration, for a section's visual slot (it fills its parent, which must be positioned)
//   export const MyVisual = threeVisual(() => import("./my-scene"))

type Load = () => Promise<{ default: ThreeScene }>

function lazyStage(load: Load, kind: StageKind) {
  return React.lazy(async () => {
    const [{ ThreeStage }, mod] = await Promise.all([import("./stage"), load()])
    const scene = mod.default
    return { default: () => <ThreeStage scene={scene} kind={kind} /> }
  })
}

export function threePattern({
  load,
  ...rest
}: Omit<PatternDefinition, "Layer" | "status"> & { load: Load }): PatternDefinition {
  const Stage = lazyStage(load, rest.kind)
  return definePattern({
    ...rest,
    status: "exploring",
    Layer: () => (
      <div
        className="web-field absolute inset-x-0 top-0"
        // Over a footer's legal bar the frame lifts the layer's bottom (--pattern-band-bottom), as for the bands.
        style={{ bottom: rest.kind === "background" ? "var(--pattern-band-bottom, 0px)" : 0 }}
      >
        <React.Suspense fallback={null}>
          <Stage />
        </React.Suspense>
      </div>
    ),
  })
}

export function threeVisual(load: Load) {
  const Stage = lazyStage(load, "visual")
  return function ThreeVisual() {
    return (
      <React.Suspense fallback={null}>
        <Stage />
      </React.Suspense>
    )
  }
}
