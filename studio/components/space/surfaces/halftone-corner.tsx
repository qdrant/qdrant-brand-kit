import { CardCopy } from "./card-copy"

// Halftone corner: a halftone dot gradient grows from the card's top-right corner. Five layers of dots on one
// 8px grid, each smaller than the last and masked to a wider reach, so the dots shrink with distance. They
// live in a band above the copy that fades out before the kicker, so no text sits on dots. On hover the
// gradient reaches further in, still inside the band.
export function HalftoneCorner() {
  return (
    <div className="spsurf spsurf-card spsurf-halftone">
      <div aria-hidden className="spsurf-halftone__field">
        <span className="spsurf-halftone__dots spsurf-halftone__dots--1" />
        <span className="spsurf-halftone__dots spsurf-halftone__dots--2" />
        <span className="spsurf-halftone__dots spsurf-halftone__dots--3" />
        <span className="spsurf-halftone__dots spsurf-halftone__dots--4" />
        <span className="spsurf-halftone__dots spsurf-halftone__dots--5" />
      </div>
      <div className="spsurf-body">
        <CardCopy />
      </div>
    </div>
  )
}
