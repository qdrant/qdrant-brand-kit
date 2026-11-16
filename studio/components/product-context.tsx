"use client"

import * as React from "react"

// Puts the open page in the product context: the indigo accent (data-context, design-system/styles/globals.css).
// Set on <html> while the page is open, so menus, popovers and dialogs, which open outside the page, follow it.
// The page's own root also sets data-context="product", so the first paint is already indigo.
export function useProductContext() {
  React.useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.context = "product"
    return () => {
      delete root.dataset.context
    }
  }, [])
}
