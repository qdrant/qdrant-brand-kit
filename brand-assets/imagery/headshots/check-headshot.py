#!/usr/bin/env python3
"""Check a headshot cutout before it goes into headshot-card or headshot-circle.

Usage:  python3 check-headshot.py path/to/cutout.png [more.png ...]
Needs:  Pillow (pip install pillow).

It can't judge taste (lighting, expression, a busy original photo). Those stay in the checklist
in README.md. It checks what the components rely on:

  1. PNG with a transparent background
  2. Square, at least 512 px
  3. Color, not black and white
  4. Top of the head is not cut, and sits 2-8% below the top edge (the CSS assumes about 4%)
  5. Shoulders run off the bottom edge and are wide (not cut at the neck)
  6. Not a close-up: the head is less than about half the width

Exit code 0 when every file passes, 1 otherwise.
"""
import sys
from PIL import Image

MIN_SIZE = 512
HEAD_TOP_MIN, HEAD_TOP_MAX = 0.02, 0.08  # head line as a share of the height
MIN_SHOULDER_WIDTH = 0.6                 # opaque width of the bottom row, share of the width
MAX_HEAD_WIDTH = 0.55                    # opaque width at 25% height, share of the width
MIN_CHROMA = 12                          # mean colorfulness of the person, 0-255
ALPHA_ON = 128                           # alpha above this counts as the person


def check(path):
    problems = []
    try:
        im = Image.open(path)
    except Exception as e:
        return [f"can't open: {e}"]

    if im.format != "PNG":
        problems.append(f"is {im.format}, needs PNG")
    w, h = im.size
    if w != h:
        problems.append(f"is {w}x{h}, needs to be square")
    if min(w, h) < MIN_SIZE:
        problems.append(f"is {min(w, h)} px, needs at least {MIN_SIZE} px (boost resolution in Figma)")

    if "A" not in im.getbands() and "transparency" not in im.info:
        problems.append("has no transparency: remove the background in Figma")
        return problems
    im = im.convert("RGBA")
    alpha = im.getchannel("A")
    a = alpha.load()

    corners = [a[0, 0], a[w - 1, 0]]
    if max(corners) > 0:
        problems.append("top corners aren't transparent: the background is still there")

    rows = [sum(1 for x in range(w) if a[x, y] > ALPHA_ON) for y in range(h)]
    top = next((y for y, n in enumerate(rows) if n), None)
    if top is None:
        return problems + ["is empty"]
    head = top / h
    if top == 0:
        problems.append("top of the head is cut off")
    elif not HEAD_TOP_MIN <= head <= HEAD_TOP_MAX:
        problems.append(
            f"top of the head is {head:.0%} below the top edge, needs {HEAD_TOP_MIN:.0%}-{HEAD_TOP_MAX:.0%} "
            "(crop the square so the head is about 4% from the top)"
        )

    if rows[-1] == 0:
        problems.append("nothing touches the bottom edge: the shoulders should run off it")
    elif rows[-1] / w < MIN_SHOULDER_WIDTH:
        problems.append(
            f"bottom edge is only {rows[-1] / w:.0%} wide: shoulders cut or too close, frame from the shoulders up"
        )

    head_w = rows[int(h * 0.25)] / w
    if head_w > MAX_HEAD_WIDTH:
        problems.append(f"head is {head_w:.0%} of the width: too close, frame from the shoulders up")

    rgb = im.convert("RGB").resize((128, 128))
    small_a = alpha.resize((128, 128))
    chroma = [max(p) - min(p) for p, al in zip(rgb.getdata(), small_a.getdata()) if al > ALPHA_ON]
    if chroma and sum(chroma) / len(chroma) < MIN_CHROMA:
        problems.append("looks black and white: use a color photo")

    return problems


def main(paths):
    if not paths:
        print(__doc__)
        return 1
    failed = 0
    for p in paths:
        problems = check(p)
        if problems:
            failed += 1
            print(f"FAIL {p}")
            for x in problems:
                print(f"  - {x}")
        else:
            print(f"OK   {p}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
