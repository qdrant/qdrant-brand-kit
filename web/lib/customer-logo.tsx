import type * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import { customerLogos, type CustomerLogoData } from "../content/customer-logos"
import { ASSETS } from "./assets"

// A customer's logo from web/assets/logos/customers (design lead, 2026-11-23), in one of four versions:
// - "color": the brand's colors, for light backgrounds (only for logos with a color file; the others fall back to
//   "dark").
// - "light": one color, white, for dark backgrounds.
// - "dark": one color, near-black (neutral-900), for light backgrounds.
// - "mono": one color in the current text color, so it follows the theme; set any color with a text-* class
//   (a neutral, to blend in).
// Each logo has two files: `<id>.svg` (color) and `<id>-mono.svg`, a mask (the logo white, the parts cut out of it
// black) that CSS paints in any color. Size it with a height (`h-8`): the width follows the logo's proportions. Give
// it a width too and it fits inside that box, centered.
export type CustomerLogoVersion = "color" | "light" | "dark" | "mono"

const byId = new Map(customerLogos.map((logo) => [logo.id, logo]))

export const customerLogoSrc = (logo: CustomerLogoData, file: "color" | "mono") =>
  `${ASSETS}/logos/customers/${logo.id}${file === "mono" ? "-mono" : ""}.svg`

export function CustomerLogo({
  id,
  version = "mono",
  className,
  style,
}: {
  id: string
  version?: CustomerLogoVersion
  className?: string
  style?: React.CSSProperties
}) {
  const logo = byId.get(id)
  if (!logo) return null

  if (version === "color" && logo.color) {
    return (
      <img
        src={customerLogoSrc(logo, "color")}
        alt={logo.name}
        width={logo.color.width}
        height={logo.color.height}
        className={cn("h-8 w-auto shrink-0 object-contain", className)}
        style={{ aspectRatio: `${logo.color.width} / ${logo.color.height}`, ...style }}
      />
    )
  }

  const mask = `url(${customerLogoSrc(logo, "mono")})`
  return (
    <span
      role="img"
      aria-label={logo.name}
      className={cn(
        "inline-block h-8 shrink-0 bg-current",
        version === "light" && "text-neutral-0",
        (version === "dark" || version === "color") && "text-neutral-900",
        className
      )}
      style={{
        aspectRatio: `${logo.width} / ${logo.height}`,
        maskImage: mask,
        maskMode: "luminance",
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        ...style,
      }}
    />
  )
}
