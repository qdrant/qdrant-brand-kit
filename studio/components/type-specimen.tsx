"use client"

import * as React from "react"

import { Badge } from "@qdrant/design-system/components/ui/badge"

type Details = [label: string, value: string][]

const weights: Record<string, string> = {
  "300": "Light",
  "400": "Regular",
  "500": "Medium",
  "600": "SemiBold",
  "700": "Bold",
}

const round = (n: number, digits: number) =>
  String(Math.round(n * 10 ** digits) / 10 ** digits)

// The sample as the browser renders it: family, size, line height (as a ratio and in px), letter spacing and
// weight, plus width and case when they aren't the default. The family is the first one the sample asks for.
function measure(sample: HTMLElement): Details {
  const css = getComputedStyle(sample)
  const size = parseFloat(css.fontSize)
  const lineHeight = parseFloat(css.lineHeight)
  const tracking =
    css.letterSpacing === "normal" ? 0 : parseFloat(css.letterSpacing)
  const details: Details = [
    ["Family", css.fontFamily.split(",")[0].replace(/["']/g, "").trim()],
    ["Size", `${round(size, 1)}px`],
    [
      "Line height",
      Number.isNaN(lineHeight)
        ? "normal"
        : `${round(lineHeight / size, 2)} · ${round(lineHeight, 1)}px`,
    ],
    ["Letter spacing", `${round(tracking, 2)}px`],
    ["Weight", `${weights[css.fontWeight] ?? ""} ${css.fontWeight}`.trim()],
  ]
  if (css.fontStretch !== "100%" && css.fontStretch !== "normal")
    details.push(["Width", css.fontStretch])
  if (css.textTransform !== "none") details.push(["Case", css.textTransform])
  return details
}

// One style on the Typography page: its name as a tag, the details measured from the sample (the element
// marked data-sample in children), any info passed in (like the shapes that share a size), and the sample. It measures again whenever the sample's box changes, so a
// size or line height changed in the CSS updates the details without a reload.
export function TypeSpecimen({
  name,
  info = [],
  children,
}: {
  name: string
  info?: Details
  children: React.ReactNode
}) {
  const [details, setDetails] = React.useState<Details>([])
  const ref = React.useCallback((element: HTMLDivElement | null) => {
    const sample = element?.querySelector<HTMLElement>("[data-sample]")
    if (!sample) return
    const update = () =>
      setDetails((previous) => {
        const next = measure(sample)
        return JSON.stringify(next) === JSON.stringify(previous)
          ? previous
          : next
      })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(sample)
    return () => observer.disconnect()
  }, [])

  return (
    <article className="grid gap-4 border-b py-8 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8">
      <div className="flex flex-col items-start gap-3">
        <Badge variant="outline">{name}</Badge>
        <dl className="grid min-h-24 grid-cols-[auto_1fr] content-start gap-x-3 gap-y-1 text-xs">
          {details.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-mono text-foreground">{value}</dd>
            </div>
          ))}
          {info.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div ref={ref} className="min-w-0">
        {children}
      </div>
    </article>
  )
}
