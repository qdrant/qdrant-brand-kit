import { customerLogos } from "@qdrant/web/content/customer-logos"
import { CustomerLogo, customerLogoSrc } from "@qdrant/web/lib/customer-logo"

import { DocsSidebar } from "@/components/web/docs-sidebar"

export const metadata = { title: "Customer logos · Web · Qdrant Studio" }

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`

// Every customer logo the website can use (Juan, 2026-11-23), from web/content/customer-logos.ts and
// web/assets/logos/customers: each in its three versions, on the background it's for. The tiles keep their own
// backgrounds in both studio themes.
export default function CustomerLogos() {
  const withColor = customerLogos.filter((logo) => logo.color).length
  return (
    <div className="flex min-h-0 flex-1">
      <DocsSidebar current="customer-logos" />

      <div className="flex min-w-0 flex-1 flex-col gap-10 p-8">
        <header className="flex max-w-3xl flex-col gap-3">
          <p className="font-mono text-xs text-muted-foreground uppercase">Website</p>
          <h1 className="text-3xl font-semibold">Customer logos</h1>
          <p className="text-muted-foreground">
            {customerLogos.length} customers, as SVG in <code className="font-mono text-sm">web/assets/logos/customers</code>
            . Each has a one-color file that the website paints in any color, so the light and dark versions (or a
            neutral, to blend in) come from one file; {withColor} also have a color file, and the rest show the dark
            version until one is found. Use them with{" "}
            <code className="font-mono text-sm">{'<CustomerLogo id="hubspot" version="mono" />'}</code> from{" "}
            <code className="font-mono text-sm">web/lib/customer-logo.tsx</code>.
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[56rem] text-sm">
            <thead className="border-b text-left font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-normal">Customer</th>
                <th className="px-4 py-3 font-normal">Color</th>
                <th className="px-4 py-3 font-normal">Light</th>
                <th className="px-4 py-3 font-normal">Dark</th>
                <th className="px-4 py-3 font-normal">Files</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customerLogos.map((logo) => (
                <tr key={logo.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{logo.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{logo.id}</p>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex h-20 w-48 items-center justify-center rounded-md ring-1 ring-border bg-neutral-25 px-6">
                      {logo.color ? (
                        <CustomerLogo id={logo.id} version="color" className="h-8 max-w-full" />
                      ) : (
                        <span className="font-mono text-[11px] text-neutral-500 uppercase">No color file</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex h-20 w-48 items-center justify-center rounded-md ring-1 ring-border bg-neutral-950 px-6">
                      <CustomerLogo id={logo.id} version="light" className="h-8 max-w-full" />
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex h-20 w-48 items-center justify-center rounded-md ring-1 ring-border bg-neutral-25 px-6">
                      <CustomerLogo id={logo.id} version="dark" className="h-8 max-w-full" />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                    {logo.color && (
                      <a href={customerLogoSrc(logo, "color")} className="block hover:text-foreground">
                        {logo.id}.svg · {kb(logo.color.bytes)}
                      </a>
                    )}
                    <a href={customerLogoSrc(logo, "mono")} className="block hover:text-foreground">
                      {logo.id}-mono.svg · {kb(logo.bytes)}
                    </a>
                    <span className="block">From {logo.source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
