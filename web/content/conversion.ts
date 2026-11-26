// Copy from the current qdrant.tech (read 2026-11-21), verbatim, for the proof and conversion sections: testimonials,
// case studies, pricing, the sizing calculator, comparison tables, FAQs and forms. Where a quote was long, only its
// first full sentence is used, never a paraphrase. Form fields, labels and options are the site's own forms (the
// HubSpot forms on /contact-us/, /qdrant-for-startups/, /serverless/ and the footer). The sizing formula is
// Qdrant's capacity planning guide (qdrant.tech/documentation/capacity-planning/). Links not captured are "#".

import type { Link } from "./site"

// ---------------------------------------------------------------------------------------------------------------
// Testimonials

export type Quote = {
  quote: string
  name?: string
  // A role and company, or a handle for community quotes.
  role?: string
  company?: string
  handle?: string
}

// Home: the Canva quote under "Enterprise-ready tooling" (no person is named on the site).
export const canvaQuote: Quote = {
  quote:
    "Qdrant's technical architecture and performance capabilities have proven to be exactly what we need as we scale our AI-powered features across the platform. They are an ideal partner as we standardize our vector search infrastructure to serve millions of users worldwide.",
  company: "Canva",
}

// Community: "What Our Community Members Are Saying". Long quotes cut to their first full sentence.
export const communityQuotes = {
  title: "What Our Community Members Are Saying",
  action: { label: "Join Discord", href: "https://discord.com/invite/qdrant" },
  quotes: [
    { quote: "qdrant has been amazing!", name: "Owen Colegrove", handle: "@ocolegro" },
    { quote: "qdrant is so fast I'm using Rust for all future projects goodnight everyone", name: "Darren", handle: "@darrenangle" },
    {
      quote: "Indexing millions of embeddings into @qdrant_engine has been the smoothest experience I've had so far with a vector db.",
      name: "Greg Schoeninger",
      handle: "@gregschoeninger",
    },
    { quote: "@qdrant_engine is ultra super powerful!", name: "Ifioravanti", handle: "@ivanfioravanti" },
    { quote: "Qdrant is awesome", name: "sengpt", handle: "@sengpt" },
    { quote: "I am so inspired by Qdrant's performance.", name: "Charlie Greenman", handle: "@razroo_chief" },
  ] as Quote[],
}

// Enterprise Solutions: the two customer quotes, cut to their first full sentence.
export const enterpriseQuotes: Quote[] = [
  {
    quote: "Qdrant powers our demanding recommendation and RAG applications.",
    name: "Srubin Sethu Madhavan",
    role: "Technical Lead II at Hubspot",
    company: "HubSpot",
  },
  {
    quote: "Vector stores are definitely here to stay, the objects in the world around us from image, sound, video and text become easily universal and searchable thanks to the embedding models and vector stores.",
    name: "Hooman Sedghamiz",
    role: "Director AI/ML, Bayer",
    company: "Bayer",
  },
]

// The Deutsche Telekom case study (blog/case-study-deutsche-telekom): Arun Joseph's quote, beside the result from
// the Cloud page's customer card.
export const telekomResult = {
  quote: {
    quote: "I looked at Qdrant and immediately loved the simplicity, Rust-based efficiency, and memory management capabilities.",
    name: "Arun Joseph",
    company: "Deutsche Telekom",
  } as Quote,
  metric: {
    value: "7x Faster",
    label: "Production Time",
    text: "After replacing their vector stack with Qdrant, Deutsche Telekom cut AI agent development from 15 days to 2 days.",
    link: { label: "Read Case Study", href: "https://qdrant.tech/blog/case-study-deutsche-telekom/" },
  },
}

// ---------------------------------------------------------------------------------------------------------------
// Case studies

export type CaseStudy = {
  company: string
  // Its id in the customer logo library: a result card shows the logo, not the name (design lead, 2026-11-26).
  logo?: string
  // The headline figure and the words after it ("2-3x" "Revenue Lift").
  metric: string
  metricLabel?: string
  text: string
  category?: string
  detail?: string
  link: Link
}

// Cloud: "Customers Building with Qdrant Cloud".
export const cloudCustomers = {
  kicker: "In Production",
  title: "Customers Building with Qdrant Cloud",
  items: [
    {
      company: "Tripadvisor",
      logo: "tripadvisor",
      metric: "2-3x",
      metricLabel: "Revenue Lift",
      text: "Travelers using the generative AI experience show 2-3x more revenue than those using traditional search.",
      category: "Consumer-facing AI app",
      detail: "11M businesses · 21 countries",
      link: { label: "Read Case Study", href: "https://qdrant.tech/blog/case-study-tripadvisor/" },
    },
    {
      company: "Deutsche Telekom",
      logo: "telekom",
      metric: "7x Faster",
      metricLabel: "Production Time",
      text: "After replacing their vector stack with Qdrant, Deutsche Telekom cut AI agent development from 15 days to 2 days.",
      category: "Multi-agent platform",
      detail: "2M+ AI conversations served",
      link: { label: "Read Case Study", href: "https://qdrant.tech/blog/case-study-deutsche-telekom/" },
    },
    {
      company: "FAZ",
      logo: "faz",
      metric: "<1s",
      metricLabel: "Filtered query response on 14M vectors",
      text: "Sub-second response times on complex, highly filtered semantic queries across an indexed archive of more than 14 million vectors.",
      category: "Media",
      detail: "75 years of archived journalism",
      link: { label: "Read Case Study", href: "https://qdrant.tech/blog/case-study-faz/" },
    },
  ] as CaseStudy[],
}

// Customers: the page's heading, with Deutsche Telekom's story as the featured one (its line from the Customers
// hero, Arun Joseph's quote from the case study, the figures from the Cloud page's card).
export const featuredStory = {
  kicker: "Customer Case Studies",
  title: "Explore What Leading Teams Build with Qdrant",
  action: { label: "Talk to Sales", href: "/contact-us/" },
  story: {
    company: "Deutsche Telekom",
    summary: "Built a multi-agent PaaS powering 2M+ conversations across 10 countries, cutting agent dev time from 15 days to 2.",
    quote: telekomResult.quote,
    metrics: [
      { value: "7x Faster", label: "Production Time" },
      { value: "2M+", label: "AI conversations served" },
    ],
    link: { label: "Read Case Study", href: "https://qdrant.tech/blog/case-study-deutsche-telekom/" },
  },
}

// ---------------------------------------------------------------------------------------------------------------
// Pricing

export type Tier = {
  name: string
  // The price line as the site writes it.
  price?: string
  description?: string
  features?: string[]
  // Labeled lists, for the wider enterprise cards ("Best for:", "Benefits:").
  featureGroups?: { label: string; items: string[] }[]
  note?: string
  cta: Link
  // The tier the page leads with: its button is the primary one.
  highlight?: boolean
}

export type TierGroup = { label: string; tiers: Tier[] }

// Pricing: the tier cards under the hero, in the page's two tabs, Managed and On-Premise.
export const pricingTiers = {
  title: "Qdrant Cloud Pricing",
  description:
    "Start free. Scale to production with fully managed vector search. Meet all enterprise security and compliance requirements.",
  action: { label: "Talk to our Team", href: "/contact-us/" },
  secondaryAction: { label: "Try our Pricing Calculator", href: "https://cloud.qdrant.io/calculator" },
  groups: [
    {
      label: "Managed",
      tiers: [
        {
          name: "Free Tier",
          price: "Free forever",
          description: "For testing, and prototypes",
          features: ["Single Node Cluster", "0.5 vCPU / 1GB RAM/ 4 GB Disk.", "Free Cloud Inference With Selected Models"],
          cta: { label: "Start Free", href: "https://cloud.qdrant.io" },
        },
        {
          name: "Standard Tier",
          price: "Usage-based pricing",
          description: "For production workloads and scaling applications",
          features: [
            "Dedicated Resources",
            "Flexible Vertical and Horizontal Scaling",
            "Highly Available Setups",
            "Backup & Disaster Recovery",
            "Free Tokens for Paid Inference Models",
            "99.5% Uptime SLA",
          ],
          note: "Subscribe on Marketplace.",
          cta: { label: "Deploy on Cloud", href: "https://cloud.qdrant.io" },
          highlight: true,
        },
        {
          name: "Premium Tier",
          price: "Minimum spend required",
          description: "For enterprises with additional security and compliance needs",
          features: ["SSO", "Private VPC Links", "99.9% Uptime SLA", "Extra Support"],
          cta: { label: "Talk to Our Engineers", href: "/contact-us/" },
        },
      ],
    },
    {
      label: "On-Premise",
      tiers: [
        {
          name: "Hybrid Cloud",
          description: "Run managed Qdrant clusters on your own infrastructure using your compute, network and storage.",
          featureGroups: [
            { label: "Best for:", items: ["Local Data Residency", "Regulated Workloads", "Easy Operations in Your Own Cloud"] },
            { label: "Benefits:", items: ["Data Stays in Your Network", "Fully Managed Through Qdrant Cloud", "Production-Grade Uptime"] },
          ],
          cta: { label: "Talk to Our Engineers", href: "/contact-us/" },
          highlight: true,
        },
        {
          name: "Private Cloud",
          description: "Dedicated, isolated deployment for strict security or compliance needs.",
          featureGroups: [
            { label: "Best for:", items: ["Large Enterprises", "Sensitive Workloads", "Air-Gapped Setups"] },
            { label: "Benefits:", items: ["Custom SLAs", "Full Isolation"] },
          ],
          cta: { label: "Talk to Our Engineers", href: "/contact-us/" },
          highlight: true,
        },
      ],
    },
  ] as TierGroup[],
  // The band under the tiers.
  calculator: {
    text: "Not sure how large your cluster needs to be?",
    prefix: "Try our",
    link: { label: "Pricing Calculator", href: "https://cloud.qdrant.io/calculator" },
  },
}

// ---------------------------------------------------------------------------------------------------------------
// Sizing calculator

// The heading from the Pricing page's calculator band, the line from the capacity planning guide.
export const sizing = {
  title: "Not sure how large your cluster needs to be?",
  description:
    "Sizing a Qdrant cluster means estimating how much storage and memory your collections need and deciding how to distribute that load across nodes.",
  action: { label: "Try our Pricing Calculator", href: "https://cloud.qdrant.io/calculator" },
  source: { label: "Capacity Planning", href: "https://qdrant.tech/documentation/capacity-planning/" },
}

// ---------------------------------------------------------------------------------------------------------------
// Comparison tables

// A cell: a check (true), a dash (false or null), text, or text with a link.
export type Cell = boolean | null | string | { text: string; link: Link }
export type TableColumn = { label: string; icon?: string; highlight?: boolean }
export type TableGroup = { title?: string; rows: { label: string; values: Cell[] }[] }

// Pricing: "Support & Reliability", grouped rows per plan.
export const supportPlans = {
  kicker: "Enterprise Support",
  title: "Support & Reliability",
  action: { label: "Talk to Our Team", href: "/contact-us/" },
  columns: [{ label: "Community" }, { label: "Standard" }, { label: "Premium" }, { label: "Enterprise" }] as TableColumn[],
  groups: [
    { title: "Pricing", rows: [{ label: "Price", values: ["Free", "Included with Paid Tier", "On Request", "On Request"] }] },
    {
      title: "Availability & Uptime",
      rows: [
        { label: "Helpdesk Hours", values: ["Discord Only", "10h/day (Business Hours)", "24/7, 365", "24/7, 365"] },
        { label: "Uptime SLA", values: [false, "99.5%", "99.9% (99.95% Multi-AZ)", "Custom"] },
      ],
    },
    {
      title: "Response SLA",
      rows: [{ label: "Severity 1 (Full service outage)", values: [false, "4h (Business Hours)", "1h (24/7)", "Custom"] }],
    },
    {
      title: "Support Channels",
      rows: [
        { label: "Email / Ticket Portal", values: [false, true, true, true] },
        { label: "Private Slack / Discord / Teams", values: [false, false, true, true] },
      ],
    },
    {
      title: "Advisory Services",
      rows: [
        { label: "Migration Support", values: [false, true, true, true] },
        { label: "Architecture Reviews", values: [false, false, true, true] },
        { label: "Performance Consulting", values: [false, false, true, true] },
      ],
    },
    { title: "Add-Ons", rows: [{ label: "Forward Deployed Engineer", values: [false, false, "Optional", "Optional"] }] },
    {
      title: "Infrastructure/Security",
      rows: [
        { label: "SSO", values: [false, false, true, true] },
        { label: "VPC Private Links", values: [false, false, true, true] },
        { label: "Multi-AZ Deployment", values: [false, false, true, true] },
        { label: "Encryption with Shared Keys", values: [false, false, true, true] },
      ],
    },
  ] as TableGroup[],
}

// Migrate from Chroma: "Qdrant vs. Chroma Comparison".
export const versusChroma = {
  title: "Qdrant vs. Chroma Comparison",
  description: "We Offer Hybrid Search, Multitenancy, and Enterprise-Grade Security and Compliance.",
  rowHeader: "What enterprises evaluate",
  columns: [{ label: "Qdrant", highlight: true }, { label: "Chroma Cloud" }, { label: "Chroma Open Source" }] as TableColumn[],
  groups: [
    {
      rows: [
        {
          label: "Same engine for managed and self-hosted",
          values: [
            "Yes, one Apache 2.0 engine. Qdrant Cloud adds managed security and operations.",
            "Not applicable",
            "No: sparse and hybrid search are only available on Chroma Cloud",
          ],
        },
        {
          label: "Hybrid search in one query",
          values: ["Dense plus sparse (BM25, SPLADE, miniCOIL) or a full-text index", "Yes, through the Search API", "No"],
        },
        {
          label: "Multitenancy",
          values: ["Payload-based", "Tenant-level isolation, built for millions of collections", "Same tenant model, sized for a handful of collections"],
        },
        {
          label: "Scaling and operations",
          values: ["Sharding and replication across nodes, managed on Qdrant Cloud", "Managed", "You run it: sizing, upgrades, and on-call are yours."],
        },
        {
          label: "Deployment options",
          values: ["Cloud, Hybrid Cloud, Private Cloud, Self-Hosted, Edge (beta)", "Managed only", "Self-hosted"],
        },
        {
          label: "Security and compliance",
          values: [
            "SOC 2 Type II, HIPAA BAA, GDPR DPA, RBAC, and audit logs; SSO and private link on Premium",
            "Not applicable after December 22",
            "Yours to build",
          ],
        },
        {
          label: "Serverless",
          values: [
            { text: "Early access.", link: { label: "Join the list", href: "/serverless/#form" } },
            "Yes, until December 22",
            "No",
          ],
        },
      ],
    },
  ] as TableGroup[],
}

const trustCenter: Cell = {
  text: "Available via",
  link: { label: "Trust Center", href: "https://app.drata.com/trust/9cbbb75b-0c38-11ee-865f-029d78a187d9" },
}

// Security: "What Security You Get on Each Deployment Model".
export const securityMatrix = {
  title: "What Security You Get on Each Deployment Model",
  action: { label: "Explore the Security Docs", href: "https://qdrant.tech/documentation/security/" },
  columns: [
    { label: "Qdrant Cloud", icon: "Cloud" },
    { label: "Hybrid / Private Cloud", icon: "Layers" },
    { label: "Self-Hosted", icon: "Server" },
  ] as TableColumn[],
  groups: [
    {
      rows: [
        { label: "Encryption in transit (TLS)", values: ["Built-in", "Customer configuration", "Customer configuration"] },
        { label: "Encryption at rest", values: ["Built-in; Customer-provided keys (Premium)", "Customer configuration", "Customer configuration"] },
        { label: "Audit Logging", values: ["Available on paid clusters", "Available on paid clusters", "Customer configuration"] },
        { label: "Cloud Management Console role-based access control (RBAC)", values: ["Built-in", "Built-in, Hybrid only", "Not applicable"] },
        { label: "Single sign-on (SSO)", values: ["Included with Premium", "Available on request (Hybrid only)", "Not applicable"] },
        { label: "Private network connectivity", values: ["Included with Premium", "Not applicable", "Not applicable"] },
        { label: "Compliance documentation (SOC 2 Type 2, HIPAA)", values: [trustCenter, trustCenter, "Not applicable"] },
      ],
    },
  ] as TableGroup[],
}

// ---------------------------------------------------------------------------------------------------------------
// FAQ

// A question with no answer yet (the design has none) shows, but doesn't open.
export type Faq = { question: string; answer?: string }

// Pricing: "FAQs".
export const pricingFaq = {
  title: "FAQs",
  items: [
    {
      question: "What Happens if I Exceed Free Tier Limits?",
      answer: "If your data size growth exceeds the Free Tier limits (1GB RAM and 4GB disk), you can easily upgrade to a Standard Tier and scale up your cluster.",
    },
    {
      question: "How Does Qdrant Cloud Pricing Work",
      answer: "Qdrant Cloud pricing is based on resource usage, if you have a bigger cluster, you pay for more. The free tier includes 1GB RAM and 4GB disk storage, upgrading will get you a dedicated cluster.",
    },
    {
      question: "Can I Migrate from OSS to Qdrant Cloud?",
      answer: "Yes, you can easily migrate your existing Qdrant OSS deployment to Qdrant Cloud. We provide a migration tool and documentation to help you transition smoothly.",
    },
    {
      question: "How Do I Choose Between Free Tier and Standard Tier?",
      answer: "The Free Tier is ideal for testing, and prototypes being limited to 1GB RAM and 4GB disk without high availability. Choose the Standard Tier for workloads that require dedicated clusters, higher availability, and advanced features.",
    },
    {
      question: "What's the Difference Between Managed, Hybrid, and Private Cloud?",
      answer: "Managed Cloud is fully managed by Qdrant. Hybrid Cloud lets you bring your own infrastructure while using Qdrant's management plane. Private Cloud gives you complete control with on-premise deployment.",
    },
    {
      question: "How Is Billing Calculated Month-to-Month?",
      answer: "Billing is calculated based on actual resource usage during the billing period. You're charged for compute (vCPU), memory (GB), storage (GB) consumed by your clusters, storage (GB) consumed by backups, and used inference tokens of paid models. Usage is billed hourly, and you can monitor it through the Qdrant Cloud dashboard.",
    },
  ] as Faq[],
}

// Hybrid Cloud: "FAQs". The site's answer on network access repeats a sentence, so that question is left out.
export const hybridFaq = {
  title: "FAQs",
  action: { label: "Talk to Us", href: "/contact-us/" },
  items: [
    {
      question: "Does Qdrant have access to my data in Hybrid Cloud?",
      answer: "In Hybrid Cloud, your data plane runs inside your own Kubernetes environment. Qdrant Cloud receives operational metadata only: cluster health and resource usage, your Kubernetes configuration, and collection names and counts. No user data leaves your environment.",
    },
    {
      question: "What Kubernetes distributions does Hybrid Cloud support?",
      answer: "Hybrid Cloud requires a standard-compliant Kubernetes cluster. AWS EKS, Google GKE, and Azure AKS all qualify, as does any other conformant distribution.",
    },
    {
      question: "Who is responsible for Kubernetes operations and storage in Hybrid Cloud?",
      answer: "You are responsible for the Kubernetes environment, storage provisioning, and load balancer. Qdrant is responsible for the control plane, the Kubernetes Operator, delivery of Qdrant container images to your cluster, and correct configuration and management of your Qdrant clusters.",
    },
    {
      question: "Can I manage Hybrid Cloud clusters from the same console as fully managed clusters?",
      answer: "Yes. Hybrid Cloud clusters are provisioned and managed from the Qdrant Cloud Console at cloud.qdrant.io, the same interface used for fully managed deployments. To begin setup, open the console and follow the Hybrid Cloud enrollment flow.",
    },
    {
      question: "How do I choose where my Hybrid Cloud cluster runs?",
      answer: "When creating a cluster, you select your registered Hybrid Cloud environment as the deployment target, the same way you would choose a cloud region for a fully managed cluster. This lets you place data in a specific cloud account and region to meet residency requirements.",
    },
  ] as Faq[],
}

// Cloud: "FAQs", by category.
export const cloudFaq = {
  title: "FAQs",
  categories: [
    {
      label: "Getting Started",
      items: [
        {
          question: "Is there a free tier?",
          answer: "Yes. The free tier is a single-node cluster with 0.5 vCPU, 1GB RAM, and 4GB disk. That fits roughly one million 768-dimension vectors. No credit card. Free clusters suspend after 1 week of inactivity and delete after 4 weeks if you don't reactivate them.",
        },
        {
          question: "What clouds and regions are supported?",
          answer: "AWS, GCP, and Azure across multiple regions. The current questions shows up in the cluster creation flow and on the pricing page. New regions get added when customers ask for them.",
        },
        {
          question: "Which clients and SDKs do you support?",
          answer: "Official SDKs for Python, TypeScript, Rust, Go, Java, and .NET. The REST and gRPC APIs are documented and identical to open-source Qdrant, so any community client built against the OSS engine works against Cloud.",
        },
        {
          question: "Can I bring my own embedding model?",
          answer: "Yes. Qdrant Cloud is model-agnostic, so you can bring vectors from OpenAI, Cohere, Voyage, or your own fine-tunes. If you want one less vendor, Qdrant Cloud Inference generates text and image embeddings inside the cluster using models like MiniLM, SPLADE, BM25, Mixedbread Embed-Large, and CLIP. Paid clusters get up to 5 million free tokens per model per month, with no token cap on BM25.",
        },
      ],
    },
    {
      label: "Pricing and Billing",
      items: [
        {
          question: "How is pricing calculated?",
          answer: "Resource-based: vCPU, RAM, and storage, billed hourly. Cloud Inference adds usage charges only when you call paid embedding models. The pricing page has a sizing calculator.",
        },
        {
          question: "Are there overage charges or surprise bills?",
          answer: "No. Cluster sizes are explicit and any change needs your authorization. Capacity alerts fire at 80% so you can upgrade on your own terms before anything breaks.",
        },
        {
          question: "Do you offer startup or research discounts?",
          answer: "Yes. The Qdrant for Startups program offers a 20% Qdrant Cloud discount for 12 months. Eligibility: pre-seed, seed, or Series A, under 5 years old, under $5M in funding, building an AI product (agencies and dev shops don't qualify). Apply at qdrant.tech/qdrant-for-startups.",
        },
      ],
    },
    {
      label: "Performance and Scale",
      items: [
        {
          question: "What query latency should I expect?",
          answer: "For a typical 10M-vector collection at 768 dimensions with moderate filtering, P50 lands in the single-digit milliseconds and P99 stays under 50ms. Numbers shift with dimension count, recall target, filter selectivity, and cluster size. Reproducible benchmarks at qdrant.tech/benchmarks.",
        },
        {
          question: "How fast can I ingest data?",
          answer: "CPU indexing handles tens of thousands of vectors per second per node, depending on dimension and HNSW parameters. GPU-accelerated HNSW indexing delivers up to 4x faster index construction for bulk loads. GPU clusters are available today on AWS, with other clouds on the roadmap.",
        },
        {
          question: "How does quantization affect recall?",
          answer: "Scalar quantization typically loses 1% to 2% recall and cuts RAM by 4x. TurboQuant (Google's algorithm, integrated into Qdrant) sits in the middle: 4-bit gives roughly 8x compression with recall close to scalar, up to 32x at higher ratios. Binary with rescoring keeps recall close to full precision while cutting memory by up to 32x for compatible embedding models. The cluster UI shows recall before and after so you can pick the trade-off you want.",
        },
      ],
    },
    {
      label: "Clusters and Scaling",
      items: [
        {
          question: "How do I scale up or down?",
          answer: "Vertical scaling adds vCPU, RAM, or disk to existing nodes. Horizontal scaling adds nodes and rebalances shards automatically. Both run from the dashboard or the API. If your collections aren't replicated, a vertical scale takes a short downtime window. Replicated collections scale without interruption.",
        },
        {
          question: "What happens when my cluster gets full?",
          answer: "If RAM or disk usage stays above 80% for 5 minutes, the account owner gets an email alert. From there you can scale vertically (more capacity per node) or horizontally (more nodes), or delete data. No surprise lockouts, no surprise bills.",
        },
        {
          question: "Is multi-region supported?",
          answer: "Multi-AZ within a single region is available on the Premium Multi-AZ tier. It needs a minimum of three nodes and scales in multiples of three. Multi-region active-active replication isn't a managed feature yet. Teams that need it run separate clusters per region today.",
        },
      ],
    },
    {
      label: "Reliability",
      items: [
        {
          question: "What's your SLA?",
          answer: "99.5% uptime on Standard. 99.9% on Premium. Up to 99.95% on Premium Multi-AZ. The full SLA, including uptime definitions and service-credit terms, lives at qdrant.to/sla.",
        },
        {
          question: "How do backups work?",
          answer: "Scheduled incremental snapshots on AWS and GCP, with configurable retention. Azure backups bill based on total disk usage. You can also take on-demand snapshots before risky changes and restore to the same cluster or a new one. For long-term retention or compliance, you can export snapshots to your own object storage.",
        },
        {
          question: "What's your disaster recovery posture?",
          answer: "You set the snapshot cadence to match your RPO. Premium Multi-AZ deployments replicate across three availability zones (cross-AZ replication, not failover) with no failover delay. If a zone goes down, reads and writes continue from the surviving zones with no customer action required. For cross-region retention, export snapshots to your own object storage in any region.",
        },
      ],
    },
    {
      label: "Security and Compliance",
      items: [
        {
          question: "Are you SOC 2, GDPR, and HIPAA compliant?",
          answer: "Yes. SOC 2 Type II report and HIPAA certification on file. GDPR-compliant Data Processing Agreement available. Email Solutions Engineering for current compliance documentation and BAA scope.",
        },
        {
          question: "How is data encrypted?",
          answer: "TLS in transit. Storage volumes encrypted at rest. Premium customers can use customer-managed keys for disk encryption, plus SSO and VPC private links. Snapshots and backups inherit the same encryption.",
        },
        {
          question: "What does audit logging capture?",
          answer: "Every API operation: queries, upserts, deletes, collection management, and snapshot operations. Each entry is structured JSON with caller identity, timestamp, target collection, and the decision (allowed or denied). You can retrieve logs through an API endpoint, configure retention to match your policy, and download them for long-term storage in your own systems. Available on all paid clusters.",
        },
        {
          question: "Are you EU-based?",
          answer: "Yes. Qdrant is headquartered in Berlin. EU customers can keep data in EU regions exclusively, which addresses US Cloud Act concerns and similar extraterritorial regimes.",
        },
      ],
    },
    {
      label: "Migration and Lock-In",
      items: [
        {
          question: "Is migrating from Qdrant Open Source to Cloud difficult?",
          answer: "No. Our open-source migration tool turns it into a configuration change, not a rewrite. Application code points at a new endpoint; business logic stays intact.",
        },
        {
          question: "How do I migrate from another vector database?",
          answer: "The migration tool covers Pinecone, Weaviate, Milvus, Chroma, Redis, MongoDB, OpenSearch, Elasticsearch, pgvector, S3 Vectors, FAISS, Apache Solr, and Qdrant-to-Qdrant (for example, OSS to Cloud). The bigger lift is usually re-running the ingestion pipeline; the data move itself is incremental and resumes if interrupted. Solutions Engineering will pair on a migration plan if you ask.",
        },
        {
          question: "Can I move workloads back from Cloud to OSS later?",
          answer: "Yes. Export a snapshot, restore it on your own infrastructure running open-source Qdrant. The engine and data format are identical. Your data is yours.",
        },
        {
          question: "What happens if Qdrant Cloud goes away?",
          answer: "The engine is open source under Apache 2.0, with 30k+ GitHub stars and a 60k-member Discord community. You can run it yourself indefinitely. Engine parity keeps your options open whatever happens to the managed service.",
        },
      ],
    },
    {
      label: "Support",
      items: [
        {
          question: "What support tiers do you offer?",
          answer: "Community (Discord, free), Standard (10x5 business hours, Mon-Fri 08:00 to 18:00 CET), and Premium (24x7 critical incident response with priority response times).",
        },
        {
          question: "How fast do you respond?",
          answer: "We use four severity levels. Standard customers get a Sev 1 response in 4 business hours, Sev 2 in 6, Sev 3 in 24. Premium customers get Sev 1 in 1 hour, Sev 2 in 2, Sev 3 in 4 business hours. Real engineers, not a tier-1 chatbot.",
        },
        {
          question: "Do you have a community channel?",
          answer: "Yes. The Qdrant Discord is open to all developers, including the engineering team. discord.gg/qdrant",
        },
      ],
    },
  ] as { label: string; items: Faq[] }[],
}

// ---------------------------------------------------------------------------------------------------------------
// Forms

export type FormField = {
  name: string
  label: string
  type: "text" | "email" | "url" | "textarea" | "select" | "checkbox"
  required?: boolean
  placeholder?: string
  options?: string[]
  // Half the row from sm, so two short fields share a line.
  half?: boolean
}

export type FormSpec = {
  title?: string
  fields: FormField[]
  submit: string
  // Fine print under the fields.
  note?: string
}

// The Country/Region options of the site's forms (HubSpot), in their order.
export const countries = [
  "Afghanistan", "Åland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla",
  "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory",
  "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Canary Islands", "Caribbean Netherlands", "Cayman Islands", "Central African Republic", "Chad", "Chile",
  "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Cook Islands",
  "Costa Rica", "Côte d'ivoire", "Croatia", "Cuba", "Curaçao", "Cyprus", "Czechia",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Falkland Islands",
  "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia",
  "French Southern and Antarctic Lands", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece",
  "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Macao", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova",
  "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island",
  "North Korea", "North Macedonia", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn Islands", "Poland", "Portugal",
  "Puerto Rico", "Qatar", "Réunion", "Romania", "Russia", "Rwanda", "Saint Barthélemy", "Saint Helena",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin", "Saint Pierre and Miquelon",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "South Korea", "South Sudan", "Spain",
  "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Türkiye", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "U.S. Virgin Islands", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Wallis and Futuna", "Western Sahara", "Yemen",
  "Zambia", "Zimbabwe",]

// Contact Us: the intro, the option cards and the form ("Talk to our Team").
export const contact = {
  title: "Contact Qdrant",
  description: "Let us know how we can help by filling out the form. We will respond within 48 business hours.",
  options: [
    {
      icon: "MessagesSquare",
      title: "Qdrant Cloud Support",
      text: "For questions or issues with Qdrant Cloud, contact",
      link: { label: "support@qdrant.io", href: "mailto:support@qdrant.io" },
    },
    {
      icon: "MessageSquareCode",
      title: "Developer Support",
      text: "For developer questions about Qdrant usage, join our",
      link: { label: "Discord Server", href: "https://qdrant.to/discord" },
    },
  ],
  form: {
    title: "Talk to our Team",
    fields: [
      { name: "email", label: "Business Email", type: "email", required: true },
      { name: "firstname", label: "First Name", type: "text", required: true, half: true },
      { name: "lastname", label: "Last Name", type: "text", required: true, half: true },
      { name: "company", label: "Company", type: "text", required: true, half: true },
      { name: "jobtitle", label: "Job Title (optional)", type: "text", half: true },
      { name: "message", label: "Message", type: "textarea", required: true },
      { name: "country", label: "Country/Region", type: "select", required: true, options: countries },
    ],
    submit: "Send Message",
    note: "Qdrant needs the contact information you provide to us to contact you about our products and services. You may unsubscribe from these communications at any time. For information on how to unsubscribe, as well as our privacy practices and commitment to protecting your privacy, please review our Privacy Policy.",
  } as FormSpec,
}

// The footer's newsletter: the title and line from site.ts's footer, the field and button as the footer has them.
export const newsletter = {
  title: "Sign up for Qdrant updates",
  description:
    "We'll occasionally send you best practices for using vector data and similarity search, as well as product news.",
  placeholder: "Enter your email",
  submit: "Subscribe",
}

// Qdrant for Startups: the benefits and the application form ("Join our Startup Program").
export const startups = {
  title: "Qdrant for Startups",
  description: "Qdrant for Startups is committed to being the catalyst for the next generation of AI innovators.",
  benefitsTitle: "Why join Qdrant for Startups?",
  benefits: [
    { icon: "BadgePercent", title: "Discount for Qdrant Cloud", text: "Enjoy a 20% discount on Qdrant Cloud for the first year." },
    { icon: "MessagesSquare", title: "Expert Technical Advice", text: "Get access to sessions with experts for personalized technical advice." },
    {
      icon: "Gift",
      title: "Partner Perks",
      text: "Receive exclusive perks from Hugging Face, LlamaIndex, and Airbyte, ensuring you have access to key tools and resources for AI-driven applications.",
    },
  ],
  form: {
    title: "Join our Startup Program",
    fields: [
      { name: "firstname", label: "First Name", type: "text", required: true, half: true },
      { name: "lastname", label: "Last Name", type: "text", required: true, half: true },
      { name: "email", label: "Business Email", type: "email", required: true },
      { name: "company", label: "Company Name", type: "text", required: true, half: true },
      { name: "country", label: "Country/Region", type: "select", options: countries, half: true },
      { name: "website", label: "Website URL", type: "url", required: true },
      { name: "description", label: "Product Description", type: "textarea", required: true },
      { name: "funding", label: "Funding Stage", type: "select", required: true, options: ["Pre-Seed", "Seed", "Series A"] },
      { name: "communications", label: "I agree to receive other communications from Qdrant.", type: "checkbox" },
    ],
    submit: "Submit",
    note: "By submitting, you agree to our Privacy Policy and allow Qdrant to store and process the information submitted above to provide you with the content requested.",
  } as FormSpec,
}

// Qdrant Serverless: the intro, "When to Use It" and the waitlist form ("Join the Waitlist").
export const serverless = {
  kicker: "Qdrant Serverless",
  title: "Join the Waitlist",
  description:
    "We're bringing serverless to Qdrant Cloud. No clusters, no capacity planning, no scaling to manage: create a collection, load vectors, and search. Same Qdrant API. Tell us about your workload and we'll reach out.",
  benefitsTitle: "When to Use It",
  benefitsDescription: "Serverless is built for workloads where provisioned capacity isn't the best fit.",
  benefits: [
    {
      title: "Multitenant AI Applications",
      text: "SaaS products where each customer has their own set of vectors that only they can access. Thousands of small, isolated tenants without running a cluster sized for their sum.",
    },
    {
      title: "Spiky or Idle Workloads",
      text: "Applications with bursty, unpredictable, or infrequent traffic. Internal tools, agent memory, and long-tail features that don't justify dedicated compute.",
    },
    {
      title: "Fast Starts, Small Footprints",
      text: "Prototypes and early products that need production-grade vector search from day one without capacity planning. Start small, grow without re-architecting.",
    },
  ],
  aside: "The right tool depends on your workload, which is what the waitlist form asks about.",
  form: {
    fields: [
      { name: "email", label: "Email", type: "email", required: true },
      { name: "firstname", label: "First name", type: "text", required: true, half: true },
      { name: "lastname", label: "Last name", type: "text", required: true, half: true },
      { name: "company", label: "Company", type: "text" },
      {
        name: "what_are_you_building",
        label: "What are you building?",
        type: "textarea",
        required: true,
        placeholder: "For example: a research assistant where each customer uploads their own documents and searches only their own data.",
      },
      { name: "is_your_workload_multitenant", label: "Is your workload multi-tenant?", type: "select", options: ["Yes", "No"] },
      {
        name: "vectors_in_your_largest_collection",
        label: "Vectors in your largest collection",
        type: "select",
        options: ["Under 100,000", "100,000 to 1 million", "1 million to 10 million", "More than 10 million"],
      },
      {
        name: "where_do_you_run_vector_search_today",
        label: "Where do you run vector search today?",
        type: "select",
        required: true,
        options: ["Qdrant open source (self-hosted)", "Qdrant Cloud", "Another vector search engine", "Nowhere yet, still evaluating"],
      },
      { name: "communications", label: "I agree to receive other communications from Qdrant.", type: "checkbox" },
    ],
    submit: "Join Waitlist",
    note: "We care about your privacy. Learn how we handle your data in our Privacy Policy.",
  } as FormSpec,
}
