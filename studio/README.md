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

Open `http://localhost:3000`. Press `d` to switch the page between dark and light.

## What's in it

| Page | What it shows |
| --- | --- |
| Overview (`/`) | A set of components in a dark and a light section side by side |
| Design system (`/design-system`) | Every component in the design system, grouped, each with shadcn's demo of its variants and states |
| Web (`/web`) | The sections in `web/sections` (none yet) |

**The panel on the left** switches the theme and lets you try values live: the accent color, the corner radius, the Mona Sans width of headings, and a glow on the primary button. Nothing changes in the code. **Copy CSS** gives you the overrides worth keeping, to move into `design-system/` with a line in `design-system/DESIGN.md`; **Reset** clears them.

| Path | What it is |
| --- | --- |
| `app/` | The pages, and `app/repo/`, a read-only route that serves `brand-assets/` and `primitives/` at `/repo/...` (the same paths as `review/render.py`), so pages can use the real logo, patterns and Qbot |
| `components/studio-panel.tsx` | The panel: navigation, theme and the live controls |
| `lib/overrides.ts` | What each control changes, as CSS variables |
| `lib/catalog.ts` | Every component, grouped. Add new ones here; the design system page warns about any it's missing |
| `examples/` | shadcn's demos, fetched by `scripts/fetch-examples.mjs` ([its README](examples/README.md)) |
| `components/theme-provider.tsx` | Dark and light themes with `data-theme`, dark by default |
| `components.json` | shadcn's settings: components install into the design system |
| `next.config.ts` | Loads the design system and web packages from the workspace |

## Agents' tools

- **The shadcn skill** is installed for Claude Code in `.claude/skills/shadcn` at the repo root: shadcn's own guidance for adding, styling and debugging components.
- **The Playwright MCP** lets Claude Code open the studio and take screenshots to check its work. It's a local setting, not in the repo; add it once from the repo root with `claude mcp add playwright -- pnpm dlx @playwright/mcp@latest`.
