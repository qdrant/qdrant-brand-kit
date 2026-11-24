# Working together on the website library

A handoff for the marketing designer joining the design lead on the website library (2026-11-23). It covers what's been built, where the rules live, how to set up, how the two of you split the work, and how to branch so you don't get in each other's way. Give it to your Claude session first: it's written for both of you.

## The plan

- **The design lead** keeps refining the baseline components on the studio's Canvas: the sections in `web/sections/`, their parts in `web/lib/`, and the design system they're built from.
- **You** work on the patterns and shaders that are added to those components later: the layers in `web/patterns/`, the scene engine in `web/visuals/scene.tsx`, and new canvas or WebGL scenes.
- Each of you works on your own branch, and both branches merge into `web-sections`. From there, everything goes to `main` through PR #16.

## What's here

This repo is Qdrant's brand system: the rules and materials for creatives, the design system for web UI (shadcn on Base UI), the website's sections built from it, and a studio app to review them all.

| Folder | What it is |
| --- | --- |
| `primitives/` | The tokens: colors, typography, spacing. Generated from their `.tokens.json` files |
| `design-system/` | shadcn on Base UI, styled only through the primitives. Its rules are in `AGENTS.md` and the look and its decisions in `DESIGN.md` |
| `web/` | The website's section library: 50 sections, their registry, content, visuals, patterns, pages and the website's guidelines |
| `studio/` | The Next.js app where everything is reviewed. The Web page shows the library; the Space page holds the space-theme explorations |
| `brand-assets/`, `brand-components/`, `guidelines/`, `review/` | Creatives (social posts, ads, banners). Not part of this work |

The website library lives on the branch `web-sections`, in PR [qdrant/qdrant-brand-kit#16](https://github.com/qdrant/qdrant-brand-kit/pull/16). It targets `main` and waits on the visual designer's review. `main` already has the color work (#14, #15) and the visual designer's creative and print changes (#11 to #13), but not the website library. Always start from `web-sections`.

## Read these first

In this order. They're the rules, and they win over anything in this file:

1. [`AGENTS.md`](../AGENTS.md) at the root: the map, and the rules you must never break.
2. [`design-system/AGENTS.md`](../design-system/AGENTS.md) and [`design-system/DESIGN.md`](../design-system/DESIGN.md): how UI is built, the look and every decision with its date.
3. [`web/AGENTS.md`](AGENTS.md): how sections, visuals and patterns are built, and "Adding a pattern".
4. [`web/guidelines.ts`](guidelines.ts): every rule for the website, with who decided it and when. The studio shows them at Web, Docs, Guidelines.
5. [`studio/AGENTS.md`](../studio/AGENTS.md): what each studio page is, including Space.

## Set up

You need Node 20.9 or newer and pnpm 11 (the repo asks for 11.25.0).

```bash
git clone --branch web-sections https://github.com/qdrant/qdrant-brand-kit.git
```

```bash
cd qdrant-brand-kit && pnpm install
```

```bash
pnpm dev
```

The studio opens at `localhost:3000`. To look at the studio yourself, run it on your own computer. A cloud session can build and check the code, but you see the pages locally.

Before every commit:

```bash
pnpm lint && pnpm typecheck && pnpm build
```

## Branches

Each of you works on your own branch, cut from `web-sections`. Neither of you commits to `web-sections` directly. Your work reaches it through a pull request.

| Who | Branch | Pull request into |
| --- | --- | --- |
| The design lead | `web-components` | `web-sections` |
| You | `web-patterns` | `web-sections` |

### Create your branch (once)

```bash
git fetch origin
```

```bash
git switch web-sections && git pull
```

```bash
git switch -c web-patterns
```

```bash
git push -u origin web-patterns
```

In a cloud session, ask Claude to do the same: start from `web-sections`, create `web-patterns`, and push to it. Cloud sessions name their own branches (`claude/…`) unless you tell them which branch to use.

### Every day

Start by bringing in what the other person has merged, so your branch never drifts far:

```bash
git fetch origin && git merge origin/web-sections
```

Commit small and often, and push to your branch:

```bash
git push
```

### When a piece is ready

1. Merge the latest `web-sections` into your branch and fix any conflicts there, on your branch.
2. Run lint, typecheck and build.
3. Open a pull request from your branch into `web-sections`, and say what it changes and which rules it adds:

```bash
gh pr create --base web-sections --head web-patterns
```

4. The other person looks at it in the studio, then merges it. Keep working on the same branch afterwards.

## Who owns which files

Conflicts happen when two branches change the same lines. Stay in your own files, and add to the shared ones as described here.

**Yours (patterns and shaders):**

- `web/patterns/`: every pattern file, `index.tsx` and `types.ts`.
- `web/visuals/scene.tsx`: the canvas and WebGL engine.
- New scene files in `web/visuals/`. The design lead owns the existing visual files there (`console.tsx`, `console-setup.tsx`, `cluster-diagram.tsx`, `zone-globe.tsx`), so ask before changing them.
- `studio/components/web/patterns-view.tsx` and `studio/app/web/(views)/patterns/`: the studio's Patterns tab.
- `studio/components/space/`, `studio/lib/space.ts` and `studio/app/space/`: the Space page, where options are explored.

**The design lead's (components):**

- `web/sections/`, `web/lib/`, `web/registry/`, `web/content/` and `web/pages/`.
- `design-system/` and `primitives/`.
- The rest of `studio/components/web/` (Canvas, Docs, Builder).

**Shared (add, don't rewrite):**

- **`web/styles/web.css`.** Pattern CSS goes in one block, at the end, under a comment that says it belongs to patterns. Leave the rest of the file alone. The `--web-scene-*` colors and `.web-depth-haze` are already there; keep changes to them in that block.
- **`web/guidelines.ts`.** Add your rules to the "patterns" group (Patterns and effects) only.
- **`design-system/DESIGN.md`.** Add a new row for a decision; don't edit the rows above it.
- **Where patterns are drawn.** `web/lib/section.tsx` renders a section's `pattern`, and `web/lib/plate.tsx` renders the `cardPattern` inside each card. Both are the design lead's. If you need them to change, say so first.

## How patterns work

- **Two kinds.** A pattern is one file in `web/patterns/` exporting `definePattern({ id, name, kind, description, Layer })`. A `"background"` pattern sits behind a section's content, and a `"surface"` pattern sits inside each card of a section.
- **Registering one.** List it in `web/patterns/index.tsx`. It then shows in the studio's Patterns tab and in the Builder's pattern pickers, and any section can use it through its `pattern` or `cardPattern` prop.
- **What a Layer is.** It fills its parent (absolute, inset 0) and is purely decorative: `aria-hidden`, no pointer events, never text. The `data-web-patterns="off"` switch on the Canvas hides every pattern at once, so you can compare with and without.
- **The engine.** Canvas and WebGL scenes run on `web/visuals/scene.tsx`:
  - `SceneCanvas` for 2D canvas scenes;
  - `SceneShader` for WebGL2 fragment shaders, which get `u_res`, `u_time`, `u_pointer`, `u_dpr` and the palette colors you ask for as `u_c0…`;
  - `GLSL_NOISE` for shared noise functions.
- **What the engine does for you.** It draws only while a scene is on screen and the tab is visible, and draws one still frame for reduced motion. A shader also gives back its WebGL context when it scrolls away: browsers keep only about 16 contexts at once, and a surface pattern runs in every card of a section.
- **Colors.** The palette comes from the `--web-scene-*` variables in `web/styles/web.css`, with different values for dark and light. Never write a hex in a pattern; add a variable instead.
- **The first pattern** is Depth haze (`web/patterns/depth-haze.tsx`): violet noise lit from above, with sparse stars on the 8px grid, drifting slowly. It's at 50% opacity on dark and 40% on light, behind the Console screens on the Resilience page's Capabilities rows. Use it as the model for the next ones.
- **The source of the options.** The Space page (`/space`) holds about 80 explorations (backgrounds, signature visuals, card surfaces and WebGL shaders), each with a code like BG-07 or SH-12. They use their own `--sp-*` colors. To bring one to the website:
  1. Port it to `web/` on the scene engine with the `--web-scene-*` colors.
  2. Register it in `web/patterns/index.tsx`.
  3. Add a dated line to `DESIGN.md` and a rule to `web/guidelines.ts`.

  Never put one inside a design-system component.
- **Brand patterns** in `brand-assets/patterns/` (the creatives' Color, Mesh and Generative patterns) render slowly. If one is used on the website, render it once per size, never on every frame or resize.

## The rules for patterns so far

The design lead decided these. They're in `web/guidelines.ts` and `design-system/DESIGN.md`:

- **Added by hand, with intent** (design lead, 2026-11-22). The design lead removed the first batch of patterns so they come back one at a time, each for a reason. Propose patterns to the design lead with a rendered example; one goes into `web/patterns/index.tsx` and onto a section only with his yes.
- **Subtle, and slow or still.** A pattern supports the content and never competes with it.
- **Both themes.** Each pattern is checked in dark and light, at desktop and phone width.
- **Space comes from light, type and motion, never glow** (`DESIGN.md`, Space theme). Light comes from above. Avoid glows, colored shadows, nebula gradients, literal rockets and planets, and twinkling stars behind data.
- **Effects belong in sections, never in design-system components.**
- **A page is all dark or all light** (design lead, 2026-11-22), so a pattern never switches a section's theme.
- **Kicker nodes blink** (design lead, 2026-11-22; only kickers' since 2026-11-24). The hexagon before a kicker blinks like a live readout: a hard step to 25% and back every 2 seconds, each at its own offset. That's the model for "alive" motion: stepped and quiet, like the telemetry mark on the Space page's Telemetry footer (SF-19).

## Decisions made so far, for context

All of these are in `web/guidelines.ts` with their dates. A short list, so you know the look you're designing for:

- **Layout.** A 1200px container with 24px column gaps, on the 4px spacing scale. Pages are built only from the library.
- **Colors.**
  - Amaranth is the accent and indigo the second color.
  - Links are indigo (400 on dark, 800 on light).
  - Colors follow the color guidelines' contrast steps by theme.
- **Icons.** Lucide only, in color and never amaranth, with pixel-perfect lines: 1px up to 18px, 1.5px from 20 to 32px, 2px from 40px.
- **Lines and material.**
  - Rails run down each side of the page and seams between sections, with hexagon nodes where they meet.
  - A hairline grid's lines are one color, inside and out.
  - Cards are plates, a touch darker than the page's surfaces on dark.
  - A window's dots are a step lighter than their bar, with a very subtle glass.
  - The selected tab has a clear fill.
- **Visuals.**
  - A visual's frame hugs it and sits on the outer side of its row.
  - A wide card's subject (the Multi-AZ globe) can sit in the center, with its points around it.
- **Motion.** In-page links scroll with an ease-in-out, in 0.6 to 1.1 seconds.
- **Type.** A trial for headings, from 60px in Medium, with a switch to compare it. It goes into the primitives only with the visual designer's yes.

## Never

The full list is in the root `AGENTS.md`. The ones that matter most here:

- **Rules and review.** Rules come from the design lead, and changes to shared rules need the visual designer's yes. Every rule the design lead decides goes into `web/guidelines.ts` in the same commit.
- **Content.** Never invent content: copy, dates, names or links.
- **Files in the repo.**
  - Never save working files, renders or screenshots in this repo. Keep them in a folder outside it.
  - Never edit generated CSS in `primitives/`: change the `.tokens.json` and run `pnpm tokens`.
- **Git.** Commit only the files you changed. Never push to `main`, and never force-push a shared branch.
- **Money.** Don't spend money (image generations, paid tools) without asking first.
