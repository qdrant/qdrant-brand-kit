// The Qdrant Vector Search Engine page of qdrant.tech (/qdrant-vector-database/, read 2026-11-26 from the site's
// source), word for word, for web/pages/engine.tsx. Icons are Lucide names chosen for the site's own outline icons.
// The site's rocket illustration in "Qdrant Cloud is the fastest way…" isn't used: the website has no raster
// images, and the band needs none.

import type { Link } from "./site"
import type { Feature } from "./sections"

export const engineHero = {
  title: "Qdrant. Efficient, Scalable, Fast.",
  description:
    "Qdrant is the most advanced vector search with highest RPS, minimal latency, fast indexing, high control with accuracy, and so much more.",
  primary: {
    label: "Get Started",
    href: "https://cloud.qdrant.io/signup",
  } as Link,
  secondary: { label: "Talk to Sales", href: "/contact-us/" } as Link,
}

// The three rows under the hero; the site gives them no heading.
export const engineUseCases: Feature[] = [
  {
    title: "Built for Performance",
    text: "With up to 4x RPS, Qdrant excels in delivering high-speed, efficient data processing, setting new benchmarks in vector database performance.",
    link: { label: "Benchmarks", href: "/benchmarks/" },
  },
  {
    title: "Fully Managed",
    text: "Experience seamless scalability and minimal operational overhead with Qdrant Cloud, designed for ease-of-use and reliability.",
    link: { label: "Qdrant Cloud", href: "/cloud/" },
  },
  {
    title: "Run Anywhere",
    text: "Qdrant’s Hybrid Cloud and Private Cloud solutions offer flexible deployment options for top-tier data protection.",
    link: { label: "Enterprise Solutions", href: "/enterprise-solutions/" },
  },
]

// "Feature Overview". The second card's sentence links "Advanced sharding" on the site; here the card keeps its own
// link and the sentence its words.
export const engineFeatures = {
  title: "Feature Overview",
  description:
    "Built as a dedicated similarity search engine, Qdrant provides unique features to provide unparalleled performance and efficiency in managing your vector data workloads.",
  items: [
    {
      icon: "Gauge",
      title: "Advanced Compression",
      text: "Scalar, Product, and unique Binary Quantization features significantly reduce memory usage and improve search performance (40x) for high-dimensional vectors.",
      link: {
        label: "Quantization",
        href: "/documentation/manage-data/quantization/#binary-quantization",
      },
    },
    {
      icon: "Cloud",
      title: "Distributed, Cloud-Native Design",
      text: "Managed cloud services on AWS, GCP, and Azure for scalable, maintenance-free vector search. Advanced sharding available.",
      link: { label: "Cloud Options", href: "/cloud/" },
    },
    {
      icon: "Rocket",
      title: "Easy to Use API",
      text: "Offers OpenAPI v3 specification for generating client libraries in almost any programming language.",
      link: {
        label: "Learn More",
        href: "/documentation/interfaces/#api-reference",
      },
    },
    {
      icon: "Building",
      title: "Enterprise-grade Security",
      text: "Includes robust access management, backup options, and disaster recovery. Dedicated Enterprise Solutions available.",
      link: { label: "Enterprise Solutions", href: "/enterprise-solutions/" },
    },
    {
      icon: "Puzzle",
      title: "Integrations",
      text: "Qdrant supports a wide range of integrations for all leading embeddings and frameworks.",
      link: { label: "See Integrations", href: "/documentation/frameworks/" },
    },
    {
      icon: "Users",
      title: "Multitenancy Support",
      text: "Ability to segment a single collection for organized and efficient retrieval, data isolation, and privacy. Vital for applications needing distinct vector dataset management.",
      link: {
        label: "Multitenancy",
        href: "/documentation/manage-data/multitenancy/",
      },
    },
    {
      icon: "HardDrive",
      title: "Memory Maps and IO Uring",
      text: "Effective on-disk storage options and low level hardware optimization.",
      link: { label: "Learn More", href: "/articles/io_uring/" },
    },
    {
      icon: "Target",
      title: "Fast and Precise Matching",
      text: "Unparalleled speed and accuracy, powered by a bespoke modification of the HNSW algorithm for Approximate Nearest Neighbor Search.",
      link: { label: "Learn More", href: "/documentation/search/search/" },
    },
    {
      icon: "Funnel",
      title: "Payloads & Advanced Filtering",
      text: "Vector payload supports a large variety of data types and query conditions, including string matching, numerical ranges, geo-locations, and more.",
      link: {
        label: "Learn More",
        href: "/documentation/manage-data/payload/",
      },
    },
    {
      icon: "ChartScatter",
      title: "Sparse Vector Support",
      text: "Efficient handling of sparse vectors for enhanced text retrieval and memory-efficient data representation for high-dimensional data sets.",
      link: { label: "Learn More", href: "/articles/sparse-vectors/" },
    },
  ] as Feature[],
}

// The band after the features ("get-started-small").
export const engineCloudBand = {
  title: "Qdrant Cloud is the fastest way to get started with Qdrant.",
  primary: {
    label: "Get Started",
    href: "https://cloud.qdrant.io/signup",
  } as Link,
}

// "Additional Resources", shared by the site's product pages.
export const additionalResources = {
  title: "Additional Resources",
  items: [
    {
      icon: "BookOpen",
      title: "Documentation",
      text: "Discover more about Qdrant by checking out our documentation for details on advanced features and functionalities.",
      link: { label: "Read More", href: "/documentation/" },
    },
    {
      icon: "Building",
      title: "Enterprise Solutions",
      text: "For maximal control for production-ready applications Qdrant is available as a Hybrid Cloud and Private Cloud (Full On Premise) solution.",
      link: { label: "Read More", href: "/enterprise-solutions/" },
    },
    {
      icon: "ChartColumn",
      title: "Benchmarks",
      text: "Learn how Qdrant is designed to deliver the fastest and most accurate results and how it compares to alternatives in our benchmarks.",
      link: { label: "Compare", href: "/benchmarks/" },
    },
    {
      icon: "Tag",
      title: "Pricing",
      text: "Visit our pricing page for more details on Qdrant’s free tier, managed cloud, and enterprise plans.",
      link: { label: "Learn More", href: "/pricing/" },
    },
  ] as Feature[],
}

// The closing band ("get-started"), shared by the site's product pages.
export const getStartedFree = {
  title: "Get started for free",
  description:
    "Turn embeddings or neural network encoders into full-fledged applications for matching, searching, recommending, and more.",
  primary: {
    label: "Get Started",
    href: "https://cloud.qdrant.io/signup",
  } as Link,
}
