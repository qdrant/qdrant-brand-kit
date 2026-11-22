import { WebTabs } from "@/components/web/web-tabs"

export default function WebViewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100svh-3rem)] flex-col">
      <WebTabs />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
