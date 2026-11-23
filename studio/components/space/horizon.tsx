// Horizon: a planet's edge low in the section, lit from above, with violet haze over it and a few stars.
// CSS only (gradients, one large circle, grain), so it costs nothing to show. The rules are in space.css.
export function Horizon() {
  return (
    <div aria-hidden className="sp-horizon pointer-events-none absolute inset-0">
      <div className="sp-horizon__stars" />
      <div className="sp-horizon__haze" />
      <div className="sp-horizon__planet" />
      <div className="sp-horizon__mark">
        <span>ALT 000</span>
      </div>
      <div className="sp-grain" />
    </div>
  )
}
