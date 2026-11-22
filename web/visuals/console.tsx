"use client"

import * as React from "react"
import {
  Box,
  Calendar,
  ChevronsUpDown,
  CircleHelp,
  CloudSync,
  Copy,
  Cpu,
  CreditCard,
  DatabaseBackup,
  Ellipsis,
  HardDrive,
  Info,
  KeyRound,
  MemoryStick,
  Rocket,
  Server,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"

import {
  Alert,
  AlertDescription,
} from "@qdrant/design-system/components/ui/alert"
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
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@qdrant/design-system/components/ui/field"
import { Input } from "@qdrant/design-system/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@qdrant/design-system/components/ui/input-group"
import { Label } from "@qdrant/design-system/components/ui/label"
import { Progress } from "@qdrant/design-system/components/ui/progress"
import {
  Select,
  SelectTrigger,
  SelectValue,
} from "@qdrant/design-system/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@qdrant/design-system/components/ui/sidebar"
import { Switch } from "@qdrant/design-system/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@qdrant/design-system/components/ui/table"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@qdrant/design-system/components/ui/tabs"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@qdrant/design-system/components/ui/toggle-group"
import { cn } from "@qdrant/design-system/lib/utils"

import { type } from "../lib/type"

import { CloudLogo } from "../lib/cloud-logo"

// Qdrant Cloud Console screens (from the Resilience page's Figma, "Capabilities", node 20034:36551), rebuilt from
// the design system's components with the Figma's copy, scaled down and cropped like the Figma. They're product UI,
// so their accent is indigo (data-context="product"). Visuals for a section's `visual` slot: each export fills a
// 504px-tall frame and crops the screen at its right and bottom edges.

// Console mockups. Each is a picture of the product: one image for assistive tech, inert inside.

// Anchored at the Figma's offset (98, 92) inside the visual and cropped by its right and bottom edges.
function ConsoleFrame({
  label,
  className,
  children,
}: {
  label: string
  className: string
  children: React.ReactNode
}) {
  return (
    <div
      role="img"
      aria-label={label}
      data-context="product"
      className="absolute top-8 right-0 bottom-0 left-6 overflow-hidden rounded-tl-xl border-t border-l bg-background sm:top-22 sm:left-24"
    >
      <div inert className={className}>
        {children}
      </div>
    </div>
  )
}

// The Figma's colors in the console mockups, as the nearest palette colors (dark) with their light-theme steps.
// - Selected (cards, chips, nav, tabs): the Console's primary/main #9494FF, indigo-400 on dark and indigo-600
//   on light, as a border or text over a 16% tint. Colored text on light is 700.
// - Success #26A69A: teal-500 for the dot and the tint; its text and icons take teal-400, as colored text and
//   icons on dark take 400 or lighter (primitives/colors). Light: a 600 dot and icon, 800 text on 50.
// - Secondary #64B5F6 (stat icons, meters): blue-400 on dark, blue-600 on light.
const selected =
  "aria-pressed:border-(--qd-color-indigo-400) aria-pressed:bg-(--qd-color-indigo-400)/16 light:aria-pressed:border-(--qd-color-indigo-600) light:aria-pressed:bg-(--qd-color-indigo-600)/10"
const statIcon =
  "size-4 text-(--qd-color-blue-400) light:text-(--qd-color-blue-600)"
// The sidebar: secondary-gray items, the active one on the 16% tint with an indigo icon.
const navButton =
  "text-muted-foreground data-active:bg-(--qd-color-indigo-400)/16 data-active:text-foreground data-active:[&_svg]:text-(--qd-color-indigo-400) light:data-active:bg-(--qd-color-indigo-600)/10 light:data-active:[&_svg]:text-(--qd-color-indigo-600)"

// The Figma's status badge: success text on a 16% tint, no border.
function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-(--qd-color-teal-500)/16 text-(--qd-color-teal-400) dark:bg-(--qd-color-teal-500)/16 light:bg-(--qd-color-teal-50) light:text-(--qd-color-teal-800)"
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-(--qd-color-teal-500) light:bg-(--qd-color-teal-600)"
      />
      {children}
    </Badge>
  )
}

const regions = [
  {
    name: "North America",
    options: ["🇺🇸 N. Virginia", "🇺🇸 N. California", "🇺🇸 Oregon"],
    selected: "🇺🇸 N. Virginia",
  },
  { name: "Europe", options: ["🇩🇪 Frankfurt", "🇮🇪 Ireland", "🇬🇧 London"] },
  { name: "Asia", options: ["🇯🇵 Tokyo", "🇸🇬 Singapore", "🇮🇳 Mumbai"] },
  { name: "Australia", options: ["🇦🇺 Sidney"] },
]

// "Create a Cluster" (Figma 20251:35682): the console at 65%.
function CreateClusterMockup() {
  return (
    <ConsoleFrame
      label="Qdrant Cloud console: Create a Cluster"
      className="w-[706px] [zoom:0.65]"
    >
      <div className="flex h-12 items-center border-b pl-22">
        <p className="text-lg font-semibold">Create a Cluster</p>
      </div>
      <div className="flex w-150 flex-col gap-6 pt-8 pl-22">
        <Card>
          <CardHeader>
            <CardTitle>Cluster Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input defaultValue="test" />
            </Field>
            <Field>
              <FieldLabel>Cluster Version</FieldLabel>
              <Select
                items={[{ label: "v1.13.6 (default)", value: "v1.13.6" }]}
                defaultValue="v1.13.6"
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
              </Select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cloud Provider</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ToggleGroup
              variant="outline"
              defaultValue={["aws"]}
              className="grid w-full grid-cols-4"
            >
              {/* The Figma's selected provider: a #6047FF border (the product accent) over the 16% tint. */}
              <ToggleGroupItem
                value="aws"
                aria-label="AWS"
                className="aria-pressed:border-primary aria-pressed:bg-(--qd-color-indigo-400)/16 light:aria-pressed:bg-(--qd-color-indigo-600)/10"
              >
                <CloudLogo provider="aws" alt="" />
              </ToggleGroupItem>
              <ToggleGroupItem value="google-cloud" aria-label="Google Cloud">
                <CloudLogo provider="google-cloud" alt="" />
              </ToggleGroupItem>
              <ToggleGroupItem value="azure" aria-label="Azure">
                <CloudLogo provider="azure" alt="" />
              </ToggleGroupItem>
              <ToggleGroupItem value="hybrid-cloud">
                {/* The Figma's Hybrid Cloud icon is a cyan cloud (nearest cyan-500); icons take 400 on dark, 600 on light. */}
                <CloudSync
                  aria-hidden
                  className="text-(--qd-color-cyan-400) light:text-(--qd-color-cyan-600)"
                />
                Hybrid Cloud
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="flex flex-col gap-3">
              <CardTitle>Region</CardTitle>
              {regions.map((region) => (
                <div
                  key={region.name}
                  className="grid grid-cols-[--spacing(24)_1fr] items-center gap-2"
                >
                  <span className="text-muted-foreground">{region.name}</span>
                  <ToggleGroup
                    variant="outline"
                    size="sm"
                    defaultValue={region.selected ? [region.selected] : []}
                  >
                    {region.options.map((option) => (
                      <ToggleGroupItem
                        key={option}
                        value={option}
                        className={cn(
                          "text-muted-foreground aria-pressed:text-foreground",
                          selected
                        )}
                      >
                        {option}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cluster Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-8">
            <Field>
              <FieldLabel>
                High Availability
                <Info aria-hidden className="size-3.5 text-muted-foreground" />
              </FieldLabel>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <span>On</span>
                <span className="border-l pl-2 text-muted-foreground">
                  Qdrant cluster with zero-downtime upgrades.
                </span>
              </div>
            </Field>
            <Field>
              <FieldLabel>
                Nodes
                <Info aria-hidden className="size-3.5 text-muted-foreground" />
              </FieldLabel>
              <Select items={[{ label: "3", value: "3" }]} defaultValue="3">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
              </Select>
            </Field>
          </CardContent>
        </Card>
      </div>
    </ConsoleFrame>
  )
}

// The Figma's own icon for Hybrid Cloud isn't Lucide, so CloudSync stands in (as in the studio's CloudShell).
const nav: { label: string; icon: LucideIcon }[] = [
  { label: "Get Started", icon: Rocket },
  { label: "Clusters", icon: Server },
  { label: "Hybrid Cloud", icon: CloudSync },
  { label: "Backups", icon: DatabaseBackup },
  { label: "API Keys", icon: KeyRound },
]

const accountNav: { label: string; icon: LucideIcon }[] = [
  { label: "Access Management", icon: Users },
  { label: "Billing", icon: CreditCard },
  { label: "Settings", icon: Settings },
]

const clusterTabs = [
  "Overview",
  "API Keys",
  "Metrics",
  "Logs",
  "Backups",
  "Configuration",
  "Inference",
]

const sources = [
  "Other Qdrant instances",
  "Pinecone",
  "Elastic",
  "MongoDB",
  "And more",
]

// The node row's three meters, copy as in the Figma.
const meters = [
  { label: "2.00 MiB of 4.00 GiB", value: 6 },
  { label: "2.00 GiB of 4.00 GiB", value: 6 },
  { label: "2.00 vCPUs of 4.00 vCPUs", value: 5 },
]

function Stat({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2">{children}</dd>
    </div>
  )
}

// A cluster's overview (Figma 20251:35732): the console at 50%. The sidebar's Qdrant logo is left out: at
// this scale it would render about 14px tall, under the logo's 24px minimum (brand-assets/logo).
function ClusterOverviewMockup() {
  return (
    <ConsoleFrame
      label="Qdrant Cloud console: a cluster's overview"
      className="w-230 [zoom:0.5]"
    >
      <SidebarProvider
        className="h-235 min-h-0"
        style={{ "--sidebar-width": "14rem" } as React.CSSProperties}
      >
        <Sidebar collapsible="none" className="border-r">
          <SidebarHeader className="h-14 border-b" />
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {nav.map(({ label, icon: Icon }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      isActive={label === "Clusters"}
                      className={navButton}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="uppercase">
                account
              </SidebarGroupLabel>
              <SidebarMenu>
                {accountNav.map(({ label, icon: Icon }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton className={navButton}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className={navButton}>
                  <CircleHelp />
                  <span>Get Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center border-b px-6">
            <Button variant="outline" size="sm">
              <Users aria-hidden />
              John Doe’s Account
              <ChevronsUpDown aria-hidden />
            </Button>
          </header>

          <div className="flex flex-col px-8 pt-4">
            <div className="flex items-center gap-2 py-6">
              <p className="text-xl font-semibold">ultimate-cluster-name</p>
              <StatusBadge>Healthy</StatusBadge>
            </div>

            <Tabs defaultValue="Overview">
              <TabsList
                variant="line"
                className="w-full justify-start border-b"
              >
                {clusterTabs.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="flex-none after:bg-(--qd-color-indigo-400) data-active:text-(--qd-color-indigo-400) light:after:bg-(--qd-color-indigo-600) light:data-active:text-(--qd-color-indigo-700)"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex w-164 flex-col gap-4 pt-4">
              <Card>
                <CardContent className="flex flex-col gap-4">
                  <dl className="grid grid-cols-[1fr_auto_auto] gap-x-10">
                    <Stat label="Cluster ID">
                      <span className="truncate">
                        417e7581-4aad-4627-8bf5-66c4fda3b364
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Copy cluster ID"
                      >
                        <Copy className="text-muted-foreground" />
                      </Button>
                    </Stat>
                    <Stat label="Version">v1.13.6</Stat>
                    <Stat label="Cloud Provider">
                      <CloudLogo provider="aws" className="size-4" />
                      some-region
                    </Stat>
                  </dl>
                  <dl className="flex gap-6">
                    <Stat label="Nodes">
                      <Box aria-hidden className={statIcon} />1
                    </Stat>
                    <Stat label="Disk">
                      <HardDrive aria-hidden className={statIcon} />
                      8GiB
                    </Stat>
                    <Stat label="RAM">
                      <MemoryStick aria-hidden className={statIcon} />
                      2GiB
                    </Stat>
                    <Stat label="vCPU">
                      <Cpu aria-hidden className={statIcon} />
                      0.5
                    </Stat>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Update Cluster</CardTitle>
                  <CardDescription>
                    A new Qdrant version is available!
                    <br />
                    Check out the release notes{" "}
                    <span className="text-(--qd-color-indigo-400) underline underline-offset-4 light:text-(--qd-color-indigo-700)">
                      here
                    </span>{" "}
                    to discover what&apos;s new.
                  </CardDescription>
                  <CardAction className="flex items-end gap-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-muted-foreground">Version</Label>
                      <Select
                        items={[{ label: "v1.15.5", value: "v1.15.5" }]}
                        defaultValue="v1.15.5"
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                      </Select>
                    </div>
                    {/* No icon in a call-to-action button (design-system/AGENTS.md), so the Figma's icon is left out. */}
                    <Button variant="outline">Update</Button>
                  </CardAction>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Get Started with Your Data</CardTitle>
                  <CardAction className="flex gap-2">
                    <Button size="sm">Create Collection</Button>
                    <Button size="sm" variant="outline">
                      Migrate Your Data
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-muted-foreground">
                    Create a new collection to start storing vectors and
                    metadata. Or migrate existing data using our Migration Tool
                    from sources like:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((source) => (
                      <Badge key={source} variant="secondary">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="gap-0 py-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>node</TableHead>
                      <TableHead>ram</TableHead>
                      <TableHead>cpu</TableHead>
                      <TableHead>disk</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <Box
                            aria-hidden
                            className="size-4 text-(--qd-color-teal-400) light:text-(--qd-color-teal-600)"
                          />
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">#0</span>
                              <StatusBadge>Healthy</StatusBadge>
                            </div>
                            <span className="text-muted-foreground">
                              v1.13.6
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      {meters.map((meter, i) => (
                        <TableCell key={i}>
                          <div className="flex w-32 flex-col gap-1">
                            <span className="text-muted-foreground">
                              {meter.label}
                            </span>
                            <Progress
                              value={meter.value}
                              aria-label={meter.label}
                              className="**:data-[slot=progress-indicator]:bg-(--qd-color-blue-400) light:**:data-[slot=progress-indicator]:bg-(--qd-color-blue-600)"
                            />
                          </div>
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="More actions"
                        >
                          <Ellipsis />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ConsoleFrame>
  )
}

// "Set up Backup Schedule" (Figma 20034:36655): a dialog-looking Card in a faint frame, at 75% (55% on
// phones) so its buttons clear the Honest Note, which sits over its bottom edge.
function BackupScheduleMockup() {
  return (
    <>
      <div className="absolute inset-x-0 top-10 flex justify-center">
        <div
          role="img"
          aria-label="Qdrant Cloud console: Set up Backup Schedule dialog"
          data-context="product"
        >
          <div
            inert
            className="rounded-t-2xl bg-foreground/5 p-4 [zoom:0.55] sm:[zoom:0.75]"
          >
            <Card className="w-128">
              <CardHeader>
                <CardTitle>Set up Backup Schedule</CardTitle>
                <CardDescription>
                  Setting a backup schedule will enable backups for your
                  cluster. Scheduled backups are retained for 1 year.
                </CardDescription>
                <CardAction>
                  <Button variant="ghost" size="icon-sm" aria-label="Close">
                    <X />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* The Figma's info alert: a dark blue tint (#0C2029), light blue text (#B8E7FB) and icon
                    (#29B6F6), no border. Light: 800 text on 50, the icon at 600. */}
                <Alert className="border-transparent bg-(--qd-color-blue-950) text-(--qd-color-blue-400) light:bg-(--qd-color-blue-50) light:text-(--qd-color-blue-600)">
                  <Info aria-hidden />
                  <AlertDescription className="text-(--qd-color-blue-200) light:text-(--qd-color-blue-800)">
                    Scheduling backups will cause additional charges to your
                    account that depend on the cloud provider and region.{" "}
                    <a>Learn more</a>
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                  <Field>
                    <FieldLabel>Backup Name</FieldLabel>
                    <Input placeholder="Name" />
                  </Field>
                  <Field>
                    <FieldLabel>Cluster</FieldLabel>
                    <Select items={[{ label: "Select cluster", value: null }]}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Frequency</FieldLabel>
                    <Select
                      items={[{ label: "Daily", value: "daily" }]}
                      defaultValue="daily"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Start Time</FieldLabel>
                    <InputGroup>
                      <InputGroupInput defaultValue="1:00 AM (UTC+05:21)" />
                      <InputGroupAddon align="inline-end">
                        <Calendar aria-hidden />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                  <Field className="col-span-2">
                    <FieldLabel>Days of Retention</FieldLabel>
                    <Input defaultValue="30" />
                    <FieldDescription>
                      Retention period must be between 1 and 365 days.
                    </FieldDescription>
                  </Field>
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t">
                <Button variant="outline">Cancel</Button>
                <Button>Set Backup Schedule</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* "Note-Card" (20034:36707): its left edge is the Figma's teal #038585, teal-600. */}
      <div className="absolute inset-x-0 bottom-0 border-t border-l-2 border-l-(--qd-color-teal-600) bg-card px-6 py-4">
        <p className={type.xsmall}>
          <strong className="font-semibold text-foreground">Honest Note</strong>{" "}
          Backups protect against data loss; they are not a fast-failover
          substitute. For low recovery time, run replicated and Multi-AZ. For
          planned data-center switchovers or full region loss, talk to us about
          an active-active pattern.
        </p>
      </div>
    </>
  )
}

// A frame for a console screen, 504px tall (the Figma's 557 by 504), the screen anchored inside it.
function Frame({ children }: { children: React.ReactNode }) {
  return <div className="relative isolate h-[504px] w-full overflow-hidden">{children}</div>
}

// "Create a Cluster": cloud provider and region.
export function ConsoleCreateCluster() {
  return (
    <Frame>
      <CreateClusterMockup />
    </Frame>
  )
}

// A cluster's overview: its nodes, their health and usage.
export function ConsoleClusterOverview() {
  return (
    <Frame>
      <ClusterOverviewMockup />
    </Frame>
  )
}

// "Set up Backup Schedule": a dialog.
export function ConsoleBackupSchedule() {
  return (
    <Frame>
      <BackupScheduleMockup />
    </Frame>
  )
}
