import { Hero, type HeroProps } from "../sections/hero"
import { cloudHero, homeHero, pricingHero } from "../content/site"
import { defineSection } from "./types"

export const hero = defineSection<HeroProps>({
  id: "hero",
  name: "Hero",
  category: "hero",
  summary: "The opening section of a page: its H1, main actions and an optional media slot.",
  file: "hero",
  component: Hero,
  variants: [
    {
      id: "home",
      name: "Centered with prompt",
      description: "The home page: centered heading, two actions, a prompt to copy and a row of proof points.",
      props: {
        layout: "centered",
        title: homeHero.title,
        description: homeHero.description,
        primary: homeHero.primary,
        secondary: homeHero.secondary,
        snippet: homeHero.snippet,
        trust: homeHero.trust,
      },
    },
    {
      id: "product",
      name: "Split with image",
      description: "A product page: kicker, heading, one action and pills on the left, a product screenshot on the right.",
      props: {
        layout: "split",
        kicker: cloudHero.kicker,
        title: cloudHero.title,
        primary: cloudHero.primary,
        pills: cloudHero.pills,
        media: "image",
        mediaLabel: "Product screenshot",
      },
    },
    {
      id: "code",
      name: "Split with code",
      description: "A developer-facing page: heading and actions on the left, Qdrant's quickstart search on the right.",
      props: {
        layout: "split",
        title: homeHero.title,
        description: homeHero.description,
        primary: homeHero.primary,
        secondary: homeHero.secondary,
        media: "code",
      },
    },
    {
      id: "page",
      name: "Page header",
      description: "An index or pricing page: a centered heading, one or two lines and two actions, no media.",
      props: {
        layout: "centered",
        title: pricingHero.title,
        description: pricingHero.description,
        primary: pricingHero.primary,
        secondary: pricingHero.secondary,
      },
    },
  ],
  docs: {
    use: [
      "Once per page, first after the navbar. It holds the page's only H1.",
      "Centered for the home page and index pages; split when a visual (a screenshot, code, an illustration) proves the claim.",
    ],
    rules: [
      "One primary action at most, and one secondary (outline). Pills and proof points are not buttons.",
      "The heading is SemiBold Mona Sans Display: 40px on phones, 56px from md, 64px from lg.",
      "A media placeholder is for review only; a page replaces it with the real image.",
      "Proof points are facts with a source (stars, members, certifications), never adjectives.",
    ],
    anatomy: [
      { part: "Kicker", note: "Optional, mono capitals: the product or page name." },
      { part: "Heading", note: "The page's H1." },
      { part: "Description", note: "One or two lines, in the lead size." },
      { part: "Actions", note: "Primary and secondary buttons." },
      { part: "Pills or prompt", note: "Optional: short claims as outline badges, or one line to copy." },
      { part: "Media", note: "Optional: code, or an image the page supplies." },
      { part: "Proof points", note: "Optional: a hairline, then facts with icons." },
    ],
    props: [
      { name: "layout", type: '"centered" | "split"', note: "Split puts the media on the right from lg." },
      { name: "kicker, title, description", type: "string", note: "title is required." },
      { name: "primary, secondary", type: "{ label, href }", note: "The actions." },
      { name: "snippet", type: "{ label?, text }", note: "One line to copy, like a prompt for an agent." },
      { name: "pills", type: "string[]", note: "Short claims." },
      { name: "trust", type: "{ label, icon? }[]", note: "Proof points, each with a Lucide icon name." },
      { name: "media", type: '"none" | "code" | "image"', note: "What fills the media slot." },
    ],
  },
  fields: [
    {
      prop: "layout",
      label: "Layout",
      kind: "select",
      options: [
        { value: "centered", label: "Centered" },
        { value: "split", label: "Split" },
      ],
    },
    { prop: "kicker", label: "Kicker", kind: "text" },
    { prop: "title", label: "Heading", kind: "textarea" },
    { prop: "description", label: "Description", kind: "textarea" },
    {
      prop: "media",
      label: "Media",
      kind: "select",
      options: [
        { value: "none", label: "None" },
        { value: "code", label: "Code" },
        { value: "image", label: "Image" },
      ],
    },
  ],
})
