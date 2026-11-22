"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import type { BenchmarkData, BenchmarkEngine, BenchmarkMetricId } from "../content/platform"
import { ArrowLink } from "../lib/arrow-link"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { type } from "../lib/type"

export type BenchmarkChartProps = SectionProps & {
  header: HeaderProps
  data: BenchmarkData
  // The engine drawn in indigo; the others stay neutral.
  highlight?: BenchmarkEngine
  // How the page explains its method, and where its raw data is.
  methodology?: Link
  rawData?: Link
  // The first precision stop shown.
  defaultPrecision?: string
  // bars: one horizontal bar per engine, the best first.
  layout?: "bars"
}

// A segmented switch for one choice: mono labels, the active one on the highlight with an indigo mark under it.
function Switch<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className={cn(type.xsmall, "font-mono uppercase")}>{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
        {options.map((o) => {
          const on = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={cn(
                "relative rounded-md border px-3 py-1.5 font-mono text-xs outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)",
                on
                  ? "border-(--web-line-strong) bg-muted text-foreground"
                  : "border-(--web-line) text-muted-foreground hover:text-foreground"
              )}
            >
              {o.label}
              {on && <span aria-hidden className="absolute inset-x-3 -bottom-px h-px bg-(--web-indigo)" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// An interactive benchmark (2026-11-21): dataset tabs, a metric and a precision switch, and one horizontal bar per
// engine, the best first. The highlighted engine is indigo, the others neutral; never the accent. Only published
// figures, with a link to how they were measured.
export function BenchmarkChart({
  header,
  data,
  highlight = "qdrant",
  methodology,
  rawData,
  defaultPrecision,
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: BenchmarkChartProps) {
  const [datasetId, setDatasetId] = React.useState(data.datasets[0]?.id ?? "")
  const [metricId, setMetricId] = React.useState<BenchmarkMetricId>(data.metrics[0]?.id ?? "rps")
  const [precision, setPrecision] = React.useState(defaultPrecision ?? data.precisions[0] ?? "")

  const dataset = data.datasets.find((d) => d.id === datasetId) ?? data.datasets[0]
  const metric = data.metrics.find((m) => m.id === metricId) ?? data.metrics[0]
  const values = (dataset && metric && data.results[dataset.id]?.[precision]?.[metric.id]) || {}
  const rows = (Object.entries(values) as [BenchmarkEngine, number][]).sort((a, b) =>
    metric?.lowerIsBetter ? a[1] - b[1] : b[1] - a[1]
  )
  const max = Math.max(...rows.map(([, v]) => v), 0)

  return (
    <Section
      theme={theme}
      surface={surface}
      pattern={pattern}
      cardPattern={cardPattern}
      id={id}
      className={className}
      innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)"
    >
      <SectionHeader kicker={header.kicker} title={header.title} description={header.description} />

      <div className="web-tray rounded-[calc(var(--radius-xl)+6px)]">
        <Plate as="figure" className="flex min-w-0 flex-col rounded-xl">
          {/* Dataset tabs */}
          <div role="tablist" aria-label="Dataset" className="flex gap-1 overflow-x-auto border-b border-(--web-line) px-2">
            {data.datasets.map((d) => {
              const on = d.id === dataset?.id
              return (
                <button
                  key={d.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setDatasetId(d.id)}
                  className={cn(
                    "relative shrink-0 px-3 py-3.5 font-mono text-xs whitespace-nowrap outline-none focus-visible:underline",
                    on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d.id}
                  {on && <span aria-hidden className="absolute inset-x-3 -bottom-px h-0.5 bg-(--web-indigo)" />}
                </button>
              )
            })}
          </div>

          {/* The dataset's facts and the switches */}
          <div className="flex flex-col gap-6 border-b border-(--web-line) p-5 md:flex-row md:items-end md:justify-between md:p-6">
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
              {dataset && (
                <>
                  <span>
                    <span className="text-foreground">{dataset.vectors}</span> vectors
                  </span>
                  <span>
                    <span className="text-foreground">{dataset.dimensions}</span> dimensions
                  </span>
                  <span>
                    <span className="text-foreground">{dataset.distance}</span> distance
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-6">
              <Switch
                label="Plot values"
                options={data.metrics.map((m) => ({ value: m.id, label: m.label }))}
                value={metricId}
                onChange={setMetricId}
              />
              <Switch
                label="Precision"
                options={data.precisions.map((p) => ({ value: p, label: `≥ ${p}` }))}
                value={precision}
                onChange={setPrecision}
              />
            </div>
          </div>

          {/* Bars */}
          <figcaption className="sr-only">
            {metric?.label} on {dataset?.id} at precision {precision} or higher
          </figcaption>
          <ol className="flex flex-col gap-4 p-5 md:p-6">
            {rows.map(([engine, value], i) => {
              const on = engine === highlight
              const width = max > 0 ? Math.max((value / max) * 100, 1.5) : 0
              return (
                <li
                  key={engine}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 md:grid-cols-[9rem_minmax(0,1fr)_7rem]"
                >
                  <span className={cn("flex items-center gap-2 text-sm", on ? "text-foreground" : "text-muted-foreground")}>
                    <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    {data.engines[engine]}
                  </span>
                  <span className="col-span-2 row-start-2 h-3 overflow-hidden rounded-xs bg-(--web-tray) md:col-span-1 md:row-start-auto">
                    <span
                      className={cn(
                        "block h-full rounded-xs transition-[width] duration-500 ease-out",
                        on ? "bg-(--web-indigo)" : "bg-(--web-line-strong)"
                      )}
                      style={{ width: `${width}%` }}
                    />
                  </span>
                  <span
                    className={cn(
                      "col-start-2 row-start-1 text-right font-mono text-sm tabular-nums md:col-start-3",
                      on ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {value.toLocaleString("en-US")} <span className="text-xs text-muted-foreground">{metric?.unit}</span>
                  </span>
                </li>
              )
            })}
          </ol>

          {/* Footer: how to read it, and the method */}
          <div className="flex flex-col gap-3 border-t border-(--web-line) px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <p className={cn(type.xsmall, "font-mono")}>
              {metric?.lowerIsBetter ? "Lower is better" : "Higher is better"} · {metric?.threads}{" "}
              {metric?.threads === 1 ? "search thread" : "search threads"} · {data.updated}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {methodology && (
                <ArrowLink href={methodology.href} className="text-sm">
                  {methodology.label}
                </ArrowLink>
              )}
              {rawData && (
                <ArrowLink href={rawData.href} className="text-sm">
                  {rawData.label}
                </ArrowLink>
              )}
            </div>
          </div>
        </Plate>
      </div>
    </Section>
  )
}
