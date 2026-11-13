# Design system

Qdrant's UI component library, `@qdrant/design-system`: shadcn on Base UI, styled only through the Qdrant [primitives](../primitives/). The web sections in [`web/`](../web/) are built from it, and the [studio](../studio/) shows it. Product UI will use it later.

Agents: read [`AGENTS.md`](AGENTS.md). The look and its decisions are in [`DESIGN.md`](DESIGN.md).

| Path | What it is |
| --- | --- |
| `components/ui/` | The shadcn components (63), from the Qdrant preset. Restyled only through tokens |
| `components/qdrant/` | Qdrant's own components, built from the ones in `ui/`. Empty for now |
| `styles/globals.css` | The stylesheet: Tailwind, the primitives, and shadcn's tokens mapped onto the Qdrant roles |
| `styles/tokens.css` | Generated: the Qdrant palette as Tailwind colors. Tailwind's default palette is switched off |
| `styles/components/` | Looks shared with the brand components, as plain CSS variables. `button.css` is the button's look |
| `lib/`, `hooks/` | Helpers the components use |
| `components.json` | shadcn's settings for this package |

## How the values flow

1. `primitives/*/*.tokens.json`: the source, matching the Figma primitives.
2. `node primitives/build.mjs` (or `pnpm tokens`) writes `primitives/*/*.css` (`--qd-*` variables) and `styles/tokens.css`.
3. `styles/globals.css` imports them and maps shadcn's tokens by meaning: `background` is `background.default`, `card` is `raised`, `primary` is the brand red, and so on.
4. The components use shadcn's semantic classes, so they follow the primitives without knowing them.

Change a value at step 1, never further down.

## Use it

The studio already does this. A new app in this workspace would:

```tsx
// app/layout.tsx
import "@qdrant/design-system/globals.css"

// any component
import { Button } from "@qdrant/design-system/components/ui/button"
```

Add `"@qdrant/design-system": "workspace:*"` to the app's dependencies, list it in `transpilePackages` in `next.config.ts`, and put `data-theme="dark"` (or `"light"`) on `<html>`.

## Add to it

- **A shadcn component:** from `studio/`, `pnpm dlx shadcn@latest add <name>`. Then move any helper it wrote into `studio/hooks` or `studio/lib` over to `hooks/` or `lib/` here ([`AGENTS.md`](AGENTS.md) says how).
- **A Qdrant component:** a file in `components/qdrant/`, built from `components/ui/`, using tokens only.
- **A look shared with a brand component:** variables in `styles/components/`, imported by both sides, like `button.css`.

Check every change in the studio, in dark and in light, before committing.
