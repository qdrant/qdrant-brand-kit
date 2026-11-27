import type * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// A nested filter on an array of objects (blog post "Qdrant 1.20", "Faster Nested Filters with Per-Element
// Indexes", 2026-11-26): the redrawn figure, in HTML so it follows the theme. The filter asks for shop A and a price
// under $100 in the same element of offers. Point 7 has both, but in different offers, so it doesn't match; point 9's
// offers[1] has both, so it matches. The values that meet a condition are indigo; the one element that meets every
// condition is the key result, marked in amaranth. Every label and value is the original figure's. Static: the
// figure is one comparison, read at a glance. Wide, each point is a row with its offers side by side; narrow, the
// offers stack under the point.

const DESCRIPTION =
  "A nested filter matches when one array element meets every condition. A nested filter on offers requires shop A and a price under 100 dollars. Point 7 has an offer from shop A for 500 dollars and an offer from shop B for 50 dollars, so the conditions are met by different offers and point 7 doesn't match. Point 9 has an offer from shop A for 80 dollars, which meets both conditions, so point 9 matches."

type Value = { text: string; meets?: boolean }
type Offer = { shop: Value; price: Value; match?: boolean }
type Point = { name: string; offers: [Offer, Offer]; match: boolean }

const POINTS: Point[] = [
  {
    name: "Point 7",
    match: false,
    offers: [
      {
        shop: { text: "shop: A", meets: true },
        price: { text: "price: $500" },
      },
      { shop: { text: "shop: B" }, price: { text: "price: $50", meets: true } },
    ],
  },
  {
    name: "Point 9",
    match: true,
    offers: [
      { shop: { text: "shop: B" }, price: { text: "price: $120" } },
      {
        shop: { text: "shop: A", meets: true },
        price: { text: "price: $80", meets: true },
        match: true,
      },
    ],
  },
]

const text =
  "font-mono text-(length:--qd-font-size-12) leading-(--qd-line-height-150) font-medium"

// A chip: mono text on the surface with a hairline; indigo when it meets a condition.
function Chip({
  meets,
  children,
}: {
  meets?: boolean
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-[4px] border px-2 whitespace-nowrap",
        meets
          ? "border-(--web-scene-glow) bg-[color-mix(in_oklab,var(--web-scene-glow)_14%,var(--web-scene-surface))] text-(--web-indigo-text)"
          : "border-(--web-scene-line) bg-(--web-scene-surface) text-(--web-scene-star)"
      )}
    >
      {children}
    </span>
  )
}

function OfferBox({ offer, index }: { offer: Offer; index: number }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1.5 rounded-md border p-2",
        offer.match
          ? "border-(--web-scene-accent)"
          : "border-(--web-scene-line)"
      )}
    >
      {/* The element's index, shown here only when the offers stack (wide, the column heads say it). */}
      <span className="text-(--web-scene-label) @xl:hidden">
        offers[{index}]
      </span>
      <div className="flex flex-wrap gap-2">
        <Chip meets={offer.shop.meets}>{offer.shop.text}</Chip>
        <Chip meets={offer.price.meets}>{offer.price.text}</Chip>
      </div>
    </div>
  )
}

function Result({ match }: { match: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap uppercase",
        match ? "text-(--web-scene-star)" : "text-(--web-scene-label)"
      )}
    >
      {match && (
        <span aria-hidden className="size-[5px] bg-(--web-scene-accent)" />
      )}
      {match ? "match" : "no match"}
    </span>
  )
}

const columns =
  "@xl:grid @xl:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)_5.5rem] @xl:items-center @xl:gap-3"

export function NestedFilter() {
  return (
    <div
      role="img"
      aria-label={DESCRIPTION}
      className={cn(
        "@container w-full max-w-[720px] text-(--web-scene-star)",
        text
      )}
    >
      <div aria-hidden className="flex flex-col gap-4">
        {/* The filter. */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-(--web-scene-label) uppercase">
            filter
          </span>
          <Chip meets>shop = A</Chip>
          <Chip meets>price &lt; $100</Chip>
        </div>

        {/* The collection. */}
        <div className="flex flex-col gap-3 rounded-lg border border-(--web-scene-line) p-3">
          <div className={cn("text-(--web-scene-label)", columns)}>
            <span className="uppercase">Collection</span>
            <span className="hidden pl-[9px] @xl:block">offers[0]</span>
            <span className="hidden pl-[9px] @xl:block">offers[1]</span>
          </div>
          {POINTS.map((point) => (
            <div
              key={point.name}
              className={cn(
                "flex flex-col gap-2 border-t border-(--web-scene-line) pt-3",
                columns
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={
                    point.match
                      ? "text-(--web-scene-star)"
                      : "text-(--web-scene-label)"
                  }
                >
                  {point.name}
                </span>
                <span className="@xl:hidden">
                  <Result match={point.match} />
                </span>
              </div>
              {point.offers.map((offer, i) => (
                <OfferBox key={i} offer={offer} index={i} />
              ))}
              <span className="hidden @xl:block">
                <Result match={point.match} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
