// The Qdrant Serverless page of qdrant.tech (/serverless/, read 2026-11-26 from the site's source), word for word, for
// web/pages/serverless.tsx. "When to Use It", "When Not to Use It" and the waitlist form are already in the library
// (content/platform.ts's serverlessFit, content/conversion.ts's serverless); this file holds the rest.

import type { Faq } from "./conversion"
import type { Link } from "./site"

export const serverlessHero = {
  kicker: "Coming Soon",
  title: "Qdrant Serverless",
  description:
    "We're bringing serverless to Qdrant Cloud. No clusters, no capacity planning, no scaling to manage: create a collection, load vectors, and search. Same Qdrant API. Tell us about your workload and we'll reach out.",
  primary: { label: "Join the Waitlist", href: "#form" } as Link,
}

// "What Is Qdrant Serverless?": its subtitle and description, read as one passage above the two columns.
export const serverlessWhat = {
  title: "What Is Qdrant Serverless?",
  description:
    "Serverless vector search removes the cluster from the equation. You don't choose node sizes, plan capacity, or manage scaling. Instead, just create a collection, send vectors, and search. Pricing is based on usage. It runs on the same engine and the same API as other Qdrant deployment, including filtered search, hybrid search, and multivector support.",
}

export const serverlessFaq = {
  title: "FAQs",
  items: [
    {
      question: "What is serverless vector search?",
      answer:
        "A deployment model where you don't provision or manage clusters. You send vectors and queries; capacity scales with your workload, and you pay based on usage.",
    },
    {
      question: "Will it support the full Qdrant API?",
      answer:
        "Yes. Serverless runs the same Qdrant engine as every other deployment, including filtered search, hybrid search, and multivector support.",
    },
    {
      question: "When will it be available?",
      answer:
        "We're rolling out access in stages, starting with a limited group from the waitlist. Join the waitlist and tell us about your workload to be considered for early access.",
    },
    {
      question: "How will pricing work?",
      answer: "We'll publish details soon.",
    },
  ] as Faq[],
}
