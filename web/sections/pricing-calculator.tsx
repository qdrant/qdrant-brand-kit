"use client"

import * as React from "react"

import { Field, FieldLabel } from "@qdrant/design-system/components/ui/field"
import { Input } from "@qdrant/design-system/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@qdrant/design-system/components/ui/native-select"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import { ArrowLink } from "../lib/arrow-link"
import { LinkButton } from "../lib/link-button"
import { Plate } from "../lib/plate"
import { Section, type SectionProps } from "../lib/section"
import { SectionHeader } from "../lib/section-header"
import type { HeaderProps } from "../lib/section-props"
import { type } from "../lib/type"

// Bytes per dimension by datatype, from Qdrant's capacity planning guide (float32 is the default).
const datatypes = { float32: 4, float16: 2, uint8: 1 } as const
// Bytes per dimension of the quantized copy. Scalar cuts RAM by 4x (Cloud FAQ, 1 byte per dimension); 4-bit
// TurboQuant is 0.5 bytes per dimension (the guide's example).
const quantizations = { off: 0, scalar: 1, turbo4: 0.5 } as const
const quantizationLabels: Record<keyof typeof quantizations, string> = {
  off: "Off",
  scalar: "Scalar (int8)",
  turbo4: "4-bit TurboQuant",
}

export type SizingInput = {
  vectors: number
  dimensions: number
  replicas: number
  datatype: keyof typeof datatypes
  quantization: keyof typeof quantizations
}

const GB = 1024 ** 3

// The capacity planning guide's formulas (qdrant.tech/documentation/capacity-planning/), for one dense vector
// per point and the default HNSW m = 16, leaving payloads out:
//   base = number_of_points * replication_factor
//   dense_size = base * dimensions * bytes_per_dim
//   quantized_size = base * dimensions * quant_bytes
//   hnsw_size = base * m * 2 * 4 bytes * 1.2
//   id_tracker_size = base * 52 bytes
// RAM holds the dense vectors (cached), or with quantization the quantized copy (pinned) with the originals moved
// to cold, plus the HNSW index and the ID tracker. Disk holds all of these. Both get ~20% headroom.
export function estimate({ vectors, dimensions, replicas, datatype, quantization }: SizingInput) {
  const base = Math.max(0, vectors) * Math.max(1, replicas)
  const dense = base * Math.max(0, dimensions) * datatypes[datatype]
  const quantized = base * Math.max(0, dimensions) * quantizations[quantization]
  const hnsw = base * 16 * 2 * 4 * 1.2
  const idTracker = base * 52
  const ramParts = [
    quantization === "off"
      ? { label: "Dense vectors", bytes: dense }
      : { label: "Quantized vectors", bytes: quantized },
    { label: "HNSW index", bytes: hnsw },
    { label: "ID tracker", bytes: idTracker },
  ]
  const ram = ramParts.reduce((sum, p) => sum + p.bytes, 0)
  const disk = dense + quantized + hnsw + idTracker
  return { ramParts, ram: (ram * 1.2) / GB, disk: (disk * 1.2) / GB }
}

const formatGb = (gb: number) => `${gb < 10 ? gb.toFixed(2) : gb.toFixed(1)} GB`

export type PricingCalculatorProps = SectionProps & {
  // aside: the heading on the left, the estimator on the right. stacked: the heading above, inputs beside the result.
  layout?: "aside" | "stacked"
  header: HeaderProps
  // The guide the formula comes from.
  source?: Link
  defaults?: Partial<SizingInput>
}

// An estimate of a cluster's RAM and disk from the capacity planning guide's formulas (2026-11-21). No prices:
// the action sends people to Qdrant Cloud's calculator for those.
export function PricingCalculator({ layout = "aside", header, source, defaults, theme, surface, pattern, cardPattern, id, className }: PricingCalculatorProps) {
  const [input, setInput] = React.useState<SizingInput>({
    vectors: 1_000_000,
    dimensions: 768,
    replicas: 2,
    datatype: "float32",
    quantization: "off",
    ...defaults,
  })
  const result = estimate(input)
  const fieldId = React.useId()
  const set = <K extends keyof SizingInput>(key: K, value: SizingInput[K]) => setInput((prev) => ({ ...prev, [key]: value }))
  const num = (value: string) => (value === "" ? 0 : Number(value))

  const action = header.action ? <LinkButton href={header.action.href}>{header.action.label}</LinkButton> : undefined

  const form = (
    <Plate as="form" className="flex flex-col gap-5 rounded-xl p-6" onSubmit={(e) => e.preventDefault()}>
      <Field>
        <FieldLabel htmlFor={`${fieldId}-vectors`}>Number of vectors</FieldLabel>
        <Input id={`${fieldId}-vectors`} type="number" min={0} step={100000} inputMode="numeric" value={input.vectors} onChange={(e) => set("vectors", num(e.target.value))} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${fieldId}-dimensions`}>Dimensions</FieldLabel>
          <Input id={`${fieldId}-dimensions`} type="number" min={1} inputMode="numeric" value={input.dimensions} onChange={(e) => set("dimensions", num(e.target.value))} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${fieldId}-replicas`}>Replication factor</FieldLabel>
          <Input id={`${fieldId}-replicas`} type="number" min={1} max={12} inputMode="numeric" value={input.replicas} onChange={(e) => set("replicas", num(e.target.value))} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${fieldId}-datatype`}>Datatype</FieldLabel>
          <NativeSelect id={`${fieldId}-datatype`} className="w-full" value={input.datatype} onChange={(e) => set("datatype", e.target.value as SizingInput["datatype"])}>
            {Object.keys(datatypes).map((d) => (
              <NativeSelectOption key={d} value={d}>
                {d}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${fieldId}-quantization`}>Quantization</FieldLabel>
          <NativeSelect id={`${fieldId}-quantization`} className="w-full" value={input.quantization} onChange={(e) => set("quantization", e.target.value as SizingInput["quantization"])}>
            {(Object.keys(quantizations) as (keyof typeof quantizations)[]).map((q) => (
              <NativeSelectOption key={q} value={q}>
                {quantizationLabels[q]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      </div>
    </Plate>
  )

  const output = (
    <Plate as="div" aria-live="polite" className="flex flex-col rounded-xl">
      <div className="flex flex-col gap-2 p-6">
        <p className={cn(type.xsmall, "font-mono uppercase")}>Estimated RAM</p>
        <p className="font-mono text-5xl tracking-tight text-foreground tabular-nums">{formatGb(result.ram)}</p>
        <p className={type.small}>With ~20% headroom.</p>
      </div>
      <dl className="flex flex-col border-t border-(--web-line) px-6 py-4">
        {result.ramParts.map((p) => (
          <div key={p.label} className="flex items-baseline justify-between gap-4 py-1.5">
            <dt className={type.small}>{p.label}</dt>
            <dd className="font-mono text-sm text-foreground tabular-nums">{formatGb(p.bytes / GB)}</dd>
          </div>
        ))}
        <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-(--web-line) pt-3">
          <dt className={type.small}>Estimated disk</dt>
          <dd className="font-mono text-sm text-foreground tabular-nums">{formatGb(result.disk)}</dd>
        </div>
      </dl>
      {source && (
        <div className="mt-auto border-t border-(--web-line) px-6 py-4">
          <ArrowLink href={source.href} className="text-sm">
            {source.label}
          </ArrowLink>
        </div>
      )}
    </Plate>
  )

  if (layout === "stacked") {
    return (
      <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="flex flex-col gap-(--qd-layout-heading-to-content-min) lg:gap-(--qd-layout-heading-to-content-max)">
        <SectionHeader layout={action ? "action" : "stacked"} kicker={header.kicker} title={header.title} description={header.description} actions={action} />
        <div className="grid gap-(--web-card-gap) lg:grid-cols-2">
          {form}
          {output}
        </div>
      </Section>
    )
  }

  return (
    <Section theme={theme} surface={surface} pattern={pattern} cardPattern={cardPattern} id={id} className={className} innerClassName="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-(--qd-layout-column-gap)">
      <SectionHeader kicker={header.kicker} title={header.title} description={header.description} actions={action} />
      <div className="web-tray grid gap-1.5 rounded-[calc(var(--radius-xl)+6px)] md:grid-cols-2">
        {form}
        {output}
      </div>
    </Section>
  )
}
