import { SignupForm, type SignupFormProps } from "../sections/signup-form"
import { serverless, startups } from "../content/conversion"
import { defineSection } from "./types"

export const signupForm = defineSection<SignupFormProps>({
  id: "signup-form",
  name: "Sign-up form",
  category: "forms",
  summary: "An application or a waitlist: what joining gets you beside the site's form.",
  file: "signup-form",
  component: SignupForm,
  variants: [
    {
      id: "application",
      name: "Application",
      description: "The program's benefits on plates beside the application form (Qdrant for Startups).",
      props: {
        layout: "application",
        header: { title: startups.title, description: startups.description },
        benefitsTitle: startups.benefitsTitle,
        benefits: startups.benefits,
        form: startups.form,
      },
    },
    {
      id: "waitlist",
      name: "Waitlist",
      description: "Numbered reasons to join beside the waitlist form (Qdrant Serverless).",
      props: {
        layout: "waitlist",
        header: { kicker: serverless.kicker, title: serverless.title, description: serverless.description },
        benefitsTitle: serverless.benefitsTitle,
        benefitsDescription: serverless.benefitsDescription,
        benefits: serverless.benefits,
        aside: serverless.aside,
        form: serverless.form,
        pattern: ["stars"],
      },
    },
  ],
  docs: {
    use: ["A program application (startups, partners) or a waitlist for a product in early access. For general questions, use Contact."],
    rules: [
      "Fields, labels and options exactly as the site's form, in its order.",
      "Benefits are the program's own; icons on tiles in color (application) or numbers in mono (waitlist).",
      "The form isn't wired: a page connects it.",
    ],
    anatomy: [
      { part: "Heading", note: "Kicker, title and line." },
      { part: "Benefits", note: "A title and line, then plates with icons or a numbered list on hairlines." },
      { part: "Form", note: "The site's fields, fine print and the submit button, on a plate." },
    ],
    props: [
      { name: "layout", type: '"application" | "waitlist"', note: "Plates with icons or a numbered list." },
      { name: "header", type: "{ kicker?, title, description? }", note: "The heading block." },
      { name: "benefits", type: "{ title, text?, icon? }[]", note: "What joining gets you." },
      { name: "benefitsTitle, benefitsDescription, aside", type: "string", note: "Text around the benefits." },
      { name: "form", type: "{ title?, fields, submit, note? }", note: "The form, as in Contact." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "application", label: "Application" }, { value: "waitlist", label: "Waitlist" }] }],
})
