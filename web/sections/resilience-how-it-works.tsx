import { Copy, FileX, RefreshCw } from "lucide-react"

import { cn } from "@qdrant/design-system/lib/utils"

import { ArrowLink } from "@qdrant/web/lib/arrow-link"
import { Section } from "@qdrant/web/lib/section"
import { type } from "@qdrant/web/lib/type"

// "How Resilience Works on Qdrant Cloud" (Figma: Qdrant Web Design, "How-it-Works", node 20825:110082): the heading
// and its description side by side, then three steps in a bordered grid with a closing line under them. The
// icons keep the Figma's blue (lightBlue/700, nearest blue-500): blue-400 on dark and blue-600 on light, the
// icon steps in primitives/colors.
const steps = [
  {
    icon: Copy,
    title: "Replication",
    description: "Equal copies of every shard, kept across your nodes.",
  },
  {
    icon: FileX,
    title: "Failover",
    description: "Searches and writes continue when a node goes down.",
  },
  {
    icon: RefreshCw,
    title: "Rolling Upgrades",
    description:
      "Updates move through one node at a time while the rest serve traffic.",
  },
]

export function ResilienceHowItWorks() {
  return (
    <Section>
      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <h2 className={type.h4}>
            How Resilience Works
            <br />
            on Qdrant Cloud
          </h2>
          <div className="flex flex-col items-start gap-6 lg:w-2/5">
            <p className={type.lead}>
              Run at least 3 nodes with replication factor 2 or higher and the
              capabilities below apply to your cluster.
            </p>
            <ArrowLink
              href="https://qdrant.tech/documentation/cloud/configure-cluster/"
              target="_blank"
              rel="noreferrer"
            >
              Configure a Replicated Cluster (Docs)
            </ArrowLink>
          </div>
        </div>

        <div className="grid border-t border-l lg:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-6 border-r border-b px-6 py-8 lg:pb-20"
            >
              <Icon
                aria-hidden
                className="size-8 text-(--qd-color-blue-400) light:text-(--qd-color-blue-600)"
              />
              <div className="flex flex-col gap-4">
                <h3 className={type.h6}>{title}</h3>
                <p className={type.body}>{description}</p>
              </div>
            </div>
          ))}
          <p
            className={cn(
              type.body,
              "border-r border-b p-6 text-center lg:col-span-3"
            )}
          >
            <strong className="font-semibold">
              You set it, Qdrant runs it.
            </strong>{" "}
            You choose the replication factor, the platform maintains the
            replicas.
          </p>
        </div>
      </div>
    </Section>
  )
}
