# Start here (for agents)

This repo is the Qdrant marketing brand system: the rules and materials for **creatives** (social posts, ads, banners, event graphics). Not the product UI. This page is a map: it tells you what to read and the rules you must never break. The values live in the linked files. **For any part, asset or rule you use, read its README in full.**

## Making a creative

1. **Ask first.** Settle the questions in [`guidelines/`](guidelines/) section 1 (tone, pattern or image, hero, red, other sizes) unless the request already answers them. Never decide a layout or look on your own when the person hasn't said: ask, with rendered options when it's visual.
2. **Read, in this order:**
   - [`guidelines/README.md`](guidelines/README.md): all of it. Section 11 (Composition) is how to lay a creative out. There are no fixed post templates.
   - [`primitives/typography/README.md`](primitives/typography/README.md), "Text in creatives": the title scale and the one supporting size. Classes `.qd-title` (`--medium`, `--long`) and `.qd-supporting`.
   - [`primitives/layout/README.md`](primitives/layout/README.md): shapes, margins, grid, gap roles, Box, and "Steps for an agent".
   - [`primitives/layout/checks.md`](primitives/layout/checks.md): what every creative must pass.
   - Then **only** what you use: [`brand-assets/logo/`](brand-assets/logo/), [`icons/`](brand-assets/icons/), [`patterns/`](brand-assets/patterns/), [`imagery/`](brand-assets/imagery/) (incl. `headshots/`), [`mascot/`](brand-assets/mascot/), and the parts in [`components/`](components/) (button, headshot-card, headshot-circle, partner-lockup).
3. **Build** in HTML/CSS with the repo's CSS and classes. Never redraw the logo, a part or a pattern.
4. **Review it** with [`review/`](review/): `render.py`, `check.py`, `sheet.py`. Fix every fail, then look at each render yourself (the checker lists what it can't judge).
5. **Show** the contact sheet and say what you'd ask or change.

## Never

- Invent content (copy, dates, speakers, links). Write copy only when asked.
- Change an approved pattern, the logo or an approved part. Never redraw them.
- Use Bold for titles, right-align text, mix alignments, or use more than two text sizes outside the headshot parts.
- Put Qbot with headshots or with a generated image, or use two heroes.
- Put Qbot between text blocks or over text, the logo or the button, or cut its face ([`guidelines/`](guidelines/) section 6). Use `.qd-mascot--glow` from `brand-assets/mascot/3d/mascot.css`, never your own glow.
- Use an icon that isn't from Lucide, or put an icon in a button ([`brand-assets/icons/`](brand-assets/icons/)).
- Use red as a background without the person's yes.
- Spend money (Design Lab or image generations) without asking first.
- Save working files, renders or photos inside this repo. Work in a folder outside it, with absolute paths.

## Changing the repo

- **Ask Vanesa before changing any rule or file**, and say what you'd change and why. Rules come with a decision date.
- Other chats edit this folder too: commit only the files you changed, and push. If a push to `main` fails with a GitHub "Internal Server Error", push to a temporary branch, run `gh api -X PATCH repos/vanesaajdini/qdrant-mkt-brand-system/git/refs/heads/main -f sha=<sha> -F force=false`, then delete the branch.
- **When a rule changes, update this file in the same commit** if the change touches anything listed here.
