import { cn } from "@qdrant/design-system/lib/utils"

import { ASSETS } from "@qdrant/web/lib/assets"

const names = { aws: "AWS", "google-cloud": "Google Cloud", azure: "Azure" }

// A cloud provider's logo, as in the Figma's Console screens: square, 24px at full size. The Figma draws the
// AWS wordmark white for dark screens, so on light it switches to aws-on-light.svg, the same file with the
// wordmark in AWS's dark ink (#232F3E). Pass `alt=""` when the control around it already has the name.
export function CloudLogo({
  provider,
  alt = names[provider],
  className,
}: {
  provider: keyof typeof names
  alt?: string
  className?: string
}) {
  const classes = cn("size-6 shrink-0", className)
  if (provider !== "aws") {
    return (
      <img
        src={`${ASSETS}/logos/${provider}.svg`}
        alt={alt}
        width={24}
        height={24}
        className={classes}
      />
    )
  }
  return (
    <>
      <img
        src={`${ASSETS}/logos/aws.svg`}
        alt={alt}
        width={24}
        height={24}
        className={cn(classes, "light:hidden")}
      />
      <img
        src={`${ASSETS}/logos/aws-on-light.svg`}
        alt={alt}
        width={24}
        height={24}
        className={cn(classes, "hidden light:block")}
      />
    </>
  )
}
