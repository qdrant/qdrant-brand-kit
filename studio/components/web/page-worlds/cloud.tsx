// The Cloud world (2026-11-26): qdrant.tech/cloud, section by section, from the library. Copy, links and icons are the
// live page's, read on 2026-11-26, word for word (kickers in the library's title case; the site sets them in
// capitals). Where the library already holds the page's copy (the customers, the FAQ, the capability tabs), the
// section keeps its variant's own props.
//
// Outlier: the website's rules put a page's copy in web/content/<page>.ts. It's here so the change stays inside the
// Patterns tab; it can move to web/content when the page is built for real.

import { ConsoleClusterSetup } from "@qdrant/web/visuals/console-setup"

import type { PageWorld } from "../page-explorations"

const startFree = { label: "Start Free", href: "https://cloud.qdrant.io/signup" }

// "Capabilities Included with Every Cloud Cluster": the page shows one group at a time under its tabs; here the
// anchor nav's tabs point at the five groups, one feature grid each, with the ids the tabs already use.
const capability = (
  n: number,
  title: string,
  description: string,
  items: { icon: string; title: string; text: string }[]
) => ({
  // Cards, as on the site; a hairline grid of cells left an empty cell under the five High Availability items.
  section: "feature-grid",
  variant: "cells",
  overrides: {
    appearance: "cards",
    id: `qdrant-cloud-capabilities-tab-${n}`,
    header: { title, description },
    items,
    columns: items.length === 8 ? 4 : 3,
  },
})

export const cloud: PageWorld = {
  id: "cloud",
  group: "Product",
  name: "Cloud",
  prefix: "CL",
  source: "https://qdrant.tech/cloud/",
  sections: {
    announcement: {
      section: "announcement-bar",
      variant: "plain",
      overrides: {
        text: "Livestream: Product Search for Agentic Shoppers | Vector Retrieval with UCP",
        link: { label: "RSVP", href: "https://luma.com/agentic-product-search" },
      },
    },
    navbar: { section: "navbar", variant: "full" },
    hero: {
      section: "hero",
      variant: "product",
      overrides: {
        kicker: "Qdrant Cloud",
        title: "Build Fast, Accurate Vector Search at Scale with Qdrant Cloud",
        description:
          "Qdrant Cloud is a managed service for running Qdrant vector search. You get the same open-source Rust engine with secure, predictable performance at scale. Move between self-hosted and managed without changing your code or data.",
        primary: startFree,
        pills: ["Predictable P99 Latency", "Native Hybrid + Multimodal", "SOC 2 + HIPAA + GDPR"],
        visual: <ConsoleClusterSetup />,
      },
    },
    // Ten logos split unevenly in a row (8 + 2) or a grid, so they drift in one line, as on the site.
    logos: {
      section: "logo-cloud",
      variant: "marquee",
      overrides: {
        label: "Trusted by Enterprise Teams",
        logos: [
          { name: "Tripadvisor", logo: "tripadvisor" },
          { name: "Canva", logo: "canva" },
          { name: "Telekom", logo: "telekom" },
          { name: "Discord", logo: "discord" },
          { name: "Fandom", logo: "fandom" },
          { name: "Zepto", logo: "zepto" },
          { name: "OpenTable", logo: "opentable" },
          { name: "Sprinklr", logo: "sprinklr" },
          { name: "Dust", logo: "dust" },
          { name: "FAZ", logo: "faz" },
        ],
      },
    },
    why: {
      section: "feature-grid",
      variant: "numbered",
      overrides: {
        header: {
          kicker: "Why Qdrant Cloud",
          title: "Offload Operations to Qdrant Cloud",
          description:
            "Get the same predictably fast and accurate vector search engine. Qdrant Cloud handles the infrastructure.",
          action: startFree,
        },
        items: [
          {
            title: "Simplify Cluster Operations",
            text: "Upgrades, scaling, sharding, backups, and monitoring run continuously without operator action.",
          },
          {
            title: "Audited Compliance",
            text: "Certified under SOC 2 Type II, HIPAA, and GDPR. BAA and DPA available on request.",
          },
          {
            title: "No Vendor Lock-In",
            text: "The same Qdrant engine, data format, and APIs across self-hosted, hybrid, and managed Cloud. Cloud supports snapshot export to your own infrastructure.",
          },
        ],
      },
    },
    // The library's Result cards are the page's "Customers Building with Qdrant Cloud", as they are.
    customers: { section: "case-studies", variant: "cards" },
    // The library's anchor tabs are the page's five capability groups. Not sticky: on the site the tabs belong to the
    // capabilities, so they don't follow the reader down the rest of the page.
    capabilities: { section: "anchor-nav", variant: "tabs", overrides: { sticky: false } },
    search: capability(
      0,
      "Composable Search for the Whole Retrieval Pipeline",
      "You choose how each query is ranked, filtered, and scored. Combine dense vectors, sparse vectors, and metadata filters at query time.",
      [
        {
          icon: "Search",
          title: "Hybrid Search",
          text: "Keyword and semantic search lives in the same engine. Dense and sparse vectors in one query. Native BM25 and SPLADE++ run alongside dense retrieval.",
        },
        {
          icon: "Filter",
          title: "Filterable HNSW",
          text: "Latency stays predictable under filters. Filtering integrates with graph traversal, beyond pre- and post-filtering tradeoffs.",
        },
        {
          icon: "Layers3",
          title: "Built-in Multivector",
          text: "More precise multimodal search in one query. Store multiple vectors per object across text, image, audio, video.",
        },
        {
          icon: "TrendingUp",
          title: "Full-Spectrum Reranking",
          text: "Apply business logic and token-level precision. Score boosting, ColBERT, and Maximum Marginal Relevance in-engine.",
        },
        {
          icon: "SlidersHorizontal",
          title: "Advanced Metadata Filters",
          text: "Enable more precise and efficient retrieval. Store metadata in JSON and use advanced filters, such as nested, text, geo, has_vector, and more.",
        },
        {
          icon: "RefreshCw",
          title: "Ingestion and Updates",
          text: "Bulk upserts and streaming. Insert, update, and delete on a live index.",
        },
        {
          icon: "Cloud",
          title: "Qdrant Cloud Inference",
          text: "Embed and query in one round trip. Native embedding generation inside a cluster.",
        },
        {
          icon: "ThumbsUp",
          title: "Recommendation API",
          text: "Get “more like this” with one API call. Positive and negative examples to find similar items.",
        },
      ]
    ),
    performance: capability(
      1,
      "Control Performance at Scale",
      "The same engine runs from in-memory dev to web-scale production. Tune memory, indexing speed, and capacity for each workload.",
      [
        {
          icon: "Minimize",
          title: "Quantization",
          text: "Up to 32× memory reduction. Scalar, TurboQuant, and binary help strike a balance between accuracy, storage efficiency, and search speed.",
        },
        {
          icon: "HardDrive",
          title: "On-Disk Storage",
          text: "Offload cold vectors and payloads to disk to reduce RAM cost.",
        },
        {
          icon: "Maximize",
          title: "Vertical and Horizontal Scaling",
          text: "Shards rebalance automatically, maintaining optimal performance. Scale clusters up, down, or out.",
        },
        {
          icon: "Cpu",
          title: "GPU Indexing",
          text: "Up to 4× faster HNSW indexing. Every node in your cluster gets a dedicated GPU with a simple toggle.",
        },
        {
          icon: "Users",
          title: "Flexible Multitenancy",
          text: "Serve thousands of tenants per cluster with payload-based separation. Promote noisy ones to dedicated while traffic continues.",
        },
        {
          icon: "CircleGauge",
          title: "SIMD and Async I/O",
          text: "SIMD acceleration across x86 and ARM. io_uring keeps disk throughput high on Cloud volumes.",
        },
      ]
    ),
    availability: capability(
      2,
      "High Availability and Recovery",
      "Engine-handled operations on highly available clusters. Continuous backups and live upgrades.",
      [
        {
          icon: "RefreshCw",
          title: "Zero-Downtime Upgrades",
          text: "Engine upgrades run while the cluster serves traffic. Multi-version supported.",
        },
        {
          icon: "GitBranch",
          title: "Multi-AZ Replication",
          text: "Up to 99.95% SLA. Three availability zones with automatic failover.",
        },
        {
          icon: "Database",
          title: "Backups and Disaster Recovery",
          text: "Scheduled incremental backups, on-demand snapshots, and restore to any cluster.",
        },
        {
          icon: "Download",
          title: "Snapshot Export",
          text: "Export snapshots to your own object storage for long-term retention or DR.",
        },
        {
          icon: "LifeBuoy",
          title: "Engineering Support",
          text: "Guaranteed response times on critical incidents. Business-hours coverage on Standard, 24/7 on Premium.",
        },
      ]
    ),
    security: capability(
      3,
      "Defense in Depth for Production Workloads",
      "Encryption on every channel and volume, granular access control, and private network options. Compliance-ready under SOC 2, HIPAA, and GDPR.",
      [
        {
          icon: "ShieldCheck",
          title: "Compliance",
          text: "Reports available under NDA. SOC 2 Type II, HIPAA with BAA, and GDPR with DPA.",
        },
        {
          icon: "LockOpen",
          title: "Encryption in Transit",
          text: "End-to-end protection in flight. TLS 1.2+ on every API endpoint and replication channel.",
        },
        {
          icon: "HardDrive",
          title: "Encryption at Rest",
          text: "Storage protected by default; Premium adds customer-managed keys. AES-256 on storage volumes.",
        },
        {
          icon: "Waypoints",
          title: "Private VPC Links",
          text: "On Premium, traffic stays on private networks over AWS PrivateLink, GCP Private Service Connect, or Azure Private Link.",
        },
        {
          icon: "ListFilter",
          title: "IP Allowlisting",
          text: "Define your network perimeter explicitly. Restrict cluster access to specific CIDR ranges.",
        },
        {
          icon: "Key",
          title: "Single Sign-On (SSO)",
          text: "On Premium, manage Cloud Console sign-in through your identity provider. SAML or OpenID Connect with Okta, Azure AD, Google Workspace, and others.",
        },
      ]
    ),
    monitoring: capability(
      4,
      "Monitoring and Observability Toolkit",
      "Monitor cluster health, audit every API call, and visualize capacity in real time. Configurable retention for compliance.",
      [
        {
          icon: "Activity",
          title: "Prometheus Metrics",
          text: "OpenMetrics-compatible /metrics and /sys_metrics endpoints on every cluster.",
        },
        {
          icon: "ChartLine",
          title: "Grafana Dashboard",
          text: "Reference dashboard for cluster health, query latency, and capacity.",
        },
        {
          icon: "FileText",
          title: "Audit Logging",
          text: "Logs every API operation: caller, target, and outcome in structured JSON.",
        },
        {
          icon: "BellRing",
          title: "Capacity Alerts",
          text: "Alerts at 80% RAM and disk utilization, plus CPU throttling.",
        },
        {
          icon: "HeartPulse",
          title: "Health Endpoints",
          text: "Kubernetes-style /healthz, /livez, /readyz on every node.",
        },
        {
          icon: "SatelliteDish",
          title: "Telemetry",
          text: "Per-segment, per-shard internals with configurable verbosity.",
        },
      ]
    ),
    stack: {
      section: "code-showcase",
      variant: "aside",
      overrides: {
        header: {
          kicker: "Getting Started",
          title: "Qdrant Cloud Across Your Stack",
          description:
            "Same workflow from your app, terminal, or CI. Python SDK in app code, qcloud CLI in scripts and CI. Same Qdrant Cloud API.",
        },
        tabs: [
          {
            label: "Python SDK",
            code: `from qdrant_client import QdrantClient

client = QdrantClient(
    url="https://your-cluster.qdrant.io",
    api_key="qdrant_…",
)

# List collections on this cluster
catalog = client.get_collections()

# Snapshot before risky index or schema changes
client.create_snapshot(collection_name="products")

# Page payloads for spot checks, exports, or pipeline validation
points, next_offset = client.scroll(
    collection_name="reports",
    limit=100,
    with_payload=True,
)`,
          },
          {
            label: "qcloud CLI · REST",
            code: `# Pick the Qdrant Cloud context (API key + account id)
qcloud context use prod

# Inspect clusters — ids, regions, endpoints, status
qcloud cluster list
qcloud cluster describe $QDRANT_CLUSTER_ID

# Snapshot the collection (in-cluster) before risky index / schema changes
qcloud cluster snapshot create products

# Query data via REST when scripting outside the SDK
curl -sS "https://abcd-1234.eu-central.aws.cloud.qdrant.io:6333/collections/products/points/scroll" \\
  -H "api-key: $QDRANT_DATA_API_KEY" \\
  -H 'Content-Type: application/json' \\
  -d '{"limit": 100, "with_payload": true, "with_vector": false}'`,
          },
          {
            label: "Terraform",
            code: `terraform {
  required_providers {
    qdrant-cloud = {
      source  = "qdrant/qdrant-cloud"
      version = "~> 1.0"
    }
  }
}

provider "qdrant-cloud" {
  api_key    = var.qdrant_api_key
  account_id = var.qdrant_account_id
}

resource "qdrant-cloud_cluster" "production" {
  name              = "search-production"
  cloud_provider    = "aws"
  cloud_region      = "eu-central-1"

  configuration {
    number_of_nodes = 3
    node_configuration {
      package_id = "gpxxl-1"  # 8 vCPU, 32 GB RAM per node
    }
  }
}

# Pin the data API key to a Terraform output for downstream consumers
output "cluster_endpoint" {
  value = qdrant-cloud_cluster.production.url
}`,
          },
        ],
      },
    },
    pricing: {
      section: "cta",
      variant: "band",
      overrides: {
        title: "Pricing Based on Cluster Resources",
        description:
          "Qdrant Cloud is priced on the resources your cluster uses: vCPU, RAM, disk, and inference tokens for paid models.",
        primary: { label: "See Pricing", href: "https://qdrant.tech/pricing/" },
        secondary: undefined,
      },
    },
    start: {
      section: "feature-grid",
      variant: "cards",
      overrides: {
        header: { kicker: "Try Qdrant Cloud", title: "Spin Up a Qdrant Cluster" },
        columns: 3,
        tones: undefined,
        items: [
          {
            icon: "Rocket",
            title: "Try Cloud Free",
            text: "Spin up a permanently free cluster in under 90 seconds. No credit card, no minimum spend, around one million 768-dimension vectors.",
            link: startFree,
          },
          {
            icon: "MessageSquare",
            title: "Talk to a Solutions Engineer",
            text: "For SOC 2 evidence, HIPAA BAA, sizing help, or enterprise procurement.",
            link: { label: "Talk to the Team", href: "https://qdrant.tech/contact-us/" },
          },
          {
            icon: "Code",
            title: "Run Open Source Locally",
            text: "Pull the Docker image or clone the repo. Same engine, same APIs as Cloud. Apache 2.0.",
            link: { label: "View on GitHub", href: "https://github.com/qdrant/qdrant" },
          },
        ],
      },
    },
    // The library's Categories FAQ is the page's, as it is (the answers from the site's accordions).
    faq: { section: "faq", variant: "categories" },
    cta: {
      section: "cta",
      variant: "centered",
      overrides: {
        title: "Considering a Production Deployment?",
        description: "Solutions engineering pairs with teams on sizing, migration planning, and compliance.",
        primary: { label: "Talk to the Team", href: "https://qdrant.tech/contact-us/" },
        secondary: { label: "Case Studies", href: "https://qdrant.tech/customers/" },
      },
    },
    footer: { section: "footer", variant: "full" },
  },
  labels: {
    announcement: "Announcement",
    navbar: "Navbar",
    hero: "Hero",
    logos: "Logos",
    why: "Why Qdrant Cloud",
    customers: "Customers (figures)",
    capabilities: "Capability tabs",
    search: "Composable search",
    performance: "Control performance",
    availability: "High availability",
    security: "Defense in depth",
    monitoring: "Monitoring",
    stack: "Across your stack",
    pricing: "Pricing",
    start: "Spin up a cluster",
    faq: "FAQs",
    cta: "Call to action",
    footer: "Footer",
  },
  // Figures never get a pattern, and the bars stay plain.
  noPattern: ["announcement", "navbar", "customers", "capabilities"],
  versions: [
    {
      id: "cloud-as-is",
      name: "Cloud, as it is",
      idea: "qdrant.tech/cloud from the library, with no patterns: the baseline to mix patterns into.",
      mix: {},
    },
  ],
  start: {},
  gaps: [
    "The capabilities show one group at a time on the site, under tabs; here the anchor tabs lead to the five groups, one after another.",
    "The capability cards link to the docs on the site; the library's cards need a link label, which the site's cards don't have, so they don't link.",
    "The line under the capabilities' heading (“Each capability is available through the Qdrant Cloud Console and the API.”) has no slot in the anchor nav.",
    "Across Your Stack has four tabs on the site (Language SDKs, Infrastructure as Code, Migrate, Integrations) with their own sub-tabs; the code showcase shows the three code samples the page has, without syntax colors (its tabs aren't named for a language).",
    "The hero's screenshot is the library's cluster setup screen, rebuilt from the design system, not the site's image.",
  ],
}
