import { CardCopy } from "./card-copy"

// Stacked deck: three cards fanned behind the main card, each a step darker, turning about a point below
// the deck like a hand of cards. On hover they spread further and the main card lifts.
export function Stack() {
  return (
    <div className="spsurf spsurf-stack">
      <div aria-hidden className="spsurf-stack__sheet spsurf-stack__sheet--3" />
      <div aria-hidden className="spsurf-stack__sheet spsurf-stack__sheet--2" />
      <div aria-hidden className="spsurf-stack__sheet spsurf-stack__sheet--1" />
      <div className="spsurf-stack__card">
        <span aria-hidden className="spsurf-stack__index sp-readout">
          01 / 04
        </span>
        <CardCopy />
      </div>
    </div>
  )
}
