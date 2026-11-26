// The Qdrant Private Cloud page of qdrant.tech (/private-cloud/, read 2026-11-26 from the site's source), word for
// word, for web/pages/private-cloud.tsx. The page is short: a hero, one statement beside an image, the customer
// logos and a line to contact the team.

import type { Link } from "./site"
import type { Feature } from "./sections"

export const privateHero = {
  title: "Qdrant Private Cloud. Run Qdrant On-Premise.",
  description:
    "Effortlessly deploy and manage your enterprise-ready vector search fully on-premise, enhancing security for AI-driven applications.",
  primary: { label: "Contact us", href: "/contact-us/" } as Link,
}

export const privateAbout: Feature = {
  title:
    "Qdrant Private Cloud offers a dedicated, on-premise solution that guarantees supreme data privacy and sovereignty.",
  text: "Designed for enterprise-grade demands, it provides a seamless management experience for your vector workloads, ensuring optimal performance and security for vector search and AI applications.",
}

// The shared customer list (headless/customer-list), in the site's order.
export const privateCustomers = [
  { name: "AlphaSense", logo: "alphasense" },
  { name: "Deutsche Telekom", logo: "telekom" },
  { name: "HubSpot", logo: "hubspot" },
  { name: "Disney", logo: "disney" },
  { name: "BCG X", logo: "bcg-x" },
  { name: "CB Insights", logo: "cb-insights" },
  { name: "Vivendi", logo: "vivendi" },
  { name: "GitBook", logo: "gitbook" },
  { name: "Microsoft", logo: "microsoft" },
  { name: "Dust", logo: "dust" },
  { name: "GLG", logo: "glg" },
  { name: "Mozilla", logo: "mozilla" },
  { name: "Johnson & Johnson", logo: "johnson-and-johnson" },
  { name: "HRS Group", logo: "hrs-group" },
  { name: "Kaufland", logo: "kaufland" },
  { name: "Deloitte", logo: "deloitte" },
  { name: "Hewlett Packard Enterprise", logo: "hewlett-packard-enterprise" },
]

export const privateContact = {
  title: "To learn more about Qdrant Private Cloud, please contact our team.",
  primary: { label: "Contact us", href: "/contact-us/" } as Link,
}
