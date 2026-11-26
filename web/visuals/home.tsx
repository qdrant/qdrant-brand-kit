"use client"

import { ArrowRight } from "lucide-react"

import { ASSETS } from "../lib/assets"
import { CodePanel } from "../lib/code-panel"
import { MonoImage } from "../lib/mono-image"
import { AgentMemory } from "./diagrams/agent-memory"
import { Anomaly } from "./diagrams/anomaly"
import { Benchmark } from "./diagrams/benchmark"
import { DiagramFrame } from "./diagrams/frame"
import { FilteredRoute } from "./diagrams/filtered-route"
import { Hybrid } from "./diagrams/hybrid"
import { Indexing } from "./diagrams/indexing"
import { Inference } from "./diagrams/inference"
import { LateInteraction } from "./diagrams/late-interaction"
import { Projector } from "./diagrams/projector"
import { Quantization } from "./diagrams/quantization"
import { Rag } from "./diagrams/rag"
import { Recommend } from "./diagrams/recommend"
import { Rerank } from "./diagrams/rerank"
import { RingedPlanet } from "./diagrams/ringed-planet"
import { Storage } from "./diagrams/storage"

// The home page's visuals (design lead, 2026-11-26): diagrams drawn in the Space signatures' style instead of the
// site's PNG and JPG illustrations, each checked against the current documentation, and code from the docs.

// The hero: a collection in orbit, a query connected to its nearest points (instead of the site's astronaut photo).
export function HeroPlanet() {
  return (
    <DiagramFrame width={1200} aspect="2 / 1">
      <RingedPlanet />
    </DiagramFrame>
  )
}

// Expansive metadata filters: a filtered search with the Query API, every condition from the payload docs
// (keyword match, range, geo radius in meters, full-text match).
export function MetadataFilterCode() {
  return (
    <CodePanel
      title="POST /collections/products/points/query"
      language="json"
      className="w-[552px] max-w-full rounded-none border-0"
      code={`{
  "query": [0.2, 0.1, 0.9, 0.7],
  "filter": {
    "must": [
      { "key": "category", "match": { "value": "electronics" } },
      { "key": "price", "range": { "lte": 500 } },
      {
        "key": "store_location",
        "geo_radius": {
          "center": { "lon": 13.403683, "lat": 52.520711 },
          "radius": 1000.0
        }
      },
      { "key": "description", "match": { "text": "wireless noise cancelling" } }
    ]
  },
  "with_payload": true,
  "limit": 10
}`}
    />
  )
}

// Native hybrid search: a sparse and a dense result list fused by reciprocal rank fusion.
export function HybridDiagram() {
  return (
    <DiagramFrame aspect="552 / 360">
      <Hybrid />
    </DiagramFrame>
  )
}

// Built-in multivector: late interaction (MaxSim) between query and document token vectors.
export function MultivectorDiagram() {
  return (
    <DiagramFrame aspect="552 / 400">
      <LateInteraction />
    </DiagramFrame>
  )
}

// Efficient, one-stage filtering: a search through the graph that checks the filter as it goes, over the extra edges
// built from the payload index.
export function FilteringDiagram() {
  return (
    <DiagramFrame aspect="552 / 420">
      <FilteredRoute />
    </DiagramFrame>
  )
}

// Quantization: one vector compressed step by step, with each step's size.
export function QuantizationDiagram() {
  return (
    <DiagramFrame aspect="1 / 1">
      <Quantization />
    </DiagramFrame>
  )
}

// Semantic search: a cloud of embeddings, a query and its nearest neighbors.
export function SemanticSearchDiagram() {
  return (
    <DiagramFrame width={720} aspect="16 / 9">
      <Projector />
    </DiagramFrame>
  )
}

// Full-spectrum reranking: many candidates from a prefetch, a rerank stage (ColBERT, a formula or MMR), the top results.
export function RerankDiagram() {
  return (
    <DiagramFrame aspect="552 / 400">
      <Rerank />
    </DiagramFrame>
  )
}

// Performance by Design, the four tabs: the single-node benchmark (June 2024), real-time indexing, storage tiers.
export function BenchmarkDiagram() {
  return (
    <DiagramFrame aspect="1 / 1">
      <Benchmark />
    </DiagramFrame>
  )
}

export function IndexingDiagram() {
  return (
    <DiagramFrame aspect="1 / 1">
      <Indexing />
    </DiagramFrame>
  )
}

export function StorageDiagram() {
  return (
    <DiagramFrame aspect="1 / 1">
      <Storage />
    </DiagramFrame>
  )
}

// Native Cloud Inference: text or an image in, embeddings made in the cluster, then the search.
export function InferenceDiagram() {
  return (
    <DiagramFrame width={720} aspect="16 / 10">
      <Inference />
    </DiagramFrame>
  )
}

// The use cases, one per tab: RAG, agent memory, recommendations and anomaly detection (semantic search is above).
export function RagDiagram() {
  return (
    <DiagramFrame width={720} aspect="16 / 9">
      <Rag />
    </DiagramFrame>
  )
}

export function AgentMemoryDiagram() {
  return (
    <DiagramFrame width={720} aspect="16 / 9">
      <AgentMemory />
    </DiagramFrame>
  )
}

export function RecommendDiagram() {
  return (
    <DiagramFrame width={720} aspect="16 / 9">
      <Recommend />
    </DiagramFrame>
  )
}

export function AnomalyDiagram() {
  return (
    <DiagramFrame width={720} aspect="16 / 9">
      <Anomaly />
    </DiagramFrame>
  )
}

// Enterprise-ready tooling, the three tiles (instead of the site's SVG illustrations): the compliance badges from
// web/assets/badges, Qdrant's Prometheus metrics endpoint with metric names from the monitoring docs (values are
// examples), and Enterprise SSO, which signs a team in to the Cloud Console through its identity provider (Premium
// tier; docs: cloud-account-setup#enterprise-single-sign-on-sso, checked 2026-11-26).
const chip =
  "rounded-md border border-(--web-line) bg-card px-3 py-2 font-mono text-xs tracking-wider uppercase"

export function ComplianceBadges() {
  return (
    <div className="flex items-center gap-8">
      <MonoImage
        src={`${ASSETS}/badges/soc-2.svg`}
        label="SOC 2"
        className="size-20"
      />
      <MonoImage
        src={`${ASSETS}/badges/gdpr.svg`}
        label="GDPR"
        className="size-20"
      />
    </div>
  )
}

export function MetricsSnippet() {
  const rows = [
    ["collections_total", "4"],
    ["collections_vector_total", "1203481"],
    ["cluster_peers_total", "3"],
  ]
  return (
    <div className="flex w-full max-w-72 flex-col gap-2 font-mono text-xs">
      <p className="tracking-wider text-muted-foreground uppercase">
        GET /metrics
      </p>
      <ul className="flex flex-col gap-1.5 rounded-md border border-(--web-line) bg-card p-3">
        {rows.map(([name, value]) => (
          <li key={name} className="flex justify-between gap-3">
            <span className="truncate text-foreground">{name}</span>
            <span className="text-muted-foreground">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SsoFlow() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className={chip}>Your team</span>
      <ArrowRight
        aria-hidden
        className="size-4 rotate-90 text-(--web-indigo)"
      />
      <span className={chip}>
        Identity provider{" "}
        <span className="text-muted-foreground">SAML / OIDC</span>
      </span>
      <ArrowRight
        aria-hidden
        className="size-4 rotate-90 text-(--web-indigo)"
      />
      <span className={chip}>Cloud Console</span>
    </div>
  )
}
