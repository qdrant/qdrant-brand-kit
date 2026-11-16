import * as React from "react"
import { Check, Minus } from "lucide-react"

import { Card } from "@qdrant/design-system/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@qdrant/design-system/components/ui/table"
import { cn } from "@qdrant/design-system/lib/utils"

import { ArrowLink } from "@qdrant/web/lib/arrow-link"
import { Section } from "@qdrant/web/lib/section"
import { type } from "@qdrant/web/lib/type"

// Resilience page, "Deployment-Models" (Figma node 19619:68250): what each deployment model gives, as a
// comparison table, and a note with a link to the docs. The checks keep the Figma's teal (Teal 70, nearest
// teal-400): teal-400 on dark and teal-600 on light, the icon steps in primitives/colors.

const models = ["Managed Cloud", "Hybrid Private", "Self-Hosted OSS"]

// A cell is a check, a dash, or lines of text (each string is one line, as the Figma breaks them).
type Value = "yes" | "no" | string[]

const rows: { label: string; note?: string; values: [Value, Value, Value] }[] =
  [
    {
      label: "Replication Factor",
      note: "Set in Console",
      values: ["yes", "yes", "yes"],
    },
    {
      label: "Automatic Failover",
      note: "with RF 2+",
      values: ["yes", "yes", "yes"],
    },
    {
      label: "Multi-A-Z",
      values: [
        ["Premium, Enabled at creation"],
        ["Your Kubernetes placement"],
        ["Customer", "operated, no topology aware shard distribution"],
      ],
    },
    {
      label: "Zero-downtime Upgrades",
      values: [["Replicated"], ["Replicated"], ["Manual"]],
    },
    { label: "Auto Rebalance", values: ["yes", "yes", "no"] },
    {
      label: "Backups",
      values: [
        ["Scheduled", "+ on-demand (all paid)"],
        ["Scheduled", "+ on-demand (all paid)"],
        ["Snapshot API"],
      ],
    },
    {
      label: "Uptime SLA",
      values: [
        ["99.5% / 99.9%", "Premium / 99.95% Premium +  Multi-AZ"],
        ["Your Infrastructure"],
        "no",
      ],
    },
  ]

const note = {
  lines: [
    "The capabilities above apply to Qdrant Cloud.",
    "The same resilience primitives run across every deployment model.",
  ],
  link: {
    label: "Compare Deployment Models (Docs)",
    href: "https://qdrant.tech/documentation/cloud/",
  },
}

// The row headers' column fades from the background at the top to a lighter fill at the bottom, as in the
// Figma (a gradient to N20, nearest neutral-900; neutral-100 on light). Each cell draws its part of the ramp,
// so the column reads as one gradient.
function headerFill(row: number, rowCount: number): React.CSSProperties {
  const stop = (k: number) =>
    `color-mix(in oklab, var(--header-fill) ${(k / rowCount) * 100}%, transparent)`
  return {
    backgroundImage: `linear-gradient(${stop(row)}, ${stop(row + 1)})`,
  }
}

function ValueContent({ value }: { value: Value }) {
  if (value === "yes") {
    return (
      <Check
        role="img"
        aria-label="Yes"
        className="mx-auto size-6 text-(--qd-color-teal-400) light:text-(--qd-color-teal-600)"
      />
    )
  }
  if (value === "no") {
    return (
      <Minus
        role="img"
        aria-label="No"
        className="mx-auto size-6 text-muted-foreground"
      />
    )
  }
  return (
    <p className={cn(type.body, "text-foreground")}>
      {value.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </p>
  )
}

export function ResilienceDeploymentModels() {
  return (
    <Section innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className={type.kicker}>DEPLOYMENT MODELS</p>
        <h2 className={type.h4}>
          What Resilience You Get on Each Deployment Model
        </h2>
      </div>

      <div className="flex flex-col gap-16">
        {/* Fixed columns: a third for the labels, the rest shared by the models. Scrolls sideways on a phone. */}
        <Table className="min-w-3xl table-fixed">
          <colgroup>
            <col className="w-1/3" />
            <col />
            <col />
            <col />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead />
              {models.map((model) => (
                <TableHead
                  key={model}
                  scope="col"
                  className="border-x border-t p-8 text-center align-top"
                >
                  <span
                    className={cn(
                      type.h6,
                      "block font-sans whitespace-normal normal-case"
                    )}
                  >
                    {model}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => {
              const last = i === rows.length - 1
              return (
                <TableRow key={row.label}>
                  <TableCell
                    className={cn(
                      "border-x px-6 py-4 whitespace-normal [--header-fill:var(--qd-color-neutral-900)] light:[--header-fill:var(--qd-color-neutral-100)]",
                      last && "border-b"
                    )}
                    style={headerFill(i, rows.length)}
                  >
                    <p className={cn(type.body, "flex flex-wrap gap-x-2")}>
                      <span className="font-semibold text-foreground">
                        {row.label}
                      </span>
                      {row.note && <span>{row.note}</span>}
                    </p>
                  </TableCell>
                  {row.values.map((value, j) => (
                    <TableCell
                      key={models[j]}
                      className={cn(
                        "border-x px-8 py-4 text-center whitespace-normal",
                        last && "border-b"
                      )}
                    >
                      <ValueContent value={value} />
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <Card className="gap-4 p-6 md:flex-row md:items-center">
          <p className={cn(type.lead, "flex-1")}>
            {note.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          <ArrowLink
            href={note.link.href}
            target="_blank"
            rel="noreferrer"
            className="shrink-0"
          >
            {note.link.label}
          </ArrowLink>
        </Card>
      </div>
    </Section>
  )
}
