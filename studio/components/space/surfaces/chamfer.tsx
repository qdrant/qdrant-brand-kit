import { CardCopy } from "./card-copy"

// Chamfer (Parts Kit): a card with hard-surface clipped corners, top right and bottom left. A hairline shell
// and a fill inside it share the same clip-path, so the hairline follows the chamfer; it's lit along the top
// edge. Two rivets, an etched part number and one accent alignment tick inside the top chamfer.
export function Chamfer() {
  return (
    <div className="spsurf spsurf-chamfer">
      <div className="spsurf-chamfer__face">
        <span aria-hidden className="spsurf-chamfer__rivet spsurf-chamfer__rivet--tl" />
        <span aria-hidden className="spsurf-chamfer__rivet spsurf-chamfer__rivet--br" />
        <span aria-hidden className="spsurf-chamfer__tick" />
        <span aria-hidden className="spsurf-chamfer__part sp-readout">
          PART 07
        </span>
        <CardCopy />
      </div>
    </div>
  )
}
