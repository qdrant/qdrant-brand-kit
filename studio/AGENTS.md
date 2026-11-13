# Studio (for agents)

The studio is the workshop for the [design system](../design-system/) and the [web sections](../web/): a Next.js app that shows them on the real tokens, in dark and light. It isn't a website and never ships. Product pages come later.

Read the [root `AGENTS.md`](../AGENTS.md) and [`design-system/AGENTS.md`](../design-system/AGENTS.md) first.

## Rules

- **Every visual change is checked here before it's committed**, in dark and in light. Take screenshots to a folder outside the repo, never inside it.
- **The studio shows, it doesn't define.** A look decided here goes into the design system (`design-system/`) or the primitives, and gets a line in [`design-system/DESIGN.md`](../design-system/DESIGN.md). Nothing in `studio/` is a source of truth.
- **Run shadcn's CLI from here** (`pnpm dlx shadcn@latest add <name>`). It installs into the design system; then move the helpers it leaves in `studio/hooks` or `studio/lib` into the design system ([`design-system/AGENTS.md`](../design-system/AGENTS.md)).
- **Next.js 16 changed a lot.** Before writing app code, read the guide for what you're doing in `node_modules/next/dist/docs/`. `agentRules` is off in `next.config.ts`, so `next dev` never writes into `AGENTS.md`.
- **Themes:** `components/theme-provider.tsx` sets `data-theme` on `<html>`: dark by default, `d` toggles light. Sections can set their own `data-theme`.
