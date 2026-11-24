import { DocsSidebar } from "@/components/web/docs-sidebar"
import { ProductMarksGrid } from "@/components/web/product-marks"

export const metadata = { title: "Product marks · Web · Qdrant Studio" }

// The product marks of the Products menu in each style they're being explored in (design lead, 2026-11-24): every mark
// large, then at the menu's size. From web/lib/hex-icon.tsx; the menu takes one with the navbar's markStyle.
export default function ProductMarks() {
  return (
    <div className="flex min-h-0 flex-1">
      <DocsSidebar current="product-marks" />

      <div data-web data-context="marketing" className="flex min-w-0 flex-1 flex-col gap-12 bg-background p-8 text-foreground">
        <header className="flex max-w-3xl flex-col gap-3">
          <p className="font-mono text-xs text-muted-foreground uppercase">Website · exploring</p>
          <h1 className="text-3xl font-semibold">Product marks</h1>
          <p className="text-muted-foreground">
            Qdrant&apos;s six product marks, custom shapes drawn in small upright hexagons like the brandmark, in four
            styles to compare. Each mark is the same shape in every style. The Products menu shows one, set with the
            navbar&apos;s <code className="font-mono text-sm">markStyle</code>.
          </p>
        </header>
        <ProductMarksGrid />
      </div>
    </div>
  )
}
