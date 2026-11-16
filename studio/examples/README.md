# Examples

shadcn's own example demos for each component, as the studio shows them on the design system page, and in `preview/` the cards of shadcn's [Create page](https://ui.shadcn.com/create) preview (its `preview-02` block), for the Overview page. They're shadcn/ui code (MIT License, [`LICENSE-shadcn.md`](LICENSE-shadcn.md)), downloaded from ui.shadcn.com with their imports rewritten to `@qdrant/design-system`.

Never edit these by hand: run the script again instead. From the repo root:

```bash
node studio/scripts/fetch-examples.mjs
```

It writes one file per component in `design-system/components/ui`, `index.ts` and `preview/`, and prints any import it couldn't rewrite.

- **shadcn's styles:** the demos switch some classes per shadcn style (`style-mira:`, `style-lyra:` and so on). The design system is built on base-mira, so the script keeps mira's classes and drops the others.

- **No example yet:** `code-block`, `message`, `message-scroller` and `trace` (their demos need shadcn's AI sample code), and `direction` (shadcn has none).
- **Three stand-ins** replace shadcn's website-only pieces: `components/example.tsx` (the layout wrapper), `components/icon-placeholder.tsx` (renders the Lucide icon; Qdrant uses Lucide only) and `lib/design-system-params.ts` (tells the preview cards the style is mira).
- **Outside images:** some demos show avatars and photos from github.com, avatar.vercel.sh and images.unsplash.com, so viewing those pages loads them from there.
- Lint skips this folder, and the studio's TypeScript is slightly less strict than the design system's (`noUncheckedIndexedAccess` is off), so the demos stay as shadcn wrote them.
