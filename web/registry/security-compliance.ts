import { SecurityCompliance, type SecurityComplianceProps } from "../sections/security-compliance"
import { enterpriseTooling, security } from "../content/platform"
import { defineSection } from "./types"

export const securityCompliance = defineSection<SecurityComplianceProps>({
  id: "security-compliance",
  name: "Security and compliance",
  category: "enterprise",
  summary: "Security controls and certifications: a cell grid or a checklist, the badges and the way to the Trust Center.",
  file: "security-compliance",
  component: SecurityCompliance,
  variants: [
    {
      id: "grid",
      name: "Grid",
      description: "The Security page's controls in a hairline grid, then the badges and the Trust Center on one plate.",
      props: {
        layout: "grid",
        header: security.header,
        features: security.features,
        badges: security.badges,
        compliance: security.compliance,
        tones: "indigo",
      },
    },
    {
      id: "split",
      name: "Split",
      description: "The home page's Enterprise-ready tooling as a checklist on the left, the badges and the Trust Center on the right.",
      props: {
        layout: "split",
        header: enterpriseTooling.header,
        checklist: enterpriseTooling.items,
        badges: security.badges,
        compliance: security.compliance,
        cardPattern: "tint",
      },
    },
  ],
  docs: {
    use: ["On the security page, enterprise and deployment pages, and once on the home page for buyers who need the proof."],
    rules: [
      "Only controls and certifications the site names. A tier tag (Premium) goes on a control only when the site says so.",
      "Badges are the files in web/assets/badges, drawn in the text color through MonoImage. Never redraw or recolor one.",
      "The Trust Center is the one main action; the heading's action is secondary.",
    ],
    anatomy: [
      { part: "Heading", note: "Title, a line and an action." },
      { part: "Controls", note: "Grid: icon, optional tier tag, title, line and link per cell. Split: a checklist with teal checks." },
      { part: "Trust Center", note: "A plate with the badges, a title and line, and the action." },
    ],
    props: [
      { name: "layout", type: '"grid" | "split"', note: "Cells, or a checklist beside the Trust Center." },
      { name: "features", type: "{ title, text, icon, tag?, link? }[]", note: "For grid." },
      { name: "checklist", type: "string[]", note: "For split." },
      { name: "badges", type: "{ name, file }[]", note: "Files in web/assets/badges." },
      { name: "compliance", type: "{ title?, text?, action }", note: "The Trust Center block." },
    ],
  },
  fields: [
    { prop: "layout", label: "Layout", kind: "select", options: [{ value: "grid", label: "Grid" }, { value: "split", label: "Split" }] },
    {
      prop: "tones",
      label: "Icon colors",
      kind: "select",
      options: [
        { value: "indigo", label: "Indigo" },
        { value: "mixed", label: "Mixed" },
        { value: "teal", label: "Teal" },
        { value: "blue", label: "Blue" },
      ],
    },
  ],
})
