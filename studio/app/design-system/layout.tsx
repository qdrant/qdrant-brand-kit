import { DesignSystemTabs } from "@/components/design-system-tabs"

// Every Design system page has the Components and Variations tabs on top.
export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesignSystemTabs />
      {children}
    </>
  )
}
