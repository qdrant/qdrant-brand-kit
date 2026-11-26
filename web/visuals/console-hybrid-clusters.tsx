"use client"

import { CloudSync } from "lucide-react"

import { Badge } from "@qdrant/design-system/components/ui/badge"
import { Button } from "@qdrant/design-system/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@qdrant/design-system/components/ui/table"
import { cn } from "@qdrant/design-system/lib/utils"

import { CloudLogo } from "../lib/cloud-logo"
import { ConsoleWindow, StatusBadge } from "./console-parts"

// The Console's cluster list with Hybrid Cloud clusters among fully managed ones (Hybrid Cloud page, "Provision,
// scale, and monitor from one console", 2026-11-26), rebuilt from the design system's components instead of the
// site's PNG (hybrid-cloud-card-visual.png). A managed cluster shows its provider and region; a Hybrid Cloud cluster
// shows the Hybrid Cloud environment it was created in, picked "like choosing a region" (the page's FAQ;
// /documentation/cloud/create-cluster/: "Select a provider and region, or a Hybrid Cloud environment"; checked
// 2026-11-26). The Figma's Hybrid Cloud icon isn't Lucide, so CloudSync stands in (visuals/console.tsx). Names,
// regions and environments are examples; one hybrid row is selected. 560 by 300; under 448px the status drops out.

type Row = {
  name: string
  healthy: boolean
  where: { provider: "aws" | "google-cloud" | "azure"; region: string } | { environment: string }
  selected?: boolean
}

const rows: Row[] = [
  { name: "search-prod", healthy: true, where: { provider: "aws", region: "us-east-1" } },
  { name: "hc-production", healthy: true, where: { environment: "production" }, selected: true },
  { name: "eu-docs", healthy: true, where: { provider: "google-cloud", region: "europe-west3" } },
  { name: "hc-testing", healthy: false, where: { environment: "testing" } },
  { name: "rag-staging", healthy: true, where: { provider: "azure", region: "eastus" } },
]

const hideNarrow = "@max-[28rem]:hidden"

export function ConsoleHybridClusters({ className }: { className?: string }) {
  return (
    <ConsoleWindow
      label="Qdrant Cloud Console: the cluster list, where clusters in Hybrid Cloud environments sit beside fully managed clusters on AWS, Google Cloud and Azure"
      className={cn("h-[300px] w-[560px]", className)}
    >
      <div className="flex h-full flex-col gap-3 px-5 pt-4 @max-[28rem]:px-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-semibold">Clusters</p>
          <Button size="sm">Create</Button>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase">Name</TableHead>
                <TableHead className={cn("uppercase", hideNarrow)}>Status</TableHead>
                <TableHead className="uppercase">Provider</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.name}
                  className={cn(
                    row.selected &&
                      "bg-(--qd-color-indigo-400)/16 shadow-[inset_2px_0_0_var(--qd-color-indigo-400)] light:bg-(--qd-color-indigo-600)/10 light:shadow-[inset_2px_0_0_var(--qd-color-indigo-600)]"
                  )}
                >
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className={hideNarrow}>
                    <StatusBadge tone={row.healthy ? "success" : "neutral"}>
                      {row.healthy ? "Healthy" : "Unknown"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {"environment" in row.where ? (
                      <span className="flex items-center gap-2">
                        <CloudSync
                          aria-hidden
                          className="size-4 shrink-0 text-(--qd-color-cyan-400) light:text-(--qd-color-cyan-600)"
                        />
                        {row.where.environment}
                        <Badge variant="secondary">Hybrid</Badge>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CloudLogo provider={row.where.provider} className="size-4" />
                        {row.where.region}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ConsoleWindow>
  )
}
