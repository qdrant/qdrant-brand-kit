// The controls in the right panel, all global: each one changes a design-system token, so every instance of
// a component follows (components read their tokens through their classes; a className on one instance still
// wins). Defaults are the tokens' own values, so the panel starts with no changes. Foundation controls move
// every component that points to them; a component's own controls move only that component.
//
// The machinery (DialKit config, CSS output) is in lib/dials.ts. The tokens are in
// design-system/styles/components/, and the research behind the controls is summed up in
// design-system/DESIGN.md.

import { select, slider, toggle, type Group } from "@/lib/dials"

// Palette families that can carry the brand action color. White text needs 600 or darker on most,
// 700 or darker on these (Figma contrast rules, primitives/colors/README.md).
const accents = ["amaranth", "indigo", "blue", "purple", "pink", "red", "teal", "green", "cyan", "orange"]
const needs700 = new Set(["orange", "green", "teal", "cyan"])

// The panel's accent replaces the context accent (styles/globals.css) everywhere, product pages included.
function accentVars(family: string): Record<string, string> {
  const base = needs700.has(family) ? 700 : 600
  const c = (step: number) => `var(--qd-color-${family}-${step})`
  return {
    "--qd-ui-accent": c(base),
    "--qd-ui-accent-hover": c(base + 100),
    "--qd-ui-accent-muted": c(base - 200),
  }
}

// shadcn's radius sizes around one Figma radius, the way styles/globals.css maps them for the default ("sm").
const radii = ["none", "xs", "sm", "md", "lg", "xl"]
function radiusVars(base: string): Record<string, string> {
  const i = radii.indexOf(base)
  const at = (offset: number) => `var(--qd-radius-${radii[Math.min(Math.max(i + offset, 0), radii.length - 1)]})`
  return {
    "--radius-xs": at(-1),
    "--radius-sm": at(-1),
    "--radius-md": at(0),
    "--radius-lg": at(0),
    "--radius-xl": at(0),
    "--radius-2xl": at(1),
    "--radius-3xl": at(1),
    "--radius-4xl": at(2),
  }
}

// A color at a share, from the design system's own roles or the neutral ramp.
const mix = (color: string, share: number) => `color-mix(in oklab, ${color} ${share}%, transparent)`
const black = (share: number) => mix("var(--qd-color-neutral-1000)", share)

// Elevation presets, from the research: none, Vercel's small and medium materials, Vercel's menu, and
// Supabase's heavy floating shadow. "stock" is the component's current shadow.
const shadows: Record<string, string> = {
  none: "0 0 transparent",
  soft: `0 1px 2px ${black(16)}`,
  layered: `0 2px 2px ${black(8)}, 0 8px 8px -8px ${black(16)}`,
  floating: `0 1px 1px ${black(4)}, 0 4px 8px -4px ${black(8)}, 0 16px 24px -8px ${black(12)}`,
  deep: `0 8px 24px -12px ${black(24)}, 0 8px 32px -12px ${black(16)}, 0 32px 72px -12px ${black(12)}`,
}
const shadowOptions = Object.keys(shadows)
const shadow = (name: string) => (v: string) => (v === "stock" ? {} : { [name]: shadows[v] ?? shadows.none! })

// Easing presets: Tailwind's default, Supabase's enter curve, Vercel's swift (a slight overshoot), Ramp's
// in-out, and linear.
const easings = [
  { value: "cubic-bezier(0.19, 1, 0.22, 1)", label: "Weightless" },
  { value: "cubic-bezier(0.4, 0, 0.2, 1)", label: "Standard" },
  { value: "cubic-bezier(0.16, 1, 0.3, 1)", label: "Expo out" },
  { value: "cubic-bezier(0.175, 0.885, 0.32, 1.1)", label: "Swift" },
  { value: "cubic-bezier(0.45, 0.05, 0.55, 0.95)", label: "In-out" },
  { value: "linear", label: "Linear" },
]

const weights = (value: string) => select([], value, [
  { value: "300", label: "Light 300" },
  { value: "400", label: "Regular 400" },
  { value: "500", label: "Medium 500" },
  { value: "600", label: "SemiBold 600" },
])
const fonts = [
  { value: "var(--font-sans)", label: "Mona Sans" },
  { value: "var(--font-mono)", label: "Mono" },
]

// The neutral ramp (primitives/colors), for the depth controls.
const neutralSteps = [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 850, 900, 925, 950, 975, 1000].map(String)
const neutral = (vars: string | string[], step: string, scope: "dark" | "light") =>
  select(
    [vars].flat(),
    step,
    neutralSteps.map((s) => ({ value: s, label: `neutral-${s}` })),
    { scope, css: (v) => Object.fromEntries([vars].flat().map((name) => [name, `var(--qd-color-neutral-${v})`])) }
  )

// The colors a checked control can take: the accent (default) or the text color (monochrome).
const checkColor = (color: string, foreground: string) =>
  select([], "accent", ["accent", "text"], {
    css: (v) => (v === "text" ? { [color]: "var(--foreground)", ...(foreground ? { [foreground]: "var(--background)" } : {}) } : {}),
  })

export const controls: Group = {
  foundations: {
    color: {
      accent: select([], "amaranth", accents, { css: accentVars }),
    },
    shape: {
      radiusScale: select([], "sm", radii.slice(0, 5), { css: radiusVars }),
    },
    controls: {
      _collapsed: true,
      height: slider("--qd-ui-control-height", 36, 20, 48, 2),
      paddingX: slider("--qd-ui-control-padding-x", 8, 4, 24, 2),
      radius: slider("--qd-ui-control-radius", 8, 0, 24, 1),
      fontSize: slider("--qd-ui-control-font-size", 14, 10, 16, 0.5),
    },
    type: {
      _collapsed: true,
      headingWidth: slider("--studio-heading-stretch", 100, 75, 125, 5, "%"),
      tracking: slider("--qd-ui-tracking", 0, -0.04, 0.04, 0.005, "em"),
      titleSize: slider([], 14, 12, 20, 1, "px", {
        css: (v) => ({ "--qd-ui-title-size": `${v}px`, "--qd-ui-title-leading": `${Math.round((v * 20) / 14)}px` }),
      }),
      titleWeight: { ...weights("500"), vars: ["--qd-ui-title-weight"] },
      titleTracking: slider("--qd-ui-title-tracking", 0, -0.06, 0.02, 0.005, "em"),
      labelWeight: { ...weights("500"), vars: ["--qd-ui-label-weight"] },
      captionFont: select("--qd-ui-caption-font", "var(--font-mono)", fonts),
      captionUppercase: toggle(true, { "--qd-ui-caption-case": "uppercase" }, { "--qd-ui-caption-case": "none" }),
      captionTracking: slider("--qd-ui-caption-tracking", 0.08, -0.02, 0.12, 0.01, "em"),
      tabularNumbers: toggle(true, { "--qd-ui-numerals": "tabular-nums" }, { "--qd-ui-numerals": "normal" }),
    },
    light: {
      _collapsed: true,
      // Light from above, on dark: the line along the top edge of cards, menus, popovers and dialogs.
      topLight: slider([], 6, 0, 20, 1, "%", {
        scope: "dark",
        css: (v) => ({ "--qd-ui-top-light": mix("var(--qd-color-neutral-0)", v) }),
      }),
    },
    focus: {
      _collapsed: true,
      width: slider("--qd-ui-focus-width", 2, 0, 4, 0.5),
      opacity: slider([], 30, 10, 100, 5, "%", { css: (v) => ({ "--qd-ui-focus-color": mix("var(--ring)", v) }) }),
      offset: slider("--qd-ui-focus-offset", 0, 0, 4, 1),
    },
    motion: {
      _collapsed: true,
      hoverDuration: slider("--default-transition-duration", 150, 0, 400, 10, "ms"),
      popupDuration: slider("--qd-ui-popup-duration", 150, 0, 400, 10, "ms"),
      easing: select("--default-transition-timing-function", easings[0]!.value, easings),
    },
    overlay: {
      _collapsed: true,
      opacity: slider([], 70, 0, 100, 5, "%", { css: (v) => ({ "--qd-ui-overlay": mix("var(--background)", v) }) }),
      blur: slider("--qd-ui-overlay-blur", 12, 0, 24, 1),
    },
  },

  // Depth: each surface is a level of the page (the design system's `--qd-ui-page`, `--qd-ui-card`,
  // `--qd-ui-popover` and `--qd-ui-highlight`), plus the edges and the secondary text. Per theme, like
  // styles/globals.css, which shadcn reads them through.
  depthDark: {
    page: neutral("--qd-ui-page", "975", "dark"),
    raised: neutral("--qd-ui-card", "950", "dark"),
    overlay: neutral("--qd-ui-popover", "925", "dark"),
    highlight: neutral("--qd-ui-highlight", "900", "dark"),
    hover: slider([], 4, 0, 20, 1, "%", { scope: "dark", css: (v) => ({ "--qd-ui-hover": mix("var(--foreground)", v) }) }),
    border: slider([], 9, 0, 40, 1, "%", { scope: "dark", css: (v) => ({ "--border": mix("var(--foreground)", v) }) }),
    fieldFill: neutral("--qd-ui-input-bg", "900", "dark"),
    fieldEdge: neutral("--input", "800", "dark"),
    mutedText: neutral("--qd-color-text-secondary", "500", "dark"),
  },
  depthLight: {
    _collapsed: true,
    page: neutral("--qd-ui-page", "0", "light"),
    raised: neutral("--qd-ui-card", "0", "light"),
    overlay: neutral("--qd-ui-popover", "0", "light"),
    highlight: neutral("--qd-ui-highlight", "50", "light"),
    hover: neutral("--qd-ui-hover", "50", "light"),
    border: slider([], 10, 0, 40, 1, "%", { scope: "light", css: (v) => ({ "--border": mix("var(--foreground)", v) }) }),
    fieldFill: neutral("--qd-ui-input-bg", "25", "light"),
    fieldEdge: neutral("--input", "300", "light"),
    mutedText: neutral("--qd-color-text-secondary", "600", "light"),
  },

  components: {
    _collapsed: true,
    button: {
      _collapsed: true,
      height: slider("--qd-ui-button-height", 36, 20, 48, 2),
      paddingX: slider("--qd-ui-button-padding-x", 16, 4, 28, 2),
      gap: slider("--qd-ui-button-gap", 8, 0, 12, 1),
      radius: slider("--qd-ui-button-radius", 8, 0, 24, 1),
      fontSize: slider("--qd-ui-button-font-size", 14, 10, 16, 0.5),
      weightPrimary: { ...weights("600"), vars: ["--qd-ui-button-weight"] },
      weightOthers: { ...weights("500"), vars: ["--qd-ui-button-font-weight"] },
      tracking: slider("--qd-ui-button-tracking", 0, -0.04, 0.1, 0.005, "em"),
      uppercase: toggle(false, { "--qd-ui-button-case": "uppercase" }),
      pressOffset: slider("--qd-ui-button-press", 0, 0, 3, 0.5),
      pressScale: slider("--qd-ui-button-press-scale", 0.97, 0.9, 1, 0.01, ""),
      duration: slider("--qd-ui-button-duration", 200, 0, 400, 10, "ms"),
      focusOffset: slider("--qd-ui-button-focus-offset", 2, 0, 4, 1),
      edgeStrength: slider("--qd-ui-button-edge-strength", 1, 0, 2, 0.1, ""),
    },
    field: {
      _collapsed: true,
      height: slider("--qd-ui-input-height", 36, 20, 48, 2),
      paddingX: slider("--qd-ui-input-padding-x", 8, 4, 20, 1),
      radius: slider("--qd-ui-input-radius", 8, 0, 24, 1),
      fontSize: slider("--qd-ui-input-font-size", 14, 10, 16, 0.5),
      edge: select("--qd-ui-input-border", "var(--input)", [
        { value: "var(--input)", label: "Field edge" },
        { value: "var(--border)", label: "Border" },
        { value: "transparent", label: "None" },
      ]),
    },
    card: {
      _collapsed: true,
      radius: slider("--qd-ui-card-radius", 8, 0, 32, 1),
      padding: slider("--qd-ui-card-padding", 16, 8, 40, 2),
      edgeWidth: slider("--qd-ui-card-border-width", 1, 0, 2, 0.5),
      edge: select("--qd-ui-card-border-color", "var(--border)", [
        { value: "var(--border)", label: "Soft border" },
        { value: "var(--input)", label: "Field edge" },
        { value: "transparent", label: "None" },
      ]),
      shadow: select([], "none", shadowOptions, { css: shadow("--qd-ui-card-shadow") }),
    },
    badge: {
      _collapsed: true,
      height: slider("--qd-ui-badge-height", 20, 14, 28, 1),
      paddingX: slider("--qd-ui-badge-padding-x", 8, 2, 16, 1),
      radius: select("--qd-ui-badge-radius", "calc(infinity * 1px)", [
        { value: "calc(infinity * 1px)", label: "Pill" },
        { value: "8px", label: "8px" },
        { value: "6px", label: "6px" },
        { value: "4px", label: "4px" },
        { value: "2px", label: "2px" },
        { value: "0px", label: "Square" },
      ]),
      font: select("--qd-ui-badge-font", "var(--font-sans)", fonts),
      fontSize: slider("--qd-ui-badge-font-size", 10, 8, 14, 0.5),
      weight: { ...weights("500"), vars: ["--qd-ui-badge-font-weight"] },
      uppercase: toggle(false, { "--qd-ui-badge-case": "uppercase" }),
      tracking: slider("--qd-ui-badge-tracking", 0, -0.02, 0.12, 0.01, "em"),
    },
    menu: {
      _collapsed: true,
      radius: slider("--qd-ui-menu-radius", 8, 0, 20, 1),
      padding: slider("--qd-ui-menu-padding", 4, 0, 12, 1),
      itemHeight: slider("--qd-ui-menu-item-height", 28, 20, 40, 2),
      itemPaddingX: slider("--qd-ui-menu-item-padding-x", 8, 4, 16, 1),
      itemRadius: slider("--qd-ui-menu-item-radius", 8, 0, 12, 1),
      edge: select("--qd-ui-menu-border-color", "var(--border)", [
        { value: "var(--border)", label: "Soft border" },
        { value: "var(--input)", label: "Field edge" },
        { value: "transparent", label: "None" },
      ]),
      shadow: select([], "stock", ["stock", ...shadowOptions], { css: shadow("--qd-ui-menu-shadow") }),
      opacity: slider("--qd-ui-menu-opacity", 70, 40, 100, 5, "%"),
      blur: slider("--qd-ui-menu-blur", 40, 0, 60, 2),
      popoverPadding: slider("--qd-ui-popover-padding", 10, 4, 24, 1),
    },
    tabs: {
      _collapsed: true,
      height: slider("--qd-ui-tabs-height", 40, 20, 48, 2),
      padding: slider("--qd-ui-tabs-padding", 3, 0, 8, 0.5),
      radius: slider("--qd-ui-tabs-radius", 8, 0, 20, 1),
      triggerRadius: slider("--qd-ui-tabs-trigger-radius", 8, 0, 16, 1),
    },
    checkboxAndRadio: {
      _collapsed: true,
      checkboxSize: slider("--qd-ui-checkbox-size", 16, 12, 24, 1),
      checkboxRadius: slider("--qd-ui-checkbox-radius", 4, 0, 8, 0.5),
      radioSize: slider("--qd-ui-radio-size", 16, 12, 24, 1),
      checkedColor: checkColor("--qd-ui-check-color", "--qd-ui-check-foreground"),
    },
    switch: {
      _collapsed: true,
      width: slider("--qd-ui-switch-width", 28, 24, 48, 1),
      height: slider("--qd-ui-switch-height", 16.6, 14, 28, 0.1),
      checkedColor: checkColor("--qd-ui-switch-color", ""),
    },
    tooltip: {
      _collapsed: true,
      radius: slider("--qd-ui-tooltip-radius", 8, 0, 12, 1),
      paddingX: slider("--qd-ui-tooltip-padding-x", 12, 4, 16, 1),
      paddingY: slider("--qd-ui-tooltip-padding-y", 6, 2, 10, 1),
    },
    dialog: {
      _collapsed: true,
      radius: slider("--qd-ui-dialog-radius", 8, 0, 32, 1),
      padding: slider("--qd-ui-dialog-padding", 16, 8, 40, 2),
    },
    table: {
      _collapsed: true,
      headHeight: slider("--qd-ui-table-head-height", 40, 24, 56, 2),
      cellPadding: slider("--qd-ui-table-cell-padding", 8, 4, 16, 1),
    },
  },
}
