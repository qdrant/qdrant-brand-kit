// The Resilience page (Figma: Qdrant Web Design, "Resilience-Subpage", node 19452:25124), its copy word for word
// from the Figma, for the page rebuilt from the library (pages/resilience.tsx). "Start Free" goes to the Cloud signup,
// as everywhere on the site; other links the Figma doesn't give are "#". Visuals (the Console screens and cluster diagrams) are added by the page, from web/visuals.

import type { ClusterDiagramData } from "../visuals/cluster-diagram"
import type { Cell, TableColumn, TableGroup } from "./conversion"
import type { Feature } from "./sections"
import type { Link } from "./site"

export const resilienceHero = {
  kicker: "Qdrant Cloud",
  title: "Production-Ready Resilience, Managed on Qdrant Cloud",
  description:
    "Go from single-node to fully replicated high availability in the Console. Add Multi-AZ on the Premium tier for zone-level resilience and an uptime SLA of up to 99.95%, and the cluster stays available through a full availability-zone outage.",
  primary: { label: "Start Free", href: "https://cloud.qdrant.io/signup" },
  secondary: { label: "Read the Docs", href: "#" },
  note: {
    text: "Need four or five nines with contractual guarantees?",
    link: { label: "Talk to our team", href: "https://qdrant.tech/contact-us/" },
    after: "about Enterprise and Private Cloud.",
  },
}

export const resilienceHowItWorks = {
  header: {
    title: "How Resilience Works on Qdrant Cloud",
    description: "Run at least 3 nodes with replication factor 2 or higher and the capabilities below apply to your cluster.",
    action: { label: "Configure a Replicated Cluster (Docs)", href: "https://qdrant.tech/documentation/cloud/configure-cluster/" },
  },
  items: [
    { icon: "Copy", title: "Replication", text: "Equal copies of every shard, kept across your nodes." },
    { icon: "FileX", title: "Failover", text: "Searches and writes continue when a node goes down." },
    { icon: "RefreshCw", title: "Rolling Upgrades", text: "Updates move through one node at a time while the rest serve traffic." },
  ] as Feature[],
}

// The three properties, each with its diagram's data; the page draws the diagrams.
export const resilienceConfiguration = {
  header: {
    kicker: "Cluster Configuration",
    title: "Configure the Right Resilience for Your Workload",
    description:
      "Replication and node count give you high availability. Multi-AZ is the zone-resilience upgrade on top, for teams that need to survive a full availability-zone outage. These three properties define your cluster's resilience on Qdrant Cloud:",
  },
  items: [
    {
      title: "Replication Factor",
      points: [
        { label: "What Qdrant Cloud Does", text: "Keeps equal copies of every shard across your nodes" },
        { label: "What it Means", text: "Searches and writes continue when a node goes down." },
      ],
      diagram: {
        kind: "replicas",
        nodes: [
          { label: "N1", shards: ["SHARD A", "SHARD B"] },
          { label: "N2", shards: ["SHARD B", "SHARD C"] },
          { label: "N3", shards: ["SHARD C", "SHARD A"] },
        ],
      },
    },
    {
      title: "Node Count",
      points: [
        { label: "What Qdrant Cloud Does", text: "Distributes shard replicas across more nodes." },
        { label: "What it Means", text: "More headroom for your cluster to stay healthy." },
      ],
      diagram: {
        kind: "request",
        request: "CLIENT REQUEST",
        nodes: [
          { label: "N1", shards: ["SHARD A", "SHARD B"] },
          { label: "N2", shards: ["SHARD B", "SHARD C"], down: true },
          { label: "N3", shards: ["SHARD C", "SHARD A"] },
        ],
      },
    },
    {
      title: "Multi-AZ",
      points: [
        { label: "What Qdrant Cloud Does", text: "Spreads those nodes across three availability zones." },
        { label: "What it Means", text: "Your cluster stays up across a full zone outage." },
      ],
      diagram: {
        kind: "request",
        request: "CLIENT REQUEST",
        nodes: [
          { label: "AZ-A", shards: ["SHARD A", "SHARD B"] },
          { label: "AZ-B", shards: ["SHARD B", "SHARD C"], down: true },
          { label: "AZ-C", shards: ["SHARD C", "SHARD A"] },
        ],
      },
    },
  ] as (Feature & { diagram: ClusterDiagramData })[],
  // The Multi-AZ banner under the three properties: a wide card closing the grid.
  multiAz: {
    title: "Multi-AZ",
    icon: "Boxes",
    wide: true,
    points: [
      { text: "Enabled at cluster creation" },
      { text: "Available on the Premium tier" },
      { text: "Changes where your replicas are placed, not how many" },
      { text: "Without it, a multi-node cluster keeps all replicas in one zone" },
    ],
    link: { label: "Read Documentation", href: "https://qdrant.tech/documentation/scaling/distributed_deployment/" },
  } as Feature,
}

// The capabilities, as in-page anchors for the tab row, then the capabilities themselves. The first three have a
// Console screen beside them; support and Multi-AZ placement follow as two cards.
export const resilienceCapabilities = {
  header: {
    kicker: "Capabilities",
    title: "What Qdrant Cloud Manages, By Tier",
    description:
      "These capabilities apply to replicated collections. See cluster configuration above for the node count and replication factor requirements.",
    action: { label: "Configure a Cluster (Docs)", href: "https://qdrant.tech/documentation/cloud/configure-cluster/" },
  },
  tabs: [
    { label: "Automatic Failover", href: "#automatic-failover" },
    { label: "Zero-Downtime Upgrades", href: "#zero-downtime-upgrades" },
    { label: "Backup & Recovery", href: "#backup-recovery" },
    { label: "Support", href: "#support" },
    { label: "Multi-AZ Placement", href: "#multi-az-placement" },
  ] as Link[],
  rows: [
    {
      id: "automatic-failover",
      tag: "All replicated clusters",
      icon: "Copy",
      tone: "indigo",
      title: "Automatic Failover",
      points: [
        {
          label: "Mechanics",
          text: "Qdrant Cloud runs health checks across nodes and routes around unhealthy nodes, so queries continue from healthy nodes. Every replica is equal, so there is no primary to promote.",
        },
        {
          label: "Guarantees",
          text: "Qdrant Cloud detects failures and keeps serving traffic from healthy nodes. No client-side changes required.",
        },
      ],
      link: { label: "Set Up a Replicated Cluster (Docs)", href: "https://qdrant.tech/documentation/cloud/create-cluster/" },
    },
    {
      id: "zero-downtime-upgrades",
      tag: "All replicated clusters",
      icon: "Copy",
      tone: "blue",
      title: "Zero-Downtime Upgrades",
      points: [
        {
          label: "Mechanics",
          text: "When a new version is available, you choose when to upgrade. Qdrant Cloud upgrades in a rolling fashion. If you are several versions behind, the required intermediate updates run automatically.",
        },
        {
          label: "Guarantees",
          text: "Multi-node clusters where all collections have replication factor 2 or higher stay fully available throughout the upgrade.",
        },
      ],
      link: { label: "Update Your Cluster (Docs)", href: "https://qdrant.tech/documentation/cloud/cluster-upgrades/" },
    },
    {
      id: "backup-recovery",
      tag: "All paid clusters",
      icon: "DollarSign",
      tone: "teal",
      title: "Backups and Disaster Recovery",
      points: [
        {
          label: "Mechanics",
          text: "Schedule backups, set days of retention, or take an on-demand backup any time. Backups restore into the same cluster or a new one.",
        },
        {
          label: "Guarantees",
          text: "Restore your cluster to the exact state of any backup within your retention window, including its configuration. No recovery scripts needed, so your team can focus on getting back online.",
        },
      ],
      link: { label: "Back Up Your Cluster (Docs)", href: "https://qdrant.tech/documentation/cloud/backups/" },
    },
  ] as Feature[],
  cards: [
    {
      id: "support",
      tag: "Tier-dependent",
      icon: "Phone",
      tone: "blue",
      title: "Engineering Support",
      points: [
        {
          label: "Mechanics",
          text: "Premium support covers production incidents 24/7, with severity-based response-time SLAs. Standard covers business hours.",
        },
        {
          label: "Guarantees",
          text: "Faster response times and around-the-clock coverage on Premium, with SLAs defined per severity level in the Qdrant Cloud SLA.",
        },
      ],
      link: { label: "See Support SLAs", href: "https://cloud.qdrant.io/sla" },
    },
    {
      id: "multi-az-placement",
      tag: "Premium-tier",
      icon: "Trophy",
      tone: "orange",
      title: "Multi-AZ Placement",
      points: [
        {
          label: "Mechanics",
          text: "Qdrant Cloud places your shard replicas across three availability zones, so each shard has a replica in a different zone. Traffic is routed between zones automatically, so the cluster stays available if one zone goes down. Enable Multi-AZ Deployment when you create the cluster.",
        },
        {
          label: "Guarantees",
          text: "An uptime SLA of up to 99.95% on the Premium tier with Multi-AZ enabled. Traffic reroutes across zones automatically, with no client-side changes.",
        },
      ],
      link: { label: "Start Free", href: "https://cloud.qdrant.io/signup" },
    },
  ] as Feature[],
}

export const resilienceDeployment = {
  header: {
    kicker: "Deployment Models",
    title: "What Resilience You Get on Each Deployment Model",
    description:
      "The capabilities above apply to Qdrant Cloud. The same resilience primitives run across every deployment model.",
    action: { label: "Compare Deployment Models (Docs)", href: "https://qdrant.tech/documentation/cloud/" },
  },
  // The Figma has no icons on the models; these are the library matrix's, as on the Security page.
  columns: [
    { label: "Managed Cloud", icon: "Cloud" },
    { label: "Hybrid Private", icon: "Layers" },
    { label: "Self-Hosted OSS", icon: "Server" },
  ] as TableColumn[],
  groups: [
    {
      rows: [
        { label: "Replication Factor (Set in Console)", values: [true, true, true] as Cell[] },
        { label: "Automatic Failover (with RF 2+)", values: [true, true, true] as Cell[] },
        {
          label: "Multi-A-Z",
          values: [
            "Premium, Enabled at creation",
            "Your Kubernetes placement",
            "Customer operated, no topology aware shard distribution",
          ] as Cell[],
        },
        { label: "Zero-downtime Upgrades", values: ["Replicated", "Replicated", "Manual"] as Cell[] },
        { label: "Auto Rebalance", values: [true, true, false] as Cell[] },
        {
          label: "Backups",
          values: ["Scheduled + on-demand (all paid)", "Scheduled + on-demand (all paid)", "Snapshot API"] as Cell[],
        },
        {
          label: "Uptime SLA",
          values: ["99.5% / 99.9% Premium / 99.95% Premium + Multi-AZ", "Your Infrastructure", false] as Cell[],
        },
      ],
    },
  ] as TableGroup[],
}

export const resilienceCaseStudy = {
  header: { kicker: "Resilience in Production", title: "How Teams Maintain Uptime at Scale" },
  story: {
    company: "Sapu Bioscience",
    summary: "Sapu migrated from self-hosted to Qdrant Cloud Premium, indexing 28 million PubMed abstracts in a single collection.",
    link: { label: "Read the Case Study", href: "https://qdrant.tech/blog/case-study-sapu/" },
  },
}

// The Figma has questions for the first category only, and an answer for the first question only.
export const resilienceFaq = {
  header: { title: "FAQs" },
  items: [
    {
      question: "What's the uptime SLA?",
      answer: "Up to 99.95% uptime on the Premium tier with Multi-AZ enabled. Full SLA terms are in the Qdrant Cloud SLA.",
    },
    { question: "What's the difference between Standard, Premium, and Premium Multi-AZ SLAs?" },
    { question: "How is uptime measured?" },
    { question: "What if I need a higher SLA than 99.95%?" },
  ],
}

export const resilienceCta = {
  title: "Build on Qdrant Cloud",
  description: "Replication, failover, and scheduled backups on every replicated cluster.",
  primary: { label: "Start Free", href: "https://cloud.qdrant.io/signup" },
  secondary: { label: "Talk to Engineering", href: "https://qdrant.tech/contact-us/" },
}
