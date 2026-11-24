import * as React from "react"

import { Button } from "@qdrant/design-system/components/ui/button"

// The design system's Button as a link, for every call to action in a section: the same look, rendered as <a>.
export function LinkButton({
  href,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "render" | "nativeButton"> & { href: string }) {
  return <Button nativeButton={false} render={<a href={href} />} {...props} />
}
