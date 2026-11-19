import * as React from "react"
import { Boxes } from "lucide-react"

import { Card } from "@qdrant/design-system/components/ui/card"
import { cn } from "@qdrant/design-system/lib/utils"

import { ArrowLink } from "@qdrant/web/lib/arrow-link"
import { Section } from "@qdrant/web/lib/section"
import { type } from "@qdrant/web/lib/type"

// Resilience page, "Cluster-Configuration" (Figma node 20840:112203): the three properties that set a
// cluster's resilience, each with a small cluster diagram, and the Multi-AZ banner. The diagrams are drawn
// in HTML from the Figma's labels, in the Figma's colors (the nearest palette steps): violet tags and node
// borders (secondary/300 and /400, indigo-400 on dark and indigo-600 on light), light violet dots where the
// request lands (secondary/200, indigo-200), and the node that's down in gray (N40, neutral-700) with the
// accent dot. The background lights behind the cards are built in CSS below.

type Node = { label: string; shards: [string, string]; down?: boolean }

type Property = {
  title: string
  does: string
  means: string
  diagram:
    | { kind: "replicas"; nodes: Node[] }
    | { kind: "request"; request: string; nodes: Node[] }
}

const properties: Property[] = [
  {
    title: "Replication Factor",
    does: "Keeps equal copies of every shard across your nodes",
    means: "Searches and writes continue when a node goes down.",
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
    does: "Distributes shard replicas across more nodes.",
    means: "More headroom for your cluster to stay healthy.",
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
    does: "Spreads those nodes across three availability zones.",
    means: "Your cluster stays up across a full zone outage.",
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
]

const multiAz = {
  title: "Multi-AZ",
  details: [
    ["Enabled at cluster creation", "Available on the Premium tier"],
    [
      "Changes where your replicas are placed, not how many",
      "Without it, a multi-node cluster keeps all replicas in one zone",
    ],
  ],
  link: {
    label: "Read Documentation",
    href: "https://qdrant.tech/documentation/scaling/distributed_deployment/",
  },
}

// The diagrams' colors. Violet edges: indigo-400 on dark, indigo-600 on light. Gray for what's down, as dim
// as the Figma's N40 on its background (about 2:1): neutral-700 on dark, neutral-400 on light.
const violetBorder =
  "border-(--qd-color-indigo-400) light:border-(--qd-color-indigo-600)"
const downBorder =
  "border-(--qd-color-neutral-700) light:border-(--qd-color-neutral-400)"

// A node or request label: a filled mono tag, violet with the page's background color as its label (dark on
// indigo-400, white on indigo-600), or gray when its node is down.
function Tag({
  down,
  className,
  ...props
}: React.ComponentProps<"span"> & { down?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-xs py-1 text-center font-mono text-(length:--qd-font-size-14) leading-(--qd-line-height-150) text-background",
        down
          ? "bg-(--qd-color-neutral-700) light:bg-(--qd-color-neutral-400)"
          : "bg-(--qd-color-indigo-400) light:bg-(--qd-color-indigo-600)",
        className
      )}
      {...props}
    />
  )
}

function Shard({
  down,
  children,
}: {
  down?: boolean
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "flex h-6 w-full max-w-20 items-center justify-center border font-mono text-(length:--qd-font-size-12) leading-(--qd-line-height-150)",
        down
          ? cn(
              downBorder,
              "text-(--qd-color-neutral-700) light:text-(--qd-color-neutral-400)"
            )
          : "border-muted-foreground text-foreground"
      )}
    >
      {children}
    </span>
  )
}

function NodeContent({ node, gap }: { node: Node; gap: "gap-2" | "gap-4" }) {
  return (
    <div className="flex flex-col items-center gap-4 px-2 py-4">
      <Tag down={node.down} className="w-12">
        {node.label}
      </Tag>
      <div className={cn("flex w-full flex-col items-center", gap)}>
        {node.shards.map((shard) => (
          <Shard key={shard} down={node.down}>
            {shard}
          </Shard>
        ))}
      </div>
    </div>
  )
}

// The request's lines to the three nodes, with a dot where each one lands: light violet on the nodes that
// are up, the accent (the Figma's Primary, amaranth-600) on the node that's down, whose line is gray.
function Connectors() {
  return (
    <div className="relative h-8 w-full">
      <span className="absolute top-0 bottom-1/2 left-1/2 border-l border-muted-foreground" />
      <span
        className={cn(
          "absolute top-1/2 bottom-0 left-1/2 border-l",
          downBorder
        )}
      />
      <span className="absolute top-1/2 right-1/2 bottom-0 left-1/6 rounded-tl-md border-t border-l border-muted-foreground" />
      <span className="absolute top-1/2 right-1/6 bottom-0 left-1/2 rounded-tr-md border-t border-r border-muted-foreground" />
      <span className="absolute bottom-0 left-1/6 size-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-(--qd-color-indigo-200) light:bg-(--qd-color-indigo-600)" />
      <span className="absolute right-1/6 bottom-0 size-3 translate-x-1/2 translate-y-1/2 rounded-full bg-(--qd-color-indigo-200) light:bg-(--qd-color-indigo-600)" />
      <span className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary" />
    </div>
  )
}

function Diagram({ diagram }: { diagram: Property["diagram"] }) {
  if (diagram.kind === "replicas") {
    return (
      <div className="grid flex-1 grid-cols-3 divide-x divide-(--qd-color-indigo-400) border border-(--qd-color-indigo-400) light:divide-(--qd-color-indigo-600) light:border-(--qd-color-indigo-600)">
        {diagram.nodes.map((node) => (
          <NodeContent key={node.label} node={node} gap="gap-4" />
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center">
      <Tag className="px-4">{diagram.request}</Tag>
      <Connectors />
      <div className="grid w-full grid-cols-3">
        {diagram.nodes.map((node) => (
          <div
            key={node.label}
            className={node.down ? "border-y" : cn("border", violetBorder)}
          >
            <NodeContent node={node} gap="gap-2" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PropertyPanel({ property }: { property: Property }) {
  return (
    <div className="flex flex-col p-8">
      <h3 className="text-(length:--qd-type-text-xl-size) leading-(--qd-type-text-xl-line-height) font-semibold tracking-(--qd-type-text-xl-letter-spacing) text-foreground">
        {property.title}
      </h3>
      <div
        aria-hidden
        className="mx-auto flex w-full max-w-xs flex-1 flex-col py-8"
      >
        <Diagram diagram={property.diagram} />
      </div>
      <p className={cn(type.body, "border-b pb-4")}>
        <span className="font-semibold text-foreground">
          What Qdrant Cloud Does
        </span>{" "}
        {property.does}
      </p>
      <p className={cn(type.body, "pt-4")}>
        <span className="font-semibold text-foreground">What it Means</span>{" "}
        {property.means}
      </p>
    </div>
  )
}

// The Figma's "Background-Lights" (node 20840:112349), behind the cards and the banner: on each side a column
// of blurred lights along the cards' edge (deep blue below, indigo above, mirrored on the right), and two
// purple bands, faded at both ends, behind the top of the cards. Positions are the Figma's, in px from the
// cards' top-left corner (the side lights from their edge, the bands in % of the width); each light is the
// Figma's ellipse with its 75px blur. Softer on light, where the deep blue becomes a pale one.
type Light = {
  x: number
  y: number
  w: number
  h: number
  rotate: number
  color: string
  opacity: number
}

const sideLights: Light[] = [
  {
    x: 115,
    y: 89,
    w: 87,
    h: 112,
    rotate: 37.22,
    color: "var(--qd-color-indigo-600)",
    opacity: 0.5,
  },
  {
    x: 3,
    y: 153,
    w: 64,
    h: 185,
    rotate: -14.18,
    color: "var(--qd-color-indigo-600)",
    opacity: 0.38,
  },
  {
    x: 18,
    y: 253,
    w: 63,
    h: 144,
    rotate: -32.32,
    color: "var(--qd-color-indigo-600)",
    opacity: 0.64,
  },
  {
    x: -3,
    y: 367,
    w: 66,
    h: 164,
    rotate: -7.29,
    color: "var(--glow-deep)",
    opacity: 0.64,
  },
  {
    x: -6,
    y: 447,
    w: 114,
    h: 274,
    rotate: -20.55,
    color: "var(--glow-deep)",
    opacity: 0.64,
  },
]

const bands = [
  {
    left: "1.2%",
    width: "97.6%",
    y: 113,
    h: 100,
    rotate: -1.04,
    opacity: 0.19,
  },
  { left: "10.2%", width: "76.1%", y: 60, h: 40, rotate: 0.73, opacity: 0.2 },
]

const blur = "blur(75px)"

function SideLights({ className }: { className: string }) {
  return (
    <div className={cn("absolute top-0", className)}>
      {sideLights.map((light) => (
        <span
          key={`${light.x},${light.y}`}
          className="absolute rounded-full"
          style={{
            left: light.x - light.w / 2,
            top: light.y - light.h / 2,
            width: light.w,
            height: light.h,
            background: light.color,
            opacity: light.opacity,
            transform: `rotate(${light.rotate}deg)`,
            filter: blur,
          }}
        />
      ))}
    </div>
  )
}

function BackgroundLights() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 [--glow-deep:var(--qd-color-blue-950)] light:opacity-50 light:[--glow-deep:var(--qd-color-blue-300)]"
    >
      {bands.map((band) => (
        <span
          key={band.left}
          className="absolute rounded-full"
          style={{
            left: band.left,
            width: band.width,
            top: band.y - band.h / 2,
            height: band.h,
            opacity: band.opacity,
            transform: `rotate(${band.rotate}deg)`,
            backgroundImage:
              "linear-gradient(90deg, transparent, var(--qd-color-purple-700) 36.5%, var(--qd-color-purple-700) 64%, transparent)",
            filter: blur,
          }}
        />
      ))}
      <SideLights className="left-0" />
      <SideLights className="right-0 -scale-x-100" />
    </div>
  )
}

export function ResilienceClusterConfiguration() {
  return (
    <Section innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <p className={type.kicker}>CLUSTER CONFIGURATION</p>
          <h2 className={type.h4}>
            Configure the Right Resilience for Your Workload
          </h2>
        </div>
        <p className={cn(type.body, "lg:w-5/6")}>
          {
            "Replication and node count give you high availability. Multi-AZ is the zone-resilience upgrade on top, for teams that need to survive a full availability-zone outage. These three properties define your cluster's resilience on Qdrant Cloud:"
          }
        </p>
      </div>

      {/* Its own layer, so the lights sit behind the cards and above the page background. */}
      <div className="relative isolate flex flex-col gap-16">
        <BackgroundLights />
        <Card className="gap-0 p-0">
          <div className="grid divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {properties.map((property) => (
              <PropertyPanel key={property.title} property={property} />
            ))}
          </div>
        </Card>

        <Card className="gap-8 p-8 lg:flex-row lg:items-end lg:gap-16">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center gap-2">
              <Boxes
                aria-hidden
                className="size-5 shrink-0 text-(--qd-color-indigo-400) light:text-(--qd-color-indigo-600)"
              />
              <h3 className={cn(type.body, "font-semibold")}>
                {multiAz.title}
              </h3>
            </div>
            <div className="flex flex-col gap-x-(--qd-layout-column-gap) md:flex-row md:items-center">
              {multiAz.details.map((list, i) => (
                <ul
                  key={i}
                  className={cn(
                    type.body,
                    "list-disc ps-6",
                    i === 0 ? "shrink-0" : "flex-1"
                  )}
                >
                  {list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
          <ArrowLink
            href={multiAz.link.href}
            target="_blank"
            rel="noreferrer"
            className="shrink-0"
          >
            {multiAz.link.label}
          </ArrowLink>
        </Card>
      </div>
    </Section>
  )
}
