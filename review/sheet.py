#!/usr/bin/env python3
"""Contact sheet: every render in one labelled PNG.

Usage:
  python3 review/sheet.py OUT_DIR [--out OUT_DIR/contact-sheet.png] [--width 2400]

Rows are the names (alt-1, alt-2, …), columns the shapes, in the order
ultrawide, wide, square, portrait, story. Labels use the repo's Mona Sans. Needs Pillow.
"""
import argparse, glob, os, re
from PIL import Image, ImageDraw, ImageFont

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDER = ["ultrawide", "wide", "square", "portrait", "story"]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("dir")
    ap.add_argument("--out", default=None)
    ap.add_argument("--width", type=int, default=2400)
    a = ap.parse_args()
    found = {}
    for f in glob.glob(os.path.join(a.dir, "*.png")):
        m = re.match(r"(.+)-(%s)\.png$" % "|".join(ORDER), os.path.basename(f))
        if m:
            found.setdefault(m.group(1), {})[m.group(2)] = f
    if not found:
        raise SystemExit("No <name>-<shape>.png files in " + a.dir)
    rows = sorted(found)
    cols = [s for s in ORDER if any(s in found[r] for r in rows)]
    font = lambda n: ImageFont.truetype(os.path.join(REPO, "primitives/typography/fonts/MonaSans-SemiBold.ttf"), n)
    pad, label_w, head_h = 24, 220, 60
    cell_w = (a.width - label_w - pad * (len(cols) + 1)) // len(cols)
    def scaled(f):
        im = Image.open(f).convert("RGB")
        return im.resize((cell_w, round(im.height * cell_w / im.width)), Image.LANCZOS)
    imgs = {r: {c: scaled(found[r][c]) for c in cols if c in found[r]} for r in rows}
    row_h = [max((i.height for i in imgs[r].values()), default=0) + pad + 32 for r in rows]
    sheet = Image.new("RGB", (a.width, head_h + sum(row_h) + pad), (236, 237, 242))
    d = ImageDraw.Draw(sheet)
    for j, c in enumerate(cols):
        d.text((label_w + pad + j * (cell_w + pad), 18), c, fill=(20, 22, 30), font=font(28))
    y = head_h
    for r, h in zip(rows, row_h):
        d.text((pad, y + 8), r, fill=(20, 22, 30), font=font(28))
        for j, c in enumerate(cols):
            if c in imgs[r]:
                sheet.paste(imgs[r][c], (label_w + pad + j * (cell_w + pad), y))
        y += h
    out = a.out or os.path.join(a.dir, "contact-sheet.png")
    sheet.save(out)
    print(out)


if __name__ == "__main__":
    main()
