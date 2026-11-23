"use client"

import Image from "next/image"
import {
  ChevronDown,
  ChevronsUpDown,
  CircleHelp,
  CloudSync,
  CreditCard,
  DatabaseBackup,
  DatabaseZap,
  Rocket,
  Server,
  Settings,
  Users,
} from "lucide-react"

import { Button } from "@qdrant/design-system/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@qdrant/design-system/components/ui/sidebar"

// The Qdrant Cloud frame around every product page: the sidebar, the top bar and the footer. Layout and copy
// from the product's Figma (juan-serverless-2, "Space-Details-B"); the components, colors and icons are ours.
// The Figma's own icons for Clusters and Hybrid Cloud aren't Lucide, so the nearest Lucide ones stand in.
const nav = [
  { label: "Get Started", icon: Rocket },
  { label: "Clusters", icon: Server },
  { label: "Serverless Spaces", icon: DatabaseZap },
  { label: "Hybrid Cloud", icon: CloudSync },
  { label: "Backups", icon: DatabaseBackup },
  { label: "Access Management", icon: Users },
  { label: "Billing", icon: CreditCard },
  { label: "Settings", icon: Settings },
]

const footerLinks = ["Status", "Documentation", "Support", "Terms", "SLA", "Security & Compliance", "Cookie Consent"]

export function CloudShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    // Product UI, so the accent is indigo, the design system's default. Fills the studio below its 48px top menu.
    <SidebarProvider className="min-h-[calc(100svh-3rem)]">
      {/* h-auto: the static sidebar is h-full, which doesn't resolve in a min-height row; auto lets it stretch. */}
      <Sidebar collapsible="none" className="h-auto border-r">
        <SidebarHeader className="h-16 justify-center border-b px-6">
          <Image src="/repo/brand-assets/logo/qdrant-logo-dark.svg" alt="Qdrant" width={106} height={28} className="light:hidden h-7 w-auto" />
          <Image src="/repo/brand-assets/logo/qdrant-logo-light.svg" alt="Qdrant" width={106} height={28} className="light:block hidden h-7 w-auto" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton variant="outline" size="lg">
                  <span>John Doe&apos;s Account</span>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              {nav.map(({ label, icon: Icon }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton isActive={label === active}>
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton variant="outline" size="lg">
                <div className="grid flex-1 text-left">
                  <span className="truncate font-medium">John Doe</span>
                  <span className="text-muted-foreground truncate">john.doe@qdrant.com</span>
                </div>
                <ChevronDown className="ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarSeparator className="mx-0" />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <CircleHelp />
                <span>Get Support</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* The product's top bar is empty on this page. */}
        <header className="h-16 shrink-0 border-b" />
        <div className="flex-1 px-8 py-6">{children}</div>
        <footer className="flex flex-wrap items-center justify-center gap-1 py-2">
          {footerLinks.map((label) => (
            <Button key={label} variant="link" size="sm" className="text-muted-foreground">
              {label}
            </Button>
          ))}
        </footer>
      </div>
    </SidebarProvider>
  )
}
