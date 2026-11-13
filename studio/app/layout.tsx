import "@qdrant/design-system/globals.css"
import "./studio.css"
import { TooltipProvider } from "@qdrant/design-system/components/ui/tooltip"
import { StudioPanel } from "@/components/studio-panel"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = { title: "Qdrant Studio" }

// Mona Sans and Geist Mono come from primitives/typography/fonts through the design system's
// stylesheet, so no web font is loaded here.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans antialiased">
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <div className="flex min-h-svh">
              <StudioPanel />
              <main className="studio-canvas min-w-0 flex-1">{children}</main>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
