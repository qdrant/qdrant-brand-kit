import { rng } from "../rand"
import { CardCopy } from "./card-copy"

// Ticket: an event card in two parts, the body and a stub, with round notches cut from both sides where they
// meet and a perforated line between them. The stub carries a mono code and a barcode. Each part is a
// hairline shell around a fill, both cut by the same notches, so the hairline follows the cut. On hover the
// stub starts to tear off.

// A seeded barcode, the same on every load: bars and gaps of 1 to 3px, as one gradient.
const BARS = (() => {
  const rand = rng(41)
  const stops: string[] = []
  for (let x = 0; x < 96; ) {
    const bar = 1 + Math.floor(rand() * 3)
    const gap = 1 + Math.floor(rand() * 3)
    stops.push(`var(--sp-label) ${x}px ${x + bar}px`, `transparent ${x + bar}px ${x + bar + gap}px`)
    x += bar + gap
  }
  return `linear-gradient(to right, ${stops.join(", ")})`
})()

export function Ticket() {
  return (
    <div className="spsurf spsurf-ticket">
      <div className="spsurf-ticket__part spsurf-ticket__part--body">
        <div className="spsurf-ticket__fill">
          <CardCopy short />
        </div>
      </div>
      <div className="spsurf-ticket__part spsurf-ticket__part--stub">
        <div className="spsurf-ticket__fill">
          <span aria-hidden className="spsurf-ticket__perf" />
          <span className="spsurf-ticket__code sp-readout">QD-000-000</span>
          <span aria-hidden className="spsurf-ticket__bars" style={{ backgroundImage: BARS }} />
        </div>
      </div>
    </div>
  )
}
