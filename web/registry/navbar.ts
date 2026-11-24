import { Navbar, type NavbarProps } from "../sections/navbar"
import { announcement, menus, navActions } from "../content/site"
import { defineSection } from "./types"

export const navbar = defineSection<NavbarProps>({
  id: "navbar",
  name: "Navbar",
  category: "navigation",
  summary: "The site's top menu, with mega menu panels from lg and a sheet on phones.",
  file: "navbar",
  component: Navbar,
  variants: [
    {
      id: "full",
      name: "Full",
      description: "Products, Developers and Resources menus (Solutions is hidden for now), Pricing, and three actions.",
      props: { variant: "full", menus, ...navActions },
      frameMinHeight: 480,
    },
    {
      id: "featured",
      name: "Full with featured card",
      description: "As Full, with the latest release as a card in the Products panel.",
      props: {
        variant: "full",
        menus,
        ...navActions,
        featured: { tag: announcement.tag, title: announcement.text, link: announcement.link },
      },
      frameMinHeight: 480,
    },
    {
      id: "docs-card",
      name: "Docs: feature card",
      description: "The Developers menu with Documentation as a feature card at the panel's start: its big mark, description, Getting Started links and Read the Docs.",
      props: { variant: "full", menus, ...navActions, openMenu: "Developers", highlightStyle: "card" },
      frameMinHeight: 560,
      proposal: "Documentation is the most important part of the site for developers, so it gets its own space and a big mark instead of one line in a list. After Lululemon's and Hers' menus, whose side card carries a large visual.",
    },
    {
      id: "docs-band",
      name: "Docs: top band",
      description: "The Developers menu with Documentation as a band across the top: the mark, title and description, its links as chips, the groups below.",
      props: { variant: "full", menus, ...navActions, openMenu: "Developers", highlightStyle: "band" },
      frameMinHeight: 560,
      proposal: "Documentation reads first, across the whole panel, before the rest of the menu. After Slack API's docs menu, which opens with a header row for its guides and docs.",
    },
    {
      id: "docs-hub",
      name: "Docs: hub column",
      description: "The Developers menu with Documentation as a column of its own on a tray: its Getting Started links and a grid of the client libraries.",
      props: { variant: "full", menus, ...navActions, openMenu: "Developers", highlightStyle: "hub" },
      frameMinHeight: 560,
      proposal: "Documentation becomes a small hub inside the menu, with the quickstarts and a chip per client library. After Codecademy's Docs, which opens its own space with a chip per language.",
    },
    {
      id: "docs-tile",
      name: "Docs: pattern tile",
      description: "The Developers menu with Documentation as a compact tile: its title and quickstarts, no paragraph or icon, and Pixel drift moving quietly in its lower corner.",
      props: { variant: "full", menus, ...navActions, openMenu: "Developers", highlightStyle: "tile" },
      frameMinHeight: 480,
      proposal: "Documentation stands out through a living surface rather than a big icon or a paragraph: a compact tile where the marketing designer's Pixel drift pattern fills one corner and drifts slowly. After the design lead's reference: compact dark resource tiles with a pixel accent in a corner.",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "The logo, Log in and Start Free, for landing pages that keep the reader on one action.",
      props: { variant: "minimal", login: navActions.login, start: navActions.start },
    },
  ],
  docs: {
    use: [
      "Full on every page of the site. Minimal on paid landing pages, where the menus would pull readers away.",
      "Turn on sticky on long pages, so the menus and Start Free stay in reach.",
    ],
    rules: [
      "Menus group items by job, each group under a mono label. An item has a Lucide icon, bare and neutral (no tile), and, when needed, one tag (Beta, Waitlist).",
      "Every panel opens centered under the bar and has the tray's double border. A column holds up to five links; a group of six or more splits into even columns, so panels grow across, not down.",
      "Three actions at most, in this order: Log in (ghost), Contact Us (secondary), Start Free (primary), all in the small size with 14px text, like the menus. Only Start Free is primary.",
      "From lg the menus sit at the center of the page: the logo's and the actions' columns are always the same width.",
      "A menu with `hidden` stays out of the bar and the sheet, with its copy kept (Solutions, for now).",
      "Below lg the menus move into a sheet with one accordion per menu; Log in hides below sm and Contact Us below md.",
      "Item descriptions stay empty until the site has copy for them. Never invent them.",
    ],
    anatomy: [
      { part: "Logo", note: "From brand-assets, the version for the section's theme. Links home." },
      { part: "Menus", note: "Triggers that open a panel of columns, centered under the bar; Pricing is a plain link." },
      { part: "Featured card", note: "Optional, in the first panel: a release or event, on the highlight surface." },
      { part: "Actions", note: "Log in, Contact Us, Start Free." },
      { part: "Mobile sheet", note: "Below lg: the menus as accordions, then the actions." },
    ],
    props: [
      { name: "variant", type: '"full" | "minimal"', note: "Full has the menus; minimal has the logo and two actions." },
      { name: "menus", type: "Menu[]", note: "Menus with groups of items, or plain links (web/content/site.ts)." },
      { name: "login, contact, start", type: "{ label, href }", note: "The actions. start is required." },
      { name: "featured", type: "{ tag?, title, link }", note: "A card in the first menu's panel." },
      { name: "sticky", type: "boolean", note: "Keeps it at the top while the page scrolls." },
    ],
  },
  fields: [
    { prop: "sticky", label: "Sticky", kind: "boolean" },
    { prop: "highlightStyle", label: "Docs highlight", kind: "select", options: [{ value: "card", label: "Feature card" }, { value: "band", label: "Top band" }, { value: "hub", label: "Hub column" }, { value: "tile", label: "Pattern tile" }] },
    { prop: "markStyle", label: "Product marks", kind: "select", options: [{ value: "halftone", label: "Halftone" }, { value: "tones", label: "Tones" }, { value: "outline", label: "Outline" }, { value: "matrix", label: "Matrix" }] },
  ],
})
