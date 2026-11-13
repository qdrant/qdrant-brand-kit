// Every component in design-system/components/ui, grouped for the studio. When a component is added,
// add it to a group here; the design system page shows a warning for any component that isn't listed.
export const catalog: { group: string; items: string[] }[] = [
  { group: "Actions", items: ["button", "button-group", "toggle", "toggle-group"] },
  {
    group: "Forms",
    items: [
      "input",
      "input-group",
      "input-otp",
      "textarea",
      "label",
      "field",
      "checkbox",
      "radio-group",
      "switch",
      "slider",
      "select",
      "native-select",
      "combobox",
      "calendar",
    ],
  },
  {
    group: "Overlays and menus",
    items: [
      "dialog",
      "alert-dialog",
      "sheet",
      "drawer",
      "popover",
      "hover-card",
      "tooltip",
      "dropdown-menu",
      "context-menu",
      "menubar",
      "command",
    ],
  },
  { group: "Navigation", items: ["navigation-menu", "breadcrumb", "pagination", "tabs", "sidebar"] },
  { group: "Feedback", items: ["alert", "toast", "progress", "spinner", "skeleton", "empty", "badge"] },
  {
    group: "Layout and display",
    items: [
      "card",
      "item",
      "table",
      "avatar",
      "kbd",
      "accordion",
      "collapsible",
      "carousel",
      "chart",
      "aspect-ratio",
      "separator",
      "scroll-area",
      "resizable",
    ],
  },
  {
    group: "AI",
    items: ["attachment", "bubble", "marker", "questionnaire", "message", "message-scroller", "trace", "code-block"],
  },
  { group: "Utilities", items: ["direction"] },
]

export const allComponents = catalog.flatMap((g) => g.items)

export const titleOf = (name: string) =>
  name
    .split("-")
    .map((w, i) => (i === 0 ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ")
