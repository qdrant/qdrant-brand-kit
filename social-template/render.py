#!/usr/bin/env python3
"""Fill the Qdrant social post template, export it as an image at any size, and run the checks.

  1. Chrome (headless, via Playwright) opens template/index.html at the exact size, at 2x,
     with the content injected as window.__CONTENT__.
  2. The template picks its shape, lays out the slots and reports where everything ended up.
  3. Pillow downsamples to the exact size and writes PNG or JPG.
  4. The checks run on the report and on the pixels.

Examples
  .venv/bin/python render.py --content samples/event.json --size 1080x1080 --size 3000x400
  .venv/bin/python render.py --sample ad --size 1080x1920
  .venv/bin/python render.py --preview            # every sample at every test size + contact sheets

Exit code is 0 when every render passes its checks, 1 otherwise.
"""
import argparse
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE / "template" / "index.html"
SCALE = 2           # render at 2x, Pillow downsamples to the exact size
MIN_CONTRAST = 4.5  # WCAG AA, held for large text too because feeds show posts small
MIN_LOGO = 0.03     # logo height as a share of the shorter side
TEST_SIZES = ["1080x1080", "1080x1350", "1080x1920", "1920x1080", "1200x627", "3000x400"]
SAMPLES = ["event", "event-2", "event-3", "announcement", "ad"]

# Hide text and logos to photograph what sits behind them.
CLEAN_CSS = """
.eyebrow, .title, .copy, .series, .detail, .name, .role, .button, .title em, .copy strong { color: transparent !important; }
.logos img { visibility: hidden !important; }
"""


def resolve(content, base):
    """Local file paths in the content become file:// URLs the template can load."""
    def url(v):
        if not v or "://" in v or v.startswith(("data:", "#", "rgb", "hsl")):
            return v
        p = (base / v).resolve()
        return p.as_uri() if p.exists() else v
    out = dict(content)
    for key in ("partnerLogo", "background"):
        if out.get(key):
            out[key] = url(out[key])
    out["speakers"] = [dict(s, photo=url(s.get("photo"))) for s in out.get("speakers", [])]
    return out


# ------------------------------------------------------------------ checks ---

def luminance(rgb):
    def ch(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb[:3]
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def css_rgb(s):
    nums = s[s.index("(") + 1:s.index(")")].replace(",", " ").replace("/", " ").split()
    return tuple(round(float(n)) for n in nums[:3])


def worst_contrast(clean, rects, text_rgb, scale):
    """Contrast of the text color against the worst 5% of the background behind it."""
    lt = luminance(text_rgb)
    lums = []
    for r in rects:
        box = tuple(round(v * scale) for v in (r["x"], r["y"], r["x"] + r["w"], r["y"] + r["h"]))
        if box[2] <= box[0] or box[3] <= box[1]:
            continue
        crop = clean.crop(box).convert("RGB")
        crop.thumbnail((160, 160))
        lums += [luminance(p) for p in crop.getdata()]
    if not lums:
        return None
    lums.sort()
    k = max(0, int(len(lums) * 0.05))
    worst = lums[-1 - k] if lt > 0.5 else lums[k]
    hi, lo = max(lt, worst), min(lt, worst)
    return round((hi + 0.05) / (lo + 0.05), 2)


def overlap(a, b):
    return a["x"] < b["x"] + b["w"] - 1 and a["x"] + a["w"] > b["x"] + 1 and \
           a["y"] < b["y"] + b["h"] - 1 and a["y"] + a["h"] > b["y"] + 1


def run_checks(rep, full, clean, scale):
    W, H = rep["size"]["w"], rep["size"]["h"]
    checks = []

    def add(name, ok, detail):
        checks.append({"check": name, "pass": bool(ok), "detail": detail})

    cut = [k for k, items in rep["texts"].items() for t in items if t["truncated"]]
    add("text fits", not cut, "cut off: " + ", ".join(sorted(set(cut))) if cut else "nothing cut off")

    # Letters clipped: text ink touching the bottom edge of its box means descenders (g, y, p) are cut off.
    clipped = []
    for key, items in rep["texts"].items():
        for t in items:
            if t["truncated"] or t.get("onAccent"):
                continue
            r = t["rect"]
            edge = tuple(round(v * scale) for v in (r["x"], r["y"] + r["h"] - 1.5, r["x"] + r["w"], r["y"] + r["h"]))
            if edge[3] <= edge[1] or edge[2] <= edge[0]:
                continue
            d = ImageChops.difference(full.crop(edge).convert("L"), clean.crop(edge).convert("L"))
            if sum(1 for p in d.getdata() if p > 60) > 2 * scale:
                clipped.append(key)
    add("letters not clipped", not clipped, "clipped: " + ", ".join(sorted(set(clipped))) if clipped else "no letters cut off")

    low = []
    for key, items in rep["texts"].items():
        for t in items:
            c = worst_contrast(clean, t["lines"], css_rgb(t["color"]), scale)
            if c is not None and c < MIN_CONTRAST:
                low.append(f"{key} {c}:1")
    add("contrast", not low, ", ".join(low) if low else f"all text at least {MIN_CONTRAST}:1")

    lg = rep["logo"]
    r = lg["rect"]
    box = tuple(round(v * scale) for v in (r["x"], r["y"], r["x"] + r["w"], r["y"] + r["h"]))
    diff = ImageChops.difference(full.crop(box).convert("L"), clean.crop(box).convert("L"))
    painted = sum(1 for p in diff.getdata() if p > 40) / max(1, diff.width * diff.height)
    add("logo present", lg["loaded"] and painted > 0.05 and r["h"] >= max(24, MIN_LOGO * min(W, H)),
        f"loaded={lg['loaded']}, visible on {painted:.0%} of its box, {round(r['h'])}px tall (minimum 24px, Brand Guide)")

    # Clear space (Brand Guide 2.0, p. 14): nothing within one brandmark inner cube of the logo, about 0.375 x its height.
    cs = r["h"] * 0.375
    zone = {"x": r["x"] - cs, "y": r["y"] - cs, "w": r["w"] + 2 * cs, "h": r["h"] + 2 * cs}
    crowd = [k for k, s in rep["slots"].items() if k != "logo" and overlap(zone, s)]
    add("logo clear space", not crowd, f"{round(cs)}px around the logo" + (f"; inside it: {', '.join(crowd)}" if crowd else " is clear"))

    pd = rep["padding"]
    out = [k for k, s in rep["slots"].items()
           if s["x"] < pd["left"] - 1 or s["y"] < pd["top"] - 1
           or s["x"] + s["w"] > W - pd["right"] + 1 or s["y"] + s["h"] > H - pd["bottom"] + 1]
    pads = "/".join(str(round(pd[k])) for k in ("top", "right", "bottom", "left"))
    add("inside padding", not out, f"{pads}px padding (top/right/bottom/left)" + (f"; outside: {', '.join(out)}" if out else ""))
    # The content should reach the right padding edge too, so left and right margins read the same.
    end = rep.get("headerEnd")
    if end is not None:
        gap_r = W - pd["right"] - end
        add("balanced margins", abs(gap_r) < 2,
            f"header ends {round(gap_r)}px before the right padding" if abs(gap_r) >= 2 else "header reaches the right padding, same as the left")

    keys = sorted(rep["slots"])
    clash = [f"{a} / {b}" for i, a in enumerate(keys) for b in keys[i + 1:] if overlap(rep["slots"][a], rep["slots"][b])]
    add("no overlaps", not clash, ", ".join(clash) if clash else "slots are clear of each other")

    # Brand Guide 2.0: ad headings at least 80 px, sub-copy 36-40 px or more, body 20-40% of the heading.
    # Sizes are compared at the reference canvas (1080 px short side), so a 1200x627 post is held to the same rule scaled.
    ty, sc = rep["type"], rep["scale"]
    h_ref, b_ref = ty["heading"] / sc, (ty["body"] / sc if ty["body"] else None)
    small = ([f"heading {h_ref:.0f}px"] if h_ref < 80 - 0.5 else []) + ([f"body {b_ref:.0f}px"] if b_ref and b_ref < 36 - 0.5 else [])
    add("type sizes", not small, (", ".join(small) + " at the reference canvas (minimum: heading 80, body 36)") if small
        else f"heading {h_ref:.0f}px, body {b_ref and round(b_ref)}px at the reference canvas")
    if ty["body"]:
        ratio = ty["body"] / ty["heading"]
        add("hierarchy", 0.2 - 0.005 <= ratio <= 0.4 + 0.005, f"body is {ratio:.0%} of the heading (guide: 20-40%)")
    add("images load", not rep["broken"], ", ".join(rep["broken"]) or "all loaded")
    fams = " ".join(rep["fonts"])
    need = ["Mona Sans"] + (["Geist Mono"] if "date" in rep["texts"] or "time" in rep["texts"] or "location" in rep["texts"] else [])
    add("brand fonts", all(f in fams for f in need), ", ".join(sorted(set(rep["fonts"]))))
    return checks


# ------------------------------------------------------------------ render ---

def render_one(browser, content, sample, w, h):
    ctx = browser.new_context(device_scale_factor=SCALE, viewport={"width": w, "height": h})
    page = ctx.new_page()
    if content is not None:
        page.add_init_script(f"window.__CONTENT__ = {json.dumps(content)};")
        page.goto(TEMPLATE.as_uri())
    else:
        page.goto(TEMPLATE.as_uri() + f"?sample={sample}")
    page.wait_for_function("window.__READY__ === true", timeout=30000)
    rep = page.evaluate("window.__REPORT__")
    full = Image.open(io.BytesIO(page.screenshot(type="png")))
    page.add_style_tag(content=CLEAN_CSS)
    clean = Image.open(io.BytesIO(page.screenshot(type="png")))
    ctx.close()
    return rep, full, clean


def finish(full, w, h, path, fmt):
    img = full.convert("RGB").resize((w, h), Image.LANCZOS)
    if fmt == "jpg":
        img.save(path, "JPEG", quality=90, optimize=True, progressive=True)
    else:
        img.save(path, "PNG", optimize=True)
    return img


def contact_sheet(items, path, title):
    pad, lab, target_h = 32, 48, 420
    thumbs = []
    for img, label, ok in items:
        t = img.copy()
        t.thumbnail((int(target_h * 3.2), target_h))
        thumbs.append((t, label, ok))
    rows, row, row_w, max_w = [], [], 0, 2600
    for t in thumbs:
        if row and row_w + t[0].width + pad > max_w:
            rows.append(row); row, row_w = [], 0
        row.append(t); row_w += t[0].width + pad
    rows.append(row)
    width = max(sum(t[0].width + pad for t in r) for r in rows) + pad
    height = 80 + sum(max(t[0].height for t in r) + lab + pad for r in rows) + pad
    sheet = Image.new("RGB", (width, height), (238, 240, 245))
    d = ImageDraw.Draw(sheet)
    try:
        f_big = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
        f = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
    except OSError:
        f_big = f = ImageFont.load_default()
    d.text((pad, 24), title, fill=(11, 15, 25), font=f_big)
    y = 80
    for r in rows:
        x = pad
        for t, label, ok in r:
            d.text((x, y + 10), label, fill=(20, 120, 80) if ok else (200, 30, 60), font=f)
            sheet.paste(t, (x, y + lab))
            x += t.width + pad
        y += max(t[0].height for t in r) + lab + pad
    sheet.save(path, quality=90)


def write_gallery(results, out):
    """out/index.html: every render with its shape and check results, for review in a browser."""
    cards = []
    for r in results:
        name = Path(r["file"]).name
        fails = "".join(f"<li>{c['check']}: {c['detail']}</li>" for c in r["checks"] if not c["pass"])
        warns = "".join(f"<li>{w}</li>" for w in r["warnings"])
        status = "PASS" if r["pass"] else "FAIL"
        cards.append(f'<figure class="{status.lower()}"><a href="{name}"><img src="{name}" loading="lazy"></a>'
                     f'<figcaption><b>{status}</b> {name.rsplit(".", 1)[0]} · {r["shape"]}<ul>{fails}{warns}</ul></figcaption></figure>')
    passed = sum(r["pass"] for r in results)
    html = f"""<!doctype html><meta charset="utf-8"><title>Social post renders</title>
<style>body{{font:15px/1.4 system-ui,sans-serif;margin:32px;background:#f3f4f7;color:#0b0f19}}
main{{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start}}figure{{margin:0;background:#fff;padding:12px;border-radius:12px}}
img{{display:block;max-height:320px;max-width:640px}}b{{color:#14784f}}.fail b{{color:#c81e3c}}ul{{margin:4px 0 0;padding-left:18px;color:#555}}</style>
<h1>Social post renders</h1><p>{passed} of {len(results)} pass the automatic checks.</p><main>{"".join(cards)}</main>"""
    (out / "index.html").write_text(html)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    src = ap.add_mutually_exclusive_group()
    src.add_argument("--content", help="content JSON file")
    src.add_argument("--sample", choices=SAMPLES, help="a built-in sample")
    ap.add_argument("--size", action="append", help="WxH, repeatable (default: all test sizes)")
    ap.add_argument("--preview", action="store_true", help="every sample at every test size, plus contact sheets")
    ap.add_argument("--out", default="out")
    ap.add_argument("--format", choices=["png", "jpg"], default="png")
    args = ap.parse_args()

    jobs = []  # (name, content or None, sample or None)
    if args.preview:
        jobs = [(s, None, s) for s in SAMPLES]
    elif args.content:
        p = Path(args.content)
        jobs = [(p.stem, resolve(json.loads(p.read_text()), p.parent), None)]
    else:
        jobs = [(args.sample or "event", None, args.sample or "event")]
    sizes = args.size or TEST_SIZES
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    all_ok, results = True, []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome")
        for name, content, sample in jobs:
            if sample and not content:
                sp = HERE / "samples" / f"{sample}.json"
                if sp.exists():
                    content = resolve(json.loads(sp.read_text()), sp.parent)
            sheet = []
            for size in sizes:
                w, h = (int(v) for v in size.lower().split("x"))
                rep, full, clean = render_one(browser, content, sample, w, h)
                checks = run_checks(rep, full, clean, SCALE)
                ok = all(c["pass"] for c in checks)
                all_ok &= ok
                path = out / f"{name}_{w}x{h}.{args.format}"
                img = finish(full, w, h, path, args.format)
                assert img.size == (w, h)
                results.append({"file": str(path), "shape": rep["shape"], "pass": ok, "checks": checks,
                                "warnings": rep["warnings"], "report": rep})
                sheet.append((img, f"{w}x{h} · {rep['shape']} · {'PASS' if ok else 'FAIL'}", ok))
                print(f"{'PASS' if ok else 'FAIL'}  {path.name}  [{rep['shape']}]")
                for c in checks:
                    if not c["pass"]:
                        print(f"     XX {c['check']}: {c['detail']}")
                for wmsg in rep["warnings"]:
                    print(f"     !! {wmsg}")
            if len(sheet) > 1:
                contact_sheet(sheet, out / f"{name}_sheet.jpg", f"{name}")
        browser.close()
    (out / "report.json").write_text(json.dumps(results, indent=2))
    write_gallery(results, out)
    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
