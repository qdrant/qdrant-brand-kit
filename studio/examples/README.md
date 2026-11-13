# Examples

shadcn's own example demos for each component, as the studio shows them on the design system page. They're shadcn/ui code (MIT License, [`LICENSE-shadcn.md`](LICENSE-shadcn.md)), downloaded from ui.shadcn.com with their imports rewritten to `@qdrant/design-system`.

Never edit these by hand: run the script again instead. From the repo root:

```bash
node studio/scripts/fetch-examples.mjs
```

It writes one file per component in `design-system/components/ui` and `index.ts`, and prints any import it couldn't rewrite.

- **No example yet:** `code-block`, `message`, `message-scroller` and `trace` (their demos need shadcn's AI sample code), and `direction` (shadcn has none).
- **Two stand-ins** in `studio/components/` replace shadcn's website-only pieces: `example.tsx` (the layout wrapper) and `icon-placeholder.tsx` (renders the Lucide icon; Qdrant uses Lucide only).
- **Outside images:** some demos show avatars and photos from github.com, avatar.vercel.sh and images.unsplash.com, so viewing those pages loads them from there.
- Lint skips this folder, and the studio's TypeScript is slightly less strict than the design system's (`noUncheckedIndexedAccess` is off), so the demos stay as shadcn wrote them.
