# Design system (for agents)

`@qdrant/design-system` is Qdrant's UI component library: shadcn on Base UI, styled only through the Qdrant primitives. Web sections ([`web/`](../web/)) are built from it, and the [studio](../studio/) shows it. Product UI comes later and will use it too.

Read the [root `AGENTS.md`](../AGENTS.md) first. This file adds the rules for UI code.

## Before you write UI

1. **Read [`DESIGN.md`](DESIGN.md)**: the look and every decision so far, with dates.
2. **Use what exists first.** Qdrant components in [`components/qdrant/`](components/qdrant/), then the shadcn components in [`components/ui/`](components/ui/). Build something new only when neither fits, and say why.
3. **Check it in the studio** before you commit: `pnpm dev` from the repo root, then open `http://localhost:3000`. Look at it in dark and in light.

## Rules

- **Tokens only.** Use the semantic classes (`bg-background`, `text-muted-foreground`, `bg-primary`, `border-border`) or the Qdrant palette classes (`bg-indigo-600`). Never a hex, `rgb()` or `oklch()` value, and never a color that isn't in [`primitives/colors/`](../primitives/colors/). Tailwind's default palette is switched off on purpose.
- **Spacing from the 4px scale.** Padding, margins and gaps use only the [`primitives/spacing/`](../primitives/spacing/) values: Tailwind `0, 1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 36, 40`. Never `1.5`, `2.5` or arbitrary px values. Stock shadcn components still use some off-scale steps; leave them until the refinement step changes them.
- **Radius, type and border widths** come from their primitives folders through the theme. Mona Sans always renders with `ss05` and `ss06` on, and headings are SemiBold, never Bold ([`primitives/typography/`](../primitives/typography/)).
- **Icons are Lucide only** ([`brand-assets/icons/`](../brand-assets/icons/)). Never draw or import another icon set.
- **Themes:** dark is the default. Put `data-theme="dark"` or `"light"` on `<html>`, and on any section that should switch. Use `dark:` and `light:` variants only when a role can't do it.
- **Brand assets are reused, never redrawn:** the logo, patterns and Qbot from [`brand-assets/`](../brand-assets/).
- **Shared looks live in [`styles/components/`](styles/components/).** The button's look is in `styles/components/button.css`, shared with the creative button. Change the look there, never in `brand-components/`.

## Which root "Never" rules apply to web UI

| Root rule | Web UI |
| --- | --- |
| Never invent content: copy, dates, speakers, links | Applies |
| Never change or redraw the logo, a pattern or an approved part | Applies |
| Never use Bold for titles | Applies (SemiBold headings) |
| Never right-align text, mix alignments, or use more than two text sizes | Creatives only. Web pages need more sizes, and tables can right-align numbers |
| Qbot rules (no Qbot with headshots, over text, cut at the face; only its own glow) | Applies wherever Qbot appears |
| Lucide icons only | Applies |
| Never put an icon in a button | **Open, for Vanesa.** The button README says "in every use", but web UI needs icon buttons (dialog close, menus). Until decided: no icon in a call-to-action button; icon-only controls are allowed |
| Never use red as a background without a yes | Applies: amaranth is an accent, never a flat fill behind text |
| Never spend money without asking | Applies |
| Never save working files, renders or screenshots in the repo | Applies |

## Adding a shadcn component

Run the CLI from `studio/`: `pnpm dlx shadcn@latest add <name>`. It installs the component into `components/ui/` here. It also writes any hook or lib helper into `studio/`, while the component imports it from this package. **Move those helpers into `hooks/` or `lib/` here** and fix their `@/` imports, or the build breaks. Then check the new component in the studio in both themes.

## Changing a token or the mapping

- **A primitive value** (a color, a radius): change the `.tokens.json` in `primitives/`, run `pnpm tokens` from the repo root, and commit the JSON and the generated files together. Never edit generated CSS. Primitives are shared with creatives, so this needs Vanesa's review.
- **How shadcn reads the primitives:** [`styles/globals.css`](styles/globals.css). Map by meaning: shadcn's `secondary`, `muted` and `accent` are neutral surfaces, not Qdrant's violet or red.
- Record every look decision in [`DESIGN.md`](DESIGN.md), with its date.
