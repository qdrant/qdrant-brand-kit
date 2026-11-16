"use client"

import * as React from "react"
import {
  ArrowRight,
  BookMarked,
  BookText,
  Check,
  CircleDollarSign,
  CodeXml,
  Copy,
  DatabaseZap,
  Ellipsis,
} from "lucide-react"
import { Area, AreaChart } from "recharts"

import { Badge } from "@qdrant/design-system/components/ui/badge"
import { Button } from "@qdrant/design-system/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@qdrant/design-system/components/ui/card"
import { type ChartConfig, ChartContainer } from "@qdrant/design-system/components/ui/chart"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@qdrant/design-system/components/ui/item"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@qdrant/design-system/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@qdrant/design-system/components/ui/tabs"
import { cn } from "@qdrant/design-system/lib/utils"

import { CloudShell } from "@/product/cloud-shell"

// A serverless space's overview in Qdrant Cloud. Layout and copy from the product's Figma (juan-serverless-2,
// "Space-Details-B", node 18501:11790); every component, color and icon is the design system's. The chart
// lines follow the shapes drawn in the Figma: they're placeholders, not data.

const tabs = [
  "Overview",
  "API Keys",
  "Console",
  "Collections",
  "Datasets",
  "Metrics",
  "Logs",
  "Backups",
  "Inference",
  "Configuration",
]

const labels = ["cost_allocation: search", "env: staging", "cost_center: search"]

const stats: { label: string; value: string; color: string; curve: "monotone" | "linear"; points: number[] }[] = [
  {
    label: "Vectors",
    value: "4.2M",
    color: "var(--chart-3)",
    curve: "monotone",
    points: [8, 10, 18, 20, 21, 21, 22, 24, 23, 22, 21, 22, 23, 24, 26, 30],
  },
  {
    label: "Storage used",
    value: "8.4 GiB",
    color: "var(--chart-1)",
    curve: "monotone",
    points: [10, 11, 12, 13, 14, 14, 14, 14, 14, 15, 17, 19, 20, 20, 21, 21, 22],
  },
  {
    label: "Search Requests · 30d",
    value: "1.2M",
    color: "var(--chart-2)",
    curve: "linear",
    points: [20, 14, 22, 12, 24, 18, 10, 26, 16, 24, 12, 22, 10, 16, 20, 14, 14, 20, 26, 14],
  },
  {
    label: "Write Requests · 30d",
    value: "340K",
    color: "var(--chart-4)",
    curve: "linear",
    points: [30, 30, 24, 20, 20, 20, 20, 20, 20, 20, 19, 18, 17, 16, 14],
  },
]

type Tone = "success" | "warning" | "neutral"

const collections: { name: string; status: string; tone: Tone; points: string }[] = [
  { name: "midjourney_images", status: "Green", tone: "success", points: "5417" },
  { name: "star_charts", status: "Yellow", tone: "warning", points: "9999999" },
  { name: "ecommerce_products", status: "Gray", tone: "neutral", points: "143456452" },
]

const gettingStarted = [
  { title: "Open the Console", description: "Run requests directly.", icon: CodeXml },
  { title: "View Quickstart Guide", description: "Start working with your data.", icon: BookMarked },
  { title: "Explore Tutorials", description: "Learn Qdrant with interactive examples.", icon: BookText },
]

// Status dots from the palette: 400 on dark, 600 on light. The label says the status too, so color is never the
// only cue.
const dots: Record<Tone, string> = {
  success: "bg-teal-400 light:bg-teal-600",
  warning: "bg-orange-400 light:bg-orange-600",
  neutral: "bg-muted-foreground",
}

function StatusBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <Badge variant="outline">
      <span aria-hidden className={cn("size-1.5 rounded-full", dots[tone])} />
      {children}
    </Badge>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      onClick={() => {
        void navigator.clipboard?.writeText(value)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}

function Sparkline({ label, color, curve, points }: (typeof stats)[number]) {
  const config = { value: { label, color } } satisfies ChartConfig
  const data = points.map((value, i) => ({ i, value }))
  const id = label.replace(/\W+/g, "-").toLowerCase()
  return (
    <ChartContainer config={config} className="aspect-auto h-16 w-full">
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          dataKey="value"
          type={curve}
          stroke="var(--color-value)"
          strokeWidth={1.5}
          fill={`url(#fill-${id})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2">{children}</dd>
    </div>
  )
}

export function ServerlessSpace() {
  return (
    <CloudShell active="Serverless Spaces">
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <DatabaseZap aria-hidden className="text-muted-foreground size-6" />
              <h1 className="text-2xl font-semibold">extra-brown-leech</h1>
              <StatusBadge tone="success">Healthy</StatusBadge>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-medium">Labels</span>
              <div className="flex flex-wrap gap-2">
                {labels.map((label, i) => (
                  <Badge key={label} variant="secondary">
                    {i === 0 && <CircleDollarSign aria-hidden />}
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* No icon in a call-to-action button (design-system/AGENTS.md), so the Figma's plus is left out. */}
            <Button>Create Collection</Button>
            <Button variant="ghost" size="icon" aria-label="More actions" title="More actions">
              <Ellipsis />
            </Button>
          </div>
        </header>

        <Tabs defaultValue="Overview">
          <TabsList variant="line" className="w-full justify-start border-b">
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="flex-none">
                {tab}
              </TabsTrigger>
            ))}
            <TabsTrigger value="Alerts" className="flex-none">
              Alerts
              <Badge variant="secondary">2</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Overview" className="flex flex-col gap-4 pt-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
              <Card>
                <CardHeader>
                  <CardDescription>Collections</CardDescription>
                  <div className="text-2xl font-semibold">3</div>
                  <p className="text-teal-400 light:text-teal-600">+1 this week</p>
                </CardHeader>
              </Card>
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardHeader>
                    <CardDescription>{stat.label}</CardDescription>
                    <div className="text-2xl font-semibold">{stat.value}</div>
                  </CardHeader>
                  <CardContent>
                    <Sparkline {...stat} />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_--spacing(90)]">
              <div className="flex min-w-0 flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="flex items-start justify-between gap-6">
                      <Field label="Endpoint">
                        <span className="truncate">https://serverless.eu-central.cloud.qdrant.io</span>
                        <CopyButton value="https://serverless.eu-central.cloud.qdrant.io" label="Copy endpoint" />
                      </Field>
                      <Field label="Region" className="shrink-0">
                        <span>🇩🇪 Frankfurt</span>
                      </Field>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Collections</CardTitle>
                    <CardAction>
                      <Button variant="link" size="sm">
                        View All
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Points (approx)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {collections.map((c) => (
                          <TableRow key={c.name}>
                            <TableCell>{c.name}</TableCell>
                            <TableCell>
                              <StatusBadge tone={c.tone}>{c.status}</StatusBadge>
                            </TableCell>
                            <TableCell className="text-right">{c.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Connect</CardTitle>
                    <CardDescription>Use the Qdrant API to add, query, and manage vector data effortlessly.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl>
                      <Field label="Endpoint">
                        <span className="truncate">https://417e7581-4aad-4627-8bf5-66c4fda3b364.eu-...</span>
                        <CopyButton value="https://417e7581-4aad-4627-8bf5-66c4fda3b364.eu-..." label="Copy endpoint" />
                      </Field>
                    </dl>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline">Connect</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ItemGroup>
                      {gettingStarted.map(({ title, description, icon: Icon }) => (
                        <Item key={title} className="px-0">
                          <ItemMedia variant="icon" className="bg-muted size-10 rounded-full">
                            <Icon />
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle>{title}</ItemTitle>
                            <ItemDescription>{description}</ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <ArrowRight aria-hidden className="text-muted-foreground size-4" />
                          </ItemActions>
                        </Item>
                      ))}
                    </ItemGroup>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CloudShell>
  )
}
