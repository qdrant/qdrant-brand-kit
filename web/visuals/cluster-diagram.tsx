import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// Small cluster diagrams (from the Resilience page's Figma, "Cluster-Configuration", node 20840:112203): three nodes
// with their shard replicas, and for a request, the lines to the nodes with one node down. Drawn in HTML from the
// Figma's labels, in the Figma's colors (the nearest palette steps): violet tags and node borders (indigo-400 on
// dark, 600 on light), light violet dots where the request lands (indigo-200), and the node that's down in gray
// with the accent dot. A visual for a section's `visual` slot: pass <ClusterDiagram diagram={...} />.

export type DiagramNode = { label: string; shards: [string, string]; down?: boolean }
type Node = DiagramNode

export type ClusterDiagramData =
  | { kind: "replicas"; nodes: DiagramNode[] }
  | { kind: "request"; request: string; nodes: DiagramNode[] }

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

function Diagram({ diagram }: { diagram: ClusterDiagramData }) {
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

// The diagram centered in its slot, hidden from assistive tech (the text beside it says the same).
export function ClusterDiagram({ diagram, className }: { diagram: ClusterDiagramData; className?: string }) {
  return (
    <div aria-hidden className={cn("mx-auto flex w-full max-w-xs flex-col", className)}>
      <Diagram diagram={diagram} />
    </div>
  )
}
