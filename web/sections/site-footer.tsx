import * as React from "react"

import { Button } from "@qdrant/design-system/components/ui/button"
import { Input } from "@qdrant/design-system/components/ui/input"
import { Separator } from "@qdrant/design-system/components/ui/separator"
import { cn } from "@qdrant/design-system/lib/utils"

import { ASSETS } from "@qdrant/web/lib/assets"
import { MonoImage } from "@qdrant/web/lib/mono-image"
import { type } from "@qdrant/web/lib/type"

// The social marks from the Figma, each in its own proportions (the Figma has no links for them). Drawn in the
// text color, so they follow the theme.
const social = [
  { name: "GitHub", file: "github", className: "h-[23.4px] w-6" },
  { name: "LinkedIn", file: "linkedin", className: "size-[22.5px]" },
  { name: "X", file: "x", className: "h-[21px] w-[23.2px]" },
  { name: "Discord", file: "discord", className: "size-6" },
  { name: "YouTube", file: "youtube", className: "h-[17px] w-6" },
]

// The Figma's footer links have no hrefs yet, so they're placeholder links (<a> without href).
const menu = [
  {
    title: "Product",
    links: [
      "Qdrant Vector Database",
      "Qdrant Cloud",
      "Qdrant Hybrid Cloud",
      "Qdrant Enterprise Solutions",
      "Qdrant Inference",
      "Qdrant Edge (Private Beta)",
      "Pricing",
    ],
  },
  {
    title: "Use Cases",
    links: [
      "RAG",
      "Recommendation Systems",
      "Advanced Search",
      "Data Analysis & Anomaly Detection",
      "AI Agents",
    ],
  },
  {
    title: "Industries",
    links: ["E-commerce", "Legal Tech", "Hospitality & Travel"],
  },
  {
    title: "Developers",
    links: [
      "Documentation",
      "Community",
      "Github",
      "Roadmap",
      "Changelog",
      "Status Page",
    ],
  },
  {
    title: "Resources",
    links: [
      "Blog",
      "Benchmarks",
      "Articles",
      "Events",
      "Startup Program",
      "Demos",
      "Bug Bounty",
    ],
  },
  {
    title: "Company",
    links: ["About Us", "Customers", "Partners", "Careers", "Contact Us"],
  },
]

// Certification badges, 48px, in the muted text color as in the Figma.
const badges = [
  { name: "SOC 2", file: "soc-2" },
  { name: "GDPR", file: "gdpr" },
  { name: "HIPAA", file: "hipaa" },
]
const legal = ["Terms", "Privacy Policy", "Impressum"]

const link = cn(type.small, "font-medium hover:text-foreground")

// One band of the footer: the content width, with the side padding of a Section. The bands are split by
// full-width lines, so the footer doesn't use Section (its 80px padding is for page sections).
function Band({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className="px-6">
      <div
        className={cn(
          "mx-auto w-full max-w-(--qd-layout-content-width)",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

// "Footer" (Figma 19452:26766): logo and social marks, the link columns, the newsletter signup, then the
// copyright, certification badges and legal links. It follows the page theme.
export function SiteFooter() {
  return (
    <footer className="bg-background text-foreground">
      <Band className="flex flex-wrap items-center justify-between gap-6 py-10">
        <img
          src="/repo/brand-assets/logo/qdrant-logo-dark.svg"
          alt="Qdrant"
          width={120}
          height={32}
          className="h-8 w-auto light:hidden"
        />
        <img
          src="/repo/brand-assets/logo/qdrant-logo-light.svg"
          alt="Qdrant"
          width={120}
          height={32}
          className="hidden h-8 w-auto light:block"
        />
        <ul className="flex items-center gap-6 lg:gap-10">
          {social.map((mark) => (
            <li
              key={mark.name}
              className="flex size-6 items-center justify-center"
            >
              <MonoImage
                src={`${ASSETS}/social/${mark.file}.svg`}
                label={mark.name}
                className={mark.className}
              />
            </li>
          ))}
        </ul>
      </Band>

      <Separator />

      <Band className="grid grid-cols-2 gap-x-6 gap-y-12 py-16 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-between lg:gap-y-16">
        {menu.map((column) => (
          <nav
            key={column.title}
            aria-label={column.title}
            className="flex flex-col gap-4"
          >
            <h2 className={cn(type.body, "font-semibold text-foreground")}>
              {column.title}
            </h2>
            <ul className="flex flex-col gap-3">
              {column.links.map((label) => (
                <li key={label}>
                  <a className={link}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Band>

      <Separator />

      <Band className="grid items-center gap-8 py-10 lg:grid-cols-2 lg:gap-(--qd-layout-column-gap)">
        <div className="flex flex-col gap-2 lg:w-11/16">
          <h2 className="text-(length:--qd-font-size-20) leading-(--qd-line-height-normal) font-medium text-foreground">
            Sign up for Qdrant updates
          </h2>
          <p className={type.small}>
            We&apos;ll occasionally send you best practices for using vector
            data and similarity search, as well as product news.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              aria-label="Enter your email"
            />
            <Button>Subscribe</Button>
          </div>
          <p className={type.xsmall}>
            By submitting, you agree to subscribe to Qdrant&apos;s updates. You
            can withdraw your consent anytime. More details are in the{" "}
            <a className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy.
            </a>
          </p>
        </div>
      </Band>

      <Separator />

      <Band className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6 py-10">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          <p className={cn(type.small, "font-medium")}>© 2025 Qdrant.</p>
          <ul className="flex items-center gap-6">
            {badges.map((badge) => (
              <li key={badge.name} className="flex">
                <MonoImage
                  src={`${ASSETS}/badges/${badge.file}.svg`}
                  label={`${badge.name} certification badge`}
                  className="size-12 text-muted-foreground"
                />
              </li>
            ))}
          </ul>
        </div>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-3">
          {legal.map((label) => (
            <li key={label}>
              <a className={link}>{label}</a>
            </li>
          ))}
        </ul>
      </Band>
    </footer>
  )
}
