"use client"

import type * as React from "react"
import {
  BookOpen,
  ChevronRight,
  ListFilter,
  Play,
  RectangleEllipsis,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@qdrant/design-system/components/ui/badge"
import { Button } from "@qdrant/design-system/components/ui/button"
import { Card } from "@qdrant/design-system/components/ui/card"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@qdrant/design-system/components/ui/sidebar"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@qdrant/design-system/components/ui/tabs"
import { cn } from "@qdrant/design-system/lib/utils"

import { Code } from "../lib/code"
import { Logo } from "../lib/logo"

// The Qdrant Web UI (home page, "Engineered for Builders", "Built-In Web UI & Visualizations"; design lead,
// 2026-11-26), rebuilt from the design system's components instead of the site's PNG screenshot. Product UI, so its
// accent is indigo (data-context="product"). The layout and labels follow the Web UI in the "Qdrant Cloud Design"
// Figma ("Cloud vs Web UI Audit": a 240px side menu with the logo, a top bar with "cluster / name", the Collections
// page), with our components, colors and Lucide icons. The side menu keeps only what the Web UI docs list
// (/documentation/web-ui/): Console, Collections and the Tutorial.
//
// The screen: the "products" collection's points, filtered by category as in the page's filter example, as a
// search's results with their scores; the first is open in a side panel with its payload and its vector. The
// points are made-up examples. 660 by 460; narrower than 576px (a phone), the side menu and the side panel drop out,
// so the text stays at its size (12px at least) instead of shrinking.

const nav: { label: string; icon: LucideIcon }[] = [
  { label: "Console", icon: SquareTerminal },
  { label: "Collections", icon: RectangleEllipsis },
  { label: "Tutorial", icon: BookOpen },
]

// The Console's side menu: secondary-gray items, the active one on the 16% indigo tint with an indigo icon
// (visuals/console.tsx).
const navButton =
  "h-8 text-sm text-muted-foreground data-active:bg-(--qd-color-indigo-400)/16 data-active:text-foreground data-active:[&_svg]:text-(--qd-color-indigo-400) light:data-active:bg-(--qd-color-indigo-600)/10 light:data-active:[&_svg]:text-(--qd-color-indigo-600)"

// The selected point: the Console's primary/main, indigo-400 on dark and indigo-600 on light, as a border over a
// 16% tint (visuals/console.tsx).
const selectedCard =
  "ring-(--qd-color-indigo-400) bg-(--qd-color-indigo-400)/16 light:ring-(--qd-color-indigo-600) light:bg-(--qd-color-indigo-600)/10"

const filter = `{"must": [{"key": "category",
  "match": {"value": "electronics"}}]}`
// The same filter in a narrow frame, on three lines.
const filterNarrow = `{"must": [{"key": "category",
  "match": {
    "value": "electronics"}}]}`

type Point = {
  id: number
  score: string
  name: string
  category: string
  price: number
}

const points: Point[] = [
  {
    id: 1042,
    score: "0.912",
    name: "Earbuds Pro",
    category: "electronics",
    price: 199,
  },
  {
    id: 2210,
    score: "0.887",
    name: "Smart Watch",
    category: "electronics",
    price: 249,
  },
  {
    id: 377,
    score: "0.861",
    name: "Bluetooth Speaker",
    category: "electronics",
    price: 89,
  },
  {
    id: 918,
    score: "0.843",
    name: "USB-C Charger",
    category: "electronics",
    price: 29,
  },
]

const selected = points[0]!

const payloadJson = `{
  "name": "${selected.name}",
  "category": "${selected.category}",
  "price": ${selected.price}
}`

// The Web UI's status badge: green, a dot and the word, success text on a 16% tint (visuals/console.tsx).
function StatusBadge() {
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-(--qd-color-teal-500)/16 text-(length:--qd-font-size-12) text-(--qd-color-teal-400) light:bg-(--qd-color-teal-50) light:text-(--qd-color-teal-800)"
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-(--qd-color-teal-500) light:bg-(--qd-color-teal-600)"
      />
      GREEN
    </Badge>
  )
}

function PointCard({ point, active }: { point: Point; active?: boolean }) {
  return (
    <Card
      size="sm"
      className={cn("gap-2 px-3 py-3 text-xs", active && selectedCard)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">Point {point.id}</span>
        <span className="font-mono text-muted-foreground">
          Score <span className="text-foreground">{point.score}</span>
        </span>
      </div>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 font-mono">
        {(["name", "category", "price"] as const).map((key) => (
          <div key={key} className="contents">
            <dt className="text-muted-foreground">{key}</dt>
            <dd className="truncate text-foreground">{point[key]}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

function WebUiScreen() {
  return (
    <SidebarProvider
      className="h-full min-h-0"
      style={{ "--sidebar-width": "9.5rem" } as React.CSSProperties}
    >
      <Sidebar collapsible="none" className="border-r @max-[36rem]:hidden">
        <SidebarHeader className="h-12 justify-center border-b px-4">
          <Logo className="h-6" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {nav.map(({ label, icon: Icon }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton
                    isActive={label === "Collections"}
                    className={navButton}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* The top bar: where you are, and the collection's status. */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 text-sm @max-[36rem]:px-3">
          <span className="text-muted-foreground">Collections</span>
          <ChevronRight
            aria-hidden
            className="size-3.5 text-muted-foreground"
          />
          <span className="font-medium text-foreground">products</span>
          <span className="ml-auto">
            <StatusBadge />
          </span>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pt-3 @max-[36rem]:px-3">
          <Tabs defaultValue="points">
            <TabsList>
              <TabsTrigger value="points">Points</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* The filter, as JSON, and the run button. */}
          <div className="flex items-start gap-2 rounded-md border bg-card px-3 py-2">
            <ListFilter
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-muted-foreground @max-[36rem]:hidden"
            />
            <pre className="min-w-0 flex-1 overflow-hidden font-mono text-xs leading-5 whitespace-pre @max-[36rem]:hidden">
              <Code code={filter} language="json" />
            </pre>
            <pre className="min-w-0 flex-1 overflow-hidden font-mono text-xs leading-5 whitespace-pre @min-[36rem]:hidden">
              <Code code={filterNarrow} language="json" />
            </pre>
            <Button size="sm" className="shrink-0 @max-[36rem]:hidden">
              <Play />
              Run
            </Button>
          </div>

          <div className="grid min-h-0 flex-1 gap-3 @min-[36rem]:grid-cols-[minmax(0,1fr)_15.5rem]">
            {/* The results: id, score and a short payload. */}
            <div className="flex min-w-0 flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                {points.length} points <span className="mx-1">·</span> category
                = electronics
              </p>
              {points.map((point) => (
                <PointCard
                  key={point.id}
                  point={point}
                  active={point.id === selected.id}
                />
              ))}
            </div>

            {/* The open point: its payload and its vector. */}
            <Card
              size="sm"
              className="gap-3 self-start px-3 py-3 text-xs @max-[36rem]:hidden"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  Point {selected.id}
                </span>
                <span className="font-mono text-muted-foreground">
                  Score{" "}
                  <span className="text-foreground">{selected.score}</span>
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-medium text-muted-foreground">
                  Payload
                </span>
                <pre className="overflow-hidden rounded-md border bg-background px-2 py-2 font-mono text-xs leading-5">
                  <Code code={payloadJson} language="json" />
                </pre>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-medium text-muted-foreground">
                  Vectors
                </span>
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 rounded-md border bg-background px-2 py-2 font-mono">
                  <dt className="text-muted-foreground">name</dt>
                  <dd className="text-foreground">text</dd>
                  <dt className="text-muted-foreground">length</dt>
                  <dd className="text-foreground">384</dd>
                </dl>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

// The screen at its own size, cropped at the bottom like a window onto the app.
export function WebUi() {
  return (
    <div
      role="img"
      aria-label="Qdrant Web UI: the products collection's points, filtered by category, with one point's payload and vector open"
      data-context="product"
      className="@container relative h-[460px] w-[660px] max-w-full overflow-hidden rounded-lg border bg-background text-foreground"
    >
      <div inert className="h-full">
        <WebUiScreen />
      </div>
    </div>
  )
}
