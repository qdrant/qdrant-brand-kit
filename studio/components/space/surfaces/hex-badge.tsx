import { CardCopy } from "./card-copy"

// Hex badge (Parts Kit): a large extruded hexagon emblem at the top of the card, the brandmark's module. It's
// built from CSS faces clipped to paths: a silhouette that shows as the hairline edges (lit along the top),
// the two lower sides in shade, and the top face lit from above, with an etched inner ring and one small
// accent hexagon at its center. The geometry is computed here; the colors are in surfaces.css.

const R = 56 // the top face, center to corner
const DEPTH = 16
const ROOT3 = Math.sqrt(3)
// A 1px inset, measured across the slanted edges (1 / cos 30°).
const INSET = 2 / ROOT3
const W = Math.ceil(ROOT3 * R) + 2
const H = 2 * R + DEPTH + 2
const CX = W / 2
const CY = 1 + R

type Point = readonly [number, number]

const num = (v: number) => Math.round(v * 100) / 100
const path = (points: readonly Point[]) =>
  `M${points.map(([x, y]) => `${num(x)} ${num(y)}`).join(" L")} Z`
// A pointy-top hexagon around the top face's center: top, upper right, lower right, bottom, lower left,
// upper left.
const hexagon = (r: number): Point[] => {
  const half = (ROOT3 / 2) * r
  return [
    [CX, CY - r],
    [CX + half, CY - r / 2],
    [CX + half, CY + r / 2],
    [CX, CY + r],
    [CX - half, CY + r / 2],
    [CX - half, CY - r / 2],
  ]
}
// The y of the top face's lower edges at x.
const lower = (x: number) => CY + R - Math.abs(x - CX) / ROOT3
// One lower side, from x0 to x1, between the top face's edge and the bottom, 1px in from the silhouette.
const side = (x0: number, x1: number): Point[] => [
  [x0, lower(x0)],
  [x1, lower(x1)],
  [x1, lower(x1) + DEPTH - INSET],
  [x0, lower(x0) + DEPTH - INSET],
]

const [top, upperRight, lowerRight, bottom, lowerLeft, upperLeft] = hexagon(R)
const down = ([x, y]: Point): Point => [x, y + DEPTH]
const toClip = (d: string, rule = "") => `path(${rule}"${d}")`

const FACES = [
  {
    name: "edge",
    clip: toClip(path([top, upperRight, down(lowerRight), down(bottom), down(lowerLeft), upperLeft])),
  },
  { name: "left", clip: toClip(path(side(lowerLeft[0] + 1, CX - 0.5))) },
  { name: "right", clip: toClip(path(side(CX + 0.5, lowerRight[0] - 1))) },
  { name: "top", clip: toClip(path(hexagon(R - INSET))) },
  {
    name: "etch",
    clip: toClip(`${path(hexagon(R * 0.58))} ${path(hexagon(R * 0.58 - INSET))}`, "evenodd, "),
  },
  { name: "core", clip: toClip(path(hexagon(6))) },
]

export function HexBadge() {
  return (
    <div className="spsurf spsurf-card spsurf-body spsurf-hexb">
      <div aria-hidden className="spsurf-hexb__emblem" style={{ width: W, height: H }}>
        {FACES.map(({ name, clip }) => (
          <span key={name} className={`spsurf-hexb__${name}`} style={{ clipPath: clip }} />
        ))}
      </div>
      <CardCopy />
    </div>
  )
}
