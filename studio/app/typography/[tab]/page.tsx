import type { CSSProperties, ReactNode } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { cn } from "@qdrant/design-system/lib/utils"

import { TypeSpecimen } from "@/components/type-specimen"
import {
  creativeCount,
  creativeStyles,
  groups,
  styleOf,
  tabs,
  textStyles,
  weightNames,
  type TabId,
} from "@/lib/typography"

import "../brand-components.css"

export const metadata = { title: "Typography · Qdrant Studio" }

// The sentence every style shows (design lead, 2026-11-17).
const SAMPLE = "High-Performance Vector Search at Scale"

// A creative's canvas at its reference size: 1 canvas unit is 1px, so sizes read as the CSS writes them.
const referenceCanvas = { "--qd-canvas-u": "1px" } as CSSProperties

const intros: Record<"typeface" | "creatives", string> = {
  typeface:
    "Every text style in primitives/typography/typography.css that renders in this family, in each weight it comes in. The details are measured from each sample as it renders.",
  creatives:
    "The text in creatives and brand components, at each canvas shape's reference size. Shapes that share a size show once.",
}

export function generateStaticParams() {
  return tabs.map(({ id }) => ({ tab: id }))
}

// Every text style in primitives/typography, one tab per family of the Mona Sans family, then the text in
// creatives and brand components, to refine the type primitives (design lead, 2026-11-17). Each one shows the sample
// sentence and, in small type, its family, size, line height, letter spacing and weight, with its name as a tag.
export default async function TypographyTab({
  params,
}: {
  params: Promise<{ tab: string }>
}) {
  const { tab } = await params
  const current = tabs.find(({ id }) => id === tab)
  if (!current) notFound()
  const all = textStyles()
  const countOf = (id: TabId) =>
    id === "creatives"
      ? creativeCount
      : all
          .filter((s) => s.typeface === id)
          .reduce((n, s) => n + s.weights.length, 0)
  const kind = current.id === "creatives" ? "creatives" : "typeface"

  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Typography</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {intros[kind]}
        </p>
      </header>

      <nav
        aria-label="Typography"
        className="flex flex-wrap items-center gap-1"
      >
        {tabs.map(({ id, label }) => (
          <Link
            key={id}
            href={`/typography/${id}`}
            aria-current={id === current.id ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm hover:bg-muted",
              id === "creatives" && "ml-3",
              id === current.id
                ? "bg-muted font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {label}{" "}
            <span className="font-mono text-xs text-muted-foreground">
              {countOf(id)}
            </span>
          </Link>
        ))}
      </nav>

      {kind === "typeface" &&
        groups.map((group) => {
          const inGroup = all.filter(
            (s) => s.typeface === current.id && s.group === group
          )
          if (inGroup.length === 0) return null
          return (
            <Group key={group} title={group}>
              {inGroup.flatMap((style) =>
                style.weights.map((weight) => (
                  <TypeSpecimen
                    key={`${style.name}-${weight}`}
                    name={
                      style.weights.length > 1
                        ? `${style.name} ${weightNames[weight] ?? weight}`
                        : style.name
                    }
                  >
                    <p
                      data-sample
                      className="wrap-break-word text-foreground"
                      style={{ ...styleOf(style), fontWeight: weight }}
                    >
                      {SAMPLE}
                    </p>
                  </TypeSpecimen>
                ))
              )}
            </Group>
          )
        })}

      {kind === "creatives" && (
        <Group title="Creatives and brand components">
          {creativeStyles.flatMap((style) =>
            style.shapes.map((shapes) => (
              <TypeSpecimen
                key={`${style.name}-${shapes[0]}`}
                name={style.name}
                info={[["Shapes", shapes.join(", ")]]}
              >
                <div
                  className="qd-canvas"
                  data-shape={shapes[0]}
                  style={referenceCanvas}
                >
                  {style.button ? (
                    <div className="overflow-x-auto">
                      <span data-sample className={style.className}>
                        {SAMPLE}
                      </span>
                    </div>
                  ) : (
                    <p
                      data-sample
                      className={cn(style.className, "wrap-break-word")}
                    >
                      {SAMPLE}
                    </p>
                  )}
                </div>
              </TypeSpecimen>
            ))
          )}
        </Group>
      )}

    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col">
      <header className="flex flex-col gap-1 border-b pb-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase">
          {title}
        </h2>
      </header>
      {children}
    </section>
  )
}
