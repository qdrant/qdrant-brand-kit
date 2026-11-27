// The home page world (2026-11-26): qdrant.tech's home, section by section, from the library. Its versions were the
// first Pages Explorations, so they keep their PX codes.
//
// The home page follows qdrant.tech's order. Two of its sections have no match in the library yet ("Integrates with
// leading AI tools and frameworks", a logo row of integrations, and "Build AI Search the Way You Want", the
// solutions tabs), so they're left out rather than filled with copy we don't have.

import type { PageWorld } from "../page-explorations"

export const home: PageWorld = {
  id: "home",
  group: "Home",
  name: "Home page",
  prefix: "PX",
  source: "https://qdrant.tech/",
  sections: {
    navbar: { section: "navbar", variant: "full" },
    hero: { section: "hero", variant: "home" },
    logos: { section: "logo-cloud", variant: "row" },
    why: { section: "feature-rows", variant: "alternating" },
    applications: { section: "stats", variant: "results" },
    deploy: { section: "feature-grid", variant: "cards" },
    enterprise: { section: "bento", variant: "checklist" },
    quote: { section: "testimonials", variant: "single" },
    performance: { section: "feature-tabs", variant: "vertical" },
    builders: { section: "code-showcase", variant: "split" },
    cta: { section: "cta", variant: "centered" },
    footer: { section: "footer", variant: "full" },
  },
  labels: {
    navbar: "Navbar",
    hero: "Hero",
    logos: "Logos",
    why: "Why Qdrant",
    applications: "Applications (figures)",
    deploy: "Deploy anywhere",
    enterprise: "Enterprise",
    quote: "Quote",
    performance: "Performance",
    builders: "Engineered for builders",
    cta: "Call to action",
    footer: "Footer",
  },
  // Figures never get a pattern: a pattern never sits behind data.
  noPattern: ["navbar", "applications"],
  versions: [
    {
      id: "home-curated",
      name: "Home, curated mix",
      idea: "Four sections taken from the Component Explorations, spaced apart: the hero's Hex terrain spanning tree (EX-20), Halftone corner in the Deploy Anywhere cards (EX-72), Halftone field behind Engineered for Builders (EX-114) and Depth haze in the footer's newsletter card (EX-174).",
      mix: {
        hero: { pattern: ["cosmos-hex-terrain-tree"] },
        deploy: { cardPattern: "halftone-corner" },
        builders: { pattern: ["halftone-field"] },
        footer: { cardPattern: "depth-haze" },
      },
    },
    {
      id: "home-balanced",
      name: "Home, balanced",
      idea: "Three patterns, far apart: Hex terrain behind the hero, Hex noise in the enterprise tiles, Hex vortex behind the closing call to action.",
      mix: {
        hero: { pattern: ["cosmos-hex-terrain"] },
        enterprise: { cardPattern: "cosmos-noise-corner" },
        cta: { pattern: ["ref-hex-vortex"] },
      },
    },
    {
      id: "home-quiet",
      name: "Home, quiet",
      idea: "One pattern only, the hero's Hex terrain with its nearest-neighbour search; the rest of the page as it is.",
      mix: { hero: { pattern: ["cosmos-hex-terrain-search"] } },
    },
    {
      id: "home-constellations",
      name: "Home, constellations",
      idea: "The constellation hovers, twice: Halftone field behind the code showcase and the Hex ribbon behind the closing call to action.",
      mix: {
        builders: { pattern: ["ref-halftone-field-constellations"] },
        cta: { pattern: ["ref-hex-ribbon-constellations"] },
      },
    },
  ],
  // The style menus start on the curated home (PX-01), so the page opens with patterns rather than plain.
  start: {
    hero: { pattern: ["cosmos-hex-terrain-tree"] },
    deploy: { cardPattern: "halftone-corner" },
    builders: { pattern: ["halftone-field"] },
    footer: { cardPattern: "depth-haze" },
  },
  // The saved mixes from before the worlds keep their place in the browser.
  store: "qd-studio-page-mixes",
}
