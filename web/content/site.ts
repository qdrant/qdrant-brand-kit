// Copy from the current qdrant.tech (read 2026-11-21), verbatim, for the sections' examples in the studio, the docs
// and the page builder. Never invent copy: when the site has none for a slot (a menu item's description), the
// slot stays empty. Long paragraphs that weren't captured word for word are left out rather than paraphrased.

export type Link = { label: string; href: string }

export type MenuItem = Link & { tag?: string; icon?: string }
export type MenuGroup = { title?: string; items: MenuItem[] }
// `hidden` keeps a menu out of the bar and the phone sheet while keeping its copy here.
export type Menu = ({ label: string; groups: MenuGroup[] } | (Link & { groups?: undefined })) & { hidden?: boolean }

export const announcement = {
  tag: "1.20",
  text: "Qdrant 1.20: BM25 hybrid search without sparse vectors, and more",
  link: { label: "Read the release notes", href: "https://qdrant.tech/blog/qdrant-1.20.x/" },
}

// The top menu: four menus and Pricing. Icons are Lucide names, chosen for the studio (the site's own icons
// aren't Lucide).
export const menus: Menu[] = [
  {
    label: "Products",
    groups: [
      {
        title: "Deploy",
        items: [
          { label: "Qdrant Vector Search Engine", href: "/qdrant-vector-database/", icon: "Database" },
          { label: "Qdrant Managed Cloud", href: "/cloud/", icon: "Cloud" },
          { label: "Qdrant Hybrid Cloud", href: "/hybrid-cloud/", icon: "Layers" },
          { label: "Qdrant Private Cloud", href: "/private-cloud/", icon: "ShieldCheck" },
          { label: "Qdrant Edge", href: "/edge/", tag: "Beta", icon: "Cpu" },
          { label: "Qdrant Serverless", href: "/serverless/", tag: "Waitlist", icon: "Zap" },
        ],
      },
    ],
  },
  {
    label: "Solutions",
    // Hidden for now (design lead, 2026-11-23).
    hidden: true,
    groups: [
      {
        title: "Use Cases",
        items: [
          { label: "RAG", href: "/rag/", icon: "BookOpen" },
          { label: "Recommendation Systems", href: "/recommendations/", icon: "ThumbsUp" },
          { label: "Advanced Search", href: "/advanced-search/", icon: "Search" },
          { label: "Data Analysis & Anomaly Detection", href: "/data-analysis-anomaly-detection/", icon: "ChartScatter" },
          { label: "AI Agents", href: "/ai-agents/", icon: "Bot" },
        ],
      },
      {
        title: "Industries",
        items: [
          { label: "E-commerce", href: "/e-commerce/", icon: "ShoppingCart" },
          { label: "Legal Tech", href: "/legal-tech/", icon: "Scale" },
          { label: "Hospitality & Travel", href: "/hospitality-and-travel/", icon: "Plane" },
          { label: "HR Tech", href: "/hr-tech/", icon: "Users" },
          { label: "Healthcare Tech", href: "/healthcare/", icon: "HeartPulse" },
        ],
      },
    ],
  },
  {
    label: "Developers",
    groups: [
      {
        title: "Build",
        items: [
          { label: "Documentation", href: "/documentation/", icon: "FileText" },
          { label: "API Reference", href: "https://api.qdrant.tech/api-reference", icon: "Braces" },
          { label: "GitHub", href: "https://github.com/qdrant/qdrant", icon: "GitBranch" },
          { label: "Blog", href: "/blog/", icon: "Newspaper" },
        ],
      },
      {
        title: "Learn",
        items: [
          { label: "Guides", href: "/documentation/guides/", icon: "Compass" },
          { label: "Articles", href: "/articles/", icon: "BookOpenText" },
          { label: "Courses", href: "/course/", icon: "GraduationCap" },
          { label: "Tutorials", href: "/learn/examples/", icon: "SquareTerminal" },
        ],
      },
      {
        title: "Join",
        items: [
          { label: "Community", href: "/community/", icon: "MessagesSquare" },
          { label: "Events", href: "/events/", icon: "CalendarDays" },
          { label: "Qdrant Stars", href: "/stars/", icon: "Star" },
          { label: "Startup Program", href: "/qdrant-for-startups/", icon: "Rocket" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    groups: [
      {
        title: "Implement",
        items: [
          { label: "Partners", href: "/partners/", icon: "Handshake" },
          { label: "Services", href: "/services/", icon: "Wrench" },
          { label: "Integrations", href: "/integrations/", icon: "Puzzle" },
          { label: "Migration", href: "/documentation/migration-guidance/", icon: "ArrowRightLeft" },
        ],
      },
      {
        title: "Trust",
        items: [
          { label: "Security", href: "/security/", icon: "Lock" },
          { label: "Trust Center", href: "https://qdrant.to/trust-center", icon: "BadgeCheck" },
          { label: "Bug Bounty", href: "/security/bug-bounty-program/", icon: "Bug" },
        ],
      },
    ],
  },
  { label: "Pricing", href: "/pricing/" },
]

export const navActions = {
  login: { label: "Log in", href: "https://cloud.qdrant.io/login" },
  contact: { label: "Contact Us", href: "/contact-us/" },
  start: { label: "Start Free", href: "https://cloud.qdrant.io/signup" },
}

export const homeHero = {
  title: "High-Performance Vector Search at Scale",
  // The site's second sentence wasn't captured word for word, so only the first is used.
  description: "Qdrant helps you build the AI retrieval you want.",
  primary: { label: "Start Free in Qdrant Cloud", href: "https://cloud.qdrant.io/signup" },
  secondary: { label: "See How It Works", href: "/qdrant-vector-database/" },
  // The prompt is copied, not shown; the marks are the agents it's for (design lead, 2026-11-24).
  snippet: { label: "Give this to your agent", text: "set up qdrant with https://qdrant.tech/llms.txt", agents: ["claude", "codex", "cursor"] as ("claude" | "codex" | "cursor")[] },
  trust: [
    { label: "35k+ GitHub Stars", icon: "Star" },
    { label: "60k+ Community Members", icon: "Users" },
    { label: "Rust Powered", icon: "Cog" },
    { label: "SOC2 & HIPAA compliant", icon: "ShieldCheck" },
  ],
}

export const cloudHero = {
  kicker: "Qdrant Cloud",
  title: "Build Fast, Accurate Vector Search at Scale with Qdrant Cloud",
  primary: { label: "Start Free", href: "https://cloud.qdrant.io/signup" },
  pills: ["Predictable P99 Latency", "Native Hybrid + Multimodal", "SOC 2 + HIPAA + GDPR"],
}

export const pricingHero = {
  title: "Qdrant Cloud Pricing",
  description:
    "Start free. Scale to production with fully managed vector search. Meet all enterprise security and compliance requirements.",
  primary: { label: "Talk to our Team", href: "/contact-us/" },
  secondary: { label: "Try our Pricing Calculator", href: "https://cloud.qdrant.io/calculator" },
}

export const closingCta = {
  title: "Engines Ready. Awaiting Your Command.",
  description: "Cloud Quickstart - spin up a cluster in seconds.",
  primary: { label: "Start Free in Qdrant Cloud", href: "https://cloud.qdrant.io/signup" },
}

export const footer = {
  tagline: "High-Performance Vector Search",
  columns: [
    {
      title: "Product",
      links: [
        { label: "Qdrant Vector Search Engine", href: "/qdrant-vector-database/" },
        { label: "Qdrant Managed Cloud", href: "/cloud/" },
        { label: "Qdrant Hybrid Cloud", href: "/hybrid-cloud/" },
        { label: "Qdrant Edge (Beta)", href: "/edge/" },
        { label: "Qdrant Serverless (Waitlist)", href: "/serverless/" },
      ],
    },
    {
      title: "Developers",
      links: [
        { label: "Documentation", href: "/documentation/" },
        { label: "API Reference", href: "https://api.qdrant.tech/api-reference" },
        { label: "GitHub", href: "https://github.com/qdrant/qdrant" },
        { label: "Learn", href: "/learn/" },
        { label: "Status Page", href: "https://status.qdrant.io/" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Community", href: "/community/" },
        { label: "Blog", href: "/blog/" },
        { label: "Events", href: "/events/" },
        { label: "Qdrant Stars", href: "/stars/" },
        { label: "Startup Program", href: "/qdrant-for-startups/" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about-us/" },
        { label: "Customers", href: "/customers/" },
        { label: "Partners", href: "/partners/" },
        { label: "Services", href: "/services/" },
        { label: "Careers", href: "https://qdrant.to/jobs" },
      ],
    },
  ],
  newsletter: {
    title: "Sign up for Qdrant updates",
    description:
      "We'll occasionally send you best practices for using vector data and similarity search, as well as product news.",
  },
  legal: ["Terms", "Privacy Policy", "Impressum", "Recruitment Privacy Policy", "Cookie Consent"],
  copyright: "© 2026 Qdrant.",
}
