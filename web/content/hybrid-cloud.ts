// The Qdrant Hybrid Cloud page of qdrant.tech (/hybrid-cloud/, read 2026-11-26 from the site's source), word for
// word, for web/pages/hybrid-cloud.tsx. The steps are content/sections.ts's hybridSteps (with the description in
// full here), the architecture content/platform.ts's hybridArchitecture, and the FAQs content/conversion.ts's
// hybridFaq; this file holds the rest.

import type { Link } from "./site"
import type { Feature } from "./sections"

export const hybridHero = {
  kicker: "Hybrid Cloud Deployment",
  title: "Run Qdrant Inside Your Own Infrastructure, Managed by Qdrant Cloud",
  description:
    "Get the managed experience of Qdrant Cloud without your data leaving your infrastructure. The data plane runs in your own Kubernetes cluster on AWS, GCP, Azure, or any conformant distribution, so you meet residency and compliance requirements.",
  primary: { label: "Talk to Us", href: "/contact-us/" } as Link,
  secondary: {
    label: "Start Free",
    href: "https://cloud.qdrant.io/signup",
  } as Link,
  trust: [
    {
      label:
        "Manage every cluster from the central Qdrant Cloud control plane.",
      icon: "LayoutDashboard",
    },
  ],
}

// "Fully Managed, Without Access to Your Data": the large card and the three beside it.
export const hybridFeatures = {
  kicker: "Why Teams Choose Hybrid Cloud",
  title: "Fully Managed, Without Access to Your Data",
  description:
    "When data residency or compliance requirements mean vectors must stay inside your infrastructure, Hybrid Cloud delivers the managed-service experience with your data plane running entirely inside your own cloud account or on-premise datacenter.",
  large: {
    icon: "LayoutDashboard",
    title: "Provision, scale, and monitor from one console.",
    text: "Hybrid Cloud clusters are provisioned and managed from the same Qdrant Cloud Console used for fully managed clusters, giving you a single interface for every deployment type.",
    link: {
      label: "Start Free on Managed Qdrant Cloud",
      href: "https://cloud.qdrant.io/signup",
    },
  } as Feature,
  small: [
    {
      icon: "ShieldCheck",
      title:
        "Vectors, indexes, and backups live inside your own infrastructure.",
      text: "Qdrant operates the control plane; your data plane runs in your environment and Qdrant Cloud receives operational metadata only: cluster health, resource usage, and collection names and counts. No user data leaves your environment.",
    },
    {
      icon: "Split",
      title: "A clear split between what you own and what Qdrant operates.",
      text: "You own the Kubernetes environment, the load balancers, and block storage. Qdrant operates the control plane, the Kubernetes Operator, and the container registry that delivers Qdrant container images to your cluster.",
    },
    {
      icon: "Container",
      title:
        "Deploy into EKS, GKE, AKS, or any other standard-compliant Kubernetes cluster.",
      text: "Hybrid Cloud supports any conformant Kubernetes distribution, so you bring the cluster you already operate.",
    },
  ] as Feature[],
}

// "Set Up Your Hybrid Cluster in a Few Steps From the Console": its description in full and its two actions.
export const hybridSetup = {
  description:
    "Contact Sales to enable Hybrid Cloud, then connect your Kubernetes environment from the console. After that, manage your clusters as you would in Qdrant Cloud.",
  primary: { label: "Talk to Us", href: "/contact-us/" } as Link,
  secondary: {
    label: "See the Quickstart",
    href: "/documentation/hybrid-cloud/hybrid-cloud-setup/",
  } as Link,
}

// "Hybrid Cloud Puts Kubernetes Operations in Your Hands": one row, its two paragraphs as its text and a point.
export const hybridFit: Feature = {
  tag: "What You Get",
  title: "Hybrid Cloud Puts Kubernetes Operations in Your Hands",
  text: "Hybrid Cloud fits when data residency or compliance requires vectors to stay in your infrastructure and a platform team operates your Kubernetes environment. It is not a cost shortcut: you still run and pay for the underlying infrastructure.",
  points: [
    {
      text: "If you don't run Kubernetes today, or your goal is lower operational overhead, a fully managed Qdrant Cloud cluster is the better starting point.",
    },
  ],
}

export const hybridCta = {
  title: "Hybrid Cloud: Your Data, Your VPC, One Console",
  description:
    "Connect the Kubernetes cluster you already run and get a fully managed vector search engine, with your data staying exactly where it is.",
  primary: { label: "Talk to us", href: "/contact-us/" } as Link,
  secondary: {
    label: "Start free",
    href: "https://cloud.qdrant.io/signup",
  } as Link,
}
