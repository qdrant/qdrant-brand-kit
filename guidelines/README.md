# Brand guidelines: choosing and combining

The other folders say how each piece is built. This one says **which pieces to pick and how to put them together** when someone makes a creative. Written for people and for the agents that make creatives from a chat request.

Three kinds of rule:

- **Must:** never break it.
- **Suggest:** the default. The person can choose otherwise.
- **Ask:** don't decide for the person. Ask, then do what they pick.

Decided by Vanesa on 2026-11-04.

## 1. Ask first

Before making a creative, settle these with the person. Skip a question only when the request already answers it.

| Ask | Why |
| --- | --- |
| Is the tone **community / playful** or **serious / technical**? | It suggests the pattern family (section 2). |
| **Pattern or generated image** as the background? Suggest an image for storytelling and blog heroes, a pattern for everything else. | The person decides. |
| Should it have a **hero**: Qbot, a product screen, or nothing? | Only one hero per creative (section 5). |
| Does it need to **grab a lot of attention**? | Only then can the background be red (section 3). |
| Is this the **same creative in other sizes or channels**? | Then reuse the same pattern and colorway (section 10). |

## 2. Pick the pattern by tone

**Suggest:** the tone points to a pattern family. There's no hard restriction: any pattern can be used for any tone, but community themes use more playful language, so they lean to the playful Color patterns, and serious themes lean to Mesh and Generative (decided 2026-11-04). Inside a family, any pattern and colorway can be used.

| Tone | Family | Patterns |
| --- | --- | --- |
| Community / playful | Color patterns: token gradients with refraction or slice shift | Color-Refracted-Pattern-A, Color-Sliced-Pattern-A, Color-Sliced-Pattern-B |
| Serious / technical | Mesh and generative patterns | Mesh-Refracted-Pattern-A to D, Mesh-Sliced-Pattern-A, Mesh-Dithered-Pattern-A, every Generative pattern (Hexagon, Burst, Dash, Glyph), in any colorway, and Color-Sliced-Pattern-B |

Color-Sliced-Pattern-B (slices with QDRANT letters) works for **both tones** (decided 2026-11-11).

**Color-Sliced (red and violet): use Color-Sliced-Pattern-B, with the QDRANT letter layer, by default** (about 8 creatives in 10). Color-Sliced-Pattern-A, the slices without letters, only in creatives with headshots, where the letters would compete with the faces (decided 2026-11-11).

The patterns themselves are in [`brand-assets/patterns/`](../brand-assets/patterns/).

## 3. Red backgrounds

- **Must: patterns are violet or red, never another color.** No teal or other colors in a pattern background, ever (decided 2026-11-11). Red only in its approved presets and colorways.
- **Must:** violet is the default. A red pattern background (a red colorway, Hexagon-B, Dash-B) is only for creatives that need to **grab a lot of attention and be more impactful**.
- **Ask:** never pick red on your own. Offer it, and use it only when the person says yes.
- Everywhere else, red stays an accent (buttons, highlights), as [`primitives/colors/`](../primitives/colors/) says.

## 4. How the pattern covers the canvas

Use one of these three. Patterns always bleed off the canvas edges they touch. The Zone layout (pattern in one zone, plain background in the rest) is no longer an option: use the pattern mask instead (Vanesa, 2026-11-11).

| Layout | What it looks like | Text goes | Example |
| --- | --- | --- | --- |
| **Full bleed + light card** | Pattern covers the whole canvas. A light card sits on it. | On the card (`.qd-book`, on Color-Sliced-Pattern-B) | [Get-the-Guide ad, dark](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=18921-37171) and [pastel](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=18935-39510) |
| **Full bleed, text on top** | Pattern covers the whole canvas. When the pattern's small details would cross the text, the pattern is masked: 100% where the visual sits, fading softly behind the text. | On the pattern when it's calm, or on the masked part | |
| **Product screen** | Pattern covers the whole canvas behind a framed screen. | Outside the screen, on a calm area or a card | [Qdrant Cloud screen](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=18841-20954) |

Rules:

- **Must:** text never sits on a busy part of a pattern. If no area is calm enough, mask the pattern or use the light card.
- **Must: mask only when the pattern needs it** (decided 2026-11-11). Not every pattern needs a mask. Mask it only when its small details (letters, dashes, small marks) cross the text and make it hard to read. Each pattern's preset says so in `textMask`:

  | `textMask` | Patterns | What to do |
  | --- | --- | --- |
  | `soft-1` | Generative-Dash-Pattern-A | Mask, 4% behind the text: the dashes must never cross a line of text |
  | `soft-2` | Color-Sliced-Pattern-B, Generative-Hexagon-Pattern-C (its rings crossed a subtitle, 2026-11-11), Generative-Dash-Pattern-B, Generative-Burst-Pattern-A (Dark violet), Generative-Glyph-Pattern-B (Light violet, as a dark creative: white text, Dark logo, neutral 950) | Mask, 10% behind the text: a hint of the pattern stays, so it reads as one background |
  | `none` | Color-Sliced-Pattern-A, Color-Refracted-Pattern-A, Generative-Glyph-Pattern-A, Generative-Glyph-Pattern-B (Medium violet), Generative-Hexagon-Pattern-B, Generative-Burst-Pattern-A (Light violet) | No mask: text sits straight on the pattern |
  | not set | Every other pattern or colorway | Not decided yet: render it with and without the mask and ask |

  When the answer differs by colorway, `textMask` sits on the colorway instead of the preset.

  **When text still fails contrast on a `none` pattern** (e.g. the supporting line on the light end of Color-Refracted-Pattern-A on wide), mask it anyway: `soft-2`, or `soft-1` if `soft-2` still fails (decided 2026-11-11).

- **Must: how the mask looks.** The pattern keeps covering the whole canvas and is masked with a soft, eased gradient: 100% where the visual sits, fading to the preset's strength behind the text, with no visible edge between the two. A solid neutral shows through: **neutral 950** on a dark creative, **neutral 100** on a light one. The fade runs top to bottom on square, portrait and story (text at the top) and left to right on wide and ultra-wide (text on the left). The LinkedIn profile cover has its heading on the right, so its fade runs from the right (`.qd-pattern-mask--from-right`, [`primitives/layout/`](../primitives/layout/)). Use `.qd-canvas--masked` and `.qd-pattern-mask--soft-1` or `--soft-2` from [`primitives/layout/`](../primitives/layout/). Never lay a dark or light gradient over the pattern instead: mask the pattern itself. **On every shape the mask is one smooth, continuous gradient across the whole canvas: it starts gently on the text side and builds to full strength on the far side. You must not be able to tell the mask and the pattern are two layers: never a hold-then-fade, a visible edge or a cut** (decided 2026-11-11). If the pattern is calm enough for the text, use no mask at all.
- **Must:** with the mask, the logo sits on the plain neutral, so it's the **Dark** logo on a dark creative and the **Light** logo on a light one (section 8). Without the mask it's the **White** logo on the pattern.
- **Must:** the light card only sits on a full-bleed pattern. On a dark creative it's the only light piece.
- **Must: the light card always sits on Color-Sliced-Pattern-B**, red or violet, with its QDRANT letter layer. Never Color-Sliced-Pattern-A or another pattern behind the book or a Get-the-Guide ad (decided 2026-11-11).
- **Must: the light card is a book.** A vertical card shaped like a guide or a document (0.81, about 4:5), centered on a full-bleed pattern, with the pattern showing on every side. It never fills the frame. Width: **55%** of the canvas on square, **65%** on portrait, **75%** on story. On **wide** it turns landscape (5:4, 72% of the height, larger text); on **ultrawide** there's no light card (decided 2026-11-11, see [`primitives/layout/`](../primitives/layout/)). The button sits **outside the card, centered below it**. Use `.qd-book` from [`primitives/layout/`](../primitives/layout/), built from the [Get-the-Guide ad](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20958-18153) (decided 2026-11-04).
- **Suggest:** use the light card mostly for guide downloads and documentation promotions, where the ad sends people to a resource (like the Get-the-Guide ads). For events and speaker posts, prefer full bleed with text on top, masked when the text needs it (decided 2026-11-04, mask 2026-11-11).
- **Must:** never put a big headshot ([`headshot-card`](../components/headshot-card/)) inside the light card. If a light-card creative needs a speaker, use [`headshot-circle`](../components/headshot-circle/) (decided 2026-11-04).
- **Suggest:** dark is the default. Light creatives (the whole canvas on the light theme) are allowed for some moments, like the [Hybrid Cloud ad](https://www.figma.com/design/EXDtNCOBfmPCWabNex7sSJ/Campaigns?node-id=2760-5635) (decided 2026-11-04).

## 5. One hero

**Must:** one creative has at most one hero on top of its background.

| Background | Hero allowed |
| --- | --- |
| A pattern | Qbot **or** a product screen, or nothing |
| A generated image | Nothing extra. Images are never combined with Qbot ([`brand-assets/imagery/`](../brand-assets/imagery/)) |

Never allowed:

- Two patterns in one creative.
- A pattern and a generated image together.
- Qbot and a product screen together.
- Charts or stats straight on a pattern. Put them on a card, or use a plain background.

**Generated images in a creative** (decided 2026-11-11):

- **Must: text never sits on the image's subject** (`title_never_over_subject` in [`imagery/`](../brand-assets/imagery/)). Text goes on calm, dark sky or ground and passes the contrast check. If no crop keeps the text off the subject, pick another image.
- **Must: logo and text at the top, the image below or beside them.** On square, portrait and story the image sits under the text and fades in from it; on wide and slides the text sits on the left (on neutral 950) and the image on the right, fading in from the left. Never flip the layout (image on top, logo at the bottom), and never shrink an image into a floating patch with soft edges: if the image can't cover its area, pick another image (decided 2026-11-11).
- **Must: a long, soft fade.** Where the image meets the plain neutral, it fades with the pattern mask's eased curve, from the image's edge to just before its subject, with no visible band, block or edge. Never a dark block or a short, hard fade over the image. Dark creatives only: images on a light neutral read as a grey band (decided 2026-11-11).
- **Must: one image across the whole campaign.** When a direction uses imagery, every placement in it uses the same image (cropped per size), never a pattern in some sizes and an image in others, or a different image per size (decided 2026-11-11).
- **Must: choose (or generate) images that leave room for the text.** The subject sits in the lower half or on the side away from the text, with about 40% empty sky on the text side. Images whose subject fills the top of the frame don't work on social sizes; a small subject or one that sits low works best (decided 2026-11-11).
- **Must: place the image so its subject balances the text.** With text on the left, move the subject into the right part of the canvas, so the empty side isn't left bare. Scale or shift the image to do it (it always covers the canvas), and keep enlarging small: generate the image at the channel's size when you can.

## 6. Qbot in a creative

Qbot is one hero (section 5). It works on **any** pattern, in any family or colorway, or on the plain background. One Qbot per creative; 3D and 2D are never mixed ([`brand-assets/mascot/`](../brand-assets/mascot/)). Decided by Vanesa on 2026-11-04, from the examples in the [Brand Design System, Mascot section](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=20958-18151) (examples 1 to 5, left to right).

### Where it sits

- **Must: text first, Qbot below.** The logo, title, supporting line and button sit at the top; Qbot fills the space under them. Never put Qbot between two text blocks. (An exception to section 11 rule 7, like the pattern mask.)
- **Must: Qbot never comes before the heading or copy** (decided 2026-11-11). On tall shapes it sits below the text; on wide and ultra-wide shapes it sits to the right of the text, never to its left.
- **Suggest:** bottom center, or toward the bottom-right corner.
- **Must: no large empty band above Qbot.** If Qbot sits at the bottom with a lot of room over its head, make it bigger or show more of the body.
- **Wide and ultra-wide:** the text block takes half the grid on the left (6 of 12 columns); Qbot fills the right half, anchored to the bottom. The button goes last in the text block, after the supporting text, not beside the logo (section 11, rule 10).
- **Pattern mask:** Qbot stands on the full-strength part of the pattern. Its head may rise into the faded part, as long as it touches no text, logo or button.

### How big

- **Must: place Qbot by its outline, not by its image box** (decided 2026-11-11). Every pose's PNG has empty margins that differ from pose to pose. Crop to the pose's outline (the table in [`mascot/3d/`](../brand-assets/mascot/3d/), "Pose outlines") so the top of the helmet and the feet are the edges you place.
- **Must: equal gaps.** A full figure keeps the **same gap to the top, the right and the bottom** of the canvas: the canvas side margin. On tall shapes, where the text sits above it, the gap to the right and the bottom is the side margin. A Peek keeps the same gap to the top and the right, and only the bottom edge cuts it. Qbot never looks dropped in at random.
- **Must: Qbot fills the free space below the text** (on wide, the right half). The space starts one `section` gap under the lowest text, logo or button and runs to the canvas edge that trims Qbot. A longer title means a smaller Qbot. The crop names what shows; the size always follows the free space.

### Crops

Every crop is editorial, never accidental.

| Crop | What shows | Example |
| --- | --- | --- |
| Full figure | The whole body, inside the canvas, with an equal gap to the edges around it (below) | 1, 3 |
| Half body | Cut at the waist by the bottom edge | 5 |
| Close-up | Head and chest, cut below the chest logo | 2 |
| Peek | Head and shoulders, cut at the upper chest, never right under the helmet. Equal gap to the top and the right edge; only the bottom edge cuts it | 4 |

- **Must: never cut the face.** Keep the chest logo whole, except in the Peek crop.
- **Must: only the bottom edge trims Qbot,** plus the right edge when Qbot sits in the bottom-right corner. Never the top or the left edge.
- **Stories:** measure the crop from the bottom safe-zone line (344 px from the bottom). The face and the chest logo stay above that line; the body below it runs off the edge.
- Clothing on a pose (the hoodie wordmark, for example) may show. It's part of the character.

### Direction and pose

- **Must:** in a corner, Qbot faces or turns toward the canvas and the text. No side views looking out of the frame.
- Moods follow the mascot mood groups: upbeat by default, context moods when the title calls for them, sad and angry only on request.

### Overlaps

- **Must: Qbot never covers text, the logo or the button.** Its glow may sit behind text as long as the contrast check passes.
- Qbot may overlap the edge of a card.

### Glow

- **Must:** the glow is on or off per mood, as [`mascot/3d/tool/moods.json`](../brand-assets/mascot/3d/tool/moods.json) sets it (the Figma mascot component).
- Use `.qd-mascot--glow` from [`mascot/3d/mascot.css`](../brand-assets/mascot/3d/mascot.css). It follows Qbot's outline and matches the Figma component. The glow barely shows on violet patterns and reads best on the plain dark background; that's expected.

### Still open (from 2026-11-04, checked 2026-11-11)

- **How far a crop may stretch:** "no empty band" can show more body than the crop's name. No limit yet (the test capped the Peek at row 700 and the Close-up at row 800 of the 1024 source).
- **What counts as a "large" empty band:** no threshold yet.
- **Minimum size:** `mascot/3d/tool/mascot.yaml` has 240 px (marked "confirm with design"). Its `max_crop: 0.4` doesn't fit the Close-up and Peek crops; the crop table above replaces it once Design Lab is updated.
- **Pose landmarks:** a table per pose (face box, chest logo box, neck, upper chest and waist rows) so every agent crops the same way. Measured so far, in the 1024 × 1024 source: excited waist 680, happy below the chest logo 710, playful upper chest 535.
- **Checker:** `review/check.py` doesn't measure the Qbot rules yet (row "Qbot" in [`primitives/layout/checks.md`](../primitives/layout/checks.md)); judge them by eye until it does.
- **The crop for the happy pose** in `tool/moods.json` doesn't match Figma: see [`mascot/3d/`](../brand-assets/mascot/3d/), "In progress".

## 7. Product screens

- **Must:** a framed window with rounded corners and a thin border, floating on a full-bleed pattern.
- **Suggest:** let it bleed off the bottom edge, like the [Qdrant Cloud example](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=18841-20954).
- When the whole screen needs to be seen, it can sit fully inside the canvas instead.
- **Must:** use real product screens. Never redraw or fake the UI.

## 8. Logo

- **Must:** the Qdrant logo leads the content, at its **top-left**:
  - on the canvas, inside the margins, when text sits on the canvas;
  - on the card, inside its padding, when text sits on a light card.
- **Must:** the right version for the background: **Dark** on plain dark, dark images and the masked part of a dark creative, **White** on any pattern at full strength, **Light** on the light card, on a light canvas and on the masked part of a light creative. Files, sizes per shape and clear space are in [`brand-assets/logo/`](../brand-assets/logo/).
- When it can't sit top-left (no room, a busy area, the visual must lead), the agent moves it following the Brand Guide's placement rules and says where and why.
- With a partner, the [partner lockup](../components/partner-lockup/) takes the logo's place. When the lockup is the **only content** (e.g. a partner blog hero), it's the hero: centered both ways, 8 of 12 columns wide (decided 2026-11-04).
- The logo checks are in [`primitives/layout/checks.md`](../primitives/layout/checks.md).

## 9. Text length

- **Suggest:** a headline of **up to 10 words**.
- **Ask:** if the headline is much longer, ask the person to shorten it. If they want to keep it, keep it.

## 10. One creative, many sizes

- **Suggest:** when the same creative goes to several sizes or channels, use the **same pattern and colorway** in all of them, so they read as one.
- Carousels and campaigns have no rule yet. Each asset can pick its own pattern within the tone.

## 11. Composition

There are no fixed post templates. An agent lays out each creative itself, from the content it's given, following these rules and using only the approved parts in [`components/`](../components/). Decided by Vanesa on 2026-11-04.

1. **Must: never make up content.** Use only the copy, dates, speakers and links the person gives. Write copy only when asked.
2. **Suggest: reading order.** Logo → title → supporting line → date, time and place → speakers → button. On tall sizes it runs top to bottom. On wide sizes, text is on the left and the visual on the right, except the LinkedIn profile cover, where the heading sits on the right ([`primitives/layout/`](../primitives/layout/), "LinkedIn profile cover").
3. **Suggest: avoid eyebrows** (the small label above the title). They make creatives look AI-generated. Don't suggest one; use one only when the person asks for it (decided 2026-11-04).
   **Must: the event type** ("Hands-On Workshop", "Webinar") or series is **left out by default**; that's cleaner and preferred. If the content needs it, it's a **label with the heading**, directly above the title: Geist Mono, all caps, at the supporting size, `text.secondary` on dark or `text.body-on-light` on the light card, a `tight` gap to the title. **Never** in the date / time / place list. Until the badge component exists, this is the only allowed form (decided 2026-11-11).
4. **Suggest: left-aligned by default.** Centered is fine when the whole composition is symmetric and nothing sits beside the text, e.g. a title with the date and time under it, or a story with one centered hero. The agent decides.
5. **Must: never mix alignments, never right-align.** All the text in a creative is either left-aligned or centered. Left-aligned items share the same left edge.
6. **Must: two text sizes.** One title in Mona Sans SemiBold, Title Case, sized by its length, and one supporting size for everything else (body, date, time, place). Names and roles inside the headshot parts are the only exception. Sizes and the Geist Mono rule (one or two words only) are in [`primitives/typography/`](../primitives/typography/), "Text in creatives". Mona Sans titles are always Title Case (supporting text stays in sentence case); Mona Sans Condensed is always all caps and only for special occasions, when asked.
7. **Must: spread the content, top and bottom.** The logo and title block are anchored at the top margin, the supporting line and the button at the bottom margin, and the visual (Qbot, speakers, product screen) fills the space between. Never stack everything at the top with empty space below. **Exception, the pattern mask (section 4):** all the text sits at the top on the masked part, the button follows rule 10 (beside the logo only when the text block is full width, otherwise last in the text block), and the visual fills the space below, where the pattern is at 100% (decided 2026-11-11, replaces the Zone layout). **Exception, the LinkedIn profile cover:** the heading is centered top to bottom on the right ([`primitives/layout/`](../primitives/layout/)). **Exception, Qbot (section 6):** all the text, the button included, sits at the top and Qbot fills the space below (decided 2026-11-04).
8. **Must: text blocks are at least half the grid wide:** 3 of 6 columns on square and portrait, 6 of 12 on wide, 2 of 4 on story. If the text doesn't fit beside the visual at that width, it goes above or below it. Never squeeze text into a narrow column (decided 2026-11-04). **Exception, the LinkedIn profile cover:** beside Qbot, the heading may span 3 columns ([`primitives/layout/`](../primitives/layout/), decided 2026-11-11).
9. **Must: group the content, and keep the groups clearly apart** (decided 2026-11-11). A creative reads as groups: the **header** (logo, plus the button when it sits beside the logo), the **heading** (title, plus an event-type label if any), the **body** (supporting line, date, time, place), the **button** when it sits in the text block, and the **visual or speakers**. Each is its own group: the header and the heading are separate, and the button never sits tight under the body copy (decided 2026-11-11). Inside a group: `tight` (date + place) or `group` (supporting line + date). **Between groups: one gap, the same everywhere, at least 2 × `section`** (96 on square and portrait, 128 on story and wide), never closer than the largest gap inside a group ([`primitives/layout/`](../primitives/layout/)). Leftover space goes between groups, never inside one and never spread evenly between every line. The reading order must be obvious at a glance.
10. **Must: the button goes in one of two places,** at its own size, never full width ([`components/button/`](../components/button/)):
   - last in the text block, aligned with the text; or
   - top-right, level with the logo and **the same height as the logo** (never taller), when there isn't room at the bottom or the visual needs it, like the [Hybrid Cloud ad](https://www.figma.com/design/EXDtNCOBfmPCWabNex7sSJ/Campaigns?node-id=2760-5635).

   **Must: the button always sits in a corner, never in the middle of the layout.** Top-right beside the logo only when the text block spans the full width, so the button lands on the right margin. When the text block takes only part of the width (e.g. wide and ultra-wide with Qbot or a visual in the right half), the button goes **last in the text block, after the supporting text**, so logo, title, supporting text and button read as one vertical, left-aligned column (decided 2026-11-11).
11. **Ask: if the content doesn't fit, ask.** If it can't fit the size without breaking a rule, ask the person to cut it. Never shrink text below the type scale.
12. **Must: icons follow [`brand-assets/icons/`](../brand-assets/icons/).** Lucide only, outline, one color: a 400 on dark, a 600 on light, white on a pattern that isn't masked, 3:1 or more. **Suggest: put one before each date, time and place line by default** (calendar, clock, map pin; decided 2026-11-11). Next to supporting text (mostly the date / time / place row), the same height as that text, a `tight` gap away. Never in buttons, under any circumstance. Icons don't count as a text size (decided 2026-11-11).

## Changing these rules

Ask Vanesa first. Add the date and what changed next to the rule.
