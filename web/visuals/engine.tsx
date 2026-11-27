"use client"

import { DeploymentOptions } from "./diagrams/deployment-options"
import { DiagramFrame } from "./diagrams/frame"
import { HnswLayers } from "./diagrams/hnsw-layers"
import { ManagedScaling } from "./diagrams/managed-scaling"

// The Qdrant Vector Search Engine page's visuals (2026-11-26): diagrams in the Space signatures' style instead of the
// site's illustrations, each checked against the current documentation. "Built for Performance" reuses the home
// page's BenchmarkDiagram.

// The hero: a query searched through the HNSW index's layers, from the sparse top layer down to its nearest
// neighbors (docs: concepts/indexing, "Vector Index"). Taller on phones, so the three layers stay readable.
export function EngineHero() {
  return (
    <DiagramFrame width={1200} aspect="4 / 1" className="max-sm:aspect-[3/2]!">
      <HnswLayers />
    </DiagramFrame>
  )
}

// Fully Managed: Qdrant Cloud adds a node to a cluster and rebalances its shards (docs: cloud, Managed Cloud).
export function FullyManagedDiagram() {
  return (
    <DiagramFrame aspect="552 / 400">
      <ManagedScaling />
    </DiagramFrame>
  )
}

// Run Anywhere: where the control plane and the data plane run in Managed, Hybrid and Private Cloud (docs: cloud,
// hybrid-cloud, private-cloud). HTML, so its height follows its content.
export function RunAnywhereDiagram() {
  return (
    <DiagramFrame aspect="auto">
      <DeploymentOptions />
    </DiagramFrame>
  )
}
