import type * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

// TurboQuant's datatypes (blog post "Qdrant 1.20", "16-Bit and 8-Bit TurboQuant", 2026-11-26): the redrawn figure,
// in HTML so it follows the theme. You upload float32 vectors; TurboQuant rotates them, then rounds them to an
// integer grid at 16, 8 or 4 bits per dimension. Each bar's length is its bits per dimension (4px a bit), against
// float32's 32. turbo16 and turbo8, the two new sizes, are indigo; the rest quiet. Every label is the original
// figure's. Static. Wide, the input and TurboQuant stack on the left with the sizes to their right; narrow,
// everything stacks.

const DESCRIPTION =
  "TurboQuant stores float32 vectors at 16, 8, or 4 bits per dimension. You upload regular float32 vectors, which use 32 bits per dimension. TurboQuant rotates them, then rounds them to an integer grid at the size you pick: turbo16 at 16 bits per dimension has the same recall as float32, turbo8 at 8 bits comes close to float16, and turbo4 at 4 bits is smallest, but recall can drop."

type Size = { name: string; bits: number; note: string; turbo?: boolean }

const SIZES: Size[] = [
  { name: "float32", bits: 32, note: "original size" },
  { name: "turbo16", bits: 16, note: "same recall as float32", turbo: true },
  { name: "turbo8", bits: 8, note: "recall close to float16", turbo: true },
  { name: "turbo4", bits: 4, note: "smallest, recall can drop" },
]

const text =
  "font-mono text-(length:--qd-font-size-12) leading-(--qd-line-height-150) font-medium"

function Step({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-md border border-(--web-scene-line) bg-(--web-scene-surface) px-3 py-3 text-center">
      <span className="text-(--web-scene-star)">{title}</span>
      <span className="text-(--web-scene-label)">{children}</span>
    </div>
  )
}

// An indigo connector with its head, pointing down or right.
function Arrow({
  dir,
  className,
}: {
  dir: "down" | "right"
  className?: string
}) {
  const down = dir === "down"
  return (
    <svg
      aria-hidden
      width={down ? 10 : 28}
      height={down ? 22 : 10}
      viewBox={down ? "0 0 10 22" : "0 0 28 10"}
      className={cn("shrink-0 self-center", className)}
    >
      <path
        d={down ? "M5 0 V16" : "M0 5 H22"}
        fill="none"
        stroke="var(--web-scene-glow)"
        strokeWidth={1.5}
      />
      <path
        d={down ? "M1 15 L5 22 L9 15 Z" : "M21 1 L28 5 L21 9 Z"}
        fill="var(--web-scene-glow)"
      />
    </svg>
  )
}

export function TurboquantDatatypes() {
  return (
    <div
      role="img"
      aria-label={DESCRIPTION}
      className={cn(
        "@container w-full max-w-[720px] text-(--web-scene-star)",
        text
      )}
    >
      <div
        aria-hidden
        className="flex flex-col @2xl:flex-row @2xl:items-center"
      >
        {/* What you upload, and what TurboQuant does to it. */}
        <div className="flex flex-col @2xl:w-[12rem] @2xl:shrink-0">
          <Step title="float32 vectors">what you upload</Step>
          <Arrow dir="down" className="my-1" />
          <Step title="TurboQuant">
            rotate, then round
            <br />
            to an integer grid
          </Step>
        </div>
        <Arrow dir="down" className="my-1 @2xl:hidden" />
        <Arrow dir="right" className="mx-1 hidden @2xl:block" />

        {/* The sizes: bits per dimension, as bars. */}
        <div className="grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 border-(--web-scene-glow) py-1 @2xl:flex-1 @2xl:grid-cols-[4.5rem_8.5rem_minmax(0,1fr)] @2xl:gap-y-3 @2xl:border-l @2xl:pl-4">
          <span className="col-start-2 mb-1 text-(--web-scene-label) uppercase @2xl:col-[2/-1]">
            Bits per dimension
          </span>
          {SIZES.map((size) => (
            <Row key={size.name} size={size} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({ size }: { size: Size }) {
  return (
    <>
      <span
        className={
          size.turbo ? "text-(--web-indigo-text)" : "text-(--web-scene-label)"
        }
      >
        {size.name}
      </span>
      <span
        className={cn(
          "flex h-5 items-center justify-center rounded-[3px] border",
          size.turbo
            ? "border-(--web-scene-glow) bg-[color-mix(in_oklab,var(--web-scene-glow)_14%,var(--web-scene-surface))] text-(--web-indigo-text)"
            : "border-(--web-scene-line) bg-(--web-scene-surface) text-(--web-scene-label)"
        )}
        style={{ width: size.bits * 4 }}
      >
        {size.bits}
      </span>
      <span
        className={cn(
          "col-start-2 mb-2 @2xl:col-start-auto @2xl:mb-0",
          size.turbo ? "text-(--web-scene-star)" : "text-(--web-scene-label)"
        )}
      >
        {size.note}
      </span>
    </>
  )
}
