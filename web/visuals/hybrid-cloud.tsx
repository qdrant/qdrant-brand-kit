"use client"

import { ConsoleHybridClusters } from "./console-hybrid-clusters"
import { DiagramFrame } from "./diagrams/frame"
import { HybridEnvironments } from "./diagrams/hybrid-environments"
import { HybridResponsibility } from "./diagrams/hybrid-responsibility"

// The Qdrant Hybrid Cloud page's visuals (/hybrid-cloud/, 2026-11-26): its PNGs redrawn as diagrams and a Console
// screen rebuilt with the design system's components, each checked against the current documentation.

// The hero, shown bare: four Kubernetes clusters (EKS, AKS, GKE, any conformant distribution) managed from the one
// control plane over outbound connections on 443 (instead of hybrid-cloud-hero.png). Checked against
// /documentation/hybrid-cloud/ and the page's FAQ. Wide from lg; taller on tablets and phones, where the
// environments sit in two rows around the control plane.
export function HybridHero() {
  return (
    <DiagramFrame
      width={1200}
      aspect="4 / 1"
      className="aspect-[3/5]! sm:aspect-[3/2]! lg:aspect-[7/2]! xl:aspect-[4/1]!"
    >
      <HybridEnvironments />
    </DiagramFrame>
  )
}

// Provision, scale, and monitor from one console: the Console's cluster list, Hybrid Cloud clusters beside managed
// ones (instead of hybrid-cloud-card-visual.png). Checked against /documentation/cloud/create-cluster/ and the FAQ.
export function HybridConsoleCard() {
  return <ConsoleHybridClusters />
}

// Hybrid Cloud Puts Kubernetes Operations in Your Hands: what Qdrant operates and what you run, in layers, with the
// outbound-only connections on 443 (instead of hybrid-cloud-agentic.png). Checked against /documentation/hybrid-cloud/.
export function HybridAgenticDiagram() {
  return (
    <DiagramFrame aspect="552 / 400" className="max-sm:aspect-[2/3]!">
      <HybridResponsibility />
    </DiagramFrame>
  )
}
