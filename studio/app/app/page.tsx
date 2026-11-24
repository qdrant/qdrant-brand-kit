import { redirect } from "next/navigation"

// The App link opens the app screen straight away (design lead, 2026-11-16): the serverless space, the only page so
// far. With more pages, add a way to switch between them on the page, like Variations.
export default function App() {
  redirect("/app/serverless-space")
}
