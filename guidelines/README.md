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
| Is this the **same creative in other sizes or channels**? | Then reuse the same pattern and colorway (section 9). |

## 2. Pick the pattern by tone

**Suggest:** the tone points to a pattern family. There's no hard restriction: any pattern can be used for any tone, but community themes use more playful language, so they lean to the playful Color patterns, and serious themes lean to Mesh and Generative (decided 2026-11-04). Inside a family, any pattern and colorway can be used.

| Tone | Family | Patterns |
| --- | --- | --- |
| Community / playful | Color patterns: token gradients with refraction or slice shift | Color-Refracted-Pattern-A, Color-Sliced-Pattern-A |
| Serious / technical | Mesh and generative patterns | Mesh-Refracted-Pattern-A to D, Mesh-Sliced-Pattern-A, Mesh-Dithered-Pattern-A, every Generative pattern (Hexagon, Burst, Dash, Glyph), in any colorway |

The patterns themselves are in [`brand-assets/patterns/`](../brand-assets/patterns/).

## 3. Red backgrounds

- **Must:** violet is the default. A red pattern background (a red colorway, Hexagon-B, Dash-B) is only for creatives that need to **grab a lot of attention and be more impactful**.
- **Ask:** never pick red on your own. Offer it, and use it only when the person says yes.
- Everywhere else, red stays an accent (buttons, highlights), as [`primitives/colors/`](../primitives/colors/) says.

## 4. How the pattern covers the canvas

Use one of these four. Patterns always bleed off the canvas edges they touch.

| Layout | What it looks like | Text goes | Example |
| --- | --- | --- | --- |
| **Full bleed + light card** | Pattern covers the whole canvas. A light card sits on it. | On the card (`.qd-box--light-card`) | [Get-the-Guide ad, dark](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=18921-37171) and [pastel](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=18935-39510) |
| **Full bleed, text on top** | Pattern covers the whole canvas. | Only on a calm area: dark, low detail, and passing the contrast check | |
| **Zone** | Pattern fills one zone. The rest is the plain background (dark, or light on a light creative). | All of it in the plain zone, with the button beside the logo. The pattern zone holds only the visual | [Hybrid Cloud post](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=18841-19294) |
| **Product screen** | Pattern covers the whole canvas behind a framed screen. | Outside the screen, on a calm area or a card | [Qdrant Cloud screen](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=18841-20954) |

Rules:

- **Must:** text never sits on a busy part of a pattern. If no area is calm enough, use the light card or the zone layout.
- **Must:** the light card only sits on a full-bleed pattern. On a dark creative it's the only light piece.
- **Suggest:** dark is the default. Light creatives (the whole canvas on the light theme) are allowed for some moments, like the [Hybrid Cloud ad](https://www.figma.com/design/EXDtNCOBfmPCWabNex7sSJ/Campaigns?node-id=2760-5635) (decided 2026-11-04).
- **Zone placement**, by shape (see [`primitives/layout/`](../primitives/layout/) for shapes):

  | Shape | Pattern zone | Text zone |
  | --- | --- | --- |
  | Portrait, story, square | Bottom, about 40 to 50 % of the height | Top |
  | Wide, ultra-wide | Right side, about 40 to 50 % of the width | Left |

  The split falls on a grid line. The zone bleeds off the three edges it touches.

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

## 6. Qbot on a pattern

- Qbot works on **any** pattern, in any family or colorway.
- Qbot may **overlap the edge of a card**, but never covers text, the logo or the button.
- One Qbot per creative. 3D and 2D are never mixed ([`brand-assets/mascot/`](../brand-assets/mascot/)).

## 7. Product screens

- **Must:** a framed window with rounded corners and a thin border, floating on a full-bleed pattern.
- **Suggest:** let it bleed off the bottom edge, like the [Qdrant Cloud example](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=18841-20954).
- When the whole screen needs to be seen, it can sit fully inside the canvas instead.
- **Must:** use real product screens. Never redraw or fake the UI.

## 8. Logo

- **Must:** the Qdrant logo leads the content, at its **top-left**:
  - on the canvas, inside the margins, when text sits on the canvas or in a zone;
  - on the card, inside its padding, when text sits on a light card.
- **Must:** the right version for the background: **Dark** on plain dark and dark images, **White** on any pattern, **Light** on the light card and on a light canvas. Files, sizes per shape and clear space are in [`brand-assets/logo/`](../brand-assets/logo/).
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
2. **Suggest: reading order.** Logo → title → supporting line → date, time and place → speakers → button. On tall sizes it runs top to bottom. On wide sizes, text is on the left and the visual on the right.
3. **Suggest: avoid eyebrows** (the small label above the title). They make creatives look AI-generated. Don't suggest one; use one only when the person asks for it. A series or event type ("Vector Space Talks", "Webinar") will go in a badge component, still to come. Until the badge exists, leave the series out (decided 2026-11-04).
4. **Suggest: left-aligned by default.** Centered is fine when the whole composition is symmetric and nothing sits beside the text, e.g. a title with the date and time under it, or a story with one centered hero. The agent decides.
5. **Must: never mix alignments, never right-align.** All the text in a creative is either left-aligned or centered. Left-aligned items share the same left edge.
6. **Must: two text sizes.** One title in Mona Sans SemiBold, Title Case, sized by its length, and one supporting size for everything else (body, date, time, place). Names and roles inside the headshot parts are the only exception. Sizes and the Geist Mono rule (one or two words only) are in [`primitives/typography/`](../primitives/typography/), "Text in creatives". Mona Sans is always Title Case; Mona Sans Condensed is always all caps and only for special occasions, when asked.
7. **Must: spread the content, top and bottom.** The logo and title block are anchored at the top margin, the supporting line and the button at the bottom margin, and the visual (pattern zone, Qbot, speakers, product screen) fills the space between. Never stack everything at the top with empty space below. **Exception, the Zone layout (section 4):** all the text stays in the plain zone, the button goes beside the logo, and the pattern zone holds only the visual (decided 2026-11-04).
8. **Must: text blocks are at least half the grid wide:** 3 of 6 columns on square and portrait, 6 of 12 on wide, 2 of 4 on story. If the text doesn't fit beside the visual at that width, it goes above or below it. Never squeeze text into a narrow column (decided 2026-11-04).
9. **Suggest: related things sit close, unrelated things further apart.** The `tight` gap inside a group (date + place), `group` between items in a block (title + supporting line), `section` between blocks (text vs speakers) ([`primitives/layout/`](../primitives/layout/)). Leftover space goes between the top block and the bottom block, where the visual is, never spread evenly between every line.
10. **Must: the button goes in one of two places,** at its own size, never full width ([`components/button/`](../components/button/)):
   - last in the text block, aligned with the text; or
   - top-right, level with the logo and **the same height as the logo** (never taller), when there isn't room at the bottom or the visual needs it, like the [Hybrid Cloud ad](https://www.figma.com/design/EXDtNCOBfmPCWabNex7sSJ/Campaigns?node-id=2760-5635).
11. **Ask: if the content doesn't fit, ask.** If it can't fit the size without breaking a rule, ask the person to cut it. Never shrink text below the type scale.

## Changing these rules

Ask Vanesa first. Add the date and what changed next to the rule.
