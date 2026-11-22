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
      description: "Products, Solutions, Developers and Resources menus, Pricing, and three actions.",
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
      "Menus group items by job, each group under a mono label. An item has a Lucide icon and, when needed, one tag (Beta, Waitlist).",
      "Three actions at most, in this order: Log in (ghost), Contact Us (outline), Start Free (primary). Only Start Free is primary.",
      "Below lg the menus move into a sheet with one accordion per menu; Log in hides below sm and Contact Us below md.",
      "Item descriptions stay empty until the site has copy for them. Never invent them.",
    ],
    anatomy: [
      { part: "Logo", note: "From brand-assets, the version for the section's theme. Links home." },
      { part: "Menus", note: "Triggers that open a panel of columns; Pricing is a plain link." },
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
  fields: [{ prop: "sticky", label: "Sticky", kind: "boolean" }],
})
