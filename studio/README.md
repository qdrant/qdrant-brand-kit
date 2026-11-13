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

For now, one page with a set of stock components in dark and light side by side. The full studio comes next: every component in every state, the web sections, and live controls for radius, accent, Mona Sans width and glow, with a button to copy the CSS of values worth keeping.

| Path | What it is |
| --- | --- |
| `app/` | The pages |
| `components/theme-provider.tsx` | Dark and light themes with `data-theme`, dark by default |
| `components.json` | shadcn's settings: components install into the design system |
| `next.config.ts` | Loads the design system and web packages from the workspace |
