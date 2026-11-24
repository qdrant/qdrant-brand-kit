"use client"

import * as React from "react"
import { ArrowUpRight, Menu as MenuIcon } from "lucide-react"

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

import type { Link, Menu, MenuGroup, MenuHighlight } from "../content/site"
import { ArrowLink } from "../lib/arrow-link"
import { generativePattern } from "../patterns/explorations/generative"
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
  // How a menu's highlight (the Developers menu's Documentation) takes its own space (exploring, design lead,
  // 2026-11-24): card, a feature card at the panel's side; band, a band across the top; hub, a column of its own
  // with its quickstarts and client libraries.
  highlightStyle?: "card" | "band" | "hub" | "tile"
  // A menu open from the start, for previews (the studio's canvas and docs).
  openMenu?: string
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
  highlightStyle = "card",
  openMenu,
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
          defaultValue={openMenu}
        >
          <NavigationMenuList className="gap-1">
            {shown.map((menu, i) =>
              menu.groups ? (
                <NavigationMenuItem key={menu.label} value={menu.label}>
                  <NavigationMenuTrigger className="text-sm">
                    {menu.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-1.5">
                    <MegaPanel
                      groups={menu.groups}
                      featured={i === 0 ? featured : undefined}
                      markStyle={markStyle}
                      highlight={menu.highlight}
                      highlightStyle={highlightStyle}
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
          <HexIcon
            mark={item.mark}
            name={item.icon}
            variant={markStyle}
            className="size-9"
          />
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
  groups: allGroups,
  featured,
  markStyle,
  highlight,
  highlightStyle = "card",
}: {
  groups: MenuGroup[]
  featured?: NavbarProps["featured"]
  markStyle: HexStyle
  highlight?: MenuHighlight
  highlightStyle?: NavbarProps["highlightStyle"]
}) {
  // The highlighted item has its own space, so it leaves its group's list. The tile sits in that group, at the bottom
  // of its column; the other layouts sit at the panel's start or top.
  const tile = highlight && highlightStyle === "tile"
  const homeGroup = highlight
    ? allGroups.find((group) =>
        group.items.some((item) => item.href === highlight.href)
      )
    : undefined
  const groups = highlight
    ? allGroups.map((group) => ({
        ...group,
        items: group.items.filter((item) => item.href !== highlight.href),
      }))
    : allGroups
  const band = highlight && highlightStyle === "band"
  return (
    <div
      className={cn(
        "flex h-full gap-2 rounded-xl border border-(--web-line) bg-popover p-2",
        band && "flex-col"
      )}
    >
      {highlight && !tile && (
        <Highlight
          item={highlight}
          variant={highlightStyle}
          markStyle={markStyle}
        />
      )}
      <div className="flex gap-2">
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
                      <FeatureItem
                        item={item}
                        index={index}
                        markStyle={markStyle}
                      />
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
              {tile && highlight && homeGroup?.title === group.title && (
                <Highlight
                  item={highlight}
                  variant="tile"
                  markStyle={markStyle}
                />
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

// The tile's pattern: Pixel drift (web/patterns/explorations, the marketing designer's), with its own params, on a
// 20-second loop instead of 6 so it drifts more quietly, and without its fade, since the tile masks it to a corner.
const docsDrift = generativePattern({
  id: "docs-pixel-drift",
  name: "Pixel drift (Documentation tile)",
  kind: "surface",
  description:
    "Pixel drift, slower, for the Documentation tile in the Developers menu.",
  loop: 20,
  fade: false,
  params: {
    layout: "grid",
    cell: 10,
    shape: "gradient",
    rotation: 40,
    size: 1,
    shaping: "fill",
    softness: 1.2,
    noiseAmount: 0.45,
    blend: "add",
    noiseScale: 4,
    octaves: 2,
    warp: 0,
    element: "hexagon",
    orientation: "fixed",
    elementRotation: 30,
    scale: 0.7,
    sizeByValue: false,
    density: "stochastic",
    threshold: 0,
    seed: 7,
  },
})

// A menu's highlight (design lead, 2026-11-24, exploring), one item given its own space, in four layouts:
// - card: a feature card at the panel's start, its big mark, title, description, Getting Started links and Read
//   the Docs (after Lululemon's and Hers' menus, whose side card carries a large visual).
// - band: a band across the top of the panel, the mark, title and description on the left and its links as chips on
//   the right, the menu's groups below it (after Slack API's docs menu, which opens with a header row).
// - hub: a column of its own on a tray, with its Getting Started links and a grid of the client libraries (after
//   Codecademy's Docs, which opens its own space with a chip per language).
// - tile: only the main link, as a compact card at the bottom of its group's column (under its other links), with
//   Pixel drift moving quietly on its right side (after the design lead's reference: dark resource tiles with a pixel accent in a corner).
function Highlight({
  item,
  variant = "card",
  markStyle,
}: {
  item: MenuHighlight
  variant?: NavbarProps["highlightStyle"]
  markStyle: HexStyle
}) {
  const mark = (size: "md" | "lg") => (
    <span
      className={cn(
        "web-icon-tile web-tone-indigo grid shrink-0 place-items-center overflow-hidden",
        size === "lg" ? "size-16 rounded-2xl" : "size-14 rounded-xl"
      )}
    >
      <HexIcon
        mark={item.mark}
        variant={markStyle}
        className={size === "lg" ? "size-12" : "size-10"}
      />
    </span>
  )
  const title = (
    <NavigationMenuLink
      href={item.href}
      className="w-fit p-0 text-[17px] leading-snug font-medium text-foreground hover:bg-transparent hover:text-(--web-link)"
    >
      {item.label}
    </NavigationMenuLink>
  )
  const description = (
    <p className="text-[13px] leading-snug text-muted-foreground">
      {item.description}
    </p>
  )
  const label = (text: string) => (
    <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
      {text}
    </p>
  )
  const quickLinks = (
    <ul className="flex flex-col gap-0.5">
      {item.start.map((link) => (
        <li key={link.label}>
          <NavigationMenuLink href={link.href} className="px-2 py-1.5 text-sm">
            {link.label}
          </NavigationMenuLink>
        </li>
      ))}
    </ul>
  )

  if (variant === "tile") {
    const Drift = docsDrift.Layer
    return (
      <Plate
        as="div"
        className="group/tile relative flex min-h-11 flex-1 items-start overflow-hidden rounded-lg"
      >
        {/* The pattern fills the right side, past the label, and fades toward it. It's mirrored so its dense side (it
            gathers toward the lower left) sits at the tile's edge, and a little stronger than in a card. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-[58%] -scale-x-100 [mask-image:linear-gradient(to_left,transparent,black_55%)] [&_.web-generative]:opacity-85"
        >
          <Drift />
        </span>
        <NavigationMenuLink
          href={item.href}
          className="relative gap-1.5 p-3 text-sm font-medium text-foreground hover:bg-transparent hover:text-(--web-link)"
        >
          {item.label}
          <ArrowUpRight
            className="size-3.5 text-muted-foreground"
            aria-hidden
          />
        </NavigationMenuLink>
      </Plate>
    )
  }

  if (variant === "band") {
    return (
      <div className="web-tray flex items-center gap-5 rounded-lg p-4">
        {mark("md")}
        <div className="flex max-w-md min-w-0 flex-col gap-1">
          {title}
          {description}
        </div>
        <ul className="ml-auto flex max-w-sm flex-wrap justify-end gap-1.5">
          {[...item.start, ...item.sections].map((link) => (
            <li key={link.label}>
              <NavigationMenuLink
                href={link.href}
                className="rounded-md border border-(--web-line) bg-popover px-2.5 py-1 text-xs whitespace-nowrap"
              >
                {link.label}
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (variant === "hub") {
    return (
      <div className="web-tray flex w-80 shrink-0 flex-col gap-4 rounded-lg p-4">
        <div className="flex items-center gap-4">
          {mark("md")}
          {title}
        </div>
        {description}
        <div className="flex flex-col gap-1.5">
          {label("Getting Started")}
          {quickLinks}
        </div>
        <div className="flex flex-col gap-2">
          {label("Client Libraries")}
          <ul className="grid grid-cols-3 gap-1.5">
            {item.libraries.map((lib) => (
              <li key={lib.label}>
                <NavigationMenuLink
                  href={lib.href}
                  className="justify-center rounded-md border border-(--web-line) bg-popover px-2 py-1.5 font-mono text-xs"
                >
                  {lib.label}
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </div>
        <ArrowLink href={item.action.href} className="text-sm">
          {item.action.label}
        </ArrowLink>
      </div>
    )
  }

  return (
    <Plate
      as="div"
      className="flex w-72 shrink-0 flex-col gap-4 rounded-lg p-5"
    >
      {mark("lg")}
      <div className="flex flex-col gap-1.5">
        {title}
        {description}
      </div>
      <div className="flex flex-col gap-1.5">
        {label("Getting Started")}
        {quickLinks}
      </div>
      <ArrowLink href={item.action.href} className="mt-auto text-sm">
        {item.action.label}
      </ArrowLink>
    </Plate>
  )
}
