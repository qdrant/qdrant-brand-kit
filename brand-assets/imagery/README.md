# Imagery

Generated images in a Qdrant image style: blog heroes, article images, social and event imagery. No text in the image. Read from Design Lab (brand kit 0.1.0) on 2026-11-04; Design Lab is still the live source.

## How it works today

1. Someone asks for an image in Claude or on the Create screen.
2. They pick a channel (size) and an image style. With no style named, Default is used.
3. Design Lab writes the prompt from the request, using [All images](guidance/images.md): describe the scene, never the style.
4. It generates **3 options** of the same scene at `1536×1024`, sending all 10 style references every time.
5. The AI review marks each option Design-approved or not. Everything is saved to the Library.

## What's inside

| Path | What it is |
| --- | --- |
| `imagery.config.json` | Options, channel sizes, styles, rules, review |
| `guidance/images.md` | Rules for every generated image |
| `guidance/invariants.md` | No text in images; never combined with the mascot |
| `guidance/review.md` | The review checklist |
| `styles/default/style.md` | Default style guidance |
| `styles/default/references/` | The 10 Default moodboard images, in slot order, as stored in Design Lab |

## Channel sizes

| Channel | Size |
| --- | --- |
| Blog post hero | 2002×1122 |
| Technical article | 898×300 |
| Event | 1080×1080 |
| Social, square | 1080×1080 |
| Social, portrait | 1080×1350 |
| Social, wide | 1920×1080 |

## Adding a style

Add `styles/<name>/` with a `style.md` and up to 10 `references/`, and a matching entry under `styles.list` in the config. In Design Lab, a style is a moodboard (Brand kit → Image styles).

## Open issues

- **Default style guidance is empty.** Design Lab only has the placeholder text, so the references carry the whole style.
- **Options don't match.** The blog and article output type is set to 1 option, but the legacy image type and the Nov 2 decision say 3.
- **Mascot is "optional"** on the imagery output types, but the routing rules say the mascot and realistic imagery are never combined.
- **Model isn't confirmed** in the kit; only the generator size (`1536×1024`) is.
- **Unusual ratios** (very wide banners, tall stories) still need rules (MKT-491).
- The review checklist is one line. A fuller rubric is a design to-do.
