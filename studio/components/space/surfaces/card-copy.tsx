import { type } from "@qdrant/web/lib/type"

// The placeholder copy each surface wraps: a kicker, a title and a line or two of text. The real copy comes
// from the page's Figma. It's positioned, so it paints above the surface's absolute layers.
export function CardCopy({ short = false }: { short?: boolean }) {
  return (
    <div className="relative flex flex-col gap-2">
      <span className={type.kicker}>Kicker</span>
      <h3 className={type.h6}>Card title</h3>
      <p className={type.small}>
        {short
          ? "Placeholder supporting text, one or two lines."
          : "Placeholder supporting text, one or two lines. The copy comes from the page's Figma."}
      </p>
    </div>
  )
}
