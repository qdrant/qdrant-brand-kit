import type { CSSProperties, ReactNode } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { cn } from "@qdrant/design-system/lib/utils"

import { TypeSpecimen } from "@/components/type-specimen"
import {
  creativeCount,
  creativeStyles,
  groups,
  proposedRoles,
  proposedStyles,
  styleOf,
  tabs,
  textStyles,
  type TabId,
} from "@/lib/typography"

import "../brand-components.css"

export const metadata = { title: "Typography · Qdrant Studio" }

// The sentence every style shows (Juan, 2026-11-17).
const SAMPLE = "High-Performance Vector Search at Scale"

// A creative's canvas at its reference size: 1 canvas unit is 1px, so sizes read as the CSS writes them.
const referenceCanvas = { "--qd-canvas-u": "1px" } as CSSProperties

const intros: Record<"typeface" | "creatives" | "proposed", string> = {
  typeface:
    "Every text style in primitives/typography/typography.css that renders in this family. The details are measured from each sample as it renders.",
  creatives:
    "The text in creatives and brand components, at each canvas shape's reference size. Shapes that share a size show once.",
  proposed:
    "The proposed ladder, not adopted yet: one set of styles for brand, web and marketing, grouped by role and named as in Figma. Compare it with today's styles in the other tabs; each style lists the ones it would replace.",
}

export function generateStaticParams() {
  return tabs.map(({ id }) => ({ tab: id }))
}

// Every text style in primitives/typography, one tab per family of the Mona Sans family, then the text in
// creatives and brand components, and the proposed ladder, to refine the type primitives (Juan, 2026-11-17).
// Each one shows the sample sentence and, in small type, its family, size, line height, letter spacing and
// weight, with its name as a tag.
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
      : id === "proposed"
        ? proposedStyles.length
        : all.filter((s) => s.typeface === id).length
  const kind =
    current.id === "creatives" || current.id === "proposed"
      ? current.id
      : "typeface"

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
              {inGroup.map((style) => (
                <TypeSpecimen key={style.name} name={style.name}>
                  <p
                    data-sample
                    className="wrap-break-word text-foreground"
                    style={styleOf(style)}
                  >
                    {SAMPLE}
                  </p>
                </TypeSpecimen>
              ))}
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

      {kind === "proposed" &&
        proposedRoles.map((role) => (
          <Group key={role} title={role} note={roleNotes[role]}>
            {proposedStyles
              .filter((s) => s.role === role)
              .map((style) => (
                <TypeSpecimen
                  key={style.name}
                  name={style.name}
                  info={[["Replaces", style.replaces]]}
                >
                  <p
                    data-sample
                    className="wrap-break-word text-foreground"
                    style={style.style}
                  >
                    {SAMPLE}
                  </p>
                </TypeSpecimen>
              ))}
          </Group>
        ))}
    </div>
  )
}

const roleNotes: Record<(typeof proposedRoles)[number], string> = {
  Display:
    "Mona Sans Display SemiBold only, and Condensed (Mona Sans Condensed SemiBold, letter spacing 0, always uppercase, only when asked). Today's Regular, Medium and Bold Display styles move to SemiBold. Sizes about ×1.25 per step from H1 (64), on the 8px grid, numbered from the smallest so larger ones can be added: 1 (80), 2 (104), 3 (128), 4 (160), 5 (200). 128 isn't a size primitive yet. Letter spacing 0, like the headings. Line height continues the headings' curve: 1.08, 1.06, 1.05, 1.04, 1.03. Not placed: the 36px supporting text and button on square and portrait.",
  Heading:
    "Mona Sans Display: Regular, Medium and SemiBold. No Bold: it's retired, and its uses move to SemiBold. Every heading also comes in Mono (Mona Sans Mono), H1 included. Letter spacing 0 on every heading and Display style (decided), since Mona Sans Display is already tighter than the text cut. Line height on one curve from H6 1.3 to H1 1.1 (H5 1.22, H4 1.17, H3 1.14, H2 1.12), about 6.4px of leading above the size, which Display continues.",
  Text: "Mona Sans: Regular, Medium and SemiBold, no Bold; Mono in Mona Sans Mono. Letter spacing 0, Text XL included.",
}

function Group({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col">
      <header className="flex flex-col gap-1 border-b pb-3">
        <h2 className="text-xs font-medium text-muted-foreground uppercase">
          {title}
        </h2>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </header>
      {children}
    </section>
  )
}
