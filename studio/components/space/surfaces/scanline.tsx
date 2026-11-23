import { CardCopy } from "./card-copy"

// Scanline: a scan line moves down the card's header, a field of dots on the 8px grid, and lights the dots
// it passes; they fade behind it. One dot is a result: it lights in the accent with its score as the line
// crosses it. Three CSS animations of the same length keep the line, the lit band and the result in step.
export function Scanline() {
  return (
    <div className="spsurf spsurf-card">
      <div aria-hidden className="spsurf-scan">
        <div className="spsurf-scan__dots" />
        <div className="spsurf-scan__lit" />
        <div className="spsurf-scan__beam" />
        <span className="spsurf-scan__hit" />
        <span className="spsurf-scan__score sp-readout">0.98</span>
        <span className="spsurf-scan__label sp-readout">SCAN</span>
      </div>
      <div className="spsurf-body">
        <CardCopy />
      </div>
    </div>
  )
}
