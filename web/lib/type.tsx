// The web type scale as Tailwind classes for sections, from primitives/typography (the --qd-type-* roles and
// font sizes). Headings are SemiBold, never Bold.
export const type = {
  // Mono labels above headings, in capitals.
  kicker:
    "font-mono text-(length:--qd-font-size-14) leading-(--qd-line-height-normal) uppercase tracking-normal text-muted-foreground",
  h3: "text-(length:--qd-type-h3-size) leading-(--qd-type-h3-line-height) tracking-(--qd-type-h3-letter-spacing) font-semibold text-foreground",
  h4: "text-(length:--qd-type-h4-size) leading-(--qd-type-h4-line-height) tracking-(--qd-type-h4-letter-spacing) font-semibold text-foreground",
  h5: "text-(length:--qd-type-h5-size) leading-(--qd-type-h5-line-height) tracking-(--qd-type-h5-letter-spacing) font-semibold text-foreground",
  h6: "text-(length:--qd-type-h6-size) leading-(--qd-type-h6-line-height) tracking-(--qd-type-h6-letter-spacing) font-semibold text-foreground",
  // Body sizes: 20px, 18px lead, 16px body, 14px and 12px small print. Add font-semibold for a 20px title.
  xl: "text-(length:--qd-type-text-xl-size) leading-(--qd-type-text-xl-line-height) tracking-(--qd-type-text-xl-letter-spacing) text-muted-foreground",
  lead: "text-(length:--qd-font-size-18) leading-(--qd-line-height-normal) text-muted-foreground",
  body: "text-(length:--qd-font-size-16) leading-(--qd-line-height-normal) text-muted-foreground",
  small:
    "text-(length:--qd-font-size-14) leading-(--qd-line-height-normal) text-muted-foreground",
  xsmall:
    "text-(length:--qd-font-size-12) leading-(--qd-line-height-normal) text-muted-foreground",
} as const
