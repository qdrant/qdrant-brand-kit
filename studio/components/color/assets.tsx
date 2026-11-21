import Image from "next/image"
import { ArrowRight, CalendarDays, Check, Clock, Info, MapPin } from "lucide-react"

import { cn } from "@qdrant/design-system/lib/utils"

// Example assets for the Color page's Assets tab. Every color in them is a semantic token (--sem-*, from the
// panel), so changing a token changes every asset, in both themes. The copy is the studio's sample sentence and
// placeholders.

const SAMPLE = "High-Performance Vector Search at Scale"

const assets = [
  {
    id: "post",
    name: "Event post",
    tests:
      "A 1:1 social post: the base, a raised card outlined in border/subtle, the kicker on accent/subtle, icons in accent/text and the button on accent/primary.",
    Asset: EventPost,
  },
  {
    id: "update",
    name: "Product update",
    tests:
      "Web UI on the four surfaces, outlined in border/subtle: tags, status badges, an alert, a field with buttons, a menu with a selected item, and a meter.",
    Asset: ProductUpdate,
  },
  {
    id: "slide",
    name: "Chart slide",
    tests:
      "A 16:9 slide with a bar chart in dataviz/1 to 3, gridlines in border/default and a highlighted column.",
    Asset: ChartSlide,
  },
]

export function ColorAssets() {
  return (
    <div className="flex flex-col gap-12">
      {assets.map(({ id, name, tests, Asset }) => (
        <section key={id} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">{name}</h2>
            <p className="max-w-3xl text-sm text-muted-foreground">{tests}</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {(["light", "dark"] as const).map((mode) => (
              <figure key={mode} className="flex min-w-0 flex-col gap-2">
                <figcaption className="font-mono text-xs text-muted-foreground uppercase">{mode}</figcaption>
                <div data-theme={mode} className="color-asset overflow-hidden rounded-lg border">
                  <Asset />
                </div>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// The logo for the asset's theme: the light wordmark on dark, the dark one on light.
function Logo({ className }: { className?: string }) {
  return (
    <>
      <Image
        src="/repo/brand-assets/logo/qdrant-logo-dark.svg"
        alt="Qdrant"
        width={96}
        height={28}
        className={cn("w-auto self-start light:hidden", className)}
      />
      <Image
        src="/repo/brand-assets/logo/qdrant-logo-light.svg"
        alt="Qdrant"
        width={96}
        height={28}
        className={cn("hidden w-auto self-start light:block", className)}
      />
    </>
  )
}

// A 1:1 post, sized in container units so it keeps its proportions at any width, like a creative.
function EventPost() {
  const rows = [
    { Icon: CalendarDays, label: "Date", value: "Weekday, Month 00" },
    { Icon: Clock, label: "Time", value: "00:00" },
    { Icon: MapPin, label: "Place", value: "City or online" },
  ]
  return (
    <div className="@container">
      <div className="flex aspect-square flex-col justify-between bg-(--sem-background-default) p-[7cqw] text-(--sem-text-primary)">
        <Logo className="h-[4.5cqw]" />
        <div className="flex flex-col gap-[3cqw]">
          <span className="w-fit rounded-[0.8cqw] bg-(--sem-accent-subtle) px-[1.8cqw] py-[0.7cqw] font-mono text-[2.4cqw] text-(--sem-accent-text) uppercase">
            Kicker
          </span>
          <h3 className="text-[7cqw] leading-[1.08]">{SAMPLE}</h3>
          <p className="max-w-[80%] text-[3cqw] leading-[1.45] text-(--sem-text-secondary)">
            Supporting text in text/secondary, one or two lines under the title.
          </p>
        </div>
        <div className="flex items-end justify-between gap-[3cqw]">
          <dl className="flex flex-col gap-[1.6cqw] rounded-[1.6cqw] border border-(--sem-border-subtle) bg-(--sem-background-raised) p-[2.8cqw] text-[2.6cqw]">
            {rows.map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-[1.6cqw]">
                <Icon className="size-[3.2cqw] text-(--sem-accent-text)" strokeWidth={1.75} />
                <dt className="w-[9cqw] text-(--sem-text-secondary)">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <span className="rounded-[1cqw] bg-(--sem-accent-primary) px-[3.6cqw] py-[1.8cqw] text-[2.8cqw] font-semibold text-(--sem-text-on-accent)">
            Button
          </span>
        </div>
      </div>
    </div>
  )
}

const statuses = ["success", "error", "warning", "info"] as const

// Web UI on the four surfaces, at its real size.
function ProductUpdate() {
  return (
    <div className="flex flex-col gap-5 bg-(--sem-background-default) p-6 text-sm text-(--sem-text-primary)">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-xs text-(--sem-accent-text) uppercase">Kicker</span>
          <h3 className="text-xl leading-tight">Section title</h3>
        </div>
        <span className="inline-flex items-center gap-1 text-(--sem-accent-text) underline-offset-4 hover:underline">
          Link <ArrowRight className="size-4" />
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {["Tag", "Tag", "Tag"].map((tag, i) => (
          <span
            key={i}
            className="rounded-full bg-(--sem-accent-secondary-subtle) px-2.5 py-0.5 text-xs text-(--sem-accent-secondary-text)"
          >
            {tag}
          </span>
        ))}
        {statuses.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs capitalize"
            style={{ background: `var(--sem-status-${s}-subtle)`, color: `var(--sem-status-${s})` }}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {s}
          </span>
        ))}
      </div>

      <div className="flex gap-3 rounded-md bg-(--sem-status-info-subtle) p-3">
        <Info className="mt-0.5 size-4 shrink-0 text-(--sem-status-info)" />
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">Alert title</span>
          <span className="text-(--sem-text-secondary)">Supporting text for the alert, in text/secondary.</span>
        </div>
      </div>

      <div className="relative grid gap-4 sm:grid-cols-[minmax(0,1fr)_176px]">
        <div className="flex flex-col gap-3 rounded-lg border border-(--sem-border-subtle) bg-(--sem-background-raised) p-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">Label</span>
            <span className="flex h-9 items-center rounded-md border border-(--sem-border-strong) bg-(--sem-background-raised) px-3 text-(--sem-text-disabled)">
              Placeholder
            </span>
            <span className="text-xs text-(--sem-text-secondary)">Helper text</span>
          </label>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-(--sem-text-secondary)">Meter</span>
              <span className="font-mono">64%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-(--sem-background-highlight)">
              <div className="h-full w-[64%] rounded-full bg-(--sem-accent-secondary)" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="rounded-md bg-(--sem-accent-primary) px-3.5 py-2 font-medium text-(--sem-text-on-accent) hover:bg-(--sem-accent-primary-hover)">
              Button
            </span>
            <span className="rounded-md border border-(--sem-border-strong) px-3.5 py-2 font-medium hover:bg-(--sem-background-highlight)">
              Button
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 self-start rounded-lg border border-(--sem-border-subtle) bg-(--sem-background-overlay) p-1 shadow-lg">
          <span className="rounded-sm px-2 py-1.5">Menu item</span>
          <span className="flex items-center justify-between rounded-sm bg-(--sem-background-highlight) px-2 py-1.5">
            Selected item <Check className="size-4 text-(--sem-accent-text)" />
          </span>
          <span className="rounded-sm px-2 py-1.5">Menu item</span>
          <span className="rounded-sm px-2 py-1.5 text-(--sem-text-disabled)">Disabled item</span>
        </div>
      </div>
    </div>
  )
}

// Sample values, as a share of the chart's height.
const series = [
  [42, 64, 30],
  [55, 78, 41],
  [38, 59, 27],
  [61, 88, 48],
]

// A 16:9 slide, sized in container units.
function ChartSlide() {
  return (
    <div className="@container">
      <div className="flex aspect-video flex-col gap-[3cqw] bg-(--sem-background-default) p-[5cqw] text-(--sem-text-primary)">
        <div className="flex items-start justify-between gap-[3cqw]">
          <div className="flex flex-col gap-[1cqw]">
            <span className="font-mono text-[1.6cqw] text-(--sem-accent-text) uppercase">Kicker</span>
            <h3 className="text-[3.6cqw] leading-tight">Chart title</h3>
          </div>
          <div className="flex gap-[2cqw] pt-[0.6cqw] text-[1.5cqw] text-(--sem-text-secondary)">
            {[1, 2, 3].map((n) => (
              <span key={n} className="flex items-center gap-[0.7cqw]">
                <span className="size-[1.3cqw] rounded-[0.3cqw]" style={{ background: `var(--sem-dataviz-${n})` }} />
                Series {n}
              </span>
            ))}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[4cqw_minmax(0,1fr)] gap-x-[1.5cqw]">
          <div className="flex flex-col justify-between pb-[3cqw] text-right font-mono text-[1.3cqw] text-(--sem-text-secondary)">
            {[100, 75, 50, 25, 0].map((v) => (
              <span key={v} className="leading-none">
                {v}
              </span>
            ))}
          </div>
          <div className="flex min-h-0 flex-col">
            <div className="relative grid flex-1 grid-cols-4 gap-[3cqw] border-b border-(--sem-border-strong) px-[1.5cqw]">
              {[0, 25, 50, 75].map((v) => (
                <span
                  key={v}
                  className="absolute inset-x-0 border-t border-(--sem-border-default)"
                  style={{ top: `${v}%` }}
                />
              ))}
              {series.map((group, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative flex items-end gap-[0.6cqw] rounded-t-[0.6cqw] px-[0.8cqw]",
                    i === 3 && "bg-(--sem-background-highlight)"
                  )}
                >
                  {group.map((v, s) => (
                    <span
                      key={s}
                      className="flex-1 rounded-t-[0.3cqw]"
                      style={{ height: `${v}%`, background: `var(--sem-dataviz-${s + 1})` }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="grid h-[3cqw] grid-cols-4 gap-[3cqw] px-[1.5cqw] pt-[0.8cqw] text-center font-mono text-[1.3cqw] text-(--sem-text-secondary)">
              {["A", "B", "C", "D"].map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          </div>
        </div>

        <span className="self-end rounded-[0.6cqw] border border-(--sem-border-subtle) bg-(--sem-background-raised) px-[1.4cqw] py-[0.6cqw] text-[1.3cqw] text-(--sem-text-secondary)">
          Sample data
        </span>
      </div>
    </div>
  )
}
