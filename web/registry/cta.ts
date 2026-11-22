import { Cta, type CtaProps } from "../sections/cta"
import { closingCta, navActions } from "../content/site"
import { defineSection } from "./types"

export const cta = defineSection<CtaProps>({
  id: "cta",
  name: "Call to action",
  category: "cta",
  summary: "A heading and one or two actions, to close a page or break up a long one.",
  file: "cta",
  component: Cta,
  variants: [
    {
      id: "centered",
      name: "Centered",
      description: "The page's closing statement, with room around it.",
      props: { layout: "centered", ...closingCta },
    },
    {
      id: "panel",
      name: "Panel",
      description: "A framed card inside a page: heading on the left, actions on the right.",
      props: { layout: "panel", ...closingCta, secondary: navActions.contact },
    },
    {
      id: "band",
      name: "Band",
      description: "One slim line between sections, between two hairlines.",
      props: { layout: "band", ...closingCta },
    },
  ],
  docs: {
    use: [
      "Centered once, at the end of a page, before the footer.",
      "Panel or band in the middle of a long page, after the section that earns the click.",
    ],
    rules: [
      "One primary action. A second action is the secondary button and goes to a person (Contact Us) or a calculator.",
      "No glows or patterns for now (Juan, 2026-11-21); they come in a later style stage.",
    ],
    anatomy: [
      { part: "Heading", note: "A statement: 56px from lg in the centered layout, a section title in the panel, a card title in the band." },
      { part: "Description", note: "Optional, one line." },
      { part: "Actions", note: "Primary, then an optional secondary button." },
    ],
    props: [
      { name: "layout", type: '"centered" | "panel" | "band"', note: "Closing, framed, or slim." },
      { name: "title, description", type: "string", note: "title is required." },
      { name: "primary, secondary", type: "{ label, href }", note: "primary is required." },
    ],
  },
  fields: [
    {
      prop: "layout",
      label: "Layout",
      kind: "select",
      options: [
        { value: "centered", label: "Centered" },
        { value: "panel", label: "Panel" },
        { value: "band", label: "Band" },
      ],
    },
    { prop: "title", label: "Heading", kind: "textarea" },
    { prop: "description", label: "Description", kind: "textarea" },
  ],
})
