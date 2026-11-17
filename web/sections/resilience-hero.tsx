import { Check, CloudSync, Rocket } from "lucide-react"

import { Button } from "@qdrant/design-system/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@qdrant/design-system/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@qdrant/design-system/components/ui/field"
import { Input } from "@qdrant/design-system/components/ui/input"
import {
  RadioGroup,
  RadioGroupItem,
} from "@qdrant/design-system/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@qdrant/design-system/components/ui/select"
import { Toggle } from "@qdrant/design-system/components/ui/toggle"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@qdrant/design-system/components/ui/toggle-group"
import { cn } from "@qdrant/design-system/lib/utils"

import { CloudLogo } from "@qdrant/web/lib/cloud-logo"
import { Section } from "@qdrant/web/lib/section"
import { type } from "@qdrant/web/lib/type"

// The Resilience page's hero (Figma: Qdrant Web Design, "Hero", node 19452:25126): the heading and calls to action
// on the left, and the Console's "Create a Cluster" screen on the right. The Figma gives no hrefs for the two
// buttons, so they have none here.
export function ResilienceHero() {
  return (
    <Section>
      <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,1fr)_450px]">
        <div className="flex flex-col items-start gap-8">
          <div className="flex flex-col gap-4">
            <p className={type.kicker}>QDRANT CLOUD</p>
            <h1 className={type.h3}>
              Production-Ready Resilience, Managed on Qdrant Cloud
            </h1>
          </div>
          <p className={type.lead}>
            Go from single-node to fully replicated high availability in the
            Console. Add Multi-AZ on the Premium tier for zone-level resilience
            and an uptime SLA of up to 99.95%, and the cluster stays available
            through a full availability-zone outage.
          </p>
          <div className="flex flex-wrap gap-6">
            <Button size="lg">Start Free</Button>
            <Button variant="outline" size="lg">
              Read the Docs
            </Button>
          </div>
          <p className={type.xsmall}>
            Need four or five nines with contractual guarantees?{" "}
            <a
              href="https://qdrant.tech/contact-us/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Talk to our team
            </a>{" "}
            about Enterprise and Private Cloud.
          </p>
        </div>

        <HeroVisual />
      </div>
    </Section>
  )
}

// The Figma's window onto the Console: a 440×518 frame that crops the screen (its summary column falls outside),
// fading into the page at the bottom. From lg the frame hangs below the text column, into the section's
// padding, as in the Figma.
function HeroVisual() {
  return (
    <div className="relative mx-auto h-[518px] w-full max-w-[440px] lg:h-auto lg:self-stretch">
      <div
        data-context="product"
        className="absolute inset-x-0 top-0 h-[518px] overflow-hidden rounded-lg border bg-background text-foreground"
      >
        {/* The screen at its real size, zoomed to 60% to fit the frame, like the Figma's small console. */}
        <div inert className="w-[730px]" style={{ zoom: 0.6 }}>
          <CreateClusterScreen />
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-2 top-[217px] h-[347px] bg-linear-to-b from-transparent from-15% to-background to-80%"
      />
    </div>
  )
}

const clusterTypes = [
  { id: "hero-cluster-type-1", value: "dedicated-1" },
  { id: "hero-cluster-type-2", value: "dedicated-2" },
]

const clusterFeatures = [
  "High Availability with Unlimited Lifetime",
  "Standard Support & 99.5% Uptime SLA",
  "Horizontal & Vertical Scaling",
  "Backup and Disaster Recovery",
  "Inference in Cloud",
]

const providers = [
  { value: "aws" },
  { value: "google-cloud" },
  { value: "azure", disabled: true },
] as const

const regions: {
  name: string
  options: { label: string; selected?: boolean }[]
}[] = [
  {
    name: "Europe",
    options: [{ label: "🇩🇪 Frankfurt" }, { label: "🇨🇭 Zurich" }],
  },
  {
    name: "North America",
    options: [{ label: "🇺🇸 N. Virginia", selected: true }],
  },
  { name: "Asia Pacific", options: [{ label: "🇦🇺 Sidney" }] },
]

const versions = [{ value: "v1.13.6", label: "v1.13.6 (default)" }]

// The Figma's selected state, as the nearest palette color (dark) with its light-theme step: the Console's
// primary/main #9494FF (indigo-400 on dark, indigo-600 on light) as a border over a 16% tint.
const selected =
  "aria-pressed:border-(--qd-color-indigo-400) aria-pressed:bg-(--qd-color-indigo-400)/16 light:aria-pressed:border-(--qd-color-indigo-600) light:aria-pressed:bg-(--qd-color-indigo-600)/10"

// "Create a Cluster" in the Console (Figma node 20868:124485), with the design system's components and the
// Figma's copy. Product UI, so its accent is indigo.
function CreateClusterScreen() {
  return (
    <div className="flex flex-col">
      <div className="flex h-14 items-center border-b bg-card px-6">
        <p className="text-(length:--qd-font-size-20) font-semibold">
          Create a Cluster
        </p>
      </div>

      <div className="flex flex-col gap-6 px-6 pt-8">
        <RadioGroup defaultValue="dedicated-2" className="grid-cols-2 gap-4">
          {clusterTypes.map((cluster) => (
            <FieldLabel
              key={cluster.id}
              htmlFor={cluster.id}
              className="bg-card has-data-checked:border-(--qd-color-indigo-400) has-data-checked:bg-(--qd-color-indigo-400)/16 dark:has-data-checked:bg-(--qd-color-indigo-400)/16 light:has-data-checked:border-(--qd-color-indigo-600) light:has-data-checked:bg-(--qd-color-indigo-600)/10"
            >
              <Field orientation="horizontal">
                <FieldContent className="gap-3">
                  <div className="flex items-center gap-2">
                    {/* The Figma's rocket: #9494FF on a 12% tint. */}
                    <span className="flex size-6 items-center justify-center rounded-sm bg-(--qd-color-indigo-400)/12 text-(--qd-color-indigo-400) light:bg-(--qd-color-indigo-600)/10 light:text-(--qd-color-indigo-600)">
                      <Rocket aria-hidden className="size-3" />
                    </span>
                    <FieldTitle>Dedicated Cluster</FieldTitle>
                  </div>
                  <FieldDescription>
                    A production-ready cluster with everything in free and:
                  </FieldDescription>
                  <ul
                    className={cn(
                      type.xsmall,
                      "flex flex-col gap-2 text-foreground"
                    )}
                  >
                    {clusterFeatures.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check
                          aria-hidden
                          className="size-4 text-muted-foreground"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </FieldContent>
                <RadioGroupItem id={cluster.id} value={cluster.value} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>

        <Card>
          <CardHeader>
            <CardTitle>Cluster Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="hero-cluster-name">Name</FieldLabel>
              <Input id="hero-cluster-name" defaultValue="test" />
            </Field>
            <Field>
              <FieldLabel htmlFor="hero-cluster-version">
                Cluster Version
              </FieldLabel>
              <Select items={versions} defaultValue="v1.13.6">
                <SelectTrigger id="hero-cluster-version" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.value} value={version.value}>
                      {version.label}
                    </SelectItem>
                  ))}
                </SelectContent>
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
              className="w-full"
            >
              {providers.map((provider) => (
                <ToggleGroupItem
                  key={provider.value}
                  value={provider.value}
                  disabled={"disabled" in provider}
                  // The Figma's selected provider: a #6047FF border (the product accent) over the 16% tint.
                  className="flex-1 aria-pressed:border-primary aria-pressed:bg-(--qd-color-indigo-400)/16 light:aria-pressed:bg-(--qd-color-indigo-600)/10"
                >
                  <CloudLogo provider={provider.value} />
                </ToggleGroupItem>
              ))}
              {/* The Figma's own Hybrid Cloud icon isn't Lucide, so CloudSync stands in (as in Capabilities). */}
              <ToggleGroupItem
                value="hybrid-cloud"
                aria-label="Hybrid Cloud"
                disabled
                className="flex-1"
              >
                <CloudSync aria-hidden />
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="flex flex-col gap-4">
              <CardTitle>Region</CardTitle>
              <div className="flex flex-col gap-2">
                {regions.map((region) => (
                  <div key={region.name} className="flex items-center gap-2">
                    <span className={cn(type.xsmall, "w-22 shrink-0")}>
                      {region.name}
                    </span>
                    <div className="flex gap-2">
                      {region.options.map((option) => (
                        <Toggle
                          key={option.label}
                          variant="outline"
                          size="sm"
                          defaultPressed={option.selected}
                          className={cn(
                            "text-muted-foreground aria-pressed:text-foreground",
                            selected
                          )}
                        >
                          {option.label}
                        </Toggle>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
