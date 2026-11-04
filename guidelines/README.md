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
| Is the tone **community / playful** or **serious / technical**? | It picks the pattern family (section 2). |
| **Pattern or generated image** as the background? Suggest an image for storytelling and blog heroes, a pattern for everything else. | The person decides. |
| Should it have a **hero**: Qbot, a product screen, or nothing? | Only one hero per creative (section 5). |
| Does it need to **grab a lot of attention**? | Only then can the background be red (section 3). |
| Is this the **same creative in other sizes or channels**? | Then reuse the same pattern and colorway (section 9). |

## 2. Pick the pattern by tone

**Must:** the tone decides the pattern family. Inside a family, any pattern and colorway can be used.

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
| **Zone** | Pattern fills one zone. The rest is the plain dark background. | In the plain zone | [Hybrid Cloud post](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=18841-19294) |
| **Product screen** | Pattern covers the whole canvas behind a framed screen. | Outside the screen, on a calm area or a card | [Qdrant Cloud screen](https://www.figma.com/design/8y0svqBDPZX6caRNF6lddG/Qdrant-Brand-Design-System?node-id=18841-20954) |

Rules:

- **Must:** text never sits on a busy part of a pattern. If no area is calm enough, use the light card or the zone layout.
- **Must:** the light card only sits on a full-bleed pattern. It's the only light piece in a creative.
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
- Size, clear space and the other logo checks are in [`primitives/layout/checks.md`](../primitives/layout/checks.md).

## 9. Text length

- **Suggest:** a headline of **up to 10 words**.
- **Ask:** if the headline is much longer, ask the person to shorten it. If they want to keep it, keep it.

## 10. One creative, many sizes

- **Suggest:** when the same creative goes to several sizes or channels, use the **same pattern and colorway** in all of them, so they read as one.
- Carousels and campaigns have no rule yet. Each asset can pick its own pattern within the tone.

## Changing these rules

Ask Vanesa first. Add the date and what changed next to the rule.
