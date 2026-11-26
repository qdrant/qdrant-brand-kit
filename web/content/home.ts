// The home page of qdrant.tech (read 2026-11-26), word for word, for web/pages/home.tsx. The hero, the customers,
// "Why Qdrant?", the results, deploy, enterprise, the Canva quote and "Performance by Design" are already in
// content/site.ts, sections.ts and conversion.ts, where the section library's examples use them too; this file
// holds the rest. The site's row of integration logos isn't here: its logos have no names in the page, and the
// library has no files for them.

import type { Feature } from "./sections"

// "Engineered for Builders": its three features, each with its link.
export const homeBuilders = {
  title: "Engineered for Builders",
  description:
    "Intuitive APIs and built-in tools — crafted for developers who demand more.",
  items: [
    {
      title: "Developer friendly APIs",
      text: "Start with a single API call — scale to advanced control over HNSW, hybrid fusion, reranking, and multi-vector retrieval, all via REST, gRPC, or official clients (Python, JavaScript, etc.).",
      link: {
        label: "Explore the API Docs",
        href: "https://api.qdrant.tech/api-reference",
      },
    },
    {
      title: "Built-In Web UI & Visualizations",
      text: "Explore collections, test vector and metadata queries, apply filters, and inspect results — all from a clean visual interface.",
      link: { label: "Try Web UI", href: "/documentation/web-ui/" },
    },
    {
      title: "Native Cloud Inference",
      text: "Generate text and image embeddings and run vector search in Qdrant Cloud — no separate pipeline or infrastructure needed.",
      link: { label: "Learn More About Inference", href: "/cloud-inference/" },
    },
  ] as Feature[],
}

// "Build AI Search the Way You Want": the use cases, one tab each.
export const homeSolutions = {
  kicker: "Solutions",
  title: "Build AI Search the Way You Want",
  description:
    "From RAG to AI agents, Qdrant delivers hybrid dense–sparse retrieval with advanced metadata filtering and real-time updates.",
  items: [
    {
      title: "RAG & GenAI",
      text: "Deliver context-rich answers with hybrid dense – sparse retrieval, metadata filters, and fresh updates.",
      link: { label: "Learn More", href: "/rag/" },
    },
    {
      title: "AI Agents",
      text: "Build intelligent agents with persistent memory and fast similarity search for context-aware interactions.",
      link: { label: "Learn More", href: "/ai-agents/" },
    },
    {
      title: "Semantic Search",
      text: "Go beyond keywords with neural search that understands intent and delivers relevant results.",
      link: { label: "Learn More", href: "/advanced-search/" },
    },
    {
      title: "Recommendation Systems",
      text: "Power personalized recommendations with real-time similarity matching across millions of items.",
      link: { label: "Learn More", href: "/recommendations/" },
    },
    {
      title: "Data Analysis & Anomaly Detection",
      text: "Detect outliers and anomalies by finding patterns that deviate from normal behavior in your data.",
      link: { label: "Learn More", href: "/data-analysis-anomaly-detection/" },
    },
  ] as Feature[],
}
