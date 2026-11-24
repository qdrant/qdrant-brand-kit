// The website's guidelines (Juan, 2026-11-22): every rule for building qdrant.tech from this library, in one place,
// for the team and for agents, here and in the Hugo build. The studio shows them first in Web, Docs, Guidelines.
//
// This file is the source of the website's rules. When Juan decides a rule, add it here in the same commit as the
// change, in its group, with who decided it and when. web/AGENTS.md keeps only how to work in this repo (adding a
// section, a pattern, the helpers) and points here for the rules.

export type Guideline = {
  // The rule, as a short imperative title.
  title: string
  // What it means in practice: values, where it applies, the exceptions.
  text: string
  // Who decided it and when, "Juan, 2026-11-21". Leave out for rules that come from elsewhere in the repo.
  decided?: string
  // Where its values live, a repo path.
  source?: string
}

export type GuidelineGroup = { id: string; title: string; intro: string; rules: Guideline[] }

export const guidelines: GuidelineGroup[] = [
  {
    id: "foundations",
    title: "Foundations",
    intro: "The website is built from the design system and its primitives, on its own surfaces, in dark and light.",
    rules: [
      {
        title: "Build from the design system",
        text: "Use the design system's components, colors, type, spacing and radii, through their tokens. A section never sets its own colors, fonts or radii, and never a hex value.",
        source: "design-system/",
      },
      {
        title: "Lay out on a 1200px container",
        text: "A 1440px design width and a 1200px content container, 24px between columns, 80 to 120px of vertical padding per section (never less than 80px), and 40 to 64px between a heading block and its content. Spacing comes from the 4px scale.",
        decided: "Juan, 2026-11-21 (the container was 1110px)",
        source: "primitives/spacing/",
      },
      {
        title: "Pages are built from the library",
        text: "A page is made of the library's sections, with its copy in a content file and real visuals (product screens, diagrams) passed to the sections' visual slot. If a page needs something a section can't do, add it to the section as a prop or a slot, so every page gets it. Never a page-only section.",
        decided: "Juan, 2026-11-22",
        source: "web/pages/, web/visuals/",
      },
      {
        title: "Use the breakpoints from the primitives",
        text: "Every section works from phone (390px) to desktop. Grids collapse to one column on phones, and nothing scrolls sideways.",
        source: "primitives/breakpoints/",
      },
      {
        title: "A page is all dark or all light",
        text: "The website is either fully dark or fully light, never a light run inside a dark page: every section follows the page's theme. Sections differ only by surface (default or raised). Inside the website, the design system's page, card, popover and highlight colors are the background roles, so its components follow. On dark the website is quieter than the roles: menus on neutral-925, cards a touch darker (Juan, 2026-11-22: 40% of the way from neutral-925 to the page's neutral-950, a mix since the palette has no step between them), highlights and hovers on neutral-900, a raised band's cards on neutral-900.",
        decided: "Juan, 2026-11-21 and 2026-11-22",
        source: "web/styles/web.css",
      },
    ],
  },
  {
    id: "type",
    title: "Type",
    intro: "Mona Sans, with ss05 and ss06 on, in the type set's sizes.",
    rules: [
      {
        title: "Headings from 60px, in Medium (a trial)",
        text: "H1 60, H2 52, H3 44, H4 38, H5 30, H6 22, with line heights 1.1, 1.12, 1.14, 1.16, 1.21 and 1.3, in Medium instead of SemiBold. Never Bold. If it's kept, it moves into the type primitives.",
        decided: "Juan, 2026-11-21 (H3 44)",
        source: "web/styles/web.css",
      },
      {
        title: "More sizes than a creative",
        text: "The creative limit of two text sizes doesn't apply: web pages need more sizes, and tables may right-align numbers.",
        source: "design-system/AGENTS.md",
      },
    ],
  },
  {
    id: "color",
    title: "Color",
    intro: "Amaranth is the accent, indigo the second color, and every colored text or mark follows the color guidelines.",
    rules: [
      {
        title: "Follow the color guidelines' contrast steps",
        text: "A colored text or icon takes the step the color guidelines give for its theme, so it is lighter on dark than on light. Text: 400 or lighter on dark, 700 or darker on light. Icons and marks: 400 on dark, 600 on light. Use the roles that hold these steps (primary.text, secondary.text, the status roles) before a palette step.",
        decided: "Juan, 2026-11-22",
        source: "primitives/colors/README.md",
      },
      {
        title: "Links are indigo",
        text: "Text links take secondary.text: indigo-400 on dark, indigo-800 on light, underlined on hover (the .web-link class, and ArrowLink for \"Read more >\" links). A link that reads as text, like a card's title or a breadcrumb, keeps the text color and turns indigo on hover (.web-link-quiet). Menus and the footer keep their own hover. Calls to action are buttons, never links.",
        decided: "Juan, 2026-11-22",
        source: "web/styles/web.css",
      },
      {
        title: "Amaranth is the accent",
        text: "For the primary button, highlights and small brand marks. Never a flat fill behind text, and no gradient on text. Red is for errors. The design system's components are indigo by default (they're the product's), so a page's root sets data-context=\"marketing\" next to data-web, and its buttons, focus and checks turn amaranth. Product screens shown on a page keep data-context=\"product\", so they stay indigo.",
        decided: "Juan, 2026-11-23",
        source: "design-system/styles/globals.css",
      },
      {
        title: "Indigo is the second color",
        text: "A thread through the website: nodes, the active state of tabs and steps, links and checkmarks. Marks use --web-indigo (indigo-400 on dark, 600 on light), text uses --web-indigo-text (400 on dark, 800 on light). Never a flat fill behind text.",
        decided: "Juan, 2026-11-21",
        source: "web/styles/web.css",
      },
      {
        title: "Diagrams take the palette color nearest to the Figma's",
        text: "By OKLab distance, through its --qd-color-* variable, never a hex. Fills, borders and dots use the dark theme's value; colored text and icons use the contrast steps above. Give every color a light value.",
        decided: "Juan, 2026-11-16",
      },
    ],
  },
  {
    id: "icons",
    title: "Icons",
    intro: "Lucide only, in color, on a tinted tile.",
    rules: [
      {
        title: "Lucide only",
        text: "Never draw an icon or use another set. Use the nearest Lucide icon when a design has another one.",
        source: "brand-assets/icons/",
      },
      {
        title: "Icons have color, never amaranth",
        text: "An icon sits on an IconTile: a small tile with a subtle tint of a color family and a hairline in it, the icon in the family's solid color (400 on dark, 600 on light). Families: indigo (the default), teal, blue, purple, cyan, green and orange. One family for a set, or cycle through them for features of equal weight. The one exception is the navbar's menus (below).",
        decided: "Juan, 2026-11-21",
        source: "web/lib/tone.tsx",
      },
      {
        title: "Menu icons are bare and neutral",
        text: "In the navbar's menus, an icon has no tile and no color family: it's bare, 16px, in the muted text color, and turns to the text color when its item is hovered or focused, so the menu reads as a list of words (Cloudflare's menus were the reference).",
        decided: "Juan, 2026-11-23",
        source: "web/sections/navbar.tsx",
      },
      {
        title: "Icon lines are pixel perfect",
        text: "An icon's line is always 1px, 1.5px or 2px, by its size, never a fraction from scaling: 1px for 12, 14, 16 and 18px icons, 1.5px for 20, 24 and 32px, 2px for 40px and above.",
        decided: "Juan, 2026-11-22",
        source: "web/styles/web.css",
      },
      {
        title: "Buttons may have one icon",
        text: "Web buttons may have one Lucide icon before or after their text, or be icon-only (close, copy, more). The creative button stays text only.",
        decided: "Juan, 2026-11-18",
      },
    ],
  },
  {
    id: "actions",
    title: "Actions",
    intro: "Buttons for calls to action, links for the rest.",
    rules: [
      {
        title: "Primary and secondary buttons come from the design system",
        text: "The primary action is the design system's primary button (amaranth). A secondary action is its secondary button, white on light.",
        decided: "Juan, 2026-11-21",
        source: "design-system/styles/components/",
      },
      {
        title: "The navbar's buttons are small",
        text: "Log in, Contact Us and Start Free take the design system's sm button (32px tall), one step under the default, so the bar stays light, with 14px text like every link in the bar, the menus and Pricing included. The phone menu's button is icon-sm. Buttons in the sections keep the default size.",
        decided: "Juan, 2026-11-23",
        source: "web/sections/navbar.tsx",
      },
      {
        title: "The selected tab stands out",
        text: "In a row of pill tabs or a toggle (a code panel's language, a chart's option, grid or list), the selected one has a clear fill: neutral-800 on dark and neutral-100 on light, with the text color (.web-selected). The others have no fill and muted text.",
        decided: "Juan, 2026-11-22",
        source: "web/styles/web.css (.web-selected)",
      },
      {
        title: "In-page links scroll with an ease",
        text: "A link to a part of the same page (an anchor nav's tab) never jumps: the page scrolls there with a slow start and a slow stop (ease-in-out quart), in 600 to 1100ms by distance, and stops just under the sticky nav. The reader's own scroll stops it, and reduced motion jumps straight there.",
        decided: "Juan, 2026-11-22",
        source: "web/lib/smooth-scroll.ts",
      },
      {
        title: "Menus open in the center",
        text: "The menus sit at the center of the page: from lg the bar is three columns, and the logo's and the actions' are always the same width, whatever each holds. Between 1024 and about 1064px the actions are wider than their column and reach up to 20px into the side margin, inside the rails. A menu's panel always opens centered under the whole navbar, whichever menu opened it, and slides between sizes as the reader moves from menu to menu. Its links have 12px padding (the step after 8 on the spacing scale), so they're easy to hit. A panel grows across, not down: a column holds up to five links, as wide as its longest label, and a group of six or more splits into columns of even length, filled top to bottom. Groups sit side by side, each a mono label over its columns, with a hairline between them. The panel has the tray's double border: the outer frame with its 6px band, then the panel's own line.",
        decided: "Juan, 2026-11-23",
        source: "web/sections/navbar.tsx",
      },
    ],
  },
  {
    id: "lines",
    title: "Lines and material",
    intro: "A shared, subtle structure every section draws on, instead of new borders or fills.",
    rules: [
      {
        title: "Rails, seams and nodes",
        text: "A hairline runs down each side of the page, 24px outside the container (the rails), and between sections (the seam). A horizontal line inside a section reaches the rails, so the lines meet. The navbar and the announcement bar have no rails, and no vertical lines; the navbar keeps its bottom line. The anchor nav's background never hides them: the rails run through it, sticky or not, and the nodes on its bottom line are its own, so they stay with it. Nodes are always on top: no background, sticky or not, ever covers one (Juan, 2026-11-23).",
        decided: "Juan, 2026-11-21",
        source: "web/styles/web.css",
      },
      {
        title: "Nodes are hexagons, like the brandmark",
        text: "Where lines meet, and before a kicker, a step or an item in a vertical list of tabs, a small hexagon (7 by 8px) stands like the logo's brandmark, a point at the top and the bottom. Hollow, filled with the page's color over a line, and filled with indigo when active. Never a dot or another shape. Nodes are alive: they blink like a live readout, a hard step to 25% and back every 2s, each at its own offset (Juan, 2026-11-22), and hold still for reduced motion. Never in a row of tabs, like tabs on a tray: the active tab's plate marks it (Juan, 2026-11-24).",
        decided: "Juan, 2026-11-22 and 2026-11-24",
        source: "web/lib/node.tsx",
      },
      {
        title: "A grid's lines are one color, inside and out",
        text: "In a hairline grid of cells, the outer and inner lines are the same hairline as the rails and seams, and the grid's sides sit on the rails. A cell's background never covers a line.",
        decided: "Juan, 2026-11-22",
        source: "web/styles/web.css (.web-grid)",
      },
      {
        title: "A window's dots are lighter than its bar",
        text: "The three dots in a code panel's or terminal's top bar are neutral-800 on dark and neutral-200 on light, with a very subtle glass: a touch lighter at the top and a hairline highlight. Visible, never drawing the eye.",
        decided: "Juan, 2026-11-22",
        source: "web/styles/web.css (.web-window-dot)",
      },
      {
        title: "A visual's frame hugs the visual",
        text: "A product screen, diagram or image sits in a frame (a plate in a tray) exactly its size, never in a bigger box, and on the outer side of its row when there's room (the right when the visual is on the right). A visual with its own look, like the globe, sits bare. Product screens are set in from the frame's top-left corner and cropped at its right and bottom, so the frame's surface shows around them.",
        decided: "Juan, 2026-11-22",
        source: "web/visuals/, web/sections/feature-rows.tsx",
      },
      {
        title: "A card's subject can sit in the center",
        text: "When the visual is what a wide card is about (the Multi-AZ globe), it sits in the center: the title above, the points around it, half on each side, each with its icon on a tile and the side's text facing the visual, and the link under it. On phones: the title, the visual, then the points.",
        decided: "Juan, 2026-11-22",
        source: "web/sections/feature-grid.tsx (visualPlacement)",
      },
      {
        title: "Cards are plates",
        text: "Cards and panels are a touch lighter at the top, with a 1px inner highlight and a soft shadow on light. Media sit in a tray, a framed holder. Rows of facts sit in a hairline grid.",
        decided: "Juan, 2026-11-21",
        source: "web/lib/plate.tsx",
      },
    ],
  },
  {
    id: "patterns",
    title: "Patterns and effects",
    intro: "Patterns bring the space, data and vector themes, chosen by hand, one at a time.",
    rules: [
      {
        title: "Patterns are added by hand, with intent",
        text: "A pattern is a background behind a section or a surface inside its cards. Juan adds them one at a time; never add or set one unless he asks. The first is Depth haze (a surface): slow violet haze with sparse stars, at half strength, behind product screens (the Resilience page's capabilities). Patterns are subtle, in the website's variables.",
        decided: "Juan, 2026-11-22",
        source: "web/patterns/",
      },
      {
        title: "Brand patterns keep their rules",
        text: "A brand pattern bleeds off every edge, violet by default and red only with a yes. Never two patterns, or a pattern with a generated image.",
        source: "brand-assets/patterns/",
      },
      {
        title: "Effects belong in sections, never in components",
        text: "Glows, background lights and textures are built in the section, in palette colors, behind the content, and softer on light. The design system's components stay quiet. No effects for now: they come in a later style stage.",
        decided: "Juan, 2026-11-16 and 2026-11-21",
      },
    ],
  },
  {
    id: "content",
    title: "Content and originality",
    intro: "Real copy, original design.",
    rules: [
      {
        title: "Never invent copy, dates, names or links",
        text: "Use the copy you're given, or qdrant.tech's, word for word. A slot with no copy stays empty, and a link with no known target is \"#\".",
      },
      {
        title: "References are for patterns, never copies",
        text: "Other sites inform layouts and patterns. Never copy a layout one to one, their copy, illustrations or signature moves. The site must look like Qdrant and nobody else.",
        decided: "Juan, 2026-11-21",
      },
      {
        title: "Images come from the Figma or brand assets",
        text: "Illustrations, logos, social marks and badges are exported as they are (SVG for vectors, PNG for the rest), never redrawn or recolored, except customer logos (below). Ask before adding a photo. The logo, Qbot and patterns follow their own rules in brand-assets.",
        decided: "Juan, 2026-11-16",
        source: "brand-assets/",
      },
      {
        title: "Customer logos come in three versions",
        text: "Every customer logo the site shows is an SVG in web/assets/logos/customers, used through CustomerLogo: color (the brand's colors, for light backgrounds), light (white, for dark backgrounds) and dark (near-black, for light backgrounds), or mono, which takes the text color, so a wall of logos can be one neutral that blends in. The light, dark and mono versions come from one one-color file. The files come from the Brand Design System's Figma (Customer-Logos) and qdrant.tech's own, trimmed to the artwork and minified; never redrawn. A logo without a color file shows its dark version. Missing color files come from the company itself (its press kit, brand page, GitHub or site) or, failing that, a public-domain file on Wikimedia Commons; never from a logo site or Brandfetch, whose terms don't allow keeping its files (Juan, 2026-11-24). Each logo records where its color came from.",
        decided: "Juan, 2026-11-23 and 2026-11-24",
        source: "web/content/customer-logos.ts",
      },
    ],
  },
]
