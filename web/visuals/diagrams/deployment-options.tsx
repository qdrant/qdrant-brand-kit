import type * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// Where each deployment runs (qdrant.tech/documentation/cloud, hybrid-cloud and private-cloud, checked 2026-11-26), in
// HTML so it follows the theme. Three columns, Managed, Hybrid and Private Cloud, over two bands: Qdrant Cloud and your
// infrastructure. Managed Cloud runs the control plane and the data plane (the databases) on Qdrant's infrastructure.
// Hybrid Cloud keeps the control plane in Qdrant Cloud and runs the data plane in your Kubernetes; the agent there
// only opens an outbound connection to the control plane, and user data stays. Private Cloud runs everything in your
// Kubernetes, managed with the operator, with no connection to Qdrant Cloud. The data planes are indigo; the band for
// your infrastructure has an indigo hairline. Static: it's read at a glance. Narrow, the chips' words wrap.

const DESCRIPTION =
  "Where each deployment runs. Managed Cloud: the control plane and the data plane both run in Qdrant Cloud. Hybrid Cloud: the control plane runs in Qdrant Cloud and the data plane runs in your infrastructure, connected by an outbound connection only. Private Cloud: the Qdrant operator and the data plane both run in your infrastructure, with no connection to Qdrant Cloud."

type Chip = { text: string; kind: "control" | "data" | "none" }
const COLUMNS: {
  name: string
  cloud: Chip[]
  yours: Chip[]
  outbound?: boolean
}[] = [
  {
    name: "Managed Cloud",
    cloud: [
      { text: "Control plane", kind: "control" },
      { text: "Data plane", kind: "data" },
    ],
    yours: [],
  },
  {
    name: "Hybrid Cloud",
    cloud: [{ text: "Control plane", kind: "control" }],
    yours: [{ text: "Data plane", kind: "data" }],
    outbound: true,
  },
  {
    name: "Private Cloud",
    cloud: [{ text: "No connection", kind: "none" }],
    // The docs name no control plane for Private Cloud: it's managed with the Qdrant operator in your Kubernetes.
    yours: [
      { text: "Qdrant operator", kind: "control" },
      { text: "Data plane", kind: "data" },
    ],
  },
]

const text =
  "font-mono text-(length:--qd-font-size-12) leading-(--qd-line-height-150) font-medium uppercase"

function ChipMark({ chip }: { chip: Chip }) {
  return (
    <span
      className={cn(
        "flex min-h-9 w-full items-center justify-center rounded-md border px-2 py-1 text-center text-balance",
        chip.kind === "data" &&
          "border-(--web-scene-glow) bg-[color-mix(in_oklab,var(--web-scene-glow)_14%,var(--web-scene-surface))] text-(--web-indigo-text)",
        chip.kind === "control" &&
          "border-(--web-scene-line) bg-(--web-scene-surface) text-(--web-scene-star)",
        chip.kind === "none" &&
          "border-dashed border-(--web-scene-line) text-(--web-scene-label)"
      )}
    >
      {chip.text}
    </span>
  )
}

function Band({
  name,
  yours,
  children,
}: {
  name: string
  yours?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-2 @md:p-3",
        yours
          ? "border-(--web-scene-glow) bg-[color-mix(in_oklab,var(--web-scene-glow)_5%,transparent)]"
          : "border-(--web-scene-line)"
      )}
    >
      <span className="text-(--web-scene-label)">{name}</span>
      <div className="grid grid-cols-3 gap-2 @md:gap-4">{children}</div>
    </div>
  )
}

export function DeploymentOptions() {
  return (
    <div
      role="img"
      aria-label={DESCRIPTION}
      className={cn("@container w-full p-4 @md:p-6", text)}
    >
      <div aria-hidden className="flex flex-col">
        {/* The three options. */}
        <div className="grid grid-cols-3 gap-2 px-2 pb-3 @md:gap-4 @md:px-3">
          {COLUMNS.map((column) => (
            <span
              key={column.name}
              className="text-center text-(--web-scene-star)"
            >
              {column.name}
            </span>
          ))}
        </div>

        <Band name="Qdrant Cloud">
          {COLUMNS.map((column) => (
            <div key={column.name} className="flex flex-col justify-end gap-2">
              {column.cloud.map((chip) => (
                <ChipMark key={chip.text} chip={chip} />
              ))}
            </div>
          ))}
        </Band>

        {/* Between the bands: Hybrid Cloud's outbound connection. */}
        <div className="grid h-14 grid-cols-3 gap-2 px-2 @md:gap-4 @md:px-3">
          {COLUMNS.map((column) => (
            <div key={column.name} className="relative flex justify-center">
              {column.outbound ? (
                <>
                  <svg
                    width={10}
                    height={56}
                    viewBox="0 0 10 56"
                    className="shrink-0 overflow-visible"
                  >
                    <path
                      d="M5 56 V1 M1 7 L5 1 L9 7"
                      fill="none"
                      stroke="var(--web-scene-glow)"
                      strokeWidth={1.5}
                    />
                  </svg>
                  <span className="absolute top-1/2 left-1/2 ml-3 -translate-y-1/2 text-(--web-scene-label)">
                    Outbound
                  </span>
                </>
              ) : null}
            </div>
          ))}
        </div>

        <Band name="Your infrastructure" yours>
          {COLUMNS.map((column) => (
            <div
              key={column.name}
              className="flex flex-col justify-start gap-2"
            >
              {column.yours.map((chip) => (
                <ChipMark key={chip.text} chip={chip} />
              ))}
            </div>
          ))}
        </Band>
      </div>
    </div>
  )
}
