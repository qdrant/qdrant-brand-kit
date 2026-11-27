"use client"

import type * as React from "react"
import {
  ChevronDown,
  ChevronsUpDown,
  CloudSync,
  CreditCard,
  DatabaseBackup,
  KeyRound,
  Rocket,
  Server,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@qdrant/design-system/components/ui/badge"
import { Button } from "@qdrant/design-system/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@qdrant/design-system/components/ui/sidebar"
import { cn } from "@qdrant/design-system/lib/utils"

import { Logo } from "../lib/logo"

// Parts the Qdrant Cloud Console screens on the Cloud and Hybrid Cloud pages share (2026-11-26): the window
// around a screen, the side menu, the account bar and the status badge, drawn like the Console screens in
// visuals/console.tsx (the Resilience page's Figma) with the design system's components. Product UI, so the
// screens sit in data-context="product" and their accent is indigo.

// The selected state: the Console's primary/main, indigo-400 on dark and indigo-600 on light, as a border or text
// over a 16% tint (visuals/console.tsx).
export const selectedTint =
  "border-(--qd-color-indigo-400) bg-(--qd-color-indigo-400)/16 light:border-(--qd-color-indigo-600) light:bg-(--qd-color-indigo-600)/10"
export const indigoText =
  "text-(--qd-color-indigo-400) light:text-(--qd-color-indigo-700)"

// The Console's status badges: success in teal on a 16% tint, unknown in gray (visuals/console.tsx).
export function StatusBadge({
  tone = "success",
  children,
}: {
  tone?: "success" | "neutral"
  children: React.ReactNode
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        tone === "success"
          ? "bg-(--qd-color-teal-500)/16 text-(--qd-color-teal-400) light:bg-(--qd-color-teal-50) light:text-(--qd-color-teal-800)"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          tone === "success"
            ? "bg-(--qd-color-teal-500) light:bg-(--qd-color-teal-600)"
            : "bg-muted-foreground"
        )}
      />
      {children}
    </Badge>
  )
}

// The Console's side menu (visuals/console.tsx): secondary-gray items, the active one on the 16% tint with an
// indigo icon. The Figma's Hybrid Cloud icon isn't Lucide, so CloudSync stands in.
const nav: { label: string; icon: LucideIcon }[] = [
  { label: "Get Started", icon: Rocket },
  { label: "Clusters", icon: Server },
  { label: "Hybrid Cloud", icon: CloudSync },
  { label: "Backups", icon: DatabaseBackup },
  { label: "API Keys", icon: KeyRound },
]

const accountNav: { label: string; icon: LucideIcon }[] = [
  { label: "Access Management", icon: Users },
  { label: "Billing", icon: CreditCard },
  { label: "Settings", icon: Settings },
]

const navButton =
  "h-8 text-sm text-muted-foreground data-active:bg-(--qd-color-indigo-400)/16 data-active:text-foreground data-active:[&_svg]:text-(--qd-color-indigo-400) light:data-active:bg-(--qd-color-indigo-600)/10 light:data-active:[&_svg]:text-(--qd-color-indigo-600)"

// The account switcher and the user, the Console's top bar.
export function AccountBar({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center justify-between gap-3 border-b px-4",
        className
      )}
    >
      <Button variant="outline" size="sm">
        <Users aria-hidden />
        John Doe’s Account
        <ChevronsUpDown aria-hidden />
      </Button>
      <span className="flex items-center gap-1 text-sm text-foreground @max-[36rem]:hidden">
        John Doe
        <ChevronDown aria-hidden className="size-3.5 text-muted-foreground" />
      </span>
    </header>
  )
}

// The Console with its side menu: the menu drops out in a narrow frame (under 576px, a phone), so the screen keeps
// its text size instead of shrinking.
export function ConsoleShell({
  active,
  children,
}: {
  active: string
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      className="h-full min-h-0"
      style={{ "--sidebar-width": "12.5rem" } as React.CSSProperties}
    >
      <Sidebar collapsible="none" className="border-r @max-[36rem]:hidden">
        <SidebarHeader className="h-12 justify-center border-b px-4">
          <Logo className="h-6" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {nav.map(({ label, icon: Icon }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton
                    isActive={label === active}
                    className={navButton}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase">account</SidebarGroupLabel>
            <SidebarMenu>
              {accountNav.map(({ label, icon: Icon }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton className={navButton}>
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </SidebarProvider>
  )
}

// A Console screen at its own size, cropped at the bottom like a window onto the app: one image for assistive
// tech, inert inside.
export function ConsoleWindow({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      role="img"
      aria-label={label}
      data-context="product"
      className={cn(
        "@container relative max-w-full overflow-hidden bg-background text-foreground",
        className
      )}
    >
      <div inert className="h-full">
        {children}
      </div>
    </div>
  )
}
