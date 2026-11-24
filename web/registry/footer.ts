import { Footer, type FooterProps } from "../sections/footer"
import { footer as content } from "../content/site"
import { defineSection } from "./types"

export const footer = defineSection<FooterProps>({
  id: "footer",
  name: "Footer",
  category: "footer",
  summary: "The site's footer: brand, link columns, newsletter, certifications and the legal bar.",
  file: "footer",
  component: Footer,
  variants: [
    {
      id: "full",
      name: "Full",
      description: "Every page of the site.",
      props: { variant: "full", ...content },
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "The legal bar only, for landing pages with the minimal navbar.",
      props: { variant: "minimal", legal: content.legal, copyright: content.copyright },
    },
  ],
  docs: {
    use: ["Full on every page; minimal with the minimal navbar."],
    rules: [
      "Four link columns at most, each under a mono label, in the site's order.",
      "Certification badges are the ones in web/assets/badges, drawn in the muted text color.",
      "Social marks come from web/assets/social. A mark without a confirmed link has none.",
    ],
    anatomy: [
      { part: "Brand", note: "The logo, the tagline and the social marks." },
      { part: "Link columns", note: "Two per row on phones, four from md." },
      { part: "Newsletter", note: "A heading, a line, an email field and Subscribe." },
      { part: "Badges", note: "SOC 2, GDPR, HIPAA." },
      { part: "Legal bar", note: "The copyright and the legal links." },
    ],
    props: [
      { name: "variant", type: '"full" | "minimal"', note: "Minimal shows the legal bar only." },
      { name: "tagline", type: "string", note: "Under the logo." },
      { name: "columns", type: "{ title, links }[]", note: "The link columns." },
      { name: "newsletter", type: "{ title, description? }", note: "The signup block." },
      { name: "legal, copyright", type: "string[], string", note: "The legal bar." },
    ],
  },
  fields: [{ prop: "tagline", label: "Tagline", kind: "text" }],
})
