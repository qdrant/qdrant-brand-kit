"use client"

import * as React from "react"
import { Menu as MenuIcon } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@qdrant/design-system/components/ui/accordion"
import { Badge } from "@qdrant/design-system/components/ui/badge"
import { Button } from "@qdrant/design-system/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@qdrant/design-system/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@qdrant/design-system/components/ui/sheet"
import { cn } from "@qdrant/design-system/lib/utils"

import type { Link, Menu, MenuGroup } from "../content/site"
import { HexIcon, type HexStyle } from "../lib/hex-icon"
import { Icon } from "../lib/icon"
import { toneAt } from "../lib/tone"
import { Plate } from "../lib/plate"
import { LinkButton } from "../lib/link-button"
import { Logo } from "../lib/logo"
import { Section, type SectionProps } from "../lib/section"

export type NavbarProps = SectionProps & {
  // full: the menus, Pricing and three actions. minimal: the logo and two actions, for landing pages.
  variant?: "full" | "minimal"
  menus?: Menu[]
  login?: Link
  contact?: Link
  start: Link
  // A card in the first menu's panel, like the latest release.
  featured?: { tag?: string; title: string; link: Link }
  // Stays at the top of the window while the page scrolls.
  sticky?: boolean
  // How the products' marks are drawn in the menu's special section (exploring; matrix, design lead, 2026-11-24).
  markStyle?: HexStyle
}

// The site's top menu (2026-11-21). From lg, each menu opens a panel of columns: a mono group label over items
// with an icon and an optional tag (Beta, Waitlist). Every panel opens centered under the whole bar, whichever menu
// opened it (design lead, 2026-11-23, like Cloudflare's). Below lg, the menus fold into a sheet with one accordion per
// menu. The logo follows the theme.
export function Navbar({
  variant = "full",
  menus: allMenus = [],
  login,
  contact,
  start,
  featured,
  sticky,
  markStyle = "matrix",
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: NavbarProps) {
  const shown = allMenus.filter((menu) => !menu.hidden)
  // The panels are placed against the whole bar, not the menu that opened them, so they're always centered.
  const bar = React.useRef<HTMLElement>(null)
  return (
    <Section
      ref={bar}
      theme={theme}
      surface={surface}
      pattern={pattern}
      cardPattern={cardPattern}
      spacing="none"
      lines={false}
      id={id}
      className={cn(
        "web-navbar overflow-visible border-b border-(--web-line)",
        sticky && "sticky top-0 z-40 bg-background/85 backdrop-blur-md",
        className
      )}
      // From lg the full bar is three columns, the logo's and the actions' always the same width, so the menus sit
      // at the center of the page (design lead, 2026-11-23). Every link and button in the bar is 14px.
      innerClassName={cn(
        "flex h-16 items-center gap-6 lg:h-18",
        variant === "full" &&
          "lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
      )}
    >
      <a
        href="/"
        className="flex shrink-0 items-center justify-self-start"
        aria-label="Qdrant home"
      >
        <Logo className="h-7" />
      </a>

      {variant === "full" && (
        <NavigationMenu
          anchor={bar}
          align="center"
          sideOffset={8}
          // The tray's double border (web.css .web-tray): the popup is the outer frame and its 6px band, and the
          // panel inside has its own line (design lead, 2026-11-23).
          popupClassName="rounded-[calc(var(--radius-xl)+6px)] bg-[linear-gradient(var(--web-tray),var(--web-tray))] ring-(--web-line)"
          className="hidden lg:flex"
        >
          <NavigationMenuList className="gap-1">
            {shown.map((menu, i) =>
              menu.groups ? (
                <NavigationMenuItem key={menu.label}>
                  <NavigationMenuTrigger className="text-sm">
                    {menu.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-1.5">
                    <MegaPanel
                      groups={menu.groups}
                      featured={i === 0 ? featured : undefined}
                      markStyle={markStyle}
                    />
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={menu.label}>
                  <NavigationMenuLink
                    href={menu.href}
                    className={cn(navigationMenuTriggerStyle(), "text-sm")}
                  >
                    {menu.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            )}
          </NavigationMenuList>
        </NavigationMenu>
      )}

      <div className="ml-auto flex items-center gap-2 justify-self-end">
        {login && (
          <LinkButton
            href={login.href}
            variant="ghost"
            size="sm"
            className="hidden text-sm sm:inline-flex"
          >
            {login.label}
          </LinkButton>
        )}
        {variant === "full" && contact && (
          <LinkButton
            href={contact.href}
            variant="secondary"
            size="sm"
            className="hidden text-sm md:inline-flex"
          >
            {contact.label}
          </LinkButton>
        )}
        <LinkButton href={start.href} size="sm" className="text-sm">
          {start.label}
        </LinkButton>
        {variant === "full" && (
          <MobileMenu menus={shown} login={login} contact={contact} />
        )}
      </div>
    </Section>
  )
}

// A column holds up to five links, as wide as its longest label (labels never wrap). A group with six or more splits into columns of even length, filled top to
// bottom, so a panel grows across rather than down (design lead, 2026-11-23).
const MAX_PER_COLUMN = 5

function columnsOf<T>(items: T[]): T[][] {
  const count = Math.ceil(items.length / MAX_PER_COLUMN)
  const size = Math.ceil(items.length / count)
  return Array.from({ length: count }, (_, i) =>
    items.slice(i * size, (i + 1) * size)
  )
}

// An item of a feature group, the menu's special section (design lead, 2026-11-24, exploring): its icon drawn in
// hexagons on a tile of its color family, a larger label with its tag, and its description under it.
function FeatureItem({
  item,
  index,
  markStyle,
}: {
  item: MenuGroup["items"][number]
  index: number
  markStyle: HexStyle
}) {
  return (
    <NavigationMenuLink
      href={item.href}
      className="group/item w-full items-start gap-4 p-3"
    >
      <span
        className={cn(
          "web-icon-tile grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl",
          `web-tone-${toneAt(index)}`
        )}
      >
        {(item.mark || item.icon) && (
          <HexIcon mark={item.mark} name={item.icon} variant={markStyle} className="size-9" />
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-1 pt-0.5">
        <span className="flex items-center gap-2 text-[15px] leading-snug font-medium text-foreground">
          {item.label}
          {item.tag && (
            <Badge variant="outline" className="font-mono">
              {item.tag}
            </Badge>
          )}
        </span>
        {item.description && (
          <span className="text-[13px] leading-snug text-muted-foreground">
            {item.description}
          </span>
        )}
      </span>
    </NavigationMenuLink>
  )
}

// A menu's panel (design lead, 2026-11-23, after Cloudflare's): quiet and easy to read. Each group is a mono label over
// its columns, with a hairline between groups. An item is its icon, bare and neutral (no tile, no color family; it
// turns to the text color on hover), its label and an optional tag. The panel has the tray's inner line.
function MegaPanel({
  groups,
  featured,
  markStyle,
}: {
  groups: MenuGroup[]
  featured?: NavbarProps["featured"]
  markStyle: HexStyle
}) {
  return (
    <div className="flex h-full gap-2 rounded-xl border border-(--web-line) bg-popover p-2">
      <div className="flex divide-x divide-(--web-line,var(--border))">
        {groups.map((group, i) => (
          <div
            key={group.title ?? i}
            className="flex flex-col gap-2 px-4 py-3 first:pl-2 last:pr-2"
          >
            {group.title && (
              <p className="px-3 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                {group.title}
              </p>
            )}
            {group.feature ? (
              // One grid, filled column by column, so the rows line up across columns however long a description is.
              <ul
                className="grid grid-flow-col grid-cols-[repeat(2,22rem)] gap-x-2 gap-y-0.5"
                style={{
                  gridTemplateRows: `repeat(${Math.ceil(group.items.length / 2)}, auto)`,
                }}
              >
                {group.items.map((item, index) => (
                  <li key={item.label} className="flex">
                    <FeatureItem item={item} index={index} markStyle={markStyle} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex gap-2">
                {columnsOf(group.items).map((column, c) => (
                  <ul key={c} className="flex min-w-56 flex-col gap-0.5">
                    {column.map((item) => (
                      <li key={item.label}>
                        <NavigationMenuLink
                          href={item.href}
                          className="group/item gap-3 p-3 text-sm"
                        >
                          <Icon
                            name={item.icon}
                            className="size-4 shrink-0 text-muted-foreground transition-colors group-hover/item:text-foreground group-focus-visible/item:text-foreground"
                          />
                          <span className="flex-1 whitespace-nowrap">
                            {item.label}
                          </span>
                          {item.tag && (
                            <Badge variant="outline" className="font-mono">
                              {item.tag}
                            </Badge>
                          )}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {featured && (
        <Plate
          as="a"
          href={featured.link.href}
          className="flex w-64 flex-col justify-between gap-6 rounded-lg p-4 text-sm outline-none focus-visible:ring-(length:--qd-ui-focus-width) focus-visible:ring-(--qd-ui-focus-color)"
        >
          {featured.tag && (
            <Badge variant="outline" className="font-mono">
              {featured.tag}
            </Badge>
          )}
          <span className="flex flex-col gap-2">
            <span className="font-medium text-foreground">
              {featured.title}
            </span>
            <span className="text-(--web-link)">{featured.link.label}</span>
          </span>
        </Plate>
      )}
    </div>
  )
}

function MobileMenu({
  menus,
  login,
  contact,
}: {
  menus: Menu[]
  login?: Link
  contact?: Link
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            aria-label="Open the menu"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-6 text-sm sm:max-w-sm"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <Accordion className="mt-10 rounded-none border-0">
          {menus.map((menu) =>
            menu.groups ? (
              <AccordionItem key={menu.label} value={menu.label}>
                <AccordionTrigger className="text-base">
                  {menu.label}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4 pb-2">
                    {menu.groups.map((group, i) => (
                      <div
                        key={group.title ?? i}
                        className="flex flex-col gap-1"
                      >
                        {group.title && (
                          <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                            {group.title}
                          </p>
                        )}
                        {group.items.map((item) => (
                          <a
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 rounded-md py-1.5 text-sm no-underline! hover:text-foreground"
                          >
                            <Icon
                              name={item.icon}
                              className="size-4 text-muted-foreground"
                            />
                            <span className="flex-1">{item.label}</span>
                            {item.tag && (
                              <Badge variant="outline" className="font-mono">
                                {item.tag}
                              </Badge>
                            )}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ) : (
              <a
                key={menu.label}
                href={menu.href}
                className="flex border-t border-(--qd-ui-divider-color) p-2 text-base font-medium"
              >
                {menu.label}
              </a>
            )
          )}
        </Accordion>
        <div className="mt-8 flex flex-col gap-2">
          {contact && (
            <LinkButton href={contact.href} variant="secondary">
              {contact.label}
            </LinkButton>
          )}
          {login && (
            <LinkButton href={login.href} variant="ghost">
              {login.label}
            </LinkButton>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
