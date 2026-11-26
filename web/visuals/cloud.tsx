"use client"

import { ConsoleClusterSettings } from "./console-cluster-settings"
import { CloudOperations } from "./diagrams/cloud-operations"
import { DiagramFrame } from "./diagrams/frame"

// The Qdrant Managed Cloud page's visuals (/cloud/, 2026-11-26): its PNG screenshots rebuilt as Console screens
// with the design system's components, and its illustration redrawn as a diagram, each checked against the current
// documentation.

// The hero: the Console creating a dedicated cluster, its settings and summary (instead of qdrant-cloud.png), for
// the hero's plate. Checked against /documentation/cloud/create-cluster/.
export function CloudHero() {
  return <ConsoleClusterSettings />
}

// Offload Operations to Qdrant Cloud: a cluster upgraded, scaled, rebalanced, backed up and monitored with no
// operator action (instead of infrastructure.png). Checked against /documentation/cloud/ and its cluster-monitoring page.
export function InfrastructureDiagram() {
  return (
    <DiagramFrame aspect="552 / 400" className="max-sm:aspect-[3/4]!">
      <CloudOperations />
    </DiagramFrame>
  )
}
