import type { CSSProperties } from "react"

import { cn } from "@qdrant/design-system/lib/utils"
import { type } from "@qdrant/web/lib/type"

import { clamp, rng } from "../rand"

// Dot-matrix metric: a stat card whose header is an LED dot-matrix bar chart, 36 columns of 10 dots on the
// 8px grid. The chart steps left one column at a time, like a live readout, and a small accent light by the
// label marks it live. The label and the number are placeholders.

const COLUMNS = 36

// A seeded random walk, so the bars are the same on every load. Each bar is a count of lit dots.
const values = (() => {
  const rand = rng(23)
  let v = 5
  return Array.from({ length: COLUMNS }, () => {
    v = clamp(v + Math.round((rand() - 0.5) * 4), 2, 9)
    return v
  })
})()

export function DotMetric() {
  return (
    <div className="spsurf spsurf-card spsurf-body spsurf-dm">
      <div className="spsurf-dm__head">
        <span className="sp-readout">Metric</span>
        <span aria-hidden className="spsurf-dm__live" />
      </div>
      <div aria-hidden className="spsurf-dm__chart">
        {/* Two copies of the data, so the strip loops without a seam. */}
        <div className="spsurf-dm__strip">
          {[...values, ...values].map((v, i) => (
            <span key={i} className="spsurf-dm__col" style={{ "--spsurf-v": v } as CSSProperties} />
          ))}
        </div>
      </div>
      <div aria-hidden className="spsurf-dm__axis" />
      <div className="flex flex-col gap-2">
        <span className={cn(type.h4, "tabular-nums")}>00.0</span>
        <p className={type.small}>Placeholder supporting text, one or two lines.</p>
      </div>
    </div>
  )
}
