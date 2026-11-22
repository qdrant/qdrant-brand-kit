"use client"

import * as React from "react"

// Marks <body> as part of the website (data-web) while a whole page is open in the studio, as a page's root is on
// the real site. Menus and dialogs open on <body>, so they take the website's surfaces and lines too.
export function WebBody() {
  React.useEffect(() => {
    document.body.setAttribute("data-web", "")
    return () => document.body.removeAttribute("data-web")
  }, [])
  return null
}
