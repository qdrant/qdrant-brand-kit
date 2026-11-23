# Studio

The workshop for the [design system](../design-system/) and the [web sections](../web/): a Next.js app that shows them on the real Qdrant tokens, in dark and light, so every change is seen before it's committed. It isn't a website and never ships.

Agents: read [`AGENTS.md`](AGENTS.md).

## Run it

From the repo root, once:

```bash
pnpm install
```

Then:

```bash
pnpm dev
```

Open `http://localhost:3000`. The top menu has the pages, and the moon and sun on the right switch between dark and light (or press `d`).

## What's in it

| Page | What it shows |
| --- | --- |
| Overview (`/`) | shadcn's [Create page](https://ui.shadcn.com/create) preview: about 30 cards that use almost every component together, to judge the look as a whole, with the product's indigo accent. It opens at 100%; **Fit** scales it to the window to see almost everything at once. Beside the heading, toggles for the space-theme prototypes |
| Design system (`/design-system`) | Two tabs. **Components**: every component in the design system, grouped, each with shadcn's demo of its variants and states. **Variations** (`/design-system/variations`): variations of the design system's structure (buttons, borders, surfaces, radius, type, density, motion), with the colors kept and the product's indigo accent. The links at the top switch between them; the switch on the right shows them on the Overview's components or on the App's serverless space. While a variation is open, it applies to the whole studio. Nothing there is decided |
| Color (`/color`) | The palette, 10 steps per color that keep their job in light and dark; one tab per group of the Figma Color collection (Text, Primary, Secondary, Status, Background, Border, Data viz, Static), each with how to use it, its tokens in light and dark with their contrast, and the tokens at work; and example assets that follow the semantic tokens, with a panel to remap them live |
| Typography (`/typography`) | Every text style in `primitives/typography/typography.css`, in each weight it comes in, one tab per family (Mona Sans Display, Mona Sans, Mona Sans Mono, Mona Sans Display Condensed); and a Creatives tab with the text in creatives and brand components (titles, supporting text, the button, headshots) at each shape's reference size. Each one shows "High-Performance Vector Search at Scale" and, in small type, its family, size, line height, letter spacing and weight, measured from the sample as it renders, with its name as a tag |
| Web (`/web`) | Marketing pages built from the sections in `web/sections`, to see the design system on a real page. The Web link opens the first one straight away: the Resilience page, rebuilt from the Figma (Qdrant Web Design) with the design system's components and colors |
| App (`/app`) | Qdrant Cloud pages rebuilt with the design system, to see how it looks in the product. Each one takes its layout and copy from the product's Figma, and its components, colors and icons from the design system. The App link opens the first one straight away: a serverless space's overview |
| Space (`/space`) | Options for the space theme in web sections: backgrounds, signature visuals, card surfaces and WebGL shaders, each with a code (BG-07, SH-12), and a few of them on real sections. Nothing there is decided |

**Changing the design system:** for now, prompt Claude Code with the studio open next to the chat (in the Claude desktop app, the browser pane). The canvas gets the whole width.

**The controls panel is hidden for now.** It's [DialKit](https://www.dialkit.dev/), in the design system's colors, and it changes the design system's tokens so every instance of a component follows, on every page. To bring it back, see the note in `app/layout.tsx`. It has:
- **Foundations:** the accent, the radius scale, the size shared by buttons, fields, toggles and tabs, type (heading width, tracking, titles, labels, captions), the focus ring, motion and the overlay behind dialogs.
- **Depth Dark and Depth Light:** which neutral each background role, the borders, the field edge and the secondary text use.
- **Components:** Button, Field, Card, Badge, Menu, Tabs, Checkbox and radio, Switch, Tooltip, Dialog and Table, each with its own size, shape, type and edges. A component's own value wins over the shared one.

Nothing changes in the code:
- The values are saved in your browser until you press **Reset**.
- **Save version** keeps a look so you can compare it with others.
- **Copy CSS** gives you the overrides worth keeping, to move into `design-system/` or `primitives/` with a line in `design-system/DESIGN.md`.

| Path | What it is |
| --- | --- |
| `app/` | The pages, and `app/repo/`, a read-only route that serves `brand-assets/`, `primitives/` and `web/assets/` at `/repo/...` (the same paths as `review/render.py`), so pages can use the real logo, patterns, Qbot and the web sections' images |
| `components/studio-nav.tsx` | The top menu: the pages, and the theme on the right |
| `components/studio-controls.tsx` | The controls panel (DialKit), hidden for now |
| `lib/overrides.ts` | The controls, and the token each one changes |
| `lib/dials.ts` | Turns the controls into DialKit's config and into the CSS overrides |
| `components/overview-canvas.tsx` | The Overview page, with its zoom |
| `components/product-context.tsx` | Puts a page in the product context (the indigo accent), with its menus and dialogs: used by Overview and Variations |
| `lib/prototypes.ts` | The space-theme prototypes: studio-only overrides of design-system tokens, switched on from the Overview heading. They stay on across pages and are saved in your browser. Not decisions |
| `lib/variations.ts` | The variations: each one is design-system tokens overridden while its page is open, plus a little CSS for looks no token covers yet |
| `lib/typography.ts`, `components/type-specimen.tsx` | The Typography page: the styles it shows (the `--qd-type-*` variables, and the creative and brand-component classes with the shapes that share a size) and one specimen, which measures its sample in the browser |
| `product/` | The App pages: `cloud-shell.tsx` (the Qdrant Cloud sidebar, top bar and footer) and one file per page, shown by `app/app/` |
| `lib/catalog.ts` | Every component, grouped. Add new ones here; the design system page warns about any it's missing |
| `examples/` | shadcn's demos and the Create page preview, fetched by `scripts/fetch-examples.mjs` ([its README](examples/README.md)) |
| `components/theme-provider.tsx` | Dark and light themes with `data-theme`, dark by default |
| `components.json` | shadcn's settings: components install into the design system |
| `next.config.ts` | Loads the design system and web packages from the workspace |

## Agents' tools

- **The shadcn skill** is installed for Claude Code in `.claude/skills/shadcn` at the repo root: shadcn's own guidance for adding, styling and debugging components.
- **The Playwright MCP** lets Claude Code open the studio and take screenshots to check its work. It's a local setting, not in the repo; add it once from the repo root with `claude mcp add playwright -- pnpm dlx @playwright/mcp@latest`.
