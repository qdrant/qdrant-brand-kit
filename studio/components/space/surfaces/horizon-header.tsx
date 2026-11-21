import { CardCopy } from "./card-copy"

// Horizon header: a small planet's edge across the card's header, lit from above, with violet haze behind
// it and stars over it. One star is a result: it's marked in the accent and shows its score.
export function HorizonHeader() {
  return (
    <div className="spsurf spsurf-card">
      <div aria-hidden className="spsurf-horizon">
        <div className="sp-stars spsurf-horizon__stars" />
        <div className="spsurf-horizon__haze" />
        <div className="spsurf-horizon__planet" />
        <span className="spsurf-horizon__hit" />
        <span className="spsurf-horizon__score sp-readout">0.97</span>
      </div>
      <div className="spsurf-body">
        <CardCopy />
      </div>
    </div>
  )
}
