# Design

How the Qdrant design system looks, and why. Every decision has a date. Add a line when a decision is made in the studio, and keep the open questions honest.

The values themselves live in [`primitives/`](../primitives/). This file says how the design system uses them.

## Decided

| Area | Decision | Date |
| --- | --- | --- |
| Base | shadcn on Base UI, from the Qdrant preset `b6t6EN2Dj`: style `base-mira` (compact), Lucide icons, inverted translucent menus with a subtle accent | 2026-11-12 |
| Themes | Dark is the default; light with `data-theme="light"`, on the page or on any section | 2026-11-12 |
| Surfaces | `background` is `background.default` (`neutral-950` dark, `neutral-25` light), `card` is `raised` (`neutral-925`, white), popovers are `overlay` (`neutral-850`, white). Secondary, muted and accent surfaces are `highlight` (`neutral-800`, `neutral-50`) | 2026-11-12 |
| Accent | `primary` is amaranth (`accent.primary`, `#DC244C`) with white text. Indigo is available as a palette color, not as shadcn's `secondary` | 2026-11-12 |
| Text | Body `text.primary`; secondary text `text.secondary` (`neutral-500` dark, `neutral-600` light), which keeps AA | 2026-11-12 |
| Borders | Decorative borders `border.on-dark` (`neutral-700`) and `border.on-light` (`neutral-200`). Inputs `neutral-600` on dark and `neutral-500` on light, for 3:1 | 2026-11-12 |
| Focus | A ring in amaranth: 2px at 40% on the button, at 30% or 50% on the other stock components | 2026-11-12 |
| Palette | Only Qdrant colors exist as Tailwind classes; Tailwind's default palette is switched off | 2026-11-12 |
| Type | Mona Sans with `ss05` and `ss06` on, Geist Mono for code. Headings SemiBold, never Bold | 2026-11-12 |
| Radius | shadcn's sizes snap to the nearest Qdrant radius: `sm` 4px, `md`, `lg` and `xl` 8px, `2xl` and `3xl` 16px, `4xl` 24px | 2026-11-12 |
| Spacing | Tailwind's 4px unit is the Figma 4px grid; only the Figma values are used in new code | 2026-11-12 |
| Button | The approved Qdrant button look, shared with the creative button through `styles/components/button.css`: an amaranth gradient with a top inner highlight; hover flat with a lighter highlight; focus ring at 40%; disabled lighter amaranth | 2026-11-12 |

## Open

- **Sizes.** `base-mira` is compact (28px buttons, 12px text). The Figma web button is 36, 40 or 48px tall with 16 or 18px text ([button README](../brand-components/button/README.md), "Web states"). Decide which the web uses.
- **Stock spacing.** Some stock components use off-scale steps (6px, 10px). Snap them to the 4px scale.
- **Inputs in light.** The stock input fill reads gray on light backgrounds.
- **Secondary button.** The Figma secondary states (outline borders in `neutral-600`, `400`, `50`) aren't wired to the `outline` variant yet.
- **Brand Design System button.** Its values (Figma `8y0svqBDPZX6caRNF6lddG`, node `13872:1092`) replace today's in `styles/components/button.css` once approved.
- **Icons in buttons.** See [`AGENTS.md`](AGENTS.md), "Which root Never rules apply to web UI". For Vanesa.

## Still to explore in the studio

The space theme, one layer at a time and in this order, since each changes the ones after it: depth (surfaces as layers of space), light (glows instead of drop shadows), texture (pattern backgrounds in web sections), type (Mona Sans width for display), motion (calm easing), and one or two signature details from the brand's own assets. Glows and textures belong in web sections; components stay quiet. Each decision gets a line in the table above.
