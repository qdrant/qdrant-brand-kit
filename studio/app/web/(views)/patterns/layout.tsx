import { PatternsTabs } from "@/components/web/patterns-tabs"

export default function PatternsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PatternsTabs />
      {children}
    </>
  )
}
