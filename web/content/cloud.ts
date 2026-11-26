// The Qdrant Managed Cloud page of qdrant.tech (/cloud/, read 2026-11-26 from the site's source), word for word, for
// web/pages/cloud.tsx. The customer cards and the FAQs are already in content/conversion.ts (cloudCustomers,
// cloudFaq) and the capability tabs' labels in content/platform.ts (cloudCapabilityTabs); this file holds the rest.
// Icons are the site's own, which are Lucide; each group's tone stands in for the site's per-group color.

import type { Link } from "./site"
import type { Feature } from "./sections"

export const cloudPageHero = {
  kicker: "Qdrant Cloud",
  title: "Build Fast, Accurate Vector Search at Scale with Qdrant Cloud",
  description:
    "Qdrant Cloud is a managed service for running Qdrant vector search. You get the same open-source Rust engine with secure, predictable performance at scale. Move between self-hosted and managed without changing your code or data.",
  primary: {
    label: "Start Free",
    href: "https://cloud.qdrant.io/signup",
  } as Link,
  trust: [
    { label: "Predictable P99 Latency", icon: "Timer" },
    { label: "Native Hybrid + Multimodal", icon: "Layers" },
    { label: "SOC 2 + HIPAA + GDPR", icon: "ShieldCheck" },
  ],
}

// "Trusted by Enterprise Teams", the hero's logos, in the site's order.
export const cloudLogos = {
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
}

// "Offload Operations to Qdrant Cloud", in full (content/sections.ts's `offload` keeps only first sentences).
export const cloudOffload: Feature = {
  tag: "Why Qdrant Cloud",
  title: "Offload Operations to Qdrant Cloud",
  text: "Get the same predictably fast and accurate vector search engine. Qdrant Cloud handles the infrastructure.",
  points: [
    {
      label: "Simplify Cluster Operations",
      text: "Upgrades, scaling, sharding, backups, and monitoring run continuously without operator action.",
    },
    {
      label: "Audited Compliance",
      text: "Certified under SOC 2 Type II, HIPAA, and GDPR. BAA and DPA available on request.",
    },
    {
      label: "No Vendor Lock-In",
      text: "The same Qdrant engine, data format, and APIs across self-hosted, hybrid, and managed Cloud. Cloud supports snapshot export to your own infrastructure.",
    },
  ],
  link: { label: "Start Free", href: "https://cloud.qdrant.io/signup" },
}

// "Capabilities Included with Every Cloud Cluster": the five groups, each a section the anchor tabs jump to. Each
// card links by its title, as on the site.
export const cloudCapabilities = {
  title: "Capabilities Included with Every Cloud Cluster",
  description:
    "Each capability is available through the Qdrant Cloud Console and the API.",
  groups: [
    {
      id: "qdrant-cloud-capabilities-tab-0",
      tone: "teal",
      title: "Composable Search for the Whole Retrieval Pipeline",
      description:
        "You choose how each query is ranked, filtered, and scored. Combine dense vectors, sparse vectors, and metadata filters at query time.",
      items: [
        {
          icon: "Search",
          title: "Hybrid Search",
          text: "Keyword and semantic search lives in the same engine. Dense and sparse vectors in one query. Native BM25 and SPLADE++ run alongside dense retrieval.",
          href: "/documentation/search/hybrid-queries/",
        },
        {
          icon: "Funnel",
          title: "Filterable HNSW",
          text: "Latency stays predictable under filters. Filtering integrates with graph traversal, beyond pre- and post-filtering tradeoffs.",
          href: "/documentation/search/low-latency-search/",
        },
        {
          icon: "Layers",
          title: "Built-in Multivector",
          text: "More precise multimodal search in one query. Store multiple vectors per object across text, image, audio, video.",
          href: "/documentation/manage-data/vectors/",
        },
        {
          icon: "TrendingUp",
          title: "Full-Spectrum Reranking",
          text: "Apply business logic and token-level precision. Score boosting, ColBERT, and Maximal Marginal Relevance in-engine.",
          href: "/documentation/search/search-relevance/",
        },
        {
          icon: "SlidersHorizontal",
          title: "Advanced Metadata Filters",
          text: "Enable more precise and efficient retrieval. Store metadata in JSON and use advanced filters, such as nested, text, geo, has_vector, and more.",
          href: "/documentation/search/filtering/",
        },
        {
          icon: "RefreshCw",
          title: "Ingestion and Updates",
          text: "Bulk upserts and streaming. Insert, update, and delete on a live index.",
          href: "/documentation/manage-data/points/",
        },
        {
          icon: "CloudCog",
          title: "Qdrant Cloud Inference",
          text: "Embed and query in one round trip. Native embedding generation inside a cluster.",
          href: "/documentation/cloud/inference/",
        },
        {
          icon: "ThumbsUp",
          title: "Recommendation API",
          text: "Get “more like this” with one API call. Positive and negative examples to find similar items.",
          href: "/documentation/search/explore/",
        },
      ] as Feature[],
    },
    {
      id: "qdrant-cloud-capabilities-tab-1",
      tone: "green",
      title: "Control Performance at Scale",
      description:
        "The same engine runs from in-memory dev to web-scale production. Tune memory, indexing speed, and capacity for each workload.",
      items: [
        {
          icon: "Minimize2",
          title: "Quantization",
          text: "Up to 32× memory reduction. Scalar, TurboQuant, and binary help strike a balance between accuracy, storage efficiency, and search speed.",
          href: "/documentation/manage-data/quantization/",
        },
        {
          icon: "HardDrive",
          title: "On-Disk Storage",
          text: "Offload cold vectors and payloads to disk to reduce RAM cost.",
          href: "/documentation/manage-data/storage/",
        },
        {
          icon: "Maximize2",
          title: "Vertical and Horizontal Scaling",
          text: "Shards rebalance automatically, maintaining optimal performance. Scale clusters up, down, or out.",
          href: "/documentation/cloud/cluster-scaling/",
        },
        {
          icon: "Cpu",
          title: "GPU Indexing",
          text: "Up to 4× faster HNSW indexing. Every node in your cluster gets a dedicated GPU with a simple toggle.",
          href: "/documentation/ops-configuration/running-with-gpu/",
        },
        {
          icon: "Users",
          title: "Flexible Multitenancy",
          text: "Serve thousands of tenants per cluster with payload-based separation. Promote noisy ones to dedicated while traffic continues.",
          href: "/documentation/manage-data/multitenancy/",
        },
        {
          icon: "CircleGauge",
          title: "SIMD and Async I/O",
          text: "SIMD acceleration across x86 and ARM. io_uring keeps disk throughput high on Cloud volumes.",
        },
      ] as Feature[],
    },
    {
      id: "qdrant-cloud-capabilities-tab-2",
      tone: "purple",
      title: "High Availability and Recovery",
      description:
        "Engine-handled operations on highly available clusters. Continuous backups and live upgrades.",
      items: [
        {
          icon: "RefreshCw",
          title: "Zero-Downtime Upgrades",
          text: "Engine upgrades run while the cluster serves traffic. Multi-version supported.",
          href: "/documentation/cloud/cluster-upgrades/",
        },
        {
          icon: "GitBranch",
          title: "Multi-AZ Replication",
          text: "Up to 99.95% SLA. Three availability zones with automatic failover.",
          href: "/documentation/cloud-premium/",
        },
        {
          icon: "Database",
          title: "Backups and Disaster Recovery",
          text: "Scheduled incremental backups, on-demand snapshots, and restore to any cluster.",
          href: "/documentation/cloud/backups/",
        },
        {
          icon: "Download",
          title: "Snapshot Export",
          text: "Export snapshots to your own object storage for long-term retention or DR.",
          href: "/documentation/snapshots/",
        },
        {
          icon: "LifeBuoy",
          title: "Engineering Support",
          text: "Guaranteed response times on critical incidents. Business-hours coverage on Standard, 24/7 on Premium.",
          href: "/documentation/support/",
        },
      ] as Feature[],
    },
    {
      id: "qdrant-cloud-capabilities-tab-3",
      tone: "cyan",
      title: "Defense in Depth for Production Workloads",
      description:
        "Encryption on every channel and volume, granular access control, and private network options. Compliance-ready under SOC 2, HIPAA, and GDPR.",
      items: [
        {
          icon: "ShieldCheck",
          title: "Compliance",
          text: "Reports available under NDA. SOC 2 Type II, HIPAA with BAA, and GDPR with DPA.",
          href: "/documentation/cloud-security/",
        },
        {
          icon: "LockOpen",
          title: "Encryption in Transit",
          text: "End-to-end protection in flight. TLS 1.2+ on every API endpoint and replication channel.",
          href: "/documentation/cloud-security/",
        },
        {
          icon: "HardDrive",
          title: "Encryption at Rest",
          text: "Storage protected by default; Premium adds customer-managed keys. AES-256 on storage volumes.",
          href: "/documentation/cloud-security/",
        },
        {
          icon: "Waypoints",
          title: "Private VPC Links",
          text: "On Premium, traffic stays on private networks over AWS PrivateLink, GCP Private Service Connect, or Azure Private Link.",
          href: "/documentation/cloud-premium/",
        },
        {
          icon: "ListFilter",
          title: "IP Allowlisting",
          text: "Define your network perimeter explicitly. Restrict cluster access to specific CIDR ranges.",
          href: "/documentation/cloud/cluster-access/",
        },
        {
          icon: "KeyRound",
          title: "Single Sign-On (SSO)",
          text: "On Premium, manage Cloud Console sign-in through your identity provider. SAML or OpenID Connect with Okta, Azure AD, Google Workspace, and others.",
          href: "/documentation/cloud-account-setup/user-management/",
        },
      ] as Feature[],
    },
    {
      id: "qdrant-cloud-capabilities-tab-4",
      tone: "orange",
      title: "Monitoring and Observability Toolkit",
      description:
        "Monitor cluster health, audit every API call, and visualize capacity in real time. Configurable retention for compliance.",
      items: [
        {
          icon: "Activity",
          title: "Prometheus Metrics",
          text: "OpenMetrics-compatible /metrics and /sys_metrics endpoints on every cluster.",
          href: "/documentation/cloud/cluster-monitoring-prometheus/",
        },
        {
          icon: "ChartLine",
          title: "Grafana Dashboard",
          text: "Reference dashboard for cluster health, query latency, and capacity.",
          href: "https://github.com/qdrant/qdrant-cloud-grafana-dashboard",
        },
        {
          icon: "FileText",
          title: "Audit Logging",
          text: "Logs every API operation: caller, target, and outcome in structured JSON.",
          href: "/documentation/cloud/configure-cluster/",
        },
        {
          icon: "BellRing",
          title: "Capacity Alerts",
          text: "Alerts at 80% RAM and disk utilization, plus CPU throttling.",
          href: "/documentation/cloud/cluster-monitoring/",
        },
        {
          icon: "HeartPulse",
          title: "Health Endpoints",
          text: "Kubernetes-style /healthz, /livez, /readyz on every node.",
          href: "/documentation/ops-monitoring/monitoring/",
        },
        {
          icon: "SatelliteDish",
          title: "Telemetry",
          text: "Per-segment, per-shard internals with configurable verbosity.",
          href: "/documentation/ops-configuration/usage-statistics/",
        },
      ] as Feature[],
    },
  ],
}

// "Qdrant Cloud Across Your Stack": the three tabs and the four links beside them (the site shows each link as a
// small illustration; here, an icon).
export const cloudStack = {
  kicker: "Getting Started",
  title: "Qdrant Cloud Across Your Stack",
  links: [
    {
      icon: "Code",
      title: "Language SDKs",
      href: "/documentation/interfaces/",
    },
    {
      icon: "FileCode",
      title: "Infrastructure as Code",
      href: "/documentation/cloud-automation/terraform/",
    },
    {
      icon: "ArrowRightLeft",
      title: "Migrate",
      href: "https://github.com/qdrant/migration",
    },
    {
      icon: "Puzzle",
      title: "Integrations",
      href: "/documentation/frameworks/",
    },
  ] as Feature[],
  tabs: [
    {
      title: "Operate Clusters (SDK + CLI)",
      heading: "Same workflow from your app, terminal, or CI.",
      text: "Python SDK in app code, qcloud CLI in scripts and CI. Same Qdrant Cloud API.",
      code: [
        {
          label: "Python SDK",
          language: "python",
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
          language: "shell",
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
      ],
    },
    {
      title: "Cluster Visibility (Console)",
      heading: "See what's in your cluster from the browser.",
      text: "Inspect collections, run queries, and check results without leaving the Console.",
    },
    {
      title: "Provision Infrastructure (Terraform)",
      heading: "Define Qdrant Cloud clusters in your IaC repo.",
      text: "Provision, scale, and tear down clusters alongside the rest of your infrastructure.",
      code: [
        {
          label: "main.tf",
          language: "text",
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
  ],
}

// The pricing band.
export const cloudPricing = {
  title: "Pricing Based on Cluster Resources",
  description:
    "Qdrant Cloud is priced on the resources your cluster uses: vCPU, RAM, disk, and inference tokens for paid models.",
  primary: { label: "See Pricing", href: "/pricing/" } as Link,
}

// "Spin Up a Qdrant Cluster".
export const cloudStart = {
  kicker: "Try Qdrant Cloud",
  title: "Spin Up a Qdrant Cluster",
  items: [
    {
      icon: "Rocket",
      title: "Try Cloud Free",
      text: "Spin up a permanently free cluster in under 90 seconds. No credit card, no minimum spend, around one million 768-dimension vectors.",
      link: { label: "Start Free", href: "https://cloud.qdrant.io/signup" },
    },
    {
      icon: "MessageSquare",
      title: "Talk to a Solutions Engineer",
      text: "For SOC 2 evidence, HIPAA BAA, sizing help, or enterprise procurement.",
      link: { label: "Talk to the Team", href: "/contact-us/" },
    },
    {
      icon: "CodeXml",
      title: "Run Open Source Locally",
      text: "Pull the Docker image or clone the repo. Same engine, same APIs as Cloud. Apache 2.0.",
      link: {
        label: "View on GitHub",
        href: "https://github.com/qdrant/qdrant",
      },
    },
  ] as Feature[],
}

// The closing band. The site breaks the title after "a".
export const cloudCta = {
  title: "Considering a Production Deployment?",
  description:
    "Solutions engineering pairs with teams on sizing, migration planning, and compliance.",
  primary: { label: "Case Studies", href: "/customers/" } as Link,
  secondary: { label: "Talk to the Team", href: "/contact-us/" } as Link,
}
