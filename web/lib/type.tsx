// The web type scale as Tailwind classes for sections, from primitives/typography (the --qd-type-* roles and
// font sizes). Headings are SemiBold (Medium in the website's type trial, web/styles/web.css), never Bold, in Mona Sans Display (font-display); body text is Mona Sans and
// kickers Mona Sans Mono (2026-11-17).
export const type = {
  // Mono labels above headings, in capitals.
  kicker:
    "font-mono text-(length:--qd-font-size-14) leading-(--qd-line-height-150) uppercase tracking-normal text-muted-foreground",
  h1: "font-display text-(length:--qd-type-h1-size) leading-(--qd-type-h1-line-height) tracking-(--qd-type-h1-letter-spacing) font-[var(--web-heading-weight,600)] text-foreground",
  h2: "font-display text-(length:--qd-type-h2-size) leading-(--qd-type-h2-line-height) tracking-(--qd-type-h2-letter-spacing) font-[var(--web-heading-weight,600)] text-foreground",
  h3: "font-display text-(length:--qd-type-h3-size) leading-(--qd-type-h3-line-height) tracking-(--qd-type-h3-letter-spacing) font-[var(--web-heading-weight,600)] text-foreground",
  h4: "font-display text-(length:--qd-type-h4-size) leading-(--qd-type-h4-line-height) tracking-(--qd-type-h4-letter-spacing) font-[var(--web-heading-weight,600)] text-foreground",
  h5: "font-display text-(length:--qd-type-h5-size) leading-(--qd-type-h5-line-height) tracking-(--qd-type-h5-letter-spacing) font-[var(--web-heading-weight,600)] text-foreground",
  h6: "font-display text-(length:--qd-type-h6-size) leading-(--qd-type-h6-line-height) tracking-(--qd-type-h6-letter-spacing) font-[var(--web-heading-weight,600)] text-foreground",
  // Body sizes: 20px, 18px lead, 16px body, 14px and 12px small print. Add font-semibold for a 20px title.
  xl: "text-(length:--qd-type-text-xl-size) leading-(--qd-type-text-xl-line-height) tracking-(--qd-type-text-xl-letter-spacing) text-muted-foreground",
  lead: "text-(length:--qd-font-size-18) leading-(--qd-line-height-150) text-muted-foreground",
  body: "text-(length:--qd-font-size-16) leading-(--qd-line-height-150) text-muted-foreground",
  small:
    "text-(length:--qd-font-size-14) leading-(--qd-line-height-150) text-muted-foreground",
  xsmall:
    "text-(length:--qd-font-size-12) leading-(--qd-line-height-150) text-muted-foreground",
} as const

// Headings that step down on smaller screens (2026-11-21): a page title, a section title and a card title. Use
// these in sections so every one scales the same way.
export const heading = {
  // The hero's H1: 40px on phones, 56px from md, 64px from lg.
  page: `${type.h4} md:text-(length:--qd-type-h2-size) md:leading-(--qd-type-h2-line-height) lg:text-(length:--qd-type-h1-size) lg:leading-(--qd-type-h1-line-height)`,
  // A section's H2: 32px on phones, 40px from md, 48px from lg.
  section: `${type.h5} md:text-(length:--qd-type-h4-size) md:leading-(--qd-type-h4-line-height) lg:text-(length:--qd-type-h3-size) lg:leading-(--qd-type-h3-line-height)`,
  // A large statement inside a section (a CTA): 32px on phones, 48px from md, 56px from lg.
  statement: `${type.h5} md:text-(length:--qd-type-h3-size) md:leading-(--qd-type-h3-line-height) lg:text-(length:--qd-type-h2-size) lg:leading-(--qd-type-h2-line-height)`,
  // A card or column title: 20px, semibold.
  card: "font-display text-(length:--qd-type-text-xl-size) leading-(--qd-type-text-xl-line-height) font-[var(--web-heading-weight,600)] text-foreground",
} as const
