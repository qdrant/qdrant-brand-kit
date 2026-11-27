"use client"

import { DataSovereignty } from "./diagrams/data-sovereignty"
import { DiagramFrame } from "./diagrams/frame"
import { OnPremise } from "./diagrams/on-premise"

// The Qdrant Private Cloud page's visuals (2026-11-26): diagrams in the Space signatures' style, checked against the
// current documentation.

// The hero: your applications querying a Qdrant cluster in your own Kubernetes, all inside your infrastructure, with
// no connection to Qdrant Cloud (docs: private-cloud). Taller on phones, so the cluster stays readable.
export function PrivateCloudHero() {
  return (
    <DiagramFrame width={1200} aspect="4 / 1" className="max-sm:aspect-[3/2]!">
      <OnPremise />
    </DiagramFrame>
  )
}

// Data privacy and sovereignty: your data inside the cluster, inside Kubernetes, inside your infrastructure, and
// nothing leaves (docs: private-cloud).
export function DataPrivacyDiagram() {
  return (
    <DiagramFrame aspect="552 / 400">
      <DataSovereignty />
    </DiagramFrame>
  )
}
