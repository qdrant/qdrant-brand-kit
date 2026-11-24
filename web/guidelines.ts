// The website's guidelines (design lead, 2026-11-22): every rule for building qdrant.tech from this library, in one place,
// for the team and for agents, here and in the Hugo build. The studio shows them first in Web, Docs, Guidelines.
//
// This file is the source of the website's rules. When the design lead decides a rule, add it here in the same commit as the
// change, in its group, with who decided it and when. web/AGENTS.md keeps only how to work in this repo (adding a
// section, a pattern, the helpers) and points here for the rules.

export type Guideline = {
  // The rule, as a short imperative title.
  title: string
  // What it means in practice: values, where it applies, the exceptions.
  text: string
  // Who decided it and when, "design lead, 2026-11-21". Leave out for rules that come from elsewhere in the repo.
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
        decided: "Design lead, 2026-11-21 (the container was 1110px)",
        source: "primitives/spacing/",
      },
      {
        title: "Pages are built from the library",
        text: "A page is made of the library's sections, with its copy in a content file and real visuals (product screens, diagrams) passed to the sections' visual slot. If a page needs something a section can't do, add it to the section as a prop or a slot, so every page gets it. Never a page-only section.",
        decided: "Design lead, 2026-11-22",
        source: "web/pages/, web/visuals/",
      },
      {
        title: "Use the breakpoints from the primitives",
        text: "Every section works from phone (390px) to desktop. Grids collapse to one column on phones, and nothing scrolls sideways.",
        source: "primitives/breakpoints/",
      },
      {
        title: "A page is all dark or all light",
        text: "The website is either fully dark or fully light, never a light run inside a dark page: every section follows the page's theme. Sections differ only by surface (default or raised). Inside the website, the design system's page, card, popover and highlight colors are the background roles, so its components follow. On dark the website is quieter than the roles: menus on neutral-925, cards a touch darker (design lead, 2026-11-22: 40% of the way from neutral-925 to the page's neutral-950, a mix since the palette has no step between them), highlights and hovers on neutral-900, a raised band's cards on neutral-900.",
        decided: "Design lead, 2026-11-21 and 2026-11-22",
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
        title: "Headings from 56px, in Medium (a trial)",
        text: "H1 56, H2 48, H3 40, H4 32, H5 24, H6 20: steps of 8 down to 24, then 20. Line heights 1.11, 1.13, 1.16, 1.2, 1.27 and 1.33, on the same curve as before. In Medium instead of SemiBold. Never Bold. If it's kept, it moves into the type primitives. Until 2026-11-24 the trial started at 60 (60, 52, 44, 38, 30, 22).",
        decided: "Design lead, 2026-11-21; from 56px on 2026-11-24",
        source: "web/styles/web.css",
      },
      {
        title: "More sizes than a creative",
        text: "The creative limit of two text sizes doesn't apply: web pages need more sizes, and tables may right-align numbers.",
        source: "design-system/AGENTS.md",
      },
      {
        title: "Kickers are 12px, and their node sits on the first line",
        text: "A kicker (the mono label above a heading) is 12px at every size (it was 14px until 2026-11-24). Its hexagon node is centered on the kicker's first line, so a kicker that wraps keeps the node beside its first word, not between the lines.",
        decided: "Design lead, 2026-11-24",
        source: "web/lib/type.tsx, web/lib/section-header.tsx",
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
        decided: "Design lead, 2026-11-22",
        source: "primitives/colors/README.md",
      },
      {
        title: "Links are indigo",
        text: "Text links take secondary.text: indigo-400 on dark, indigo-700 on light (800 until 2026-11-24), underlined on hover and one step lighter, so the hover shows: indigo-300 on dark, indigo-600 on light (2026-11-24) (the .web-link class, and ArrowLink for \"Read more >\" links). ArrowLink's chevron is as heavy as the text (a 0.116em stroke, Mona Sans Medium's stem) and 1em in size, and on hover it slides right and gains a shaft, a chevron becoming an arrow, in 200ms (2026-11-24). A link that reads as text, like a card's title, keeps the text color and turns indigo on hover (.web-link-quiet). Menus and the footer keep their own hover. Calls to action are buttons, never links.",
        decided: "Design lead, 2026-11-22 and 2026-11-24",
        source: "web/styles/web.css",
      },
      {
        title: "Amaranth is the accent",
        text: "For the primary button, highlights and small brand marks. Never a flat fill behind text, and no gradient on text. Red is for errors. The design system's components are indigo by default (they're the product's), so a page's root sets data-context=\"marketing\" next to data-web, and its buttons, focus and checks turn amaranth. Product screens shown on a page keep data-context=\"product\", so they stay indigo.",
        decided: "Design lead, 2026-11-23",
        source: "design-system/styles/globals.css",
      },
      {
        title: "Indigo is the second color",
        text: "A thread through the website: nodes, the active state of tabs and steps, links and checkmarks. Marks use --web-indigo (indigo-400 on dark, 600 on light), text uses --web-indigo-text (400 on dark, 700 on light). It's the secondary color, so the website carries it strongly, always, not as an option (2026-11-24). Never a flat fill behind text.",
        decided: "Design lead, 2026-11-21 and 2026-11-24",
        source: "web/styles/web.css",
      },
      {
        title: "Focus is indigo",
        text: "Every focus ring and focused field on the website is indigo (indigo-600 at 30%, 40% on buttons), never amaranth: an amaranth ring next to a field reads like an error. It's the design system's ring in every context.",
        decided: "Design lead, 2026-11-24",
        source: "design-system/styles/globals.css (--ring)",
      },
      {
        title: "Code has syntax colors",
        text: "Code on the website, in panels, terminals and install lines, is colored by role, like VS Code's default themes, in the palette: keywords purple, functions and shell commands blue (VS Code's yellow; the palette has none), types and classes teal, strings orange, numbers green, constants like True, None and null indigo, parameters, properties, JSON keys and shell flags cyan, and comments in the muted text color. Names, operators and brackets keep the text color. The 300 step on dark, the 700 step on light, each at 5:1 or more on a code panel. Never amaranth or red in code. Python, TypeScript and JavaScript, JSON, shell and HTTP are recognized from a file name or a label.",
        decided: "Design lead, 2026-11-24",
        source: "web/lib/code.tsx, web/styles/web.css",
      },
      {
        title: "Diagrams take the palette color nearest to the Figma's",
        text: "By OKLab distance, through its --qd-color-* variable, never a hex. Fills, borders and dots use the dark theme's value; colored text and icons use the contrast steps above. Give every color a light value.",
        decided: "Design lead, 2026-11-16",
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
        decided: "Design lead, 2026-11-21",
        source: "web/lib/tone.tsx",
      },
      {
        title: "Menu icons are bare and neutral",
        text: "In the navbar's menus, an icon has no tile and no color family: it's bare, 16px, in the muted text color, and turns to the text color when its item is hovered or focused, so the menu reads as a list of words (Cloudflare's menus were the reference). The one exception is a menu's special section (below).",
        decided: "Design lead, 2026-11-23",
        source: "web/sections/navbar.tsx",
      },
      {
        title: "A menu's special section: the products (exploring)",
        text: "The Products menu is the menu's special section: each product has a 48px tile in its color family with its icon drawn in hexagons, a 15px label with its tag, and a one-line description in the muted text color, taken word for word from qdrant.tech. Two columns of three, the rows lined up. The hexagon icons are Lucide's own shapes measured onto a grid of small upright hexagons, like the brandmark: full size on the icon's lines, smaller around them like a halftone, and a touch larger in rings from the center, so they read as organic (web/lib/hex-icon.tsx). Exploring: they may change.",
        decided: "Design lead, 2026-11-24",
        source: "web/sections/navbar.tsx, web/lib/hex-icon.tsx",
      },
      {
        title: "Icon lines are pixel perfect",
        text: "An icon's line is always 1px, 1.5px or 2px, by its size, never a fraction from scaling: 1px for 12, 14, 16 and 18px icons, 1.5px for 20, 24 and 32px, 2px for 40px and above.",
        decided: "Design lead, 2026-11-22",
        source: "web/styles/web.css",
      },
      {
        title: "Buttons may have one icon",
        text: "Web buttons may have one Lucide icon before or after their text, or be icon-only (close, copy, more). The creative button stays text only.",
        decided: "Design lead, 2026-11-18",
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
        decided: "Design lead, 2026-11-21",
        source: "design-system/styles/components/",
      },
      {
        title: "The navbar's buttons are small",
        text: "Log in, Contact Us and Start Free take the design system's sm button (32px tall), one step under the default, so the bar stays light, with 14px text like every link in the bar, the menus and Pricing included. The phone menu's button is icon-sm. Buttons in the sections keep the default size.",
        decided: "Design lead, 2026-11-23",
        source: "web/sections/navbar.tsx",
      },
      {
        title: "The selected tab stands out",
        text: "In a row of pill tabs or a toggle (a code panel's language, a chart's option, grid or list), the selected one has a clear fill: neutral-800 on dark and neutral-100 on light, with the text color (.web-selected). The others have no fill and muted text.",
        decided: "Design lead, 2026-11-22",
        source: "web/styles/web.css (.web-selected)",
      },
      {
        title: "In-page links scroll with an ease",
        text: "A link to a part of the same page (an anchor nav's tab) never jumps: the page scrolls there with a slow start and a slow stop (ease-in-out quart), in 600 to 1100ms by distance, and stops just under the sticky nav. The reader's own scroll stops it, and reduced motion jumps straight there.",
        decided: "Design lead, 2026-11-22",
        source: "web/lib/smooth-scroll.ts",
      },
      {
        title: "Menus open in the center",
        text: "The menus sit at the center of the page: from lg the bar is three columns, and the logo's and the actions' are always the same width, whatever each holds. Between 1024 and about 1064px the actions are wider than their column and reach up to 20px into the side margin, inside the rails. A menu's panel always opens centered under the whole navbar, whichever menu opened it, and slides between sizes as the reader moves from menu to menu. Its links have 12px padding (the step after 8 on the spacing scale), so they're easy to hit. A panel grows across, not down: a column holds up to five links, as wide as its longest label, and a group of six or more splits into columns of even length, filled top to bottom. Groups sit side by side, each a mono label over its columns, with a hairline between them. The panel has the tray's double border: the outer frame with its 6px band, then the panel's own line.",
        decided: "Design lead, 2026-11-23",
        source: "web/sections/navbar.tsx",
      },
      {
        title: "No breadcrumbs or pagination",
        text: "The website has neither. The navbar's menus place a page, so an inner page opens with its header, not a trail of links. A directory shows every result on one page, narrowed by its filters and search.",
        decided: "Design lead, 2026-11-24",
        source: "web/sections/page-header.tsx, web/sections/filterable-index.tsx",
      },
      {
        title: "A prompt for agents shows the agents, not the prompt",
        text: "Give this to your agent: the marks of the agents it's for (Claude, Codex, Cursor), one color in the muted text color, then the label and a copy button. The prompt itself isn't shown; the button copies it, and it shows when you hover the button.",
        decided: "Design lead, 2026-11-24",
        source: "web/lib/copy-snippet.tsx, web/assets/logos/agents/",
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
        text: "Every page and every section has them, always: they're part of the website, not an option (2026-11-24). A hairline runs down each side of the page, 24px outside the container (the rails), and between sections (the seam). A horizontal line inside a section reaches the rails, so the lines meet. The navbar and the announcement bar have no rails, and no vertical lines; the navbar keeps its bottom line. The anchor nav's background never hides them: the rails run through it, sticky or not, and the nodes on its bottom line are its own, so they stay with it. Nodes are always on top: no background, sticky or not, ever covers one (design lead, 2026-11-23).",
        decided: "Design lead, 2026-11-21 and 2026-11-24",
        source: "web/styles/web.css",
      },
      {
        title: "Nodes are hexagons, like the brandmark",
        text: "Where lines meet inside a section, and before a kicker, a step or an item in a vertical list of tabs, a small hexagon (7 by 8px) stands like the logo's brandmark, a point at the top and the bottom. Hollow, filled with the page's color over a line, and filled with indigo when active. Where a seam meets the rails, at a section's outer edges, the mark is a four-point star instead (design lead, 2026-11-24): each corner the two lines make is filled with a curve in the lines' own color, tangent to both lines, so the lines widen into a sharp star, 11 by 11px, centered exactly on the crossing. A corner is drawn only where both its lines run: under the navbar, where no rail comes from above, only the two lower corners. The star is still. Never a dot or another shape. A kicker's node is a fill in the node color with no outline (2026-11-24), and it's alive: it blinks like a live readout, a hard step to 25% and back every 2s, each at its own offset (design lead, 2026-11-22), and holds still for reduced motion. Every other node is still (design lead, 2026-11-24). Never in a row of tabs, like tabs on a tray: the active tab's plate marks it (design lead, 2026-11-24).",
        decided: "Design lead, 2026-11-22 and 2026-11-24",
        source: "web/lib/node.tsx",
      },
      {
        title: "A grid's lines are one color, inside and out",
        text: "In a hairline grid of cells, the outer and inner lines are the same hairline as the rails and seams, and the grid's sides sit on the rails. A cell's background never covers a line.",
        decided: "Design lead, 2026-11-22",
        source: "web/styles/web.css (.web-grid)",
      },
      {
        title: "A window's dots are lighter than its bar",
        text: "The three dots in a code panel's or terminal's top bar are neutral-800 on dark and neutral-200 on light, with a very subtle glass: a touch lighter at the top and a hairline highlight. Visible, never drawing the eye.",
        decided: "Design lead, 2026-11-22",
        source: "web/styles/web.css (.web-window-dot)",
      },
      {
        title: "A visual's frame hugs the visual",
        text: "A product screen, diagram or image sits in a frame (a plate in a tray) exactly its size, never in a bigger box, and on the outer side of its row when there's room (the right when the visual is on the right). A visual with its own look, like the globe, sits bare. Product screens are set in from the frame's top-left corner and cropped at its right and bottom, so the frame's surface shows around them.",
        decided: "Design lead, 2026-11-22",
        source: "web/visuals/, web/sections/feature-rows.tsx",
      },
      {
        title: "A card's subject can sit in the center",
        text: "When the visual is what a wide card is about (the Multi-AZ globe), it sits in the center: the title above, the points around it, half on each side, each with its icon on a tile and the side's text facing the visual, and the link under it. On phones: the title, the visual, then the points.",
        decided: "Design lead, 2026-11-22",
        source: "web/sections/feature-grid.tsx (visualPlacement)",
      },
      {
        title: "A row's icon sits with its title, and the row reads from the top",
        text: "In a row of a list (an icon or a number, a title, then its description beside it), the icon and the title sit side by side, centered on each other, and the description starts at the top of the row, 48px away, never centered against it. On phones the description goes under the title. The title and the description get equal halves, so a title fits on one line.",
        decided: "Design lead, 2026-11-24",
        source: "web/sections/feature-grid.tsx (index)",
      },
      {
        title: "A bento of 4, 5 or 6 cards is arranged by count",
        text: "On a 6-column grid. Four: wide and narrow, then narrow and wide. Five: two halves, then three thirds. Six: a wide card and a tall one beside it, two small cards under the wide one, then two halves. The large cards hold media above their text, so the most important come first. Each card's icon sits beside its title. For more than six, use the feature grid.",
        decided: "Design lead, 2026-11-24",
        source: "web/sections/bento.tsx",
      },
      {
        title: "Cards are plates",
        text: "Every page has the material, always, not as an option (2026-11-24). Cards and panels are a touch lighter at the top, with a 1px inner highlight and a soft shadow on light. Their edge is one step under the strong line: the text color at 11% on dark (about neutral-850) and 10% on light (about neutral-100) (--web-plate-edge, 2026-11-24). A simple card, an icon with a title and a line of text (feature, value, channel and contact cards), has no inner highlight, so its top shows one line, not two (Plate simple, 2026-11-24). Media sit in a tray, a framed holder. Rows of facts sit in a hairline grid.",
        decided: "Design lead, 2026-11-21 and 2026-11-24",
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
        text: "A pattern is a background behind a section or a surface inside its cards. The design lead adds them one at a time; never add or set one unless he asks. The first is Depth haze (a surface): slow violet haze with sparse stars, at half strength, behind product screens (the Resilience page's capabilities). Patterns are subtle, in the website's variables.",
        decided: "Design lead, 2026-11-22",
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
        decided: "Design lead, 2026-11-16 and 2026-11-21",
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
        decided: "Design lead, 2026-11-21",
      },
      {
        title: "Images come from the Figma or brand assets",
        text: "Illustrations, logos, social marks and badges are exported as they are (SVG for vectors, PNG for the rest), never redrawn or recolored, except customer logos (below). Ask before adding a photo. The logo, Qbot and patterns follow their own rules in brand-assets.",
        decided: "Design lead, 2026-11-16",
        source: "brand-assets/",
      },
      {
        title: "Customer logos come in three versions",
        text: "Every customer logo the site shows is an SVG in web/assets/logos/customers, used through CustomerLogo: color (the brand's colors, for light backgrounds), light (white, for dark backgrounds) and dark (near-black, for light backgrounds), or mono, which takes the text color, so a wall of logos can be one neutral that blends in. The light, dark and mono versions come from one one-color file. The files come from the Brand Design System's Figma (Customer-Logos) and qdrant.tech's own, trimmed to the artwork and minified; never redrawn. A logo without a color file shows its dark version. Missing color files come from the company itself (its press kit, brand page, GitHub or site) or, failing that, a public-domain file on Wikimedia Commons; never from a logo site or Brandfetch, whose terms don't allow keeping its files (design lead, 2026-11-24). Each logo records where its color came from.",
        decided: "Design lead, 2026-11-23 and 2026-11-24",
        source: "web/content/customer-logos.ts",
      },
    ],
  },
]
