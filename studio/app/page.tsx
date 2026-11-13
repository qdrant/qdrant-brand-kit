import Link from "next/link"

import { ThemePreview } from "@/components/theme-preview"

export default function Overview() {
  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-2 border-b p-8">
        <h1 className="text-2xl font-semibold">Qdrant Studio</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          The design system and the web sections on the real Qdrant tokens. Try values with the controls on the
          left, then keep the ones that work in <code className="font-mono">design-system/</code> with a line in{" "}
          <code className="font-mono">DESIGN.md</code>. Every component is under{" "}
          <Link href="/design-system" className="text-primary underline-offset-4 hover:underline">
            Design system
          </Link>
          .
        </p>
      </header>
      <div className="grid md:grid-cols-2">
        {(["dark", "light"] as const).map((theme) => (
          <section key={theme} data-theme={theme} className="bg-background text-foreground flex flex-col gap-6 p-8">
            <p className="text-muted-foreground font-mono text-xs uppercase">{theme}</p>
            <ThemePreview theme={theme} />
          </section>
        ))}
      </div>
    </div>
  )
}
