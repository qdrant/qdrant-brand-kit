import "@qdrant/design-system/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
