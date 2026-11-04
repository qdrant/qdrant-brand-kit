#!/usr/bin/env python3
"""Turn a speaker's photo into a headshot cutout.

Usage:
  python3 prepare-headshot.py photo.jpg                 # writes photo-cutout.png next to it
  python3 prepare-headshot.py photo.jpg -o jane-doe.png
  python3 prepare-headshot.py a.jpg b.png c.webp        # several at once

What it does, in order (Brand Guide 2.0, slide 56):
  1. Remove the background, with rembg (open source, runs on this computer, photos never leave it).
     Skipped when the photo is already a cutout with a transparent background.
  2. Boost resolution, with Real-ESRGAN, only when the photo is too small for a 1024 px cutout and the
     realesrgan-ncnn-vulkan program is installed. Otherwise a photo under 512 px is rejected: ask
     for a bigger one.
  3. Adjust brightness, contrast and saturation, the same mild correction for everyone.
  4. Crop to the standard framing: square, top of the head 4% below the top edge, shoulders running
     off the bottom, person centered. 1024 px, or the largest size the photo allows (at least 512).
  5. Run check-headshot.py on the result.

Needs:
  - Python 3 with Pillow:   pip install pillow
  - rembg, for step 1:      pip install "rembg[cpu]"   (downloads a ~170 MB model the first time)
  - optional, for step 2:   realesrgan-ncnn-vulkan on the PATH
    (https://github.com/xinntao/Real-ESRGAN/releases, portable, no Python needed)
If rembg is missing and the photo still has its background, the script stops and says so.

Exit code 0 when every output passes the check, 1 otherwise.
"""
import argparse
import importlib.util
import os
import shutil
import subprocess
import sys
import tempfile

try:
    from PIL import Image, ImageEnhance, ImageOps
except ImportError:
    sys.exit("Needs Pillow: pip install pillow")

HERE = os.path.dirname(os.path.abspath(__file__))
TARGET = 1024          # output size, px
MIN_SIZE = 512         # smallest output allowed (same as check-headshot.py)
MIN_SOURCE = 480       # a person this tall is resized up to 512 (under 7%, no visible loss)
HEAD_LINE = 0.043      # top of the head, as a share of the height (22 px on 512)
ALPHA_ON = 128

# Mild, fixed correction so every headshot looks alike. Tweak only with design's OK.
CONTRAST_CUTOFF = 0.5  # % of darkest/lightest pixels clipped by autocontrast
SATURATION = 1.05
BRIGHTNESS = 1.0


def load_checker():
    spec = importlib.util.spec_from_file_location("check_headshot", os.path.join(HERE, "check-headshot.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def has_cutout(im):
    """True when the photo already has a transparent background."""
    if "A" not in im.getbands() and "transparency" not in im.info:
        return False
    a = im.convert("RGBA").getchannel("A")
    w, h = a.size
    corners = [a.getpixel(p) for p in [(0, 0), (w - 1, 0), (0, h // 2), (w - 1, h // 2)]]
    return max(corners) < ALPHA_ON


def remove_background(im):
    try:
        from rembg import remove
    except ImportError:
        raise ValueError(
            "the photo still has its background, and rembg isn't installed.\n"
            '  - install it: pip install "rembg[cpu]"'
        )
    return remove(im.convert("RGB")).convert("RGBA")


def upscale(im):
    """Real-ESRGAN 2x/4x if installed. Returns the image unchanged otherwise."""
    exe = shutil.which("realesrgan-ncnn-vulkan")
    if not exe:
        return im, False
    with tempfile.TemporaryDirectory() as d:
        src, dst = os.path.join(d, "in.png"), os.path.join(d, "out.png")
        im.convert("RGB").save(src)
        subprocess.run([exe, "-i", src, "-o", dst, "-s", "4"], check=True, capture_output=True)
        return Image.open(dst).convert("RGB"), True


def adjust(im):
    """Brightness, contrast, saturation on the person only. Alpha stays as it is."""
    rgb, alpha = im.convert("RGB"), im.getchannel("A")
    rgb = ImageOps.autocontrast(rgb, cutoff=CONTRAST_CUTOFF, preserve_tone=True, mask=alpha.point(lambda v: 255 if v > ALPHA_ON else 0))
    rgb = ImageEnhance.Color(rgb).enhance(SATURATION)
    rgb = ImageEnhance.Brightness(rgb).enhance(BRIGHTNESS)
    rgb.putalpha(alpha)
    return rgb


def frame(im):
    """Square crop: head 4.3% from the top, bottom of the person on the bottom edge, head centered."""
    a = im.getchannel("A").point(lambda v: 255 if v > ALPHA_ON else 0)
    box = a.getbbox()
    if not box:
        raise ValueError("no person found after removing the background")
    _, top, _, bottom = box
    side = round((bottom - top) / (1 - HEAD_LINE))
    # Center on the head: the opaque span in the top fifth of the person.
    head = a.crop((0, top, a.width, top + max(1, (bottom - top) // 5))).getbbox()
    cx = (head[0] + head[2]) / 2
    left = round(cx - side / 2)
    upper = round(top - HEAD_LINE * side)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(im.crop((left, upper, left + side, upper + side)), (0, 0))
    return canvas


def prepare(src, out):
    notes = []
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)

    if has_cutout(im):
        im = im.convert("RGBA")
        notes.append("background already removed")
    else:
        # Boost first when the photo is small: upscaling works better before the cutout.
        if min(im.size) < TARGET:
            up, done = upscale(im)
            if done:
                im = up
                notes.append("resolution boosted with Real-ESRGAN")
        im = remove_background(im)
        notes.append("background removed with rembg")

    im = adjust(im)
    im = frame(im)

    if im.width < MIN_SOURCE:
        raise ValueError(
            f"the person is only {im.width} px tall in this photo, needs {MIN_SIZE}: ask for a bigger photo"
            + ("" if shutil.which("realesrgan-ncnn-vulkan") else " (or install realesrgan-ncnn-vulkan)")
        )
    size = min(TARGET, max(MIN_SIZE, im.width))
    if im.width != size:
        im = im.resize((size, size), Image.LANCZOS)
    im.save(out, "PNG", optimize=True)
    notes.append(f"framed to {size}×{size}")
    return notes


def main():
    p = argparse.ArgumentParser(description="Turn a speaker's photo into a headshot cutout.")
    p.add_argument("photos", nargs="+")
    p.add_argument("-o", "--output", help="output file (only with one photo)")
    args = p.parse_args()
    if args.output and len(args.photos) > 1:
        p.error("-o works with one photo only")

    checker = load_checker()
    failed = 0
    for src in args.photos:
        out = args.output or os.path.splitext(src)[0] + "-cutout.png"
        try:
            notes = prepare(src, out)
        except (ValueError, OSError) as e:
            failed += 1
            print(f"FAIL {src}\n  - {e}")
            continue
        problems = checker.check(out)
        if problems:
            failed += 1
            print(f"FAIL {out}  ({', '.join(notes)})")
            for x in problems:
                print(f"  - {x}")
        else:
            print(f"OK   {out}  ({', '.join(notes)})")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
