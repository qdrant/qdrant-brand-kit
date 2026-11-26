"use client"

import type * as React from "react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// Recall@10 of turbo4, turbo8 and float16 (blog post "Qdrant 1.20", "16-Bit and 8-Bit TurboQuant", 2026-11-26): the
// redrawn chart, an SVG in the theme's colors. The data is the post's, exactly: HNSW on x86, six datasets ordered by
// dimensions, on a 0 to 1 scale as in the original. turbo8, the chart's story, is the accent (as in the original),
// turbo4 indigo, float16 the quiet gray it's measured against; only turbo8's values are written on the chart, every
// value shows on hover and all are in the accessible name. Laid out for its real width (12px text at every size):
// columns grouped by dataset when wide, horizontal bars per dataset when narrow. Static.

const SERIES = [
  { key: "turbo4", color: "var(--web-scene-glow)" },
  { key: "turbo8", color: "var(--web-scene-accent)" },
  { key: "float16", color: "var(--qd-color-neutral-500)" },
] as const

type Dataset = { name: string; dims: string; values: [number, number, number] }

// Recall@10 for turbo4, turbo8 and float16, in that order.
const DATA: Dataset[] = [
  { name: "H&M", dims: "2048d", values: [0.97, 0.994, 0.996] },
  { name: "DBpedia OpenAI", dims: "1536d", values: [0.92, 0.965, 0.963] },
  { name: "LAION", dims: "512d", values: [0.927, 0.981, 0.984] },
  { name: "arXiv", dims: "384d", values: [0.928, 0.972, 0.973] },
  { name: "SIFT", dims: "128d", values: [0.807, 0.97, 0.983] },
  { name: "Deep-image", dims: "96d", values: [0.844, 0.969, 0.975] },
]

const TITLE = "Recall@10: turbo4, turbo8, and float16"
const SUBTITLE = "six datasets by dimensions, HNSW on x86, higher is better"
const CAPTION =
  "Recall@10 for turbo4, turbo8, and float16 on six datasets, ordered by vector dimensions."
const SUMMARY = DATA.map(
  (d) =>
    `${d.name} (${d.dims}): ${SERIES.map((s, i) => `${s.key} ${d.values[i]}`).join(", ")}.`
).join(" ")

const TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1]
const CH = 7.2 // the mono's advance at 12px
const MONO = "var(--qd-font-family-mono)"
const NARROW = 480
// The narrow layout's bar height and the height of a dataset's block (its name, three bars, the space after).
const BAR = 10
const BLOCK = 18 + 3 * BAR + 4 + 16

const label = (d: Dataset) => `${d.name} (${d.dims})`

// A bar: square at the baseline, its 4px rounded end at the value.
function bar(x: number, y: number, w: number, h: number, horizontal: boolean) {
  const r = Math.min(4, horizontal ? h / 2 : w / 2, horizontal ? w : h)
  return horizontal
    ? `M${x} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x} Z`
    : `M${x} ${y + h} V${y + r} Q${x} ${y} ${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h} Z`
}

type Text = React.SVGProps<SVGTextElement>
function T(props: Text) {
  return (
    <text
      fontFamily={MONO}
      fontSize={12}
      fontWeight={500}
      fill="var(--web-scene-label)"
      {...props}
    />
  )
}

// Columns grouped by dataset.
function Columns({ w, on, setOn }: Plot) {
  const L = 52
  const top = 22
  const ph = 236
  const gw = (w - L) / DATA.length
  const wrap = DATA.some((d) => d.name.length * CH > gw - 6)
  const lines = (d: Dataset) => [
    ...(wrap ? d.name.split(" ") : [d.name]),
    `(${d.dims})`,
  ]
  const rows = Math.max(...DATA.map((d) => lines(d).length))
  const h = top + ph + 12 + rows * 16
  const y = (v: number) => top + ph * (1 - v)
  const bw = Math.min(24, (gw * 0.7 - 4) / 3)
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="block overflow-visible"
    >
      <T
        transform={`translate(10 ${top + ph / 2}) rotate(-90)`}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        recall@10
      </T>
      {TICKS.map((t) => (
        <g key={t}>
          <line
            x1={L}
            x2={w}
            y1={Math.round(y(t)) + 0.5}
            y2={Math.round(y(t)) + 0.5}
            stroke={t === 0 ? "var(--web-scene-line)" : "var(--web-scene-grid)"}
          />
          <T x={L - 8} y={y(t)} textAnchor="end" dominantBaseline="middle">
            {t.toFixed(1)}
          </T>
        </g>
      ))}
      {DATA.map((d, g) => {
        const cx = L + gw * (g + 0.5)
        const x0 = cx - (3 * bw + 4) / 2
        return (
          <g
            key={d.name}
            opacity={on === null || on === g ? 1 : 0.35}
            onPointerEnter={() => setOn(g)}
            onPointerLeave={() => setOn(null)}
          >
            <rect
              x={cx - gw / 2}
              y={top - 20}
              width={gw}
              height={h - top + 20}
              fill="transparent"
            />
            {d.values.map((v, i) => (
              <path
                key={i}
                d={bar(x0 + i * (bw + 2), y(v), bw, ph * v, false)}
                fill={SERIES[i]!.color}
              />
            ))}
            <T
              x={cx}
              y={y(Math.max(...d.values)) - 8}
              textAnchor="middle"
              fill="var(--web-scene-star)"
            >
              {d.values[1]}
            </T>
            {lines(d).map((line, i) => (
              <T key={i} x={cx} y={top + ph + 22 + i * 16} textAnchor="middle">
                {line}
              </T>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

// Horizontal bars, a block per dataset.
function Bars({ w, on, setOn }: Plot) {
  const right = 48
  const pw = w - right
  const bh = BAR
  const block = BLOCK
  const h = DATA.length * block + 48
  const x = (v: number) => pw * v
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="block overflow-visible"
    >
      {TICKS.map((t) => (
        <g key={t}>
          {DATA.map((d, g) => (
            <line
              key={d.name}
              x1={Math.round(x(t)) + 0.5}
              x2={Math.round(x(t)) + 0.5}
              y1={g * block + 16}
              y2={g * block + 18 + 3 * bh + 6}
              stroke={
                t === 0 ? "var(--web-scene-line)" : "var(--web-scene-grid)"
              }
            />
          ))}
          <T
            x={x(t)}
            y={h - 30}
            textAnchor={t === 0 ? "start" : t === 1 ? "end" : "middle"}
          >
            {t.toFixed(1)}
          </T>
        </g>
      ))}
      <T x={0} y={h - 6}>
        recall@10
      </T>
      {DATA.map((d, g) => {
        const y0 = g * block
        return (
          <g
            key={d.name}
            opacity={on === null || on === g ? 1 : 0.35}
            onPointerEnter={() => setOn(g)}
            onPointerLeave={() => setOn(null)}
          >
            <rect x={0} y={y0} width={w} height={block} fill="transparent" />
            <T x={0} y={y0 + 11}>
              {label(d)}
            </T>
            {d.values.map((v, i) => (
              <path
                key={i}
                d={bar(0, y0 + 18 + i * (bh + 2), x(v), bh, true)}
                fill={SERIES[i]!.color}
              />
            ))}
            <T
              x={pw + 8}
              y={y0 + 18 + bh + 2 + bh / 2}
              dominantBaseline="middle"
              fill="var(--web-scene-star)"
            >
              {d.values[1]}
            </T>
          </g>
        )
      })}
    </svg>
  )
}

type Plot = { w: number; on: number | null; setOn: (g: number | null) => void }

export function Turbo8Recall() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  const [on, setOn] = useState<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setW(Math.floor(entry.contentRect.width))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const narrow = w < NARROW
  const hovered = on === null ? undefined : DATA[on]

  return (
    <div
      role="img"
      aria-label={`${CAPTION} ${SUMMARY}`}
      className="w-full max-w-[720px] font-mono text-(length:--qd-font-size-12) leading-(--qd-line-height-150) font-medium"
    >
      <div aria-hidden className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-(--web-scene-star)">{TITLE}</span>
          <span className="text-(--web-scene-label)">{SUBTITLE}</span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-(--web-scene-label)">
          {SERIES.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-2">
              <span
                className="size-2.5 rounded-[2px]"
                style={{ background: s.color }}
              />
              {s.key}
            </span>
          ))}
        </div>
        <div ref={ref} className={cn("relative", !w && "h-[300px]")}>
          {w > 0 &&
            (narrow ? (
              <Bars w={w} on={on} setOn={setOn} />
            ) : (
              <Columns w={w} on={on} setOn={setOn} />
            ))}
          {hovered && on !== null && (
            <div
              className="pointer-events-none absolute flex flex-col gap-1 rounded-[4px] border border-(--web-scene-line) bg-(--web-scene-surface) px-3 py-2 whitespace-nowrap"
              style={
                narrow
                  ? { right: 0, top: Math.max(0, on * BLOCK - 40) }
                  : {
                      // Beside the hovered group, so its bars stay in view: right of it, or left near the end.
                      left:
                        on < DATA.length - 2
                          ? 52 + ((w - 52) / DATA.length) * (on + 1) + 4
                          : undefined,
                      right:
                        on < DATA.length - 2
                          ? undefined
                          : w - 52 - ((w - 52) / DATA.length) * on + 4,
                      top: 110,
                    }
              }
            >
              <span className="text-(--web-scene-star)">{label(hovered)}</span>
              {SERIES.map((s, i) => (
                <span
                  key={s.key}
                  className="flex items-center gap-2 text-(--web-scene-label)"
                >
                  <span
                    className="size-2.5 rounded-[2px]"
                    style={{ background: s.color }}
                  />
                  <span className="flex-1">{s.key}</span>
                  <span className="pl-3 text-(--web-scene-star) tabular-nums">
                    {hovered.values[i]}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
