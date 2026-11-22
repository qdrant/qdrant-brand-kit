import { Contact, type ContactProps } from "../sections/contact"
import { contact as content } from "../content/conversion"
import { defineSection } from "./types"

export const contact = defineSection<ContactProps>({
  id: "contact",
  name: "Contact",
  category: "forms",
  summary: "The contact page: the intro with the response time, other ways to reach the team, and the form.",
  file: "contact",
  component: Contact,
  variants: [
    {
      id: "default",
      name: "Contact form",
      description: "The intro and two contact cards on the left, the form on the right (Contact Us).",
      props: { title: content.title, description: content.description, options: content.options, form: content.form },
    },
  ],
  docs: {
    use: ["The contact page, or the top of a sales page. For a newsletter, use Newsletter; for a program application, Sign-up form."],
    rules: [
      "Fields and labels exactly as the site's form, in its order. Required fields carry an asterisk.",
      "The form isn't wired: it goes nowhere until a page connects it.",
      "Card icons sit on tiles in color, never amaranth.",
      "The title is the page's H1.",
    ],
    anatomy: [
      { part: "Intro", note: "Title and the line with the response time." },
      { part: "Option cards", note: "Icon tile, title, a line and its link." },
      { part: "Form", note: "Title, fields, fine print and the submit button, on a plate." },
    ],
    props: [
      { name: "title, description", type: "string", note: "The intro." },
      { name: "options", type: "{ icon?, title, text?, link }[]", note: "Other ways to reach the team." },
      { name: "form", type: "{ title?, fields, submit, note? }", note: "Fields: { name, label, type, required?, options?, placeholder?, half? }." },
    ],
  },
  fields: [
    { prop: "title", label: "Title", kind: "text" },
    { prop: "description", label: "Description", kind: "textarea" },
  ],
})
