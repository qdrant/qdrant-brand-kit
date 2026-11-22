"use client"

import * as React from "react"

import { cn } from "@qdrant/design-system/lib/utils"

import type { Link } from "../content/site"
import { Section, type SectionProps } from "../lib/section"

export type AnchorNavProps = SectionProps & {
  // The page's parts, each an in-page link (#id).
  items: Link[]
  // A quiet label before the tabs, from md.
  label?: string
  // Stick to the top of the page while it scrolls.
  sticky?: boolean
  // tabs: anchor tabs on one line, scrolling sideways on phones.
  layout?: "tabs"
}

// A sticky in-page nav for long pages (2026-11-21): anchor tabs on one line, the active one marked in indigo. It
// follows the reader: the part nearest the top of the screen is the active tab (scroll-spy), and a click marks the
// tab right away. Parts it can't find on the page leave the active tab to clicks.
export function AnchorNav({
  items,
  label,
  sticky = true,
  theme,
  surface,
  pattern,
  cardPattern,
  id,
  className,
}: AnchorNavProps) {
  const [active, setActive] = React.useState(items[0]?.href ?? "")
  const listRef = React.useRef<HTMLUListElement>(null)

  // Scroll-spy: watch the parts the tabs point to, and mark the one in the top part of the screen.
  React.useEffect(() => {
    const targets = items
      .map((item) => (item.href.startsWith("#") ? document.getElementById(item.href.slice(1)) : null))
      .filter((el): el is HTMLElement => Boolean(el))
    if (targets.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(`#${visible[0].target.id}`)
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  // Keep the active tab in view when the list scrolls sideways.
  React.useEffect(() => {
    const list = listRef.current
    const el = list?.querySelector<HTMLElement>('[aria-current="location"]')
    if (!list || !el) return
    const left = el.offsetLeft
    const right = left + el.offsetWidth
    if (left < list.scrollLeft) list.scrollLeft = left
    else if (right > list.scrollLeft + list.clientWidth) list.scrollLeft = right - list.clientWidth
  }, [active])

  return (
    <Section
      theme={theme}
      surface={surface}
      pattern={pattern}
      cardPattern={cardPattern}
      spacing="none"
      lines={false}
      id={id}
      className={cn("border-b border-(--web-line)", sticky && "sticky top-(--web-sticky-top,0px) z-20", className)}
    >
      <nav aria-label={label ?? "On this page"} className="flex items-center gap-8">
        {label && (
          <span className="hidden shrink-0 font-mono text-xs text-muted-foreground uppercase lg:block">{label}</span>
        )}
        <ul ref={listRef} className="relative -mx-6 flex min-w-0 flex-1 overflow-x-auto px-6 md:mx-0 md:px-0">
          {items.map((item, i) => {
            const on = item.href === active
            return (
              <li key={item.href} className={cn("shrink-0", i === 0 && "lg:ml-auto")}>
                <a
                  href={item.href}
                  aria-current={on ? "location" : undefined}
                  onClick={() => setActive(item.href)}
                  className={cn(
                    "relative flex h-14 items-center px-4 text-sm whitespace-nowrap outline-none focus-visible:underline",
                    on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn("absolute inset-x-4 bottom-0 h-0.5 transition-colors", on ? "bg-(--web-indigo)" : "bg-transparent")}
                  />
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </Section>
  )
}
