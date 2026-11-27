import { cn } from "@qdrant/design-system/lib/utils"

// The ID tracker's memory tiers (blog post "Qdrant 1.20", "ID Tracker Placement", 2026-11-26): the redrawn figure,
// in HTML so it follows the theme. The ID tracker maps point IDs to their internal locations; per collection, its
// memory is pinned (in RAM, the default), cached (in the page cache, evictable) or cold (read from disk). Toward RAM
// gives faster lookups, toward disk uses less RAM. The three settings are indigo chips in their tier; the scale under
// them is quiet. Every label is the original figure's. Static. The tiers stay side by side down to phone width,
// their notes wrapping.

const DESCRIPTION =
  "Memory tiers for the ID tracker. The ID tracker, which maps point IDs to their internal locations, can be set per collection to pinned, held in RAM, which is the default; cached, loaded into the page cache when a segment opens and evictable; or cold, read from disk. Toward RAM gives faster lookups; toward disk uses less RAM."

const TIERS = [
  { tier: "RAM", setting: "pinned", note: "always in RAM, default" },
  { tier: "Page cache", setting: "cached", note: "in RAM, evictable" },
  { tier: "Disk", setting: "cold", note: "read from disk" },
]

const text =
  "font-mono text-(length:--qd-font-size-12) leading-(--qd-line-height-150) font-medium"

function Head({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      width={8}
      height={10}
      viewBox="0 0 8 10"
      className="shrink-0"
    >
      <path
        d={dir === "left" ? "M8 1 L0 5 L8 9 Z" : "M0 1 L8 5 L0 9 Z"}
        fill="var(--web-scene-label)"
      />
    </svg>
  )
}

export function IdTrackerTiers() {
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
        {/* The setting. */}
        <p className="text-center text-(--web-scene-star)">
          id_tracker: {"{"} memory:{" "}
          <span className="whitespace-nowrap">pinned | cached | cold</span>{" "}
          {"}"}
        </p>

        {/* The tiers. */}
        <div className="grid grid-cols-3 gap-2 @lg:gap-3">
          {TIERS.map(({ tier, setting, note }) => (
            <div
              key={tier}
              className="flex flex-col gap-4 rounded-lg border border-(--web-scene-line) bg-(--web-scene-surface) px-2 py-3 @lg:px-4"
            >
              <span className="min-h-9 text-(--web-scene-label) uppercase @lg:min-h-0">
                {tier}
              </span>
              <span className="flex h-10 items-center justify-center self-center rounded-md border border-(--web-scene-glow) bg-[color-mix(in_oklab,var(--web-scene-glow)_14%,var(--web-scene-surface))] px-2 whitespace-nowrap text-(--web-indigo-text) @lg:w-full @lg:max-w-[8.75rem] @lg:px-3">
                {setting}
              </span>
              <span className="text-center text-(--web-scene-label)">
                {note}
              </span>
            </div>
          ))}
        </div>

        {/* The trade-off. */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center">
            <Head dir="left" />
            <span className="h-[1.5px] flex-1 bg-(--web-scene-label)" />
            <Head dir="right" />
          </div>
          <div className="flex justify-between gap-4 text-(--web-scene-label)">
            <span>faster lookups</span>
            <span className="text-right">less RAM</span>
          </div>
        </div>
      </div>
    </div>
  )
}
