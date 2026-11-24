// Copy from the current qdrant.tech (read 2026-11-21), verbatim, for the listings and content sections: page
// headers (/blog/, /customers/, /integrations/), blog posts (/blog/), articles (/articles/) and courses (/course/),
// the customer directory with its filters (/customers/, each card's own industry, product, size, geography and use
// cases), the integrations directory (/integrations/), events (/events/), the opening of a post
// (/blog/qdrant-1.20.x/), the first sections of the privacy policy (/legal/privacy-policy/), releases (the
// qdrant/qdrant GitHub releases) and the 404 page (/404). Where a passage was long, only its first full sentence is
// used, never a paraphrase. Inline code is marked with backticks and bold with **, as on the pages. Labels the site
// has no copy for (a result count, an empty state, a placeholder quote) are marked as placeholders where they're set.

import type { Link } from "./site"

// The site's breadcrumbs: Home / Blog / the page.
export type Crumb = { label: string; href?: string }

// A block of long-form text, for the article and legal sections. Text can mark `code` and **bold**.
export type ProseBlock =
  | { type: "h2" | "h3"; id: string; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; code: string; title?: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "figure"; label?: string; caption?: string }

// ---------------------------------------------------------------------------------------------------------------
// Page headers

// /customers/: the hero's label, title and button. The page has no breadcrumbs; Home and Customers are its menu names.
export const customersHeader = {
  breadcrumbs: [{ label: "Home", href: "/" }, { label: "Customers" }] as Crumb[],
  kicker: "Customer Case Studies",
  title: "Explore What Leading Teams Build with Qdrant",
  primary: { label: "Talk to Sales", href: "/contact-us/" } as Link,
}

// /integrations/: the title, the line under it and its two links.
export const integrationsHeader = {
  breadcrumbs: [{ label: "Home", href: "/" }, { label: "Integrations" }] as Crumb[],
  title: "Integrations",
  description:
    "Connect Qdrant to the embedding models, AI frameworks, data pipelines, platforms, and observability tools you already use.",
  primary: { label: "Browse documentation", href: "/documentation/ecosystem/" } as Link,
  secondary: { label: "Request an integration", href: "#request-integration" } as Link,
}

// /blog/: the title, the page's description (its meta description) and the search field's text.
export const blogHeader = {
  breadcrumbs: [{ label: "Home", href: "/" }, { label: "Blog" }] as Crumb[],
  title: "Qdrant Blog",
  description:
    "A place to learn how to become an expert traveler through vector space. Subscribe and we will update you on features and news.",
  search: { placeholder: "What are you Looking for?" },
}

// ---------------------------------------------------------------------------------------------------------------
// Blog posts (/blog/, page 1). The listing shows no categories, so posts have no tag. The featured post's excerpt is
// its page's description; the next three show no excerpt on the listing.

export type Post = {
  title: string
  href: string
  excerpt?: string
  tag?: string
  authors: string
  date: string
}

export const blogFeatured = {
  title: "Features and News",
  featured: {
    title: "Qdrant 1.20 - Full-Text Search Improvements",
    href: "/blog/qdrant-1.20.x/",
    excerpt:
      "Version 1.20 of Qdrant brings BM25 scoring on full-text indexes, a code tokenizer, faster nested filters, 16-bit and 8-bit TurboQuant, and cluster security hardening.",
    authors: "Andrey Vasnetsov",
    date: "October 22, 2026",
  } as Post,
  posts: [
    { title: "UltraBERT Fits 32K Tokens in One Vector. RIP Chunking?", href: "/blog/ultrabert-embed/", authors: "Dylan Couzon, Anush", date: "October 19, 2026" },
    { title: "Reachy Remembers: Giving a Robot a Local Semantic Memory with Qdrant Edge", href: "/blog/reachy-robot-memory-qdrant-edge/", authors: "Sasha Denisov & Chadha Sridi", date: "October 14, 2026" },
    { title: "Perplexity's New Late-Interaction Models Meet Qdrant's 21x Vector Compression", href: "/blog/pplx-embed-v2/", authors: "Dylan Couzon, Anush", date: "October 13, 2026" },
  ] as Post[],
}

export const blogPosts: Post[] = [
  {
    title: "Does a Code-Tuned Embedding Model Pay Off? papr-embed-code-1 in Qdrant",
    href: "/blog/papr-embed-code/",
    excerpt: "papr-embed-code-1 in Qdrant: code retrieval against its Qwen3-Embedding base, 1-bit TurboQuant, BM25 with the code tokenizer, and 1M filtered snippets.",
    authors: "Dylan Couzon, Anush",
    date: "November 18, 2026",
  },
  {
    title: "How to Run an Embedding Model on Bare Metal",
    href: "/blog/embeddings-on-bare-metal/",
    excerpt: "A guide on how you can run a small static embedding model on an ESP32 chip with 16MB of flash memory using `no_std` Rust",
    authors: "Clelia Bertelli",
    date: "November 11, 2026",
  },
  {
    title: "Qdrant 1.20 Performance Mechanisms: New TurboQuant Datatypes and Per-Element Indexes",
    href: "/blog/qdrant-1.20-performance/",
    excerpt: "Measurements of Qdrant 1.20 performance: turbo8 and turbo16 match float32 recall at a quarter and half of the storage, and per-element indexes make nested filters up to 4 times faster.",
    authors: "Clelia Bertelli",
    date: "November 02, 2026",
  },
  {
    title: "Scalable PDF Retrieval with Cohere Embed 5 and Qdrant Asymmetric Quantization",
    href: "/blog/cohere-embed-5-qdrant/",
    excerpt: "Use Cohere embeddings for visual PDF retrieval in Qdrant. Compare ViDoRe results and combine small vectors in RAM with full vectors on disk.",
    authors: "Evgeniya Sukhodolskaya",
    date: "October 23, 2026",
  },
  {
    title: "How Poliscope Made All of Germany's Local Politics Searchable on One Server with Qdrant",
    href: "/blog/case-study-poliscope/",
    excerpt: "How Poliscope indexed about 4,800 German council portals into one self-hosted Qdrant collection of 130M points: hybrid search, tenant and prefix filtering, and TurboQuant on one bare-metal server, taking mean search time from 20 seconds to 0.87 seconds.",
    authors: "Daniel Azoulai",
    date: "October 15, 2026",
  },
  {
    title: "Jevjitsu: Or, How We Tried Generalized Classifiers on Everything",
    href: "/blog/jevjitsu/",
    excerpt: "We applied the Jev generalized classifier to reranking, query understanding, near-duplicate removal, and semantic chunking.",
    authors: "Andrei Cristea & Chadha Sridi",
    date: "October 08, 2026",
  },
]

// ---------------------------------------------------------------------------------------------------------------
// Resources: articles (/articles/) and courses (/course/)

export type Resource = {
  // What it is, in the tag: Article, Course.
  type: string
  // Its topic, when the site gives one.
  topic?: string
  title: string
  text?: string
  // Facts under it: authors and date, or time and format.
  meta: { label?: string; value: string }[]
  href: string
}

// /articles/: "Recently Published" and the first cards of two topics.
export const recentArticles = {
  title: "Recently Published",
  description: "The latest research and engineering explanations from the team.",
  action: { label: "Technical Articles", href: "/articles/" } as Link,
  items: [
    { type: "Article", topic: "Embeddings & Machine Learning", title: "Embedding at the Speed of Light", text: "Static embedding models in FastEmbed: how they work, how fast they run, and the retrieval tradeoffs.", meta: [{ value: "Clelia Bertelli, Minish" }, { value: "November 4, 2026" }], href: "/articles/embedding-at-the-speed-of-light/" },
    { type: "Article", topic: "Indexing & Storage", title: "Universal I/O in Qdrant", text: "How Qdrant talks to different storage backends through a unified I/O interface", meta: [{ value: "Luis Cossío, Clelia Bertelli" }, { value: "October 12, 2026" }], href: "/articles/universal-io/" },
    { type: "Article", topic: "Embeddings & Machine Learning", title: "miniCOIL EN-ES: Sparse Neural Retrieval Across the Language Barrier", text: "miniCOIL goes bilingual: concept-based exact matching for English and Spanish, research preview.", meta: [{ value: "Juan Pablo Sotelo and Evgeniya Sukhodolskaya" }, { value: "October 8, 2026" }], href: "/articles/minicoil-en-es/" },
    { type: "Article", topic: "Relevance & Evaluation", title: "Predicting Weak Retrieval Without an LLM", text: "Cheap signals flag weak retrieval before you pay for a rerank or LLM judge. The one that works depends on how your search fails.", meta: [{ value: "Dylan Couzon" }, { value: "June 24, 2026" }], href: "/articles/predicting-weak-retrieval/" },
    { type: "Article", topic: "Relevance & Evaluation", title: "Relevance Feedback in Qdrant", text: "The story behind the vector search-native relevance feedback feature, available since 1.17.0, which increases the relevance of search results universally, cheaply, and at scale.", meta: [{ value: "Evgeniya Sukhodolskaya" }, { value: "February 20, 2026" }], href: "/articles/relevance-feedback/" },
    { type: "Article", topic: "Vector Search Fundamentals", title: "What is a Vector Database?", text: "What Is a Vector Database? Concepts, Architecture & Use Cases | Qdrant", meta: [{ value: "Sabrina Aquino & Chadha Sridi" }, { value: "October 9, 2024" }], href: "/articles/what-is-a-vector-database/" },
  ] as Resource[],
}

// /course/: "Available Now", the three courses with their time and what they include.
export const courses = {
  kicker: "Qdrant Academy",
  title: "Available Now",
  description:
    "Qdrant Academy is your step-by-step learning hub for mastering vector search, hybrid retrieval, and real-world AI applications with structured, free, online courses.",
  items: [
    { type: "Course", title: "Qdrant Beginner Course", meta: [{ label: "Time to Complete", value: "under 5 hours" }, { label: "Includes", value: "videos, code notebooks, projects, certification" }], href: "/course/beginners/" },
    { type: "Course", title: "Qdrant Essentials Course", meta: [{ label: "Time to Complete", value: "9-12 hours" }, { label: "Includes", value: "videos, code notebooks, projects, certification" }], href: "/course/essentials/" },
    { type: "Course", title: "Multi-Vector Search Course", meta: [{ label: "Time to Complete", value: "4-6 hours" }, { label: "Includes", value: "videos, code notebooks, projects, certification" }], href: "/course/multi-vector-search/" },
  ] as Resource[],
}

// ---------------------------------------------------------------------------------------------------------------
// The customer directory (/customers/): the site's filter groups and options, and every case-study card with the
// facets the page gives it. ConvoSearch is left out: its size on the site reads "1-50 by" and it has no geography.

export type FacetGroup = { id: string; label: string; options: string[] }
export type DirectoryItem = {
  name: string
  title: string
  meta?: string
  href: string
  facets: Record<string, string[]>
}

export const customerDirectory = {
  filterTitle: "Filter and Sort",
  searchPlaceholder: "Search Customer Stories",
  clearLabel: "Clear Filters",
  groups: [
    { id: "industry", label: "Industry", options: ["Customer support", "Developer tools", "E-commerce", "Financial services", "GovTech", "Healthcare", "Hospitality", "Legal tech", "Media and entertainment", "Security", "Technology", "Telecommunications"] },
    { id: "product", label: "Product", options: ["Hybrid", "Qdrant Cloud", "Qdrant Enterprise", "Self-managed"] },
    { id: "size", label: "Size", options: ["1-50", "51-200", "201-1000", "1000+"] },
    { id: "geography", label: "Geography", options: ["Asia Pacific", "Europe", "Global", "North America"] },
    { id: "useCase", label: "Use Case(s)", options: ["Customer support", "E-commerce discovery", "Generative AI", "Graph RAG", "Hybrid search", "Media search", "Multimodal search", "Patent and legal research", "RAG", "Real-time analytics", "Recommendations", "Semantic search", "Threat detection"] },
  ] as FacetGroup[],
  items: [
    { name: "Alhena AI", title: "How Alhena AI unified its AI stack and improved ecommerce conversions with Qdrant", meta: "6 min read", href: "/blog/case-study-alhena/", facets: { industry: ["E-commerce"], product: ["Qdrant Cloud"], size: ["51-200"], geography: ["Europe"], useCase: ["Customer support", "E-commerce discovery", "Generative AI"] } },
    { name: "&AI", title: "How &AI scaled global legal retrieval with Qdrant", meta: "5 min read", href: "/blog/case-study-and-ai/", facets: { industry: ["Legal tech"], product: ["Qdrant Cloud"], size: ["51-200"], geography: ["Europe"], useCase: ["Patent and legal research", "RAG", "Hybrid search"] } },
    { name: "Anima Health", title: "How Anima Health scaled clinical document intelligence with Qdrant", meta: "5 min read", href: "/blog/case-study-anima-health/", facets: { industry: ["Healthcare"], product: ["Self-managed"], size: ["51-200"], geography: ["Europe"], useCase: ["RAG", "Customer support", "Real-time analytics"] } },
    { name: "Aracor", title: "Precision at Scale: How Aracor Accelerated Legal Due Diligence with Hybrid Vector Search", meta: "3 min read", href: "/blog/case-study-aracor/", facets: { industry: ["Legal tech"], product: ["Hybrid"], size: ["1-50"], geography: ["North America"], useCase: ["Patent and legal research", "Hybrid search", "RAG"] } },
    { name: "Bazaarvoice", title: "How Bazaarvoice scaled AI-powered product insights with Qdrant", meta: "6 min read", href: "/blog/case-study-bazaarvoice/", facets: { industry: ["E-commerce"], product: ["Hybrid"], size: ["1000+"], geography: ["North America"], useCase: ["E-commerce discovery", "Recommendations", "Real-time analytics"] } },
    { name: "Bloop", title: "Powering Bloop semantic code search", meta: "4 min read", href: "/blog/case-study-bloop/", facets: { industry: ["Developer tools"], product: ["Self-managed"], size: ["1-50"], geography: ["Europe"], useCase: ["Semantic search", "RAG"] } },
    { name: "Cosmos", title: "How Cosmos delivered editorial-grade visual search with Qdrant", meta: "5 min read", href: "/blog/case-study-cosmos/", facets: { industry: ["Media and entertainment"], product: ["Qdrant Cloud"], size: ["1-50"], geography: ["North America"], useCase: ["Multimodal search", "Hybrid search", "Media search"] } },
    { name: "Dailymotion", title: "Dailymotion's Journey to Crafting the Ultimate Content-Driven Video Recommendation Engine with Qdrant Vector Search", meta: "7 min read", href: "/blog/case-study-dailymotion/", facets: { industry: ["Media and entertainment"], product: ["Self-managed"], size: ["201-1000"], geography: ["Europe"], useCase: ["Recommendations", "Media search", "Real-time analytics"] } },
    { name: "Data Graphs", title: "How Data Graphs Built a True Hybrid Graph RAG Platform - Qdrant", meta: "6 min read", href: "/blog/case-study-datagraphs/", facets: { industry: ["Developer tools"], product: ["Hybrid"], size: ["51-200"], geography: ["Europe"], useCase: ["Customer support", "Graph RAG", "Generative AI"] } },
    { name: "Deutsche Telekom", title: "How Deutsche Telekom Built a Multi-Agent Enterprise Platform Leveraging Qdrant", meta: "6 min read", href: "/blog/case-study-deutsche-telekom/", facets: { industry: ["Telecommunications"], product: ["Qdrant Enterprise"], size: ["1000+"], geography: ["Europe"], useCase: ["Customer support", "RAG", "Generative AI"] } },
    { name: "Dragonfruit AI", title: "How Dragonfruit AI scaled real-time computer vision with Qdrant", meta: "4 min read", href: "/blog/case-study-dragonfruit/", facets: { industry: ["Security"], product: ["Self-managed"], size: ["51-200"], geography: ["North America"], useCase: ["Multimodal search", "Real-time analytics", "Threat detection"] } },
    { name: "Dust", title: "How Dust Scaled to 5,000+ Data Sources with Qdrant", meta: "4 min read", href: "/blog/case-study-dust-v2/", facets: { industry: ["Developer tools"], product: ["Self-managed"], size: ["51-200"], geography: ["Europe"], useCase: ["RAG", "Semantic search", "Customer support"] } },
    { name: "FAZ", title: "How FAZ unlocked 75 years of journalism with Qdrant", meta: "6 min read", href: "/blog/case-study-faz/", facets: { industry: ["Media and entertainment"], product: ["Hybrid"], size: ["1000+"], geography: ["Europe"], useCase: ["Hybrid search", "Media search", "Semantic search"] } },
    { name: "Fieldy AI", title: "How Fieldy AI Achieved Reliable AI Memory with Qdrant", meta: "4 min read", href: "/blog/case-study-fieldy/", facets: { industry: ["Developer tools"], product: ["Self-managed"], size: ["1-50"], geography: ["Europe"], useCase: ["RAG", "Hybrid search", "Semantic search"] } },
    { name: "Flipkart", title: "Building real-time multimodal similarity search in Flipkart Trust & Safety with Qdrant", meta: "3 min read", href: "/blog/case-study-flipkart/", facets: { industry: ["E-commerce"], product: ["Self-managed"], size: ["1000+"], geography: ["Asia Pacific"], useCase: ["Threat detection", "Multimodal search", "Real-time analytics"] } },
    { name: "Garden", title: "How Garden Scaled Patent Intelligence with Qdrant", meta: "3 min read", href: "/blog/case-study-garden-intel/", facets: { industry: ["Legal tech"], product: ["Qdrant Cloud"], size: ["1-50"], geography: ["North America"], useCase: ["Patent and legal research", "Semantic search", "Real-time analytics"] } },
    { name: "GlassDollar", title: "How GlassDollar improved high-recall sourcing by migrating from Elasticsearch to Qdrant", meta: "5 min read", href: "/blog/case-study-glassdollar/", facets: { industry: ["Financial services"], product: ["Self-managed"], size: ["51-200"], geography: ["Europe"], useCase: ["Semantic search", "RAG", "Recommendations"] } },
    { name: "GoodData", title: "How GoodData turbocharged AI analytics with Qdrant", meta: "3 min read", href: "/blog/case-study-gooddata/", facets: { industry: ["Developer tools"], product: ["Self-managed"], size: ["201-1000"], geography: ["Europe"], useCase: ["Real-time analytics", "RAG", "Generative AI"] } },
    { name: "Himalayas", title: "How Himalayas Built Semantic Job Matching for 100,000+ Remote Listings with Qdrant", meta: "5 min read", href: "/blog/case-study-himalayas/", facets: { industry: ["Technology"], product: ["Qdrant Cloud"], size: ["1-50"], geography: ["Global"], useCase: ["Semantic search", "Recommendations", "Hybrid search"] } },
    { name: "HubSpot", title: "HubSpot & Qdrant: Scaling an Intelligent AI Assistant", meta: "3 min read", href: "/blog/case-study-hubspot/", facets: { industry: ["Customer support"], product: ["Qdrant Enterprise"], size: ["1000+"], geography: ["North America"], useCase: ["Customer support", "Recommendations", "RAG"] } },
    { name: "Kairoswealth", title: "Kairoswealth & Qdrant: Transforming Wealth Management with AI-Driven Insights and Scalable Vector Search", meta: "3 min read", href: "/blog/case-study-kairoswealth/", facets: { industry: ["Financial services"], product: ["Self-managed"], size: ["1-50"], geography: ["Europe"], useCase: ["Recommendations", "RAG", "Generative AI"] } },
    { name: "Kakao", title: "How Kakao Built an AI-Powered Internal Service Desk with Qdrant", meta: "5 min read", href: "/blog/case-study-kakao/", facets: { industry: ["Technology"], product: ["Self-managed"], size: ["1000+"], geography: ["Asia Pacific"], useCase: ["Customer support", "Hybrid search", "RAG"] } },
    { name: "Kern AI", title: "Kern AI & Qdrant: Precision AI Solutions for Finance and Insurance", meta: "4 min read", href: "/blog/case-study-kern/", facets: { industry: ["Financial services"], product: ["Self-managed"], size: ["51-200"], geography: ["Europe"], useCase: ["Customer support", "RAG", "Semantic search"] } },
    { name: "Lawme", title: "How Lawme Scaled AI Legal Assistants and Significantly Cut Costs with Qdrant", meta: "4 min read", href: "/blog/case-study-lawme/", facets: { industry: ["Legal tech"], product: ["Hybrid"], size: ["1-50"], geography: ["Asia Pacific"], useCase: ["Patent and legal research", "Hybrid search", "RAG"] } },
    { name: "Lettria", title: "GraphRAG: How Lettria Unlocked 20% Accuracy Gains with Qdrant and Neo4j", meta: "13 min read", href: "/blog/case-study-lettria-v2/", facets: { industry: ["Legal tech"], product: ["Self-managed"], size: ["51-200"], geography: ["Europe"], useCase: ["RAG", "Hybrid search", "Patent and legal research"] } },
    { name: "Lyzr", title: "How Lyzr Supercharged AI Agent Performance with Qdrant", meta: "5 min read", href: "/blog/case-study-lyzr/", facets: { industry: ["Developer tools"], product: ["Self-managed"], size: ["51-200"], geography: ["Asia Pacific"], useCase: ["RAG", "Generative AI", "Customer support"] } },
    { name: "Mixpeek", title: "How Mixpeek Uses Qdrant for Efficient Multimodal Feature Stores", meta: "4 min read", href: "/blog/case-study-mixpeek/", facets: { industry: ["Media and entertainment"], product: ["Self-managed"], size: ["1-50"], geography: ["North America"], useCase: ["Multimodal search", "RAG", "Media search"] } },
    { name: "My AskAI", title: "How My AskAI Built Self-Improving Support Agents", meta: "6 min read", href: "/blog/case-study-my-askai/", facets: { industry: ["Customer support"], product: ["Qdrant Cloud"], size: ["1-50"], geography: ["Europe"], useCase: ["Customer support", "RAG", "Hybrid search"] } },
    { name: "Nyris", title: "Nyris & Qdrant: How Vectors are the Future of Visual Search", meta: "6 min read", href: "/blog/case-study-nyris/", facets: { industry: ["E-commerce"], product: ["Self-managed"], size: ["51-200"], geography: ["Europe"], useCase: ["Multimodal search", "E-commerce discovery", "Media search"] } },
    { name: "OpenTable", title: "How OpenTable Reinvented Restaurant Discovery with Qdrant", meta: "3 min read", href: "/blog/case-study-opentable/", facets: { industry: ["Hospitality"], product: ["Qdrant Cloud"], size: ["1000+"], geography: ["North America"], useCase: ["Generative AI", "RAG", "Semantic search"] } },
    { name: "Pariti", title: "How Pariti Doubled Its Fill Rate with Qdrant", meta: "4 min read", href: "/blog/case-study-pariti/", facets: { industry: ["Technology"], product: ["Qdrant Cloud"], size: ["1-50"], geography: ["Global"], useCase: ["Recommendations", "Semantic search", "Real-time analytics"] } },
    { name: "Pathwork", title: "Pathwork Optimizes Life Insurance Underwriting with Precision Vector Search", meta: "3 min read", href: "/blog/case-study-pathwork/", facets: { industry: ["Financial services"], product: ["Qdrant Cloud"], size: ["1-50"], geography: ["North America"], useCase: ["RAG", "Recommendations", "Real-time analytics"] } },
    { name: "Pento", title: "How Pento modeled aesthetic taste with Qdrant", meta: "9 min read", href: "/blog/case-study-pento/", facets: { industry: ["Technology"], product: ["Self-managed"], size: ["1-50"], geography: ["Europe"], useCase: ["Recommendations", "Semantic search", "Multimodal search"] } },
    { name: "Pienso", title: "Pienso & Qdrant: Future Proofing Generative AI for Enterprise-Level Customers", meta: "4 min read", href: "/blog/case-study-pienso/", facets: { industry: ["Developer tools"], product: ["Self-managed"], size: ["51-200"], geography: ["North America"], useCase: ["Generative AI", "RAG", "Semantic search"] } },
    { name: "Poliscope", title: "How Poliscope Made All of Germany's Local Politics Searchable on One Server with Qdrant", meta: "9 min read", href: "/blog/case-study-poliscope/", facets: { industry: ["GovTech"], product: ["Self-managed"], size: ["1-50"], geography: ["Europe"], useCase: ["Semantic search", "Hybrid search", "RAG"] } },
    { name: "PortfolioMind", title: "How PortfolioMind Delivered Real-Time Crypto Intelligence with Qdrant", meta: "2 min read", href: "/blog/case-study-portfolio-mind/", facets: { industry: ["Financial services"], product: ["Qdrant Cloud"], size: ["1-50"], geography: ["Global"], useCase: ["Real-time analytics", "Recommendations", "Semantic search"] } },
    { name: "QA.tech", title: "Empowering QA.tech’s Testing Agents with Real-Time Precision and Scale", meta: "4 min read", href: "/blog/case-study-qatech/", facets: { industry: ["Developer tools"], product: ["Self-managed"], size: ["1-50"], geography: ["Europe"], useCase: ["Real-time analytics", "RAG", "Threat detection"] } },
    { name: "Qovery", title: "How Qovery Accelerated Developer Autonomy with Qdrant", meta: "3 min read", href: "/blog/case-study-qovery/", facets: { industry: ["Developer tools"], product: ["Qdrant Cloud"], size: ["51-200"], geography: ["Europe"], useCase: ["Customer support", "RAG", "Real-time analytics"] } },
    { name: "SayOne", title: "How SayOne Enhanced Government AI Services with Qdrant", meta: "3 min read", href: "/blog/case-study-sayone/", facets: { industry: ["Technology"], product: ["Hybrid"], size: ["201-1000"], geography: ["Asia Pacific"], useCase: ["Customer support", "RAG", "Real-time analytics"] } },
    { name: "Shakudo", title: "Qdrant and Shakudo: Secure & Performant Vector Search in VPC Environments", meta: "3 min read", href: "/blog/case-study-shakudo/", facets: { industry: ["Developer tools"], product: ["Hybrid"], size: ["51-200"], geography: ["North America"], useCase: ["Semantic search", "RAG", "Recommendations"] } },
    { name: "Sprinklr", title: "How Sprinklr Leverages Qdrant to Enhance AI-Driven Customer Experience Solutions", meta: "7 min read", href: "/blog/case-study-sprinklr/", facets: { industry: ["Customer support"], product: ["Qdrant Enterprise"], size: ["1000+"], geography: ["North America"], useCase: ["Customer support", "RAG", "Real-time analytics"] } },
    { name: "Tavus", title: "How Tavus used Qdrant Edge to create conversational AI", meta: "4 min read", href: "/blog/case-study-tavus/", facets: { industry: ["Media and entertainment"], product: ["Self-managed"], size: ["51-200"], geography: ["North America"], useCase: ["Generative AI", "RAG", "Real-time analytics"] } },
    { name: "Tripadvisor", title: "How Tripadvisor Drives 2 to 3x More Revenue with Qdrant-Powered AI", meta: "4 min read", href: "/blog/case-study-tripadvisor/", facets: { industry: ["Hospitality"], product: ["Qdrant Enterprise"], size: ["1000+"], geography: ["North America"], useCase: ["Recommendations", "Generative AI", "Multimodal search"] } },
    { name: "TrustGraph", title: "How TrustGraph built enterprise-grade agentic AI with Qdrant", meta: "4 min read", href: "/blog/case-study-trustgraph/", facets: { industry: ["Developer tools"], product: ["Self-managed"], size: ["1-50"], geography: ["Europe"], useCase: ["RAG", "Generative AI", "Semantic search"] } },
    { name: "VISUA", title: "Using vector search for quality control and anomaly detection in computer vision.", meta: "5 min read", href: "/blog/case-study-visua/", facets: { industry: ["Security"], product: ["Self-managed"], size: ["51-200"], geography: ["Europe"], useCase: ["Multimodal search", "Threat detection", "Media search"] } },
    { name: "Voiceflow", title: "Voiceflow & Qdrant: Powering No-Code AI Agent Creation with Scalable Vector Search", meta: "5 min read", href: "/blog/case-study-voiceflow/", facets: { industry: ["Customer support"], product: ["Qdrant Cloud"], size: ["201-1000"], geography: ["North America"], useCase: ["Customer support", "RAG", "Generative AI"] } },
    { name: "Xaver", title: "How Xaver scaled personalized financial advice with Qdrant", meta: "5 min read", href: "/blog/case-study-xaver/", facets: { industry: ["Financial services"], product: ["Self-managed"], size: ["51-200"], geography: ["Europe"], useCase: ["Customer support", "RAG", "Recommendations"] } },
    { name: "IrisAgent", title: "IrisAgent and Qdrant: Redefining Customer Support with AI", meta: "5 min read", href: "/blog/iris-agent-qdrant/", facets: { industry: ["Customer support"], product: ["Self-managed"], size: ["51-200"], geography: ["North America"], useCase: ["Customer support", "RAG", "Generative AI"] } },
  ] as DirectoryItem[],
}

// ---------------------------------------------------------------------------------------------------------------
// The integrations directory (/integrations/): its tabs, search field, empty state and every card, with the line the
// site gives each one.

export type Integration = { name: string; category: string; text?: string; href: string }

export const integrationDirectory = {
  allLabel: "All",
  categories: ["Embeddings", "Frameworks", "Data Management", "Platforms", "Observability"],
  searchPlaceholder: "Search integrations",
  emptyText: "No integrations match your search.",
  items: [
    { name: "Amazon Bedrock", category: "Embeddings", text: "Embed text with Amazon Titan Text Embeddings V2 and images with Amazon Nova Multimodal Embeddings on Amazon Bedrock, then search them in Qdrant.", href: "/documentation/embeddings/bedrock/" },
    { name: "Cohere", category: "Embeddings", text: "Embed text and images with Cohere Embed v5 and v4 models and search them in Qdrant, directly or through Qdrant Cloud Inference.", href: "/documentation/embeddings/cohere/" },
    { name: "FastEmbed", category: "Embeddings", text: "Browse FastEmbed's supported dense, sparse, image, and multivector embedding models, with dimensions, licenses, and links to setup guides.", href: "/documentation/embeddings/fastembed/" },
    { name: "Gemini", category: "Embeddings", text: "Embed text, images, video, audio, and PDFs with Google gemini-embedding-2 and search them in Qdrant, with adjustable vector dimensions.", href: "/documentation/embeddings/gemini/" },
    { name: "Jina AI", category: "Embeddings", text: "Embed text, images, video, audio, and PDFs with Jina AI jina-embeddings-v5 models and search them in Qdrant, through Qdrant Cloud Inference.", href: "/documentation/embeddings/jina-embeddings/" },
    { name: "Mistral", category: "Embeddings", text: "Embed text with Mistral Embed and code with Codestral Embed, then search the vectors in Qdrant, directly or through Qdrant Cloud Inference.", href: "/documentation/embeddings/mistral/" },
    { name: "Mixedbread", category: "Embeddings", text: "Run Mixedbread mxbai embedding models with sentence-transformers or on Qdrant Cloud Inference, and search the vectors in Qdrant.", href: "/documentation/embeddings/mixedbread/" },
    { name: "Nomic", category: "Embeddings", text: "Embed text and images with nomic-embed-text-v1.5 and nomic-embed-vision-v1.5 through the Nomic API or FastEmbed, and search them in Qdrant.", href: "/documentation/embeddings/nomic/" },
    { name: "NVIDIA", category: "Embeddings", text: "Embed text and images with NVIDIA Nemotron models through the NVIDIA API or a self-hosted NIM, then store and search the vectors in Qdrant.", href: "/documentation/embeddings/nvidia/" },
    { name: "Ollama", category: "Embeddings", text: "Embed documents and queries locally with Ollama models such as qwen3-embedding and embeddinggemma-2, and search them in Qdrant.", href: "/documentation/embeddings/ollama/" },
    { name: "OpenAI", category: "Embeddings", text: "Embed documents and queries with OpenAI text-embedding-3 models and search them in Qdrant, directly or through Qdrant Cloud Inference.", href: "/documentation/embeddings/openai/" },
    { name: "Qdrant Cloud Inference", category: "Embeddings", text: "Generate dense, sparse, multivector, and image embeddings in Qdrant Cloud, or route to OpenAI, Cohere, Jina AI, and OpenRouter.", href: "/documentation/embeddings/qdrant-cloud-inference/" },
    { name: "Superlinked", category: "Embeddings", text: "Serve dense, sparse, and ColBERT embeddings from the Superlinked Inference Engine (SIE) and search them in Qdrant, including hybrid search.", href: "/documentation/embeddings/superlinked/" },
    { name: "TwelveLabs", category: "Embeddings", text: "Embed video, audio, images, and text with TwelveLabs Marengo 3.5 in one vector space, and run cross-modal search over the vectors in Qdrant.", href: "/documentation/embeddings/twelvelabs/" },
    { name: "Upstage", category: "Embeddings", text: "Embed documents and queries with Upstage solar-embedding-2 passage and query models through the OpenAI SDK, and search them in Qdrant.", href: "/documentation/embeddings/upstage/" },
    { name: "Voyage AI", category: "Embeddings", text: "Embed text and images with Voyage AI voyage-4 and voyage-multimodal-3.5 models and search them in Qdrant, or run voyage-4-nano locally.", href: "/documentation/embeddings/voyage/" },
    { name: "Agno", category: "Frameworks", text: "Power Agno multi-agent systems with Qdrant as the vector knowledge base for fast retrieval, memory, and tool-augmented agent workflows.", href: "/documentation/frameworks/agno/" },
    { name: "AutoGen", category: "Frameworks", text: "Build multi-agent RetrieveChat workflows with Microsoft AutoGen and Qdrant, giving cooperating agents fast vector search over your documents.", href: "/documentation/frameworks/autogen/" },
    { name: "AWS Lakechain", category: "Frameworks", text: "Stream document embeddings from AWS Project Lakechain pipelines into Qdrant collections using the Qdrant storage connector and AWS CDK.", href: "/documentation/frameworks/lakechain/" },
    { name: "CamelAI", category: "Frameworks", text: "Use Qdrant as the vector storage backend in CAMEL-AI to ingest, retrieve, and reason over data inside LLM-based agents.", href: "/documentation/frameworks/camel/" },
    { name: "Cheshire Cat", category: "Frameworks", text: "Run Cheshire Cat agents on Qdrant as the default vector memory, taking advantage of collection aliases, quantization, and snapshots.", href: "/documentation/frameworks/cheshire-cat/" },
    { name: "Cognee", category: "Frameworks", text: "Pair Qdrant's vector breadth with Cognee's graph precision to give agents semantic memory grounded in entities, relationships, and time.", href: "/documentation/frameworks/cognee/" },
    { name: "CrewAI", category: "Frameworks", text: "Back CrewAI's short-term and entity memory with Qdrant so role-playing agents can recall context, relationships, and past interactions reliably.", href: "/documentation/frameworks/crewai/" },
    { name: "Dagster", category: "Frameworks", text: "Orchestrate AI data pipelines in Dagster with the Qdrant resource to ingest, embed, and query vector collections from declarative assets.", href: "/documentation/frameworks/dagster/" },
    { name: "DeepEval", category: "Frameworks", text: "Evaluate Qdrant-backed RAG pipelines with DeepEval, scoring answer relevancy, faithfulness, hallucination, and contextual precision against your retrieval results.", href: "/documentation/frameworks/deepeval/" },
    { name: "Dynamiq", category: "Frameworks", text: "Add Qdrant as a writer, retriever, or agent memory inside Dynamiq Gen AI workflows to orchestrate RAG and tool-using LLM agents.", href: "/documentation/frameworks/dynamiq/" },
    { name: "Feast", category: "Frameworks", text: "Use Qdrant as the online vector store in Feast to serve embedding features and similarity lookups in production ML systems at scale.", href: "/documentation/frameworks/feast/" },
    { name: "FiftyOne", category: "Frameworks", text: "Run image and text similarity search over computer vision datasets in FiftyOne, backed by Qdrant for fast vector retrieval.", href: "/documentation/frameworks/fifty-one/" },
    { name: "Firebase Genkit", category: "Frameworks", text: "Build production AI apps with Firebase Genkit using Qdrant for indexing and semantic retrieval via the official Qdrant Genkit plugin.", href: "/documentation/frameworks/genkit/" },
    { name: "Google ADK", category: "Frameworks", text: "Connect Google Agent Development Kit agents to Qdrant via the Qdrant MCP Server for semantic memory, retrieval, and tool-augmented reasoning.", href: "/documentation/frameworks/google-adk/" },
    { name: "Haystack", category: "Frameworks", text: "Build generative AI, QA, and semantic search systems in Haystack with the Qdrant document store, including support for quantization and advanced indexing.", href: "/documentation/frameworks/haystack/" },
    { name: "HoneyHive", category: "Frameworks", text: "Trace and evaluate Qdrant-powered RAG pipelines in HoneyHive to monitor latency, retrieval quality, and embedding performance in production.", href: "/documentation/frameworks/honeyhive/" },
    { name: "LangChain", category: "Frameworks", text: "Build LangChain apps with Qdrant as the vector store, supporting dense, sparse, and hybrid retrieval for semantic search and RAG.", href: "/documentation/frameworks/langchain/" },
    { name: "LangChain4j", category: "Frameworks", text: "Use Qdrant as the embedding store in LangChain4j to build context-aware AI applications in Java with full semantic retrieval support.", href: "/documentation/frameworks/langchain4j/" },
    { name: "LangGraph", category: "Frameworks", text: "Add Qdrant retrieval nodes to LangGraph workflows in Python or JavaScript to ground stateful, multi-actor agent applications in your data.", href: "/documentation/frameworks/langgraph/" },
    { name: "LlamaIndex", category: "Frameworks", text: "Index and retrieve private data in LlamaIndex with Qdrant as the vector store, augmenting LLMs with grounded context from your documents.", href: "/documentation/frameworks/llama-index/" },
    { name: "Mastra", category: "Frameworks", text: "Add Qdrant as the vector store in Mastra TypeScript AI apps to power RAG, agents, workflows, and evaluations on local or serverless deployments.", href: "/documentation/frameworks/mastra/" },
    { name: "Mem0", category: "Frameworks", text: "Power Mem0's self-improving memory layer with Qdrant to give chatbots and AI assistants personalized, long-lasting recall of user preferences.", href: "/documentation/frameworks/mem0/" },
    { name: "Microsoft GraphRAG", category: "Frameworks", text: "Plug Qdrant in as a custom vector store for Microsoft GraphRAG to combine knowledge-graph indexing with fast vector retrieval.", href: "/documentation/frameworks/microsoft-graphrag/" },
    { name: "Microsoft NLWeb", category: "Frameworks", text: "Add natural language interfaces to websites with Microsoft NLWeb backed by Qdrant as the vector store for embedding storage and context retrieval.", href: "/documentation/frameworks/nlweb/" },
    { name: "Neo4j GraphRAG", category: "Frameworks", text: "Run GraphRAG with Neo4j and Qdrant — vector search in Qdrant retrieves candidates that the Neo4j knowledge graph turns into grounded answers.", href: "/documentation/frameworks/neo4j-graphrag/" },
    { name: "Rig-rs", category: "Frameworks", text: "Build scalable LLM apps in Rust with Rig and use Qdrant as the vector store for semantic ingestion, retrieval, and RAG workflows.", href: "/documentation/frameworks/rig-rs/" },
    { name: "RocketRide", category: "Frameworks", text: "Build RAG pipelines and AI agents with RocketRide's multithreaded C++ runtime and Qdrant for vector search, retrieval, and memory.", href: "/documentation/frameworks/rocketride/" },
    { name: "Semantic-Router", category: "Frameworks", text: "Route LLM and agent requests by semantic meaning using Semantic-Router with Qdrant as the vector index for fast, embedding-based decisions.", href: "/documentation/frameworks/semantic-router/" },
    { name: "SmolAgents", category: "Frameworks", text: "Pair Hugging Face SmolAgents with Qdrant retrieval to build code-writing agents that query vector collections through reusable tools.", href: "/documentation/frameworks/smolagents/" },
    { name: "Spring AI", category: "Frameworks", text: "Add Qdrant as the vector store in Spring AI Java apps to power semantic search and RAG with Spring Boot configuration and starter packages.", href: "/documentation/frameworks/spring-ai/" },
    { name: "Stanford DSPy", category: "Frameworks", text: "Use Qdrant as the retrieval model in Stanford DSPy programs to ground prompting, reasoning, and self-improving LLM pipelines in your data.", href: "/documentation/frameworks/dspy/" },
    { name: "Swiftide", category: "Frameworks", text: "Build streaming indexing and querying pipelines in Rust with Swiftide using Qdrant as the vector store for dense and hybrid retrieval.", href: "/documentation/frameworks/swiftide/" },
    { name: "Sycamore", category: "Frameworks", text: "Process complex unstructured documents with Sycamore and write or read embeddings against Qdrant collections for GenAI and RAG analytics.", href: "/documentation/frameworks/sycamore/" },
    { name: "Testcontainers", category: "Frameworks", text: "Spin up disposable Qdrant instances inside integration tests with Testcontainers modules for Java, Go, Node.js, Python, and .NET.", href: "/documentation/frameworks/testcontainers/" },
    { name: "txtai", category: "Frameworks", text: "Use Qdrant as the embedding backend for txtai semantic applications, powering similarity search over Transformer-based neural embeddings.", href: "/documentation/frameworks/txtai/" },
    { name: "Vanna.AI", category: "Frameworks", text: "Train Vanna.AI text-to-SQL agents with Qdrant as the RAG vector store to generate accurate SQL queries grounded in your database schema and docs.", href: "/documentation/frameworks/vanna-ai/" },
    { name: "VectaX - Mirror Security", category: "Frameworks", text: "Secure vector search in Qdrant with Mirror Security VectaX — encrypt embeddings and enforce role-based access on similarity queries.", href: "/documentation/frameworks/mirror-security/" },
    { name: "VoltAgent", category: "Frameworks", text: "Build TypeScript AI agents with VoltAgent and Qdrant retrieval, using the framework's observability dashboard to monitor agent actions and tool calls.", href: "/documentation/frameworks/voltagent/" },
    { name: "Airbyte", category: "Data Management", text: "Replicate data into Qdrant with Airbyte to power vector search pipelines from hundreds of source connectors with minimal code.", href: "/documentation/data-management/airbyte/" },
    { name: "Apache Airflow", category: "Data Management", text: "Schedule and monitor Qdrant ingestion workflows with Apache Airflow's Python-native DAGs and provider hooks for vector pipelines.", href: "/documentation/data-management/airflow/" },
    { name: "Apache Spark", category: "Data Management", text: "Write big-data embeddings into Qdrant from Apache Spark jobs using the Qdrant-Spark connector for distributed ingestion.", href: "/documentation/data-management/spark/" },
    { name: "Chonkie", category: "Data Management", text: "Chunk, embed, and store text in Qdrant directly from the Chonkie SDK for fast, lightweight RAG ingestion pipelines.", href: "/documentation/data-management/chonkie/" },
    { name: "CocoIndex", category: "Data Management", text: "Build incremental ETL flows that transform documents into Qdrant-ready embeddings with CocoIndex for real-time AI pipelines.", href: "/documentation/data-management/cocoindex/" },
    { name: "Confluent Kafka", category: "Data Management", text: "Stream events from Confluent Cloud Kafka topics into Qdrant collections for real-time, event-driven vector ingestion.", href: "/documentation/data-management/confluent/" },
    { name: "DLT", category: "Data Management", text: "Load messy data into Qdrant with DLT, an open-source Python library for declarative, schema-aware vector ingestion.", href: "/documentation/data-management/dlt/" },
    { name: "InfinyOn Fluvio", category: "Data Management", text: "Stream records from InfinyOn Fluvio topics into Qdrant collections for low-latency, real-time vector ingestion.", href: "/documentation/data-management/fluvio/" },
    { name: "POMA", category: "Data Management", text: "Pair POMA structure-aware document chunking with Qdrant for clean, retrieval-ready vector indexes and RAG datasets.", href: "/documentation/data-management/poma/" },
    { name: "Redpanda Connect", category: "Data Management", text: "Build declarative, stateless streaming pipelines that sink data from Redpanda Connect into Qdrant collections.", href: "/documentation/data-management/redpanda/" },
    { name: "Unstructured", category: "Data Management", text: "Preprocess documents with Unstructured and ingest the cleaned text and embeddings into Qdrant for retrieval-ready RAG datasets.", href: "/documentation/data-management/unstructured/" },
    { name: "Apify", category: "Platforms", text: "Use Apify to crawl and clean web content, then load it into Qdrant for RAG and semantic search powered by the official Apify integration.", href: "/documentation/platforms/apify/" },
    { name: "BuildShip", category: "Platforms", text: "Add semantic search to BuildShip workflows with the Qdrant integration, building AI-assisted APIs and backend automations without code.", href: "/documentation/platforms/buildship/" },
    { name: "Keboola", category: "Platforms", text: "Connect Keboola to Qdrant to load embeddings from your data pipelines and orchestrate vector search as part of end-to-end data operations.", href: "/documentation/platforms/keboola/" },
    { name: "Kotaemon", category: "Platforms", text: "Configure Kotaemon to use Qdrant as its vector store for chatting with your documents through a customizable open-source RAG UI.", href: "/documentation/platforms/kotaemon/" },
    { name: "Make.com", category: "Platforms", text: "Add Qdrant to Make scenarios with the official app to automate vector search and AI workflows alongside thousands of other integrations.", href: "/documentation/platforms/make/" },
    { name: "N8N", category: "Platforms", text: "Add semantic search to n8n workflows with the official Qdrant node for managing collections, indexing points, and running vector queries.", href: "/documentation/platforms/n8n/" },
    { name: "Pipedream", category: "Platforms", text: "Connect Qdrant to Pipedream workflows with the official app to add vector search to automations spanning thousands of APIs and data sources.", href: "/documentation/platforms/pipedream/" },
    { name: "Power Apps", category: "Platforms", text: "Use the Qdrant connector in Microsoft Power Apps to add vector search to custom business apps and Power Platform automation flows.", href: "/documentation/platforms/powerapps/" },
    { name: "PrivateGPT", category: "Platforms", text: "Configure PrivateGPT to use Qdrant as its default vector store for offline, private question-answering over your own documents.", href: "/documentation/platforms/privategpt/" },
    { name: "Salesforce Mulesoft", category: "Platforms", text: "Bring vector search into Salesforce MuleSoft Anypoint by connecting Qdrant through the open-source MuleSoft Vectors connector for AI-powered integrations.", href: "/documentation/platforms/mulesoft/" },
    { name: "ToolJet", category: "Platforms", text: "Connect ToolJet to Qdrant with the marketplace plugin to build low-code business apps backed by collections, filtered search, and vector queries.", href: "/documentation/platforms/tooljet/" },
    { name: "Vectorize.io", category: "Platforms", text: "Use Vectorize.io to extract data from many sources and stream embeddings into Qdrant, deploying real-time RAG pipelines that stay in sync.", href: "/documentation/platforms/vectorize/" },
    { name: "Datadog", category: "Observability", text: "Monitor Qdrant in Datadog with the official integration to track REST and gRPC performance, cluster readiness, and deployment health.", href: "/documentation/observability/datadog/" },
    { name: "New Relic", category: "Observability", text: "Monitor Qdrant in New Relic by forwarding Prometheus metrics via remote write or the OpenMetrics integration, or by sending OpenTelemetry data over OTLP.", href: "/documentation/observability/newrelic/" },
    { name: "OpenLIT", category: "Observability", text: "Instrument Qdrant with OpenLIT, an OpenTelemetry-native LLM observability tool, to trace operations and surface performance insights.", href: "/documentation/observability/openlit/" },
    { name: "OpenLLMetry", category: "Observability", text: "Trace Qdrant operations with OpenLLMetry, the OpenTelemetry-based LLM observability toolkit from Traceloop, for end-to-end visibility.", href: "/documentation/observability/openllmetry/" },
  ] as Integration[],
}

// ---------------------------------------------------------------------------------------------------------------
// Events (/events/): the upcoming event and the most recent past ones. Dates are ISO (the site shows "Tue, Nov 24,
// 2026"); long descriptions keep their first sentence. Events the site doesn't link have href "#".

export type EventItem = {
  date: string
  type: string
  title: string
  text?: string
  location: string
  time?: string
  href: string
}

export const events = {
  upcomingTitle: "Upcoming Events",
  pastTitle: "Past Events",
  upcoming: [
    { date: "2026-11-24", type: "meetup", title: "Search Week After Party: Pub Quiz by Qdrant", text: "A technical pub quiz for engineers and builders. Come join us for a pint.", location: "London, UK", href: "https://luma.com/londonsearchweek_2026" },
  ] as EventItem[],
  past: [
    { date: "2026-11-17", type: "webinar", title: "Building AI Memory: From a Local Robot to a 1,000-Fly Hive Mind", text: "We walk through building both memory systems, from storing the first observation to retrieving useful experiences and sharing them across agents.", location: "Virtual", href: "https://luma.com/odscai-jzxx" },
    { date: "2026-11-10", type: "meetup", title: "Hard Negatives Meetup | Engineers Debate Night", text: "Our debate night is back. Argue or spectate over the biggest discussions about AI.", location: "NYC", href: "https://luma.com/nyc-meetup-november" },
    { date: "2026-10-13", type: "conference", title: "In The Loop | n8n conference", text: "We will be at n8n's inaugaral conference! Come say hello.", location: "Berlin", href: "#" },
    { date: "2026-10-01", type: "meetup", title: "Personalization at Agent Scale", text: "Engineering talks and networking with Vista, OLX, Qdrant, Superoptimal, the AI Collective, HackBCN and the AI Engineers Community Barcelona.", location: "Barcelona, Spain", href: "https://luma.com/xpfemx2v" },
    { date: "2026-09-23", type: "conference", title: "AI Engineer Paris", text: "We will be at AI Engineer Paris from Sept 23-24, a premier technical conference at Station F gathering 1,000+ engineers, VPs of AI, founders, and CEOs building the future of AI.", location: "Paris, France", href: "#" },
    { date: "2026-09-17", type: "webinar", title: "Vector Space Stream", text: "Tune in for a research-first broadcast for engineers. Eight talks on compression, edge, hybrid search, and more.", location: "Virtual, global", href: "https://luma.com/vector-space-stream" },
    { date: "2026-09-16", type: "meetup", title: "Berlin Community Meetup", text: "Join us in Berlin for an evening of engineering conversations, practical demos, and great company.", location: "Berlin, Germany", time: "6:30 PM", href: "https://luma.com/berlin-sept-meetup" },
    { date: "2026-09-16", type: "workshop", title: "Engineering Product Search for Business Impact", text: "We'll walk you through a product catalog and tackle the retrieval and ranking problems that actually affect businesses.", location: "Seattle, Washington", href: "https://luma.com/19mw3lea" },
  ] as EventItem[],
}

// ---------------------------------------------------------------------------------------------------------------
// An article: the opening of /blog/qdrant-1.20.x/, verbatim, through its first sections. The page has no pull quote,
// so the quote block is a labeled placeholder; the figure is a placeholder frame with the post's own caption.

export const articleToc = [
  { id: "bm25-scoring-on-full-text-indexes", label: "BM25 Scoring on Full-Text Indexes" },
  { id: "how-it-works", label: "How It Works", level: 3 },
  { id: "migrate-from-sparse-bm25", label: "Migrate from Sparse BM25", level: 3 },
  { id: "better-code-search-with-the-code-tokenizer", label: "Better Code Search with the Code Tokenizer" },
  { id: "16-bit-and-8-bit-turboquant", label: "16-Bit and 8-Bit TurboQuant" },
  { id: "turbo8-datatype", label: "turbo8 Datatype", level: 3 },
]

export const releasePost = {
  breadcrumbs: [{ label: "Home", href: "/" }, { label: "Blog", href: "/blog/" }, { label: "Qdrant 1.20 - Full-Text Search Improvements" }] as Crumb[],
  title: "Qdrant 1.20 - Full-Text Search Improvements",
  authors: "Andrey Vasnetsov",
  date: "October 22, 2026",
  tocTitle: "On this page:",
  share: [
    { label: "Share on X", href: "https://twitter.com/intent/tweet?url=https%3A%2F%2Fqdrant.tech%2Fblog%2Fqdrant-1.20.x%2F&text=Qdrant%201.20%20-%20Full-Text%20Search%20Improvements" },
    { label: "Share on LinkedIn", href: "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fqdrant.tech%2Fblog%2Fqdrant-1.20.x%2F" },
  ] as Link[],
  blocks: [
    { type: "p", text: "**Qdrant 1.20.0 is out!** Let’s look at the main features for this version:" },
    {
      type: "list",
      items: [
        "**BM25 on Full-Text Indexes and Code Search:** Rank by BM25 straight from your payload text, with no embeddings to generate. Plus, better code search with a new `code` tokenizer.",
        "**Faster Nested Filters:** A new per-element payload index answers nested filters without reading payloads, making them faster.",
        "**16-Bit and 8-Bit TurboQuant:** A 16-bit TurboQuant datatype that halves vector storage without accuracy loss, and an 8-bit TurboQuant datatype and quantization option with recall close to `float16`.",
      ],
    },
    { type: "h2", id: "bm25-scoring-on-full-text-indexes", text: "BM25 Scoring on Full-Text Indexes" },
    { type: "p", text: "In addition to vector search, Qdrant also supports full-text search, which finds results by the exact words they contain. Until now, ranking those results with BM25, a commonly used ranking function for keyword search, meant converting your text into sparse vectors." },
    { type: "p", text: "That approach has a few drawbacks. Every document and every query has to go through an inference step to produce its sparse vector. You also have to keep track of the average document length yourself to get accurate scoring. Because that value is fixed in every stored vector, it can’t adapt as your data changes, and updating it means converting all your documents again." },
    { type: "p", text: "Version 1.20 solves these challenges with BM25 scoring directly on a full-text index. Qdrant derives all BM25 statistics from your data. That includes the average document length, so scoring is accurate out of the box. You don’t need to generate embeddings. Text that’s already in your payload becomes searchable as soon as you index it." },
    { type: "h3", id: "how-it-works", text: "How It Works" },
    { type: "p", text: "To rank points with BM25 on a full-text index, use the new `text` query. For example, to search a books dataset by title, first create a full-text index on the `title` field with the `bm25` scoring type:" },
    { type: "code", title: "http", code: 'PUT /collections/books/index\n{\n  "field_name": "title",\n  "field_schema": {\n    "type": "text",\n    "scoring": {\n      "type": "bm25"\n    }\n  }\n}' },
    { type: "p", text: "Then query the index, and pass the indexed field in `using`:" },
    { type: "code", title: "http", code: 'POST /collections/books/points/query\n{\n  "query": {\n    "text": "time travel"\n  },\n  "using": "title"\n}' },
    { type: "p", text: "You can set the BM25 parameters `k` and `b` per query, so tuning them doesn’t require rebuilding the index. A `text` query works anywhere in the Query API. Combine it with dense vector search in hybrid search, or use it to rescore points retrieved by another query." },
    { type: "h3", id: "migrate-from-sparse-bm25", text: "Migrate from Sparse BM25" },
    { type: "p", text: "BM25 on sparse vectors remains supported. If your text is already stored in the payload, you can switch to a full-text index without uploading your data again. Create a full-text index with scoring enabled, configure the same text processing as your sparse BM25 model, and replace your sparse vector queries with `text` queries." },
    { type: "quote", text: "Placeholder: a pull quote from the post goes here. The post has none." },
    { type: "h2", id: "better-code-search-with-the-code-tokenizer", text: "Better Code Search with the Code Tokenizer" },
    { type: "p", text: "A common use case for full-text search is searching through source code. A full-text index uses a tokenizer to split text into the words, or tokens, that you can search for. The default `word` tokenizer splits text on spaces and punctuation, which doesn’t work well for code, because identifiers combine several words in different naming conventions. For example, it indexes `getUserName` as a single token, so a search for `user name` or `get_user_name` doesn’t find it." },
    { type: "p", text: "This release adds a new `code` tokenizer that splits identifiers on underscores and case changes, including acronyms. As a result, `getUserName`, `get_user_name`, and `user name` all match each other. It also indexes the full identifier, so `hashmap` still finds `HashMap`. Combined with BM25 scoring on a full-text index, this lets you rank code search results without generating embeddings." },
    { type: "h2", id: "16-bit-and-8-bit-turboquant", text: "16-Bit and 8-Bit TurboQuant" },
    { type: "p", text: "A vector’s datatype determines how Qdrant stores vectors. The default, `float32`, uses 32 bits per dimension. To save storage and memory, and to speed up search, you can use a datatype with fewer bits per dimension, at some cost in accuracy." },
    { type: "h3", id: "turbo8-datatype", text: "`turbo8` Datatype" },
    { type: "p", text: "`turbo8` stores each dimension in 1 byte, half the size of `float16`. We benchmarked it separately, on 11 datasets. The following chart shows recall@10 for `turbo8` compared to `turbo4` and `float16` on six of them. Benchmarks ran on x86 with HNSW configured with `m=16` and `ef_construct=100`, searching with `hnsw_ef=128`." },
    { type: "figure", label: "Chart", caption: "Recall@10 for turbo4, turbo8, and float16 on six datasets, ordered by vector dimensions." },
  ] as ProseBlock[],
}

// ---------------------------------------------------------------------------------------------------------------
// Legal: /legal/privacy-policy/ from its start through 1.5, and the first three paragraphs of section 2, verbatim
// (links kept as their text). The policy goes on from there; a page supplies the rest.

export const privacyPolicy = {
  title: "Privacy Policy",
  contentsTitle: "Contents",
  blocks: [
    { type: "h2", id: "1-introduction", text: "1. Introduction" },
    { type: "p", text: "In the following, we provide information about the collection of personal data when using:" },
    { type: "list", items: ["our website (https://qdrant.tech)", "our Cloud Panel (https://cloud.qdrant.io/)", "Qdrant’s social media profiles."] },
    { type: "p", text: "Personal data is any data that can be related to a specific natural person, such as their name or IP address." },
    { type: "h3", id: "11-contact-details", text: "1.1. Contact details" },
    { type: "p", text: "The controller within the meaning of Art. 4 para. 7 EU General Data Protection Regulation (GDPR) is Qdrant Solutions GmbH, Chausseestraße 86, 10115 Berlin, Germany, email: info@qdrant.com. We are legally represented by André Zayarni." },
    { type: "p", text: "Our data protection officer can be reached via heyData GmbH, Schützenstraße 5, 10117 Berlin, www.heydata.eu, E-Mail: datenschutz@heydata.eu." },
    { type: "h3", id: "12-scope-of-data-processing-processing-purposes-and-legal-bases", text: "1.2. Scope of data processing, processing purposes and legal bases" },
    { type: "p", text: "We detail the scope of data processing, processing purposes and legal bases below. In principle, the following come into consideration as the legal basis for data processing:" },
    {
      type: "list",
      items: [
        "Art. 6 para. 1 s. 1 lit. a GDPR serves as our legal basis for processing operations for which we obtain consent.",
        "Art. 6 para. 1 s. 1 lit. b GDPR is the legal basis insofar as the processing of personal data is necessary for the performance of a contract, e.g. if a site visitor purchases a product from us or we perform a service for him. This legal basis also applies to processing that is necessary for pre-contractual measures, such as in the case of inquiries about our products or services.",
        "Art. 6 para. 1 s. 1 lit. c GDPR applies if we fulfill a legal obligation by processing personal data, as may be the case, for example, in tax law.",
        "Art. 6 para. 1 s. 1 lit. f GDPR serves as the legal basis when we can rely on legitimate interests to process personal data, e.g. for cookies that are necessary for the technical operation of our website.",
      ],
    },
    { type: "h3", id: "13-data-processing-outside-the-eea", text: "1.3. Data processing outside the EEA" },
    { type: "p", text: "Insofar as we transfer data to service providers or other third parties outside the EEA, the security of the data during the transfer is guaranteed by adequacy decisions of the EU Commission, insofar as they exist (e.g. for Great Britain, Canada and Israel) (Art. 45 para. 3 GDPR)." },
    { type: "p", text: "In the case of data transfer to service providers in the USA, the legal basis for the data transfer is an adequacy decision of the EU Commission if the service provider has also certified itself under the EU US Data Privacy Framework." },
    { type: "p", text: "In other cases (e.g. if no adequacy decision exists), the legal basis for the data transfer are usually, i.e. unless we indicate otherwise, standard contractual clauses. These are a set of rules adopted by the EU Commission and are part of the contract with the respective third party. According to Art. 46 para. 2 lit. b GDPR, they ensure the security of the data transfer. Many of the providers have given contractual guarantees that go beyond the standard contractual clauses to protect the data. These include, for example, guarantees regarding the encryption of data or regarding an obligation on the part of the third party to notify data subjects if law enforcement agencies wish to access the respective data." },
    { type: "h3", id: "14-storage-duration", text: "1.4. Storage duration" },
    { type: "p", text: "Unless expressly stated in this privacy policy, the data stored by us will be deleted as soon as they are no longer required for their intended purpose and no legal obligations to retain data conflict with the deletion. If the data are not deleted because they are required for other and legally permissible purposes, their processing is restricted, i.e. the data are blocked and not processed for other purposes. This applies, for example, to data that must be retained for commercial or tax law reasons." },
    { type: "h3", id: "15-rights-of-data-subjects", text: "1.5. Rights of data subjects" },
    { type: "p", text: "Data subjects have the following rights against us with regard to their personal data:" },
    { type: "list", items: ["Right of access,", "Right to correction or deletion,", "Right to limit processing,", "Right to object to the processing,", "Right to data transferability,", "Right to revoke a given consent at any time."] },
    { type: "p", text: "Data subjects also have the right to complain to a data protection supervisory authority about the processing of their personal data. Contact details of the data protection supervisory authorities are available at https://www.bfdi.bund.de/EN/Service/Anschriften/Laender/Laender-node.html." },
    { type: "h2", id: "2-newsletter", text: "2. Newsletter" },
    { type: "p", text: "We reserve the right to inform customers who have already used services from us or purchased goods from time to time by e-mail or other means about our offers, if they have not objected to this. The legal basis for this data processing is Art. 6 para. 1 s. 1 lit. f GDPR. Our legitimate interest is to conduct direct advertising (recital 47 GDPR). Customers can object to the use of their e-mail address for advertising purposes at any time without incurring additional costs, for example via the link at the end of each e-mail or by sending an e-mail to our above-mentioned e-mail address." },
    { type: "p", text: "Interested parties have the option to subscribe to a free newsletter. We process the data provided during registration exclusively for sending the newsletter. Subscription takes place by selecting the corresponding field on our website, by ticking the corresponding field in a paper document or by another clear action, whereby interested parties declare their consent to the processing of their data, so that the legal basis is Art. 6 para. p. 1 lit. a GDPR. Consent can be revoked at any time, e.g. by clicking the corresponding link in the newsletter or notifying our e-mail address given above. The processing of the data until revocation remains lawful even in the event of revocation." },
    { type: "p", text: "Based on the consent of the recipients (Art. 6 para. 1 s. 1 lit. a GDPR), we also measure the opening and click-through rate of our newsletters to understand what is relevant for our audience." },
  ] as ProseBlock[],
}

// ---------------------------------------------------------------------------------------------------------------
// Releases: the latest qdrant/qdrant GitHub releases, with their dates and the first changes of each group from the
// release notes, verbatim. The minor releases take the title of their blog post. "Release notes" is a link label the
// page sets (the site has none).

export type Release = {
  version: string
  date: string
  title?: string
  changes: { kind: string; text: string }[]
  links: Link[]
}

export const releases = {
  title: "Releases",
  action: { label: "All releases on GitHub", href: "https://github.com/qdrant/qdrant/releases" } as Link,
  items: [
    {
      version: "v1.20.2",
      date: "2026-11-16",
      changes: [
        { kind: "Improvements", text: "Make batch searches with the same filter on the same vector significantly faster" },
        { kind: "Improvements", text: "Build HNSW graphs with the classic algorithm again by default, so `ef_construct` tunes graph quality on large segments" },
        { kind: "Bug Fixes", text: "Fix a new peer failing to join the cluster when it joins right after a leader election" },
      ],
      links: [{ label: "Release notes", href: "https://github.com/qdrant/qdrant/releases/tag/v1.20.2" }],
    },
    {
      version: "v1.20.1",
      date: "2026-11-13",
      changes: [
        { kind: "Improvements", text: "Build HNSW graphs of large segments faster with PiPNN" },
        { kind: "Improvements", text: "Make filters with several conditions much faster on cold on-disk payload indexes" },
        { kind: "Bug Fixes", text: "Fix HNSW index builds being up to 3x slower on hosts with many cores, a regression in v1.20.0" },
        { kind: "Security", text: "Hide snapshot telemetry of collections a collection-scoped JWT has no access to" },
      ],
      links: [{ label: "Release notes", href: "https://github.com/qdrant/qdrant/releases/tag/v1.20.1" }],
    },
    {
      version: "v1.20.0",
      date: "2026-10-22",
      title: "Qdrant 1.20 - Full-Text Search Improvements",
      changes: [
        { kind: "Features", text: "BM25 scoring directly on the full-text payload index" },
        { kind: "Features", text: "TurboQuant: new `turbo8` and `turbo16` vector datatypes" },
        { kind: "Features", text: "Per-element payload indexes: new `nested` index parameter, faster nested condition filtering." },
        { kind: "Security", text: "Internal auth is enforced by default: `service.enforce_internal_auth` now defaults to `true` when an API key is configured" },
      ],
      links: [
        { label: "Release notes", href: "https://github.com/qdrant/qdrant/releases/tag/v1.20.0" },
        { label: "Qdrant 1.20 - Full-Text Search Improvements", href: "/blog/qdrant-1.20.x/" },
      ],
    },
    {
      version: "v1.19.2",
      date: "2026-10-05",
      changes: [
        { kind: "Improvements", text: "Don't rewrite full sparse posting list on every upsert, making sparse vector upserts significantly faster" },
        { kind: "Bug Fixes", text: "Fix zero search results when HNSW entry point does not satisfy filter" },
        { kind: "Security", text: "Accept only read-write API keys on the internal gRPC API" },
      ],
      links: [{ label: "Release notes", href: "https://github.com/qdrant/qdrant/releases/tag/v1.19.2" }],
    },
    {
      version: "v1.19.0",
      date: "2026-08-05",
      title: "Qdrant 1.19 - TurboQuant Datatype & Memory Tiers",
      changes: [
        { kind: "Features", text: "TurboQuant 4-bit as a datatype of primary vector storage. Only store 4-bit quantized vectors and spare disk space on original vectors." },
        { kind: "Features", text: "Allow `\"match\": {\"prefix\": \"...\"}` in `filter` to match keywords by prefix, must be enabled in keyword index." },
        { kind: "Improvements", text: "Use batched reads in vector and payload storage" },
        { kind: "Bug Fixes", text: "Fix data loss when a payload index drop races the background segment flush" },
      ],
      links: [
        { label: "Release notes", href: "https://github.com/qdrant/qdrant/releases/tag/v1.19.0" },
        { label: "Qdrant 1.19 - TurboQuant Datatype & Memory Tiers", href: "/blog/qdrant-1.19.x/" },
      ],
    },
  ] as Release[],
}

// ---------------------------------------------------------------------------------------------------------------
// The 404 page (/404): its message, the help line with its two links, and its two buttons.

export const notFoundPage = {
  code: "404",
  title: "Oops! We can't find the page you were looking for.",
  help: [
    "Looking for documentation? Start at the ",
    { label: "documentation index", href: "/documentation/" },
    " or ",
    { label: "llms.txt", href: "/llms.txt" },
    ", which lists every page with a link to its Markdown version.",
  ] as (string | Link)[],
  primary: { label: "Go to Home", href: "/" } as Link,
  secondary: { label: "Get Support", href: "https://discord.gg/qdrant" } as Link,
}
