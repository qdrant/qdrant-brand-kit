import "@qdrant/design-system/globals.css"
import "@qdrant/web/styles/web.css"
import "./studio.css"
import { TooltipProvider } from "@qdrant/design-system/components/ui/tooltip"
import { PrototypeStyles } from "@/components/prototype-styles"
import { StudioNav } from "@/components/studio-nav"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = { title: "Qdrant Studio" }

// The Mona Sans family (Mona Sans, Display and Mono) comes from primitives/typography/fonts through the design system's
// stylesheet, so no web font is loaded here.
//
// The DialKit controls panel (components/studio-controls.tsx) is hidden for now: the design system is
// changed by prompting in Claude Code, and the canvas gets the whole width. To bring it back, import
// "dialkit/styles.css" and StudioControls here, and render <StudioControls /> next to <main> in a row.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans antialiased">
      <body>
        <ThemeProvider>
          <PrototypeStyles />
          <TooltipProvider>
            <div className="flex min-h-svh flex-col">
              <StudioNav />
              <main className="studio-canvas min-w-0 flex-1">{children}</main>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
