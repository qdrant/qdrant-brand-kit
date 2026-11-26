"use client"

import type * as React from "react"
import { Info, Rocket } from "lucide-react"

import { Button } from "@qdrant/design-system/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@qdrant/design-system/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@qdrant/design-system/components/ui/field"
import {
  Select,
  SelectTrigger,
  SelectValue,
} from "@qdrant/design-system/components/ui/select"
import { Separator } from "@qdrant/design-system/components/ui/separator"
import { Slider } from "@qdrant/design-system/components/ui/slider"
import { Switch } from "@qdrant/design-system/components/ui/switch"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@qdrant/design-system/components/ui/toggle-group"
import { cn } from "@qdrant/design-system/lib/utils"

import { CloudLogo } from "../lib/cloud-logo"
import { AccountBar, ConsoleWindow, indigoText } from "./console-parts"

// The Console's "Create a Cluster" screen at its resources step (Cloud page hero, 2026-11-26), rebuilt from the
// design system's components instead of the site's PNG (qdrant-cloud.png): the cluster's settings on the left and
// its summary on the right. The options and their names are the ones /documentation/cloud/create-cluster/ lists
// (checked 2026-11-26): High Availability, nodes ("at least 3 for production"), RAM and vCPU per node, Additional
// disk, and the AWS disk speed tiers Cost-Optimized (the default), Balanced and Performance; Multi AZ is Premium.
// The values are examples; no prices, since the page names none. 880 by 520; under 640px the summary drops out, and under 576px the settings stack in one column.

const ramSteps = ["2", "4", "8", "16", "32", "64", "128"]
const tiers = ["Cost-Optimized", "Balanced", "Performance"]

const summary: [string, React.ReactNode][] = [
  [
    "Region",
    <span key="region" className="flex items-center gap-1.5">
      <CloudLogo provider="aws" alt="" className="size-4" />
      us-east-1
    </span>,
  ],
  ["Nodes", "3"],
  ["High Availability", "Yes"],
  ["Multi AZ", "No"],
  ["RAM", "8 GiB"],
  ["vCPUs", "2 vCPU"],
  ["Disk Speed", "Cost-Optimized"],
]

function Label({ children }: { children: React.ReactNode }) {
  return (
    <FieldLabel>
      {children}
      <Info aria-hidden className="size-3.5 text-muted-foreground" />
    </FieldLabel>
  )
}

// The selected option: an indigo border over the 16% tint (visuals/console.tsx).
const pressed =
  "text-muted-foreground aria-pressed:border-(--qd-color-indigo-400) aria-pressed:bg-(--qd-color-indigo-400)/16 aria-pressed:text-foreground light:aria-pressed:border-(--qd-color-indigo-600) light:aria-pressed:bg-(--qd-color-indigo-600)/10"

function SettingsCard() {
  return (
    <Card className="min-w-0 flex-1">
      <CardHeader>
        <CardTitle>Cluster Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-6 @max-[36rem]:grid-cols-1 @max-[36rem]:gap-5">
          <Field>
            <Label>High Availability</Label>
            <FieldDescription>
              Sets up 3 or more nodes with replication.
            </FieldDescription>
            <div className="flex items-center gap-2">
              <Switch defaultChecked />
              <span>On</span>
            </div>
          </Field>
          <Field>
            <Label>Nodes</Label>
            <FieldDescription>Use at least 3 for production.</FieldDescription>
            <Select items={[{ label: "3", value: "3" }]} defaultValue="3">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
            </Select>
          </Field>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-6 @max-[36rem]:grid-cols-1 @max-[36rem]:gap-5">
          <Field>
            <Label>RAM</Label>
            <FieldDescription>Set RAM per Node</FieldDescription>
            <Slider defaultValue={[2]} min={0} max={6} step={1} />
            <div className="flex justify-between text-muted-foreground">
              {ramSteps.map((step) => (
                <span key={step}>{step}</span>
              ))}
            </div>
          </Field>
          <Field>
            <Label>vCPU</Label>
            <FieldDescription>Set vCPUs per Node</FieldDescription>
            <ToggleGroup
              variant="outline"
              defaultValue={["2"]}
              className="grid w-full grid-cols-2"
            >
              <ToggleGroupItem value="2" className={pressed}>
                2 vCPU
              </ToggleGroupItem>
              <ToggleGroupItem value="4" className={pressed}>
                4 vCPU
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>
        </div>

        <Separator />

        <Field>
          <Label>Disk Speed</Label>
          <FieldDescription>
            From the least to the most IOPS and throughput.
          </FieldDescription>
          <ToggleGroup
            variant="outline"
            defaultValue={["Cost-Optimized"]}
            className="grid w-full grid-cols-3 @max-[36rem]:grid-cols-1"
          >
            {tiers.map((tier) => (
              <ToggleGroupItem key={tier} value={tier} className={pressed}>
                {tier}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      </CardContent>
    </Card>
  )
}

function SummaryCard() {
  return (
    <Card className="w-60 shrink-0 self-start @max-[40rem]:hidden">
      <CardHeader className="flex flex-row items-center gap-2">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-sm bg-(--qd-color-indigo-400)/12 light:bg-(--qd-color-indigo-600)/10",
            indigoText
          )}
        >
          <Rocket aria-hidden className="size-3" />
        </span>
        <CardTitle>Dedicated Cluster</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-2.5">
          {summary.map(([term, value]) => (
            <div key={term} className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{term}</dt>
              <dd className="text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Create</Button>
      </CardFooter>
    </Card>
  )
}

export function ConsoleClusterSettings({ className }: { className?: string }) {
  return (
    <ConsoleWindow
      label="Qdrant Cloud Console: creating a dedicated cluster, with its settings (high availability, nodes, RAM, vCPU and disk speed) and its summary"
      className={cn("h-[520px] w-[880px]", className)}
    >
      <div className="flex h-full flex-col">
        <AccountBar />
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-6 pt-5 @max-[36rem]:px-3">
          <p className="text-lg font-semibold">Create a Cluster</p>
          <div className="flex min-h-0 gap-4">
            <SettingsCard />
            <SummaryCard />
          </div>
        </div>
      </div>
    </ConsoleWindow>
  )
}
