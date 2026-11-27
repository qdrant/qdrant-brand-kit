// Copy from the current qdrant.tech (read 2026-11-21), verbatim, for the developer, enterprise and specialized
// sections: benchmarks (/benchmarks/), the local quickstart (/documentation/quickstart/), client libraries
// (/documentation/interfaces/), Hybrid Cloud (/hybrid-cloud/), security (/security/ and the home page's
// "Enterprise-ready tooling"), Serverless (/serverless/), the AI agents and RAG promos (/ai-agents/, /rag/), the
// Cloud capabilities tabs (/cloud/) and Vector Space Day San Francisco (/vector-space-day-sf-26/). Where a passage
// was longer than fits a card, only its first full sentence is used, never a paraphrase.

import type { Link } from "./site"

// ---------------------------------------------------------------------------------------------------------------
// Benchmarks (/benchmarks/, "Single node benchmarks", updated January/June 2024). The figures come from the page's
// raw data (/benchmarks/results-1-100-thread-2024-06-15.json), picked the way the page's own table does: for each
// engine, the best configuration whose mean precision is at or above the threshold. RPS and index time use the
// 100-thread runs and the latencies the single-thread runs, as the page's metric switch does. Values are truncated
// to two decimals like the page's table: RPS in requests per second, latencies in ms, index time (upload + index)
// in minutes. The page's precision is a slider; these are three stops on it.

export type BenchmarkEngine = "qdrant" | "weaviate" | "elasticsearch" | "redis" | "milvus"
export type BenchmarkMetricId = "rps" | "latency" | "p95" | "index"
export type BenchmarkResults = Record<string, Record<BenchmarkMetricId, Partial<Record<BenchmarkEngine, number>>>>

export type BenchmarkData = {
  updated: string
  engines: Record<BenchmarkEngine, string>
  metrics: { id: BenchmarkMetricId; label: string; unit: string; lowerIsBetter: boolean; threads: number }[]
  precisions: string[]
  datasets: { id: string; vectors: string; dimensions: string; distance: string }[]
  results: Record<string, BenchmarkResults>
}

export const benchmark = {
  header: {
    kicker: "Benchmarking Vector Search",
    title: "Single node benchmarks",
    description:
      "We benchmarked several vector search engines using various configurations of them on different datasets to check how the results may vary.",
  },
  methodology: { label: "Benchmarks F.A.Q.", href: "https://qdrant.tech/benchmarks/#benchmarks-faq" } as Link,
  rawData: { label: "Download raw data", href: "https://qdrant.tech/benchmarks/results-1-100-thread-2024-06-15.json" } as Link,
  data: {
    updated: "Updated: January/June 2024",
    engines: { qdrant: "Qdrant", weaviate: "Weaviate", elasticsearch: "Elasticsearch", redis: "Redis", milvus: "Milvus" },
    metrics: [
      { id: "rps", label: "RPS", unit: "RPS", lowerIsBetter: false, threads: 100 },
      { id: "latency", label: "Latency", unit: "ms", lowerIsBetter: true, threads: 1 },
      { id: "p95", label: "p95 latency", unit: "ms", lowerIsBetter: true, threads: 1 },
      { id: "index", label: "Index time", unit: "min", lowerIsBetter: true, threads: 100 },
    ],
    precisions: ["0.9", "0.95", "0.99"],
    datasets: [
      { id: "dbpedia-openai-1M-1536-angular", vectors: "1M", dimensions: "1536", distance: "cosine" },
      { id: "deep-image-96-angular", vectors: "10M", dimensions: "96", distance: "cosine" },
      { id: "gist-960-euclidean", vectors: "1M", dimensions: "960", distance: "euclidean" },
      { id: "glove-100-angular", vectors: "1.2M", dimensions: "100", distance: "cosine" },
    ],
    results: {
  "dbpedia-openai-1M-1536-angular": {
    "0.9": { rps: { qdrant: 1260.52, weaviate: 1142.13, redis: 951.49, elasticsearch: 716.8, milvus: 219.11 }, latency: { redis: 1.42, qdrant: 1.51, weaviate: 4.41, elasticsearch: 9.26, milvus: 13.84 }, p95: { qdrant: 1.71, redis: 1.76, weaviate: 6.03, elasticsearch: 10.52, milvus: 20.29 }, index: { milvus: 1.16, qdrant: 7.53, weaviate: 13.94, redis: 36.53, elasticsearch: 73.05 } },
    "0.95": { rps: { qdrant: 1260.52, weaviate: 1142.13, elasticsearch: 716.8, redis: 709.39, milvus: 219.11 }, latency: { qdrant: 1.63, redis: 1.92, weaviate: 6.2, elasticsearch: 9.26, milvus: 13.84 }, p95: { qdrant: 1.85, redis: 2.51, weaviate: 8.52, elasticsearch: 10.52, milvus: 20.29 }, index: { milvus: 1.16, qdrant: 7.53, weaviate: 13.94, redis: 36.53, elasticsearch: 73.05 } },
    "0.99": { rps: { qdrant: 1238.0, weaviate: 845.49, elasticsearch: 712.98, redis: 337.35, milvus: 219.11 }, latency: { qdrant: 2.56, redis: 3.4, elasticsearch: 11.17, milvus: 13.84, weaviate: 13.95 }, p95: { qdrant: 3.12, redis: 4.28, elasticsearch: 11.59, weaviate: 19.74, milvus: 20.29 }, index: { milvus: 1.16, qdrant: 8.92, weaviate: 13.94, redis: 36.53, elasticsearch: 73.05 } },
  },
  "deep-image-96-angular": {
    "0.9": { rps: { weaviate: 2087.6, qdrant: 1608.64, elasticsearch: 1151.34, redis: 925.28, milvus: 580.72 }, latency: { redis: 2.21, qdrant: 3.01, elasticsearch: 7.22, milvus: 7.47, weaviate: 8.17 }, p95: { redis: 2.5, qdrant: 3.56, elasticsearch: 8.86, milvus: 9.25, weaviate: 11.4 }, index: { weaviate: 13.94, milvus: 15.14, qdrant: 23.66, redis: 106.25, elasticsearch: 308.36 } },
    "0.95": { rps: { qdrant: 1501.75, weaviate: 1079.15, elasticsearch: 894.96, redis: 689.65, milvus: 580.72 }, latency: { redis: 2.57, qdrant: 3.11, milvus: 7.47, elasticsearch: 8.32, weaviate: 9.78 }, p95: { redis: 3.17, qdrant: 3.76, milvus: 9.25, elasticsearch: 10.22, weaviate: 12.15 }, index: { weaviate: 13.94, milvus: 15.14, qdrant: 23.66, redis: 106.25, elasticsearch: 308.36 } },
    "0.99": { rps: { qdrant: 1010.27, weaviate: 819.98, elasticsearch: 574.77, milvus: 538.48, redis: 365.05 }, latency: { redis: 3.95, qdrant: 4.32, milvus: 7.47, elasticsearch: 12.58, weaviate: 12.72 }, p95: { qdrant: 5.03, redis: 5.04, milvus: 9.25, elasticsearch: 16.29, weaviate: 16.4 }, index: { weaviate: 13.94, milvus: 15.14, qdrant: 23.66, redis: 284.99, elasticsearch: 608.62 } },
  },
  "gist-960-euclidean": {
    "0.9": { rps: { qdrant: 1033.59, weaviate: 791.5, elasticsearch: 419.19, milvus: 316.03, redis: 278.06 }, latency: { qdrant: 4.43, redis: 4.88, milvus: 8.48, elasticsearch: 14.26, weaviate: 14.41 }, p95: { qdrant: 5.29, redis: 6.31, milvus: 10.12, elasticsearch: 17.75, weaviate: 19.53 }, index: { qdrant: 6.26, milvus: 7.93, weaviate: 12.32, redis: 37.93, elasticsearch: 66.21 } },
    "0.95": { rps: { qdrant: 710.23, weaviate: 496.17, milvus: 281.52, elasticsearch: 275.11, redis: 160.13 }, latency: { qdrant: 5.36, redis: 7.47, milvus: 8.77, elasticsearch: 20.63, weaviate: 21.51 }, p95: { qdrant: 6.81, redis: 9.8, milvus: 11.03, elasticsearch: 26.26, weaviate: 29.73 }, index: { qdrant: 6.26, milvus: 7.93, weaviate: 13.94, redis: 101.88, elasticsearch: 122.79 } },
    "0.99": { rps: { qdrant: 360.33, milvus: 152.72 }, latency: { qdrant: 9.96, milvus: 12.04 }, p95: { qdrant: 13.19, milvus: 15.54 }, index: { qdrant: 8.99, milvus: 9.53 } },
  },
  "glove-100-angular": {
    "0.9": { rps: { qdrant: 1395.88, milvus: 1157.5, elasticsearch: 782.76, weaviate: 653.23, redis: 448.55 }, latency: { redis: 3.35, qdrant: 4.82, milvus: 6.11, elasticsearch: 9.99, weaviate: 10.07 }, p95: { redis: 4.2, qdrant: 6.04, milvus: 8.18, weaviate: 12.46, elasticsearch: 13.05 }, index: { milvus: 3.7, qdrant: 5.31, weaviate: 12.75, redis: 24.88, elasticsearch: 37.0 } },
    "0.95": { rps: { qdrant: 872.95, milvus: 536.59, elasticsearch: 486.7, weaviate: 466.68, redis: 257.66 }, latency: { redis: 5.17, qdrant: 7.11, milvus: 10.82, elasticsearch: 15.06, weaviate: 16.19 }, p95: { redis: 6.61, qdrant: 9.26, milvus: 15.95, elasticsearch: 20.0, weaviate: 21.47 }, index: { qdrant: 9.52, milvus: 12.38, weaviate: 13.94, redis: 61.93, elasticsearch: 96.45 } },
    "0.99": { rps: { milvus: 139.9 }, latency: { qdrant: 11.48, milvus: 20.68 }, p95: { qdrant: 15.08, milvus: 36.57 }, index: { milvus: 26.72 } },
  },
    },
  } as BenchmarkData,
}

// ---------------------------------------------------------------------------------------------------------------
// The local quickstart (/documentation/quickstart/, "Download and run"): the two Docker commands, as documented.

export type TerminalLine = { comment?: string; command: string }

export const installCommand = {
  header: {
    kicker: "Download and run",
    title: "How to Get Started with Qdrant Locally",
    description: "Before you start, please make sure Docker is installed and running on your system.",
  },
  lines: [
    { comment: "First, download the latest Qdrant image from Dockerhub:", command: "docker pull qdrant/qdrant" },
    {
      comment: "Then, run the service:",
      command: 'docker run -p 6333:6333 -p 6334:6334 \\\n    -v "$(pwd)/qdrant_storage:/qdrant/storage:z" \\\n    qdrant/qdrant',
    },
  ] as TerminalLine[],
  // What the page lists once Qdrant runs.
  output: {
    title: "Qdrant is now accessible:",
    items: [
      { label: "REST API", value: "localhost:6333" },
      { label: "Web UI", value: "localhost:6333/dashboard" },
      { label: "GRPC API", value: "localhost:6334" },
    ],
  },
  links: [
    { label: "See the Quickstart", href: "https://qdrant.tech/documentation/quickstart/" },
    { label: "Documentation", href: "https://qdrant.tech/documentation/" },
  ] as Link[],
}

// ---------------------------------------------------------------------------------------------------------------
// Client libraries (/documentation/interfaces/, "Client Libraries"), in the docs' order, with the install lines as
// documented. Java has no install line there, only its Maven Central link.

export type Sdk = { name: string; install?: string; repo: Link; docs?: Link; release: Link; registry?: Link }

export const sdks = {
  header: {
    kicker: "Interfaces",
    title: "Client Libraries",
    description: "Qdrant supports these “official” clients.",
    action: { label: "Documentation", href: "https://qdrant.tech/documentation/interfaces/" } as Link,
  },
  items: [
    {
      name: "Python",
      install: "pip install qdrant-client[fastembed]",
      repo: { label: "GitHub", href: "https://github.com/qdrant/qdrant-client" },
      docs: { label: "Docs", href: "https://python-client.qdrant.tech/" },
      release: { label: "Latest Release", href: "https://github.com/qdrant/qdrant-client/releases" },
    },
    {
      name: "JavaScript / Typescript",
      install: "npm install @qdrant/js-client-rest",
      repo: { label: "GitHub", href: "https://github.com/qdrant/qdrant-js" },
      release: { label: "Latest Release", href: "https://github.com/qdrant/qdrant-js/releases" },
    },
    {
      name: "Rust",
      install: "cargo add qdrant-client",
      repo: { label: "GitHub", href: "https://github.com/qdrant/rust-client" },
      release: { label: "Latest Release", href: "https://github.com/qdrant/rust-client/releases" },
    },
    {
      name: "Go",
      install: "go get github.com/qdrant/go-client",
      repo: { label: "GitHub", href: "https://github.com/qdrant/go-client" },
      release: { label: "Latest Release", href: "https://github.com/qdrant/go-client/releases" },
    },
    {
      name: ".NET",
      install: "dotnet add package Qdrant.Client",
      repo: { label: "GitHub", href: "https://github.com/qdrant/qdrant-dotnet" },
      release: { label: "Latest Release", href: "https://github.com/qdrant/qdrant-dotnet/releases" },
    },
    {
      name: "Java",
      repo: { label: "GitHub", href: "https://github.com/qdrant/java-client" },
      registry: { label: "Available on Maven Central", href: "https://central.sonatype.com/artifact/io.qdrant/client" },
      release: { label: "Latest Release", href: "https://github.com/qdrant/java-client/releases" },
    },
  ] as Sdk[],
}

// ---------------------------------------------------------------------------------------------------------------
// Hybrid Cloud's architecture (/hybrid-cloud/): only the parts and relations the page names. Each row puts a part
// of the control plane beside a part of the data plane; a link between them points to a numbered note, the page's
// own sentence.

export type ArchitecturePart = { name: string; detail?: string }
export type ArchitectureRow = {
  control?: ArchitecturePart
  data?: ArchitecturePart[]
  // Connections in this row, each pointing to a legend note, and which side it goes to.
  links?: { note: string; to: "control" | "data" }[]
}

export const hybridArchitecture = {
  header: {
    kicker: "Qdrant Hybrid Cloud",
    title: "A clear split between what you own and what Qdrant operates.",
    description: "Manage every cluster from the central Qdrant Cloud control plane.",
    action: { label: "See the Quickstart", href: "https://qdrant.tech/documentation/hybrid-cloud/hybrid-cloud-setup/" } as Link,
  },
  control: { title: "Qdrant Cloud", label: "Control plane" },
  data: { title: "Your Kubernetes cluster", label: "Data plane" },
  rows: [
    {
      control: { name: "Qdrant Cloud control plane", detail: "api.cloud.qdrant.io · grpc.cloud.qdrant.io" },
      data: [{ name: "Cloud Agent" }],
      links: [
        { note: "01", to: "control" },
        { note: "02", to: "control" },
      ],
    },
    {
      control: { name: "Container registry" },
      data: [{ name: "Qdrant clusters" }],
      links: [{ note: "03", to: "data" }],
    },
    { control: { name: "Qdrant Cloud Console" }, data: [{ name: "Qdrant Operator" }] },
    { data: [{ name: "Load balancers" }, { name: "Block storage" }] },
  ] as ArchitectureRow[],
  legend: [
    {
      note: "01",
      text: "The Cloud Agent in your cluster opens outbound connections to api.cloud.qdrant.io and grpc.cloud.qdrant.io on port 443.",
    },
    {
      note: "02",
      text: "Qdrant Cloud receives operational metadata only: cluster health and resource usage, your Kubernetes configuration, and collection names and counts.",
    },
    {
      note: "03",
      text: "Qdrant operates the control plane, the Kubernetes Operator, and the container registry that delivers Qdrant container images to your cluster.",
    },
    { note: "04", text: "You own the Kubernetes environment, the load balancers, and block storage." },
  ],
  // The note on the data plane as a whole.
  dataNote: "04",
  footnote: "No user data leaves your environment.",
}

// ---------------------------------------------------------------------------------------------------------------
// Security (/security/, "Data Access Isolation and Encryption" and the cards under it) and the home page's
// "Enterprise-ready tooling". The certification badges are the files in web/assets/badges.

export type SecurityFeature = { title: string; text: string; icon: string; tag?: string; link?: Link }

export const security = {
  header: {
    title: "Secure Every Deployment",
    description:
      "Security controls are available across all Qdrant Cloud deployment modes. Hybrid Cloud and Private Cloud add full data isolation for stricter residency and compliance requirements.",
    action: { label: "Explore the Security Docs", href: "https://qdrant.tech/documentation/security/" } as Link,
  },
  features: [
    { icon: "Boxes", title: "Cluster Isolation", text: "Hardened, unprivileged containers, isolated from one another.", link: { label: "Explore Cluster Isolation", href: "https://qdrant.tech/documentation/cloud-security/#managed-cloud" } },
    { icon: "LockKeyhole", title: "Encryption in Transit, at Rest", text: "Data protected in transit with TLS and storage volumes encrypted at rest.", link: { label: "See How Encryption Works", href: "https://qdrant.tech/documentation/cloud-security/#managed-cloud" } },
    { icon: "SquareActivity", title: "Telemetry and Logs", text: "Originate from Qdrant cluster, but then are pushed to Qdrant's US management plane.", link: { label: "Monitor Your Clusters", href: "https://qdrant.tech/documentation/cloud/cluster-monitoring/" } },
    { icon: "GlobeLock", title: "In-region Data Residency", text: "Data in Qdrant clusters stored only in the cluster's deployment region.", link: { label: "Choose Your Region", href: "https://qdrant.tech/documentation/cloud/create-cluster/#create-a-cluster" } },
    { icon: "FileText", title: "Audit Logging", text: "Audit logging, available on paid clusters, captures operations performed through the Qdrant API, including user and API key attribution, timestamp, target collection, and result of the action.", link: { label: "Activate Audit Logging", href: "https://qdrant.tech/documentation/cloud/configure-cluster/#audit-logging" } },
    { icon: "Network", title: "Network Isolation and Private Connectivity", tag: "Only available on Premium tier", text: "Connect your Qdrant Managed Cloud cluster to your VPC using private links, so traffic between your application and the cluster travels over your private network.", link: { label: "Learn About Private Connectivity", href: "https://qdrant.tech/documentation/cloud-premium/" } },
    { icon: "KeyRound", title: "Single Sign-On", tag: "Only available on Premium tier", text: "Qdrant Cloud supports enterprise SSO for Premium tier customers, with support for Active Directory/LDAP, ADFS, Azure Active Directory Native, Google Workspace, OpenID Connect, Okta, PingFederate, and SAML.", link: { label: "Set Up SSO", href: "https://qdrant.tech/documentation/cloud-account-setup/#enterprise-single-sign-on-sso" } },
    { icon: "UserCog", title: "Access Control and RBAC", text: "Qdrant Cloud lets you manage permissions for cloud resources at the collection-level inside the Qdrant Cloud Management Cloud Console.", link: { label: "Configure RBAC", href: "https://qdrant.tech/documentation/cloud-rbac/role-management/" } },
  ] as SecurityFeature[],
  compliance: {
    title: "Compliance and Certifications",
    text: "Qdrant holds SOC 2 Type 2 and HIPAA certifications. Pull compliance reports directly from the Trust Center.",
    action: { label: "Request Reports in the Trust Center", href: "https://qdrant.to/trust-center" } as Link,
  },
  badges: [
    { name: "SOC 2", file: "soc-2" },
    { name: "GDPR", file: "gdpr" },
    { name: "HIPAA", file: "hipaa" },
  ],
}

// Home: "Enterprise-ready tooling".
export const enterpriseTooling = {
  header: {
    title: "Enterprise-ready tooling",
    description:
      "Deploy on any cloud, hybrid, or edge environment with full data control. Choose the setup that fits your infrastructure and scale securely without compromise.",
    action: { label: "Talk to our Team", href: "https://qdrant.tech/contact-us/" } as Link,
  },
  items: [
    "SOC 2 · GDPR-aligned Options",
    "Prometheus · Grafana · Datadog",
    "SSO (SAML/OIDC)",
    "Multitenancy & Granular RBAC",
    "Private Networking",
    "Zero-downtime upgrades",
    "Backups & Point-in-time restore",
    "Vector-scoped API Keys",
  ],
}

// ---------------------------------------------------------------------------------------------------------------
// Serverless (/serverless/): "When to Use It" and "When Not to Use It".

export type FitItem = { title: string; text: string }

export const serverlessFit = {
  header: {
    kicker: "Qdrant Serverless",
    title: "What Is Qdrant Serverless?",
    description: "Serverless vector search removes the cluster from the equation.",
  },
  use: {
    title: "When to Use It",
    description: "Serverless is built for workloads where provisioned capacity isn't the best fit.",
    items: [
      { title: "Multitenant AI Applications", text: "SaaS products where each customer has their own set of vectors that only they can access. Thousands of small, isolated tenants without running a cluster sized for their sum." },
      { title: "Spiky or Idle Workloads", text: "Applications with bursty, unpredictable, or infrequent traffic. Internal tools, agent memory, and long-tail features that don't justify dedicated compute." },
      { title: "Fast Starts, Small Footprints", text: "Prototypes and early products that need production-grade vector search from day one without capacity planning. Start small, grow without re-architecting." },
    ] as FitItem[],
  },
  avoid: {
    title: "When Not to Use It",
    items: [
      { title: "Sustained, Latency-Critical Traffic", text: "If your workload runs a sustained high query volume with strict latency requirements, a dedicated cluster gives you consistent, predictable performance and is usually more cost-effective at constant utilization." },
      { title: "Non-Multitenant Use Case", text: "If you have a non-multitenant use case or small set of very large tenants, it may not be a good fit." },
      { title: "Full Control or Network Isolation", text: "If you need full infrastructure control or network isolation, look at Qdrant Cloud (dedicated), Hybrid Cloud or Private Cloud." },
    ] as FitItem[],
  },
  note: "The right tool depends on your workload, which is what the waitlist form asks about.",
  action: { label: "Join the Waitlist", href: "https://qdrant.tech/serverless/#form" } as Link,
}

// ---------------------------------------------------------------------------------------------------------------
// Promos: the on-demand webinar on /ai-agents/ and the guide on /rag/.

export type Promo = { kicker: string; icon?: string; title: string; text?: string; action: Link }

export const agentsWebinar: Promo = {
  kicker: "On-demand Webinar",
  icon: "Video",
  title: "Building Agents with LlamaIndex & Qdrant",
  text: "Ready to build more advanced AI agents? Watch this webinar to learn how to use LlamaIndex and Qdrant to create intelligent agents capable of handling complex, multi-modal queries in RAG-enabled systems.",
  action: { label: "Watch Now", href: "https://www.youtube.com/watch?v=3mWIFsooibQ" },
}

export const ragGuide: Promo = {
  kicker: "A comprehensive guide",
  icon: "BookOpen",
  title: "Best Practices in RAG Evaluation",
  text: "Learn how to assess, calibrate, and optimize your RAG applications for long-term success.",
  action: { label: "Get the Guide", href: "https://qdrant.tech/rag/rag-evaluation-guide/" },
}

// ---------------------------------------------------------------------------------------------------------------
// Cloud (/cloud/, "Capabilities Included with Every Cloud Cluster"): the five group tabs, with the page's own ids.

export const cloudCapabilityTabs = {
  label: "Capabilities Included with Every Cloud Cluster",
  items: [
    { label: "Composable Search", href: "#qdrant-cloud-capabilities-tab-0" },
    { label: "Control Performance", href: "#qdrant-cloud-capabilities-tab-1" },
    { label: "High Availability", href: "#qdrant-cloud-capabilities-tab-2" },
    { label: "Defense in Depth", href: "#qdrant-cloud-capabilities-tab-3" },
    { label: "Monitoring and Recovery", href: "#qdrant-cloud-capabilities-tab-4" },
  ] as Link[],
}

// ---------------------------------------------------------------------------------------------------------------
// Vector Space Day San Francisco (/vector-space-day-sf-26/). The hero's facts as written (the page gives no year
// beside the date), the four agenda tiles, and the talks in the page's order. The page doesn't say which talk is
// in which track, nor any talk's time, so sessions have neither.

export type EventFact = { icon: string; text: string }
export type EventSession = { company: string; speakers: string[]; title: string; time?: string; track?: string }

export const vectorSpaceDay = {
  name: "Vector Space Day",
  facts: [
    { icon: "MapPin", text: "The Midway, San Francisco" },
    { icon: "CalendarDays", text: "Thursday, June 11" },
    { icon: "Clock", text: "8:30 am until happy hour" },
  ] as EventFact[],
  action: { label: "Watch the Recap", href: "https://qdrant.tech/vector-space-day-sf-26-recap/" } as Link,
  agenda: {
    kicker: "Agenda",
    title: "Why Attend Vector Space Day",
    description: "A single-track, full-day conference for engineers and researchers building with vector search and AI",
    tracks: [
      { title: "Search & AI Retrieval", icon: "Search" },
      { title: "Agents & Memory", icon: "Bot" },
      { title: "Edge & Robotics", icon: "Cpu" },
      { title: "Happy Hour", icon: "GlassWater" },
    ],
  },
  speakers: {
    kicker: "Speakers",
    title: "Meet the Speakers",
    description:
      "We've built a handpicked lineup of technical talks across 3 agenda tracks: Search & AI Retrieval, Agents & Memory, and Edge & Robotics AI.",
    sessions: [
      { company: "Mem0", speakers: ["Taranjeet Singh, CEO, Co-Founder"], title: "Continual Learning Starts with Memory" },
      { company: "Adobe", speakers: ["Murthy Chandrapaty, Principal Engineer", "Ankush Gumber, Software Engineer"], title: "Using GraphRAG to Improve Enterprise Governance" },
      { company: "Google DeepMind", speakers: ["Paige Bailey, Developer Relations Lead"], title: "Literal Skill Issue: Are SKILLS.md Holding Your Agents Back?" },
      { company: "Neo4j", speakers: ["Stephen Chin, VP of Developer Relations"], title: "Free Your Agent's Mind...with Context Graphs" },
      { company: "Hubspot", speakers: ["Oleg Tereshin, Sr Software Engineer & Xin Liu, Tech Lead"], title: "Building the Infra Behind 20 Billion+ Vectors" },
      { company: "Slack", speakers: ["Avirek Ghatia, Staff Software Engineer"], title: "Scaling to Billions: Lessons from Slack’s Semantic Search Indexing" },
      { company: "Vultr", speakers: ["Gabriel Lebow, Sr GPU Solutions Engineer"], title: "Building Distributed, Enterprise-ready Agentic AI" },
      { company: "LlamaIndex", speakers: ["Preston Carlson, AI Engineer"], title: "The Document Harness: What Your AI Misses in the 90%" },
      { company: "Arize", speakers: ["Laurie Voss, Head of Developer Relations"], title: "Stop Vibe Shipping: Evaluate Your Retrieval" },
      { company: "Twelve Labs", speakers: ["James Le, Head of Dev Experience"], title: "Beyond the Single API Call: Agentic Video Intelligence" },
      { company: "Cognee", speakers: ["Dave Nielsen, Head of Developer Relations"], title: "The Long and the Short of AI Memory" },
      { company: "Qualcomm", speakers: ["Alan Zhu, Senior Product Manager"], title: "When Latency Is the Product: Practical Patterns for On-Device GenAI" },
      { company: "AWS", speakers: ["Sandhya Subramani, Sr. Dev Advocate, GenAI"], title: "Tell the Robot What You Want" },
    ] as EventSession[],
  },
  // "Sponsorship": the tiers as the page groups them (the community sponsor's name is its logo file's), and the
  // FAQ's answer on becoming one.
  sponsorship: {
    kicker: "Sponsorship",
    title: "How do I become a sponsor?",
    description:
      "Sponsorship packages range from $5,000 to $30,000 and include booth space, brand presence, and direct access to the audience.",
    action: { label: "vectorspaceday@qdrant.com", href: "mailto:vectorspaceday@qdrant.com" } as Link,
    tiers: [
      { name: "Sponsors", sponsors: ["AWS", "Vultr"] },
      { name: "Community Sponsor", sponsors: ["Hackersquad"] },
    ],
  },
}
