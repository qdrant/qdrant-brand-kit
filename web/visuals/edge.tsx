"use client"

import type * as React from "react"

import { EdgeAnalyzeDrawing } from "./diagrams/edge-analyze-card"
import { EdgeBackupDrawing } from "./diagrams/edge-backup-card"
import { EdgeFacet } from "./diagrams/edge-facet"
import { DiagramFrame } from "./diagrams/frame"
import { EdgeIndexDrawing } from "./diagrams/edge-index-card"
import { EdgeMissionControl } from "./diagrams/edge-mission-control"
import { EdgeSentinel } from "./diagrams/edge-sentinel"
import { EdgeSmartGlasses } from "./diagrams/edge-smart-glasses"
import { EdgeSyncDrawing } from "./diagrams/edge-sync-card"
import { EdgeVisualSearch } from "./diagrams/edge-visual-search"

// The Qdrant Edge page's visuals (2026-11-26): diagrams instead of the site's demo stills and videos, card SVGs and
// the demo repo's screenshot, each checked against the Qdrant Edge docs (qdrant.tech/documentation/edge and its
// pages: the quickstart, the synchronization guide, data synchronization patterns, FastEmbed embeddings, BM25, and
// Edge vs Qdrant cluster). Labels use only words from the page or the docs; ids, scores and counts are illustrative.

// A demo's cover: fills its media slot (16/9), the slot's material showing behind it.
function Cover({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative size-full [--web-scene-bg:transparent]"
    >
      {children}
    </div>
  )
}

// Edge Mission Control: a robot's camera detects objects in a room and stores each in its memory, offline; then
// recalls one (checked against the quickstart and Edge vs Qdrant cluster).
export function MissionControlCover() {
  return (
    <Cover label="A robot's camera detects objects in a room and stores each one in its on-device memory, offline, then recalls one by searching that memory.">
      <EdgeMissionControl />
    </Cover>
  )
}

// Smart Glasses: a walk down a store aisle, frames embedded and stored in the Edge Shard and searched, all inside
// the device (checked against FastEmbed embeddings and the quickstart).
export function SmartGlassesCover() {
  return (
    <Cover label="Smart glasses walk down a store aisle; frames are stored in an Edge Shard on the device and searched there, so no footage leaves the device.">
      <EdgeSmartGlasses />
    </Cover>
  )
}

// Sentinel: twelve camera feeds scored against normal, the few past it escalated into a queue, highest first
// (checked against the quickstart's local query).
export function SentinelCover() {
  return (
    <Cover label="Twelve camera feeds are scored against normal; the feeds past normal are escalated into a queue, highest first.">
      <EdgeSentinel />
    </Cover>
  )
}

// Edge Visual Search: an aerial feed indexed on site, a search returning matching frames, and every frame synced to
// headquarters (checked against data synchronization patterns, the dual write).
export function VisualSearchCover() {
  return (
    <Cover label="An aerial camera feed is indexed on site, where a search returns matching frames, and every frame is synced to headquarters.">
      <EdgeVisualSearch />
    </Cover>
  )
}

// "Search Locally, Sync Centrally", the four cards: 4/3 drawings that fill the card's width.
// Index: points written to the Edge Shard and the server, the server builds the index, only changed segments come
// back as a partial snapshot (checked against the synchronization guide and data synchronization patterns).
export function EdgeIndexCard() {
  return <EdgeIndexDrawing />
}

// Backup: an Edge Shard backed up to the server and restored onto a replacement device (checked against data
// synchronization patterns, "Initialize Edge Shard from Existing Qdrant Collection").
export function EdgeBackupCard() {
  return <EdgeBackupDrawing />
}

// Analyze: many devices' Edge Shards flowing into one server collection (checked against data synchronization
// patterns, "Update a Server Collection from an Edge Shard").
export function EdgeAnalyzeCard() {
  return <EdgeAnalyzeDrawing />
}

// Sync: a central server keeping every Edge Shard on the same data, both ways (checked against the synchronization
// guide).
export function EdgeSyncCard() {
  return <EdgeSyncDrawing />
}

// Filter And Facet On Payload: points stored with a class in their payload, live facet counts per class, a filter
// on one class and a query among it (checked against the quickstart's filter and facet). Example data.
export function EdgeFacetDiagram() {
  return (
    <DiagramFrame aspect="552 / 400">
      <EdgeFacet />
    </DiagramFrame>
  )
}
