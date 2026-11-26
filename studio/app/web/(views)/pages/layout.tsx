import { PagesTabs } from "@/components/web/pages-tabs"

// Every page under Pages has the row of pages on top.
export default function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PagesTabs />
      {children}
    </>
  )
}
