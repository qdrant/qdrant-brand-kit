import { CardCopy } from "./card-copy"

// Orb behind glass: a violet sphere, lit from above with a hairline rim, rises behind the top of a frosted
// card. The glass blurs the part of the orb it covers, and is etched with the orb's diameter. On hover the
// orb rises a little further. The frame shows the violet haze and stars behind it (backdrop: true).
export function OrbGlass() {
  return (
    <div className="spsurf spsurf-orb">
      <div aria-hidden className="spsurf-orb__sphere" />
      <div className="spsurf-orb__glass">
        <CardCopy />
        <span aria-hidden className="spsurf-orb__etch sp-readout">
          Ø 176
        </span>
      </div>
    </div>
  )
}
