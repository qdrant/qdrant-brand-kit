#!/usr/bin/env python3
"""Export a print creative: a print-ready PDF, a proof image and the print checks.

Usage:
  python3 review/print.py page.html --format flyer-a4 --out OUT_DIR [--name flyer]
         [--trim 210x297] [--bleed 3] [--safe 5] [--panels 100,100,97] [--hidden-bottom 100]
         [--icc printer-profile.icc] [--pdfx 4] [--root FOLDER]

The format preset comes from guidelines/print/print.tokens.json. Everything the printer's spec gives
(--trim, --bleed, --safe, --panels, --hidden-bottom, --icc) overrides the preset: the spec always wins.

It writes, in OUT_DIR:
  <name>.pdf          the print file: trim + bleed + crop marks, fonts embedded, converted to the printer's
                      CMYK profile when --icc is given and Ghostscript is installed (PDF/X-4 by default)
  <name>-rgb.pdf      the same before CMYK conversion (screen colors). Not for the printer
  <name>-proof.png    what the printed piece looks like after cutting, folds dashed, for review
  <name>-full.png     the full render with bleed, and <name>-full.json, its measurements for review/check.py
  <name>-print.md     the print checks: spec, safe area, folds, text size, logo size, image resolution

The page is built like any creative (one .qd-canvas, canvas.js, repo CSS). It's laid out at 300 dpi
(about 11.8 px per mm), so patterns and images come out at print resolution.
Mechanics only: every size comes from the preset or the spec, never from this script.
Needs Google Chrome and Pillow; the CMYK conversion needs Ghostscript (gs).
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import render  # noqa: E402  (the same Chrome, server and measurements as social creatives)

DPI = 300
PX_PER_MM = DPI / 25.4
PT_PER_PX = 72 / DPI
GS_INSTALL = ("Ghostscript isn't installed, so the PDF is still in screen colors (RGB) and isn't print-ready.\n"
              "Install it once: on a Mac with Homebrew, `brew install ghostscript` (no Homebrew: install it from\n"
              "https://brew.sh first, or use Ghostscript's own installer); on Linux, `apt install ghostscript`.\n"
              "Then run this again.")


def load_format(name):
    data = json.load(open(os.path.join(REPO, "guidelines/print/print.tokens.json")))
    if name not in data["formats"]:
        sys.exit(f"Unknown format {name!r}. Formats: {', '.join(data['formats'])}")
    d = {k: v["$value"] for k, v in data["defaults"].items()}
    f = dict(data["formats"][name])
    return d, f


def layout_shapes():
    lay = json.load(open(os.path.join(REPO, "guidelines/layout/layout.tokens.json")))["canvas"]["shape"]
    px = lambda v: float(str(v["$value"]).replace("px", ""))
    return {n: (px(s["reference"]["width"]), px(s["reference"]["height"])) for n, s in lay.items() if not n.startswith("$")}


def mm_pair(text):
    a, b = (float(x) for x in text.lower().replace(" ", "").split("x"))
    return [a, b]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("page")
    ap.add_argument("--format", required=True, help="a preset from guidelines/print/print.tokens.json")
    ap.add_argument("--out", required=True)
    ap.add_argument("--name", default=None)
    ap.add_argument("--trim", help="finished size in mm, e.g. 210x297 (from the printer's spec)")
    ap.add_argument("--bleed", type=float, help="mm per side (from the spec)")
    ap.add_argument("--safe", type=float, help="mm inside the trim (from the spec)")
    ap.add_argument("--panels", help="panel widths in mm, left to right, laid out flat (brochures)")
    ap.add_argument("--hidden-bottom", type=float, help="mm at the bottom that won't be seen (roll-up base)")
    ap.add_argument("--icc", help="the printer's CMYK profile (.icc), from the spec")
    ap.add_argument("--pdfx", default="4", help="PDF/X version: 4 (default) or 1a, as the printer asks")
    ap.add_argument("--root", default=None, help="folder served at / (default: the page's folder)")
    a = ap.parse_args()

    defaults, fmt = load_format(a.format)
    from_spec = []
    trim = mm_pair(a.trim) if a.trim else fmt.get("trim")
    if a.trim: from_spec.append("finished size")
    bleed = a.bleed if a.bleed is not None else fmt.get("bleed", defaults["bleed"])
    if a.bleed is not None: from_spec.append("bleed")
    safe = a.safe if a.safe is not None else fmt.get("safe", defaults["safe"])
    if a.safe is not None: from_spec.append("safe area")
    panels = [float(x) for x in a.panels.split(",")] if a.panels else fmt.get("panels")
    if a.panels: from_spec.append("panels")
    hidden = a.hidden_bottom if a.hidden_bottom is not None else fmt.get("hiddenBottom", 0)
    min_dpi = fmt.get("minDpi", defaults["minDpi"])
    rgb_only = fmt.get("color") == "rgb"
    if not trim or bleed is None or safe is None:
        sys.exit(f"{fmt['name']} has no default size: take the finished size, bleed and safe area from the "
                 "printer's spec (--trim, --bleed, --safe).")

    name = a.name or os.path.splitext(os.path.basename(a.page))[0]
    os.makedirs(a.out, exist_ok=True)
    W = round((trim[0] + 2 * bleed) * PX_PER_MM)
    H = round((trim[1] + 2 * bleed) * PX_PER_MM)
    shape = render.shape_for(W, H)
    ref_w, ref_h = layout_shapes()[shape]
    u = min(W / ref_w, H / ref_h)
    m_px = {"x": (bleed + safe) * PX_PER_MM, "top": (bleed + safe) * PX_PER_MM,
            "bottom": (bleed + safe + hidden) * PX_PER_MM}
    folds_px = []
    if panels:
        x = bleed * PX_PER_MM
        for w in panels[:-1]:
            x += w * PX_PER_MM
            folds_px.append(x)
    slug = round(10 * PX_PER_MM)  # room outside the bleed for the crop marks
    params = {
        "format": a.format, "w": W, "h": H, "dpi": DPI, "pxPerMm": PX_PER_MM, "bleedPx": bleed * PX_PER_MM,
        "slugPx": slug, "markLenPx": 5 * PX_PER_MM, "markGapPx": 1 * PX_PER_MM, "markWeightPx": 0.25 / PT_PER_PX,
        "margin": {k: v / u for k, v in m_px.items()},  # in the layout's reference px, like the shape margins
    }

    page = os.path.abspath(a.page)
    root = os.path.abspath(a.root) if a.root else os.path.dirname(page)
    srv = render.serve(root)
    rel = os.path.relpath(page, root).replace(os.sep, "/")
    from urllib.parse import quote
    url = f"http://127.0.0.1:{srv.server_address[1]}/{rel}?w={W}&h={H}&qd-print={quote(json.dumps(params))}"
    from PIL import Image, ImageDraw
    Image.MAX_IMAGE_PIXELS = None

    # 1. Full render at 300 dpi, the text-free version for contrast, and the measurements.
    full_png = os.path.join(a.out, f"{name}-full.png")
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, "raw.png")
        for target, extra in ((full_png, ""), (full_png[:-4] + ".bg.png", "&qd-bg=1")):
            render.chrome([f"--window-size={W},{H + render.EXTRA_H}", f"--screenshot={raw}", url + extra])
            if not os.path.exists(raw):
                sys.exit("Chrome made no screenshot")
            Image.open(raw).crop((0, 0, W, H)).save(target)
    dom = render.chrome([f"--window-size={W},{H + render.EXTRA_H}", "--dump-dom", url]).stdout
    mm = re.search(r'<script type="application/json" id="qd-measure">(.*?)</script>', dom, re.S)
    if not mm:
        sys.exit("No measurements: did the page load? (one .qd-canvas, canvas.js)")
    meas = json.loads(mm.group(1).replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&"))
    meas.update(file=os.path.abspath(full_png), page=page, target={"w": W, "h": H, "shape": shape},
                print={"format": a.format, "trimMm": trim, "bleedMm": bleed, "safeMm": safe, "foldsPx": folds_px,
                       "hiddenBottomMm": hidden, "marginPx": m_px, "dpi": DPI})
    json.dump(meas, open(os.path.join(a.out, f"{name}-full.json"), "w"), indent=1)

    # 2. The PDF: trim + bleed + crop marks, at real size, text vector. The backdrop (canvas color,
    #    patterns, faded images) goes in as one 300 dpi image, because Chrome's PDF export loses CSS masks.
    rgb_pdf = os.path.join(a.out, f"{name}-rgb.pdf")
    with tempfile.TemporaryDirectory() as layer_dir:
        raw = os.path.join(layer_dir, "raw.png")
        render.chrome([f"--window-size={W},{H + render.EXTRA_H}", f"--screenshot={raw}", url + "&qd-layer=backdrop"])
        if not os.path.exists(raw):
            sys.exit("Chrome made no backdrop screenshot")
        Image.open(raw).crop((0, 0, W, H)).save(os.path.join(layer_dir, "backdrop.png"))
        srv.extra = {"/qd-layer/": layer_dir}
        render.chrome(["--no-pdf-header-footer", f"--print-to-pdf={rgb_pdf}",
                       url + "&qd-pdf=1&qd-backdrop=/qd-layer/backdrop.png"])
    if not os.path.exists(rgb_pdf):
        sys.exit("Chrome made no PDF")
    final_pdf = os.path.join(a.out, f"{name}.pdf")
    color_note = ""
    gs = shutil.which("gs")
    if rgb_only:
        shutil.copy(rgb_pdf, final_pdf)
        color_note = "Screen PDF: kept in RGB, as the preset says."
    elif not gs:
        color_note = GS_INSTALL
    elif not a.icc:
        color_note = ("No printer profile (--icc): the PDF wasn't converted to CMYK. Ask the printer for their "
                      "profile (it's in their spec, e.g. FOGRA39 in Europe, GRACoL in the US). Converting without "
                      "it risks color shifts, the brand red most of all.")
    else:
        cmd = [gs, "-dSAFER", "-dBATCH", "-dNOPAUSE", "-sDEVICE=pdfwrite", "-dPDFSETTINGS=/prepress",
               "-sColorConversionStrategy=CMYK", "-sProcessColorModel=DeviceCMYK",
               f"-sOutputICCProfile={os.path.abspath(a.icc)}", "-dEmbedAllFonts=true",
               f"-dPDFX={'4' if a.pdfx == '4' else 'true'}", f"-sOutputFile={final_pdf}", rgb_pdf]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0 or not os.path.exists(final_pdf):
            color_note = "Ghostscript couldn't convert the PDF:\n" + (r.stderr or r.stdout)[-800:]
        else:
            color_note = f"Converted to CMYK with {os.path.basename(a.icc)} (PDF/X-{a.pdfx})."

    # 3. Proof: the piece after cutting, folds dashed, scaled for review.
    full = Image.open(full_png).convert("RGB")
    b_px = round(bleed * PX_PER_MM)
    proof = full.crop((b_px, b_px, W - b_px, H - b_px))
    d = ImageDraw.Draw(proof)
    for fx in folds_px:
        x = fx - b_px
        for y in range(0, proof.height, 40):
            d.line([(x, y), (x, y + 20)], fill=(120, 120, 120), width=3)
    scale = 1600 / max(proof.size)
    if scale < 1:
        proof = proof.resize((round(proof.width * scale), round(proof.height * scale)), Image.LANCZOS)
    proof.save(os.path.join(a.out, f"{name}-proof.png"))

    # 4. Print checks (brand checks: review/check.py on <name>-full.json).
    rows = []
    def row(check, ok, detail):
        rows.append((check, "pass" if ok is True else ("fail" if ok is False else ok), detail))
    defaults_used = [x for x in ("finished size", "bleed", "safe area") if x not in from_spec]
    row("Printer's spec", True if not defaults_used else "look",
        "all from the spec" if not defaults_used else
        "from the preset, not the printer: " + ", ".join(defaults_used) + ". Confirm with the printer")
    texts = meas["texts"]
    small = [f"\"{t['text'][:20]}\" {t['fontSize'] * PT_PER_PX:.1f} pt" for t in texts if t["fontSize"] * PT_PER_PX < 8]
    row("Text size", not small, "every text 8 pt or more" if not small else "; ".join(small[:4]))
    cross = []
    for fx in folds_px:
        lo, hi = fx - safe * PX_PER_MM, fx + safe * PX_PER_MM
        at = f"the fold {(fx / PX_PER_MM - bleed):.0f} mm from the left edge"
        items = [(f"\"{t['text'][:24]}\"", t["box"]) for t in texts if not t.get("nested")]
        items += [("the logo", l["rect"]) for l in meas["logos"]] + [("the button", b["rect"]) for b in meas["buttons"]]
        for label, r in items:
            if r["x"] < hi and r["x"] + r["w"] > lo:
                cross.append(f"{label} crosses {at}")
    row("Folds", not cross if folds_px else True, "no folds" if not folds_px else
        ("nothing within the safe area of a fold" if not cross else "; ".join(cross[:4])))
    if meas["logos"]:
        lh = meas["logos"][0]["rect"]["h"] / PX_PER_MM
        row("Logo size", lh >= 8.4, f"{lh:.1f} mm tall (at least 8.4 mm)")
    else:
        row("Logo size", False, "no logo")
    low = []
    for img in meas["images"]:
        if img in meas["logos"] or img.get("src", "").endswith(".svg") or not img.get("naturalWidth"):
            continue
        shown = img.get("shown") or img["rect"]
        dpi = img["naturalWidth"] / (shown["w"] / PX_PER_MM / 25.4) if shown["w"] else 0
        if dpi < min_dpi:
            low.append(f"{os.path.basename(img['src'])} {dpi:.0f} dpi")
    row("Image resolution", not low, f"every image {min_dpi} dpi or more" if not low else
        "; ".join(low[:4]) + f" (needs {min_dpi})")
    row("Color", True if (rgb_only or "Converted" in color_note) else False, color_note.split("\n")[0])
    md = [f"# Print checks: {name}", "", f"{fmt['name']}: {trim[0]} × {trim[1]} mm, bleed {bleed} mm, "
          f"safe area {safe} mm" + (f", hidden bottom {hidden} mm" if hidden else "") +
          (f", panels {' / '.join(f'{p:g}' for p in panels)} mm" if panels else ""), "",
          "| Check | Result | Detail |", "| --- | --- | --- |"]
    md += [f"| {c} | {'✅' if r == 'pass' else ('❌' if r == 'fail' else '👀')} | {d} |" for c, r, d in rows]
    if color_note and "Converted" not in color_note and not rgb_only:
        md += ["", color_note]
    md += ["", "Brand checks: `python3 review/check.py " + os.path.join(a.out, f"{name}-full.json") + "`.",
           "Suggested: have a designer check the proof before it goes to the printer."]
    open(os.path.join(a.out, f"{name}-print.md"), "w").write("\n".join(md) + "\n")
    print("\n".join(md))
    srv.shutdown()


if __name__ == "__main__":
    main()
