import { paletteCss } from "@/lib/color"

import "./color.css"

// The proposed palette (lib/color.ts) as --qd-palette-<family>-<step> variables, on every Color tab. They only
// exist on this page until they move into primitives/colors.
export default function ColorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style id="color-palette" dangerouslySetInnerHTML={{ __html: paletteCss() }} />
      {children}
    </>
  )
}
