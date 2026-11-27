// Copy from the current qdrant.tech (read 2026-11-21), verbatim, for the second batch of sections. Where the site's
// text was longer than what was captured word for word, only its first full sentence is used, never a paraphrase.
// Code is Qdrant's quickstart (qdrant.tech/documentation/quickstart).

import type { ReactNode } from "react"

import type { Link } from "./site"

export type Feature = {
  title: string
  text?: string
  icon?: string
  tone?: string
  link?: Link
  // An in-page anchor (#id), for an anchor nav.
  id?: string
  // A short label above the title, like who it applies to ("All replicated clusters").
  tag?: string
  // Lines after the text, each on its own row, with an optional bold label ("Mechanics", "Guarantees") and an
  // optional Lucide icon (shown when the visual is in the center).
  points?: { label?: string; text: string; icon?: string }[]
  // In a grid, take the whole row (a closing card under the others).
  wide?: boolean
  // A real image, product screen or diagram for the feature's media (web/visuals), instead of a placeholder. It sits
  // in a frame (a plate in a tray) that hugs it, on the outer side of the row when there's room; "none" shows it
  // bare, for a visual with its own look (the globe).
  visual?: ReactNode
  visualFrame?: "plate" | "none"
  // A wide card's visual: beside the text ("side", the default) or in the center with the points around it, two on
  // each side, each with its icon ("center", for a visual that is the card's subject, like the globe).
  visualPlacement?: "side" | "center"
}

// Home: the case-study carousel's companies (from its links) and the button under it.
export const customers = {
  names: ["HubSpot", "Bayer", "Tripadvisor", "OpenTable", "Bazaarvoice", "Flipkart", "Sprinklr", "Deutsche Telekom"],
  // Each name's logo in the customer logo library (content/customer-logos.ts).
  logos: ["hubspot", "bayer", "tripadvisor", "opentable", "bazaarvoice", "flipkart", "sprinklr", "telekom"],
  // A wider selection for a wall of logos (2026-11-24), from the customer logo library: a proposal, not a decided list.
  wall: [
    "hubspot", "bayer", "tripadvisor", "opentable", "bazaarvoice", "flipkart", "sprinklr", "telekom", "canva", "roche",
    "discord", "perplexity", "cognizant", "dailymotion", "zscaler", "servicenow", "voiceflow", "deloitte",
  ],
  action: { label: "See more customers", href: "/customers/" },
}

// About: the stats row.
export const aboutStats = [
  { value: "250+", label: "Million Downloads" },
  { value: "29K", label: "GitHub Stars", href: "https://github.com/qdrant/qdrant" },
  { value: "9k", label: "Members", href: "/community/" },
  { value: "100+", label: "employees" },
]

// Home: "One Engine, Endless Applications", the customer metric cards.
export const applications = {
  title: "One Engine, Endless Applications",
  cards: [
    { company: "Tripadvisor", value: "2-3x revenue", text: "Powers AI Trip Planner on billions of reviews and images, driving 2-3x revenue." },
    { company: "Deutsche Telekom", value: "2M+ AI-driven conversations", text: "Powers multi-agent platform with real-time context across 2M+ AI-driven conversations." },
    { company: "Dust", value: "5,000+ data sources", text: "Powers Dust's AI agents platform with scalable vector search across 5,000+ data sources." },
    { company: "Lyzr", value: "reducing latency by 90%", text: "Powers Lyzr's AI agents, reducing latency by 90% and increasing throughput by 150%." },
  ],
}

// Home: "Deploy Anywhere at Enterprise Scale".
export const deploy = {
  title: "Deploy Anywhere at Enterprise Scale",
  action: { label: "Start Free in Qdrant Cloud", href: "https://cloud.qdrant.io/signup" },
  items: [
    { icon: "Cloud", title: "Qdrant Cloud", text: "Fully managed with high availability and auto-sharding on AWS, GCP, or Azure.", link: { label: "Explore Qdrant Cloud", href: "/cloud/" } },
    { icon: "Layers", title: "Qdrant Hybrid Cloud", text: "Bring your own Kubernetes with decoupled control and data planes. Scale anywhere with full data control.", link: { label: "Learn about Hybrid Cloud", href: "/hybrid-cloud/" } },
    { icon: "ShieldCheck", title: "Qdrant Private Cloud", text: "Maximum control with air-gapped, compliant deployments.", link: { label: "Explore Private Cloud", href: "/private-cloud/" } },
    { icon: "Cpu", title: "Qdrant Edge (Beta)", text: "Lightweight, low-latency vector search close to where data is generated.", link: { label: "Discover Qdrant Edge", href: "/edge/" } },
  ] as Feature[],
}

// Cloud: "Composable Search for the Whole Retrieval Pipeline", from the capabilities hub.
export const composableSearch = {
  kicker: "Capabilities Included with Every Cloud Cluster",
  title: "Composable Search for the Whole Retrieval Pipeline",
  description: "You choose how each query is ranked, filtered, and scored.",
  items: [
    { icon: "Search", title: "Hybrid Search", text: "Keyword and semantic search lives in the same engine." },
    { icon: "Layers", title: "Filterable HNSW", text: "Latency stays predictable under filters." },
    { icon: "Braces", title: "Built-in Multivector", text: "More precise multimodal search in one query." },
    { icon: "ChartScatter", title: "Full-Spectrum Reranking", text: "Apply business logic and token-level precision. Score boosting, ColBERT, and Maximum Marginal Relevance in-engine." },
    { icon: "FileText", title: "Advanced Metadata Filters", text: "Enable more precise and efficient retrieval. Store metadata in JSON and use advanced filters, such as nested, text, geo, has_vector, and more." },
    { icon: "ArrowRightLeft", title: "Ingestion and Updates", text: "Bulk upserts and streaming. Insert, update, and delete on a live index." },
    { icon: "Cpu", title: "Qdrant Cloud Inference", text: "Embed and query in one round trip. Native embedding generation inside a cluster." },
    { icon: "ThumbsUp", title: "Recommendation API", text: "Get “more like this” with one API call. Positive and negative examples to find similar items." },
  ] as Feature[],
}

// Cloud: "Offload Operations to Qdrant Cloud".
export const offload = {
  kicker: "Why Qdrant Cloud",
  title: "Offload Operations to Qdrant Cloud",
  description: "Get the same predictably fast and accurate vector search engine. Qdrant Cloud handles the infrastructure.",
  items: [
    { title: "Simplify Cluster Operations", text: "Upgrades, scaling, sharding, backups, and monitoring run continuously without operator action." },
    { title: "Audited Compliance", text: "Certified under SOC 2 Type II, HIPAA, and GDPR. BAA and DPA available on request." },
    { title: "No Vendor Lock-In", text: "The same Qdrant engine, data format, and APIs across self-hosted, hybrid, and managed Cloud." },
  ] as Feature[],
}

// Home: "Why Qdrant?", the feature rows. The links' targets weren't captured from the site, so they're "#".
export const whyQdrant = {
  kicker: "Why Qdrant?",
  title: "Build for Production-Grade AI Search",
  description: "Engineered for real-time retrieval with the speed, accuracy, and scale that modern AI demands.",
  rows: [
    { title: "Expansive Metadata Filters", text: "Store metadata in JSON and use advanced filters, such as `nested`, `text`, `geo`, `has_vector`, and more.", link: { label: "Learn About Metadata Filters", href: "#" } },
    { title: "Native Hybrid Search (Dense + Sparse)", text: "Blend keyword and vector search in one query – use dense or sparse vectors. Supports BM25, SPLADE++, and miniCOIL.", link: { label: "Explore Hybrid Search", href: "#" } },
    { title: "Efficient, One-Stage Filtering", text: "Filters are applied during HNSW traversal — no pre- or post-filtering.", link: { label: "See Documentation", href: "#" } },
  ] as Feature[],
}

// Home: "Enterprise-ready tooling".
export const enterprise = {
  title: "Enterprise-ready tooling",
  description: "Deploy on any cloud, hybrid, or edge environment with full data control.",
  action: { label: "Talk to our Team", href: "/contact-us/" },
  list: [
    "Multitenancy & Granular RBAC",
    "Private Networking",
    "Zero-downtime upgrades",
    "Backups & Point-in-time restore",
    "Vector-scoped API Keys",
  ],
  tiles: ["SOC 2 · GDPR-aligned Options", "Prometheus · Grafana · Datadog", "SSO (SAML/OIDC)"],
}

// Home: "Performance by Design", the vertical tabs.
export const performance = {
  title: "Performance by Design",
  items: [
    { title: "Highest‑Performance Vector Search Engine", text: "Built entirely in Rust with SIMD and a custom storage engine (Gridstore) — no wrappers, no bolt-ons. Just fast, scalable vector search." },
    { title: "Real‑Time Indexing", text: "Index new data instantly without rebuilding the entire index. Your vectors are searchable the moment they're added." },
    { title: "Memory‑Efficient Storage", text: "Store billions of vectors with minimal memory footprint using our optimized storage architecture." },
    { title: "Asymmetric, Scalar and Binary Quantization", text: "Reduce memory usage by up to 64x while maintaining search quality with advanced quantization techniques." },
  ] as Feature[],
}

// Hybrid Cloud: "Set Up Your Hybrid Cluster in a Few Steps From the Console".
export const hybridSteps = {
  kicker: "Getting Started",
  title: "Set Up Your Hybrid Cluster in a Few Steps From the Console",
  description: "Contact Sales to enable Hybrid Cloud, then connect your Kubernetes environment from the console.",
  steps: [
    { label: "Step 01", text: "Open the Qdrant Cloud Console and start the Hybrid Cloud setup." },
    { label: "Step 02", text: "Run the generated install command to deploy the Qdrant Operator and Cloud Agent into your cluster." },
    { label: "Step 03", text: "Create a Qdrant cluster and select your Hybrid Cloud environment as the target." },
  ],
}

// Home: "Engineered for Builders", with the quickstart's search in two languages and its result.
export const builders = {
  title: "Engineered for Builders",
  description: "Intuitive APIs and built-in tools — crafted for developers who demand more.",
  action: { label: "Explore the API Docs", href: "https://api.qdrant.tech/api-reference" },
  tabs: [
    {
      label: "Python",
      file: "search.py",
      code: `from qdrant_client import QdrantClient

client = QdrantClient(url="http://localhost:6333")

search_result = client.query_points(
    collection_name="test_collection",
    query=[0.2, 0.1, 0.9, 0.7],
    with_payload=False,
    limit=3,
).points`,
    },
    {
      label: "TypeScript",
      file: "search.ts",
      code: `import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({ host: "localhost", port: 6333 });

let searchResult = await client.query("test_collection", {
  query: [0.2, 0.1, 0.9, 0.7],
  limit: 3,
});`,
    },
  ],
  result: {
    label: "The results are returned in decreasing similarity order.",
    code: `[
  { "id": 4, "score": 1.362, "payload": null, "vector": null },
  { "id": 1, "score": 1.273, "payload": null, "vector": null },
  { "id": 3, "score": 1.208, "payload": null, "vector": null }
]`,
  },
}
