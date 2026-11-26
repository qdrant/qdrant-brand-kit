#!/usr/bin/env python3
"""Export a print creative: a print-ready PDF, a proof image and the print checks.

Usage:
  python3 review/print.py page.html --format flyer-a4 --out OUT_DIR [--name flyer]
         [--trim 210x297] [--bleed 3] [--safe 5] [--panels 100,100,97] [--hidden-bottom 100] [--min-dpi 150]
         [--icc printer-profile.icc] [--pdfx 4] [--print-scale small] [--root FOLDER]

The format preset comes from guidelines/print/print.tokens.json. Everything the printer's spec gives
(--trim, --bleed, --safe, --panels, --hidden-bottom, --min-dpi, --icc) overrides the preset: the spec always wins.

It writes, in OUT_DIR:
  <name>.pdf          the print file: trim + bleed + crop marks, fonts embedded, converted to the printer's
                      CMYK profile (PDF/X as the vendor asks, --pdfx). Only with --icc and Ghostscript
  <name>-rgb.pdf      the same before CMYK conversion (screen colors), for review. Not for the printer
  <name>-proof.png    what the printed piece looks like after cutting, folds dashed, for review
  <name>-full.png     the full render with bleed, and <name>-full.json, its measurements for review/check.py
  <name>-print.md     the print checks: spec, margin, text size, reversed text, folds, logo size, patterns, images,
                      QR codes, image resolution, fonts, color

Margins are the format's margin (8% of the short side, never under 1.5 × the safe area), from the
trim; the shape and scale come from the finished size, not trim + bleed. Text sizes come from the
format's title / supporting values in pt (--print-scale small: titleMin / supportingMin, for space
imagery). All from guidelines/print/ (visual designer, 2026-11-20).

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
BUSY = 0.06      # share of detailed pixels behind a text box that counts as busy (tuned 2026-11-20)
BUSY_STD = 25    # or a spread of brightness (0-255) that means a subject or ground behind the text
TOPAZ = ("To decide (visual designer): the Topaz Labs upscale API is proposed (needs approval). A 4× upscale "
         "(4096 × 6144) would cover A4 and A3 at 300 dpi. Until then, offer the plain, solid version.")
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
    ap.add_argument("--min-dpi", type=float, help="lowest image resolution at the printed size, from the vendor's "
                    "spec: overrides the format's minDpi, the vendor wins (visual designer, 2026-11-26)")
    ap.add_argument("--hidden-bottom", type=float, help="mm at the bottom that won't be seen (roll-up base)")
    ap.add_argument("--icc", help="the printer's CMYK profile (.icc), from the spec")
    ap.add_argument("--pdfx", default=None, help="PDF/X version from the vendor's spec: 4 or 1a. No brand default (visual designer, 2026-11-26); falls back to 4 and the checks flag it")
    ap.add_argument("--print-scale", choices=["normal", "small"], default="normal",
                    help="small: the smaller text sizes (titleMin, supportingMin), to keep text in the calm sky")
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
    # 300 dpi up close, 100 to 150 for large formats (the preset's minDpi), or the vendor's value (visual designer, 2026-11-26).
    min_dpi = a.min_dpi if a.min_dpi else fmt.get("minDpi", defaults["minDpi"])
    if a.min_dpi: from_spec.append("resolution")
    qr_min = fmt.get("qrMin", defaults["qrMin"])
    if a.pdfx: from_spec.append("file format")
    a.pdfx = a.pdfx or "4"
    rgb_only = fmt.get("color") == "rgb"
    if not trim or bleed is None or safe is None:
        sys.exit(f"{fmt['name']} has no default size: take the finished size, bleed and safe area from the "
                 "printer's spec (--trim, --bleed, --safe).")

    name = a.name or os.path.splitext(os.path.basename(a.page))[0]
    os.makedirs(a.out, exist_ok=True)
    W = round((trim[0] + 2 * bleed) * PX_PER_MM)
    H = round((trim[1] + 2 * bleed) * PX_PER_MM)
    TW, TH = trim[0] * PX_PER_MM, trim[1] * PX_PER_MM
    shape = render.shape_for(TW, TH)  # from the finished size, not trim + bleed
    ref_w, ref_h = layout_shapes()[shape]
    u = min(TW / ref_w, TH / ref_h)
    # The content margin, from the trim: 8% of the short side (the folded panel for brochures),
    # never under 1.5 × the safe area (visual designer, 2026-11-20). The preset's value unless the spec changes the size.
    if a.trim or a.panels or fmt.get("margin") is None:
        short = min(min(panels) if panels else trim[0], trim[1])
        margin = round(0.08 * short, 1)
    else:
        margin = fmt["margin"]
    margin = max(margin, 1.5 * safe)
    # Text in print, pt -> px at 300 dpi (guidelines/print/ section 4).
    type_pt = None
    if fmt.get("title") and fmt.get("supporting"):
        small = a.print_scale == "small"
        type_pt = {"title": fmt["title"], "supporting": fmt["supporting"],
                   "titleMin": fmt.get("titleMin", fmt["title"]), "supportingMin": fmt.get("supportingMin", fmt["supporting"]),
                   "scale": a.print_scale,
                   "titleUsed": fmt.get("titleMin", fmt["title"]) if small else fmt["title"],
                   "supportingUsed": fmt.get("supportingMin", fmt["supporting"]) if small else fmt["supporting"],
                   "titleCover": fmt.get("titleCover", round(1.45 * fmt["title"]))}
    m_px = {"x": (bleed + margin) * PX_PER_MM, "top": (bleed + margin) * PX_PER_MM,
            "bottom": (bleed + margin + hidden) * PX_PER_MM}
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
        "shape": shape, "u": u,
    }
    if type_pt:
        params["type"] = {"titlePx": type_pt["titleUsed"] / PT_PER_PX, "supportingPx": type_pt["supportingUsed"] / PT_PER_PX,
                          "titleCoverPx": type_pt["titleCover"] / PT_PER_PX}

    page = os.path.abspath(a.page)
    root = os.path.abspath(a.root) if a.root else os.path.dirname(page)
    srv = render.serve(root)
    rel = os.path.relpath(page, root).replace(os.sep, "/")
    from urllib.parse import quote
    url = f"http://127.0.0.1:{srv.server_address[1]}/{rel}?w={W}&h={H}&qd-print={quote(json.dumps(params))}"
    from PIL import Image, ImageChops, ImageDraw
    Image.MAX_IMAGE_PIXELS = None

    # 1. Full render at 300 dpi, the text-free version for contrast, and the measurements.
    full_png = os.path.join(a.out, f"{name}-full.png")
    layer_dir = tempfile.mkdtemp()  # the backdrop: canvas color and images only, for the PDF and the busy check
    backdrop_png = os.path.join(layer_dir, "backdrop.png")
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, "raw.png")
        for target, extra in ((full_png, ""), (full_png[:-4] + ".bg.png", "&qd-bg=1"),
                              (backdrop_png, "&qd-layer=backdrop")):
            render.chrome([f"--window-size={W},{H + render.EXTRA_H}", f"--screenshot={raw}", url + extra])
            if not os.path.exists(raw):
                sys.exit("Chrome made no screenshot")
            Image.open(raw).crop((0, 0, W, H)).save(target)
    dom = render.chrome([f"--window-size={W},{H + render.EXTRA_H}", "--dump-dom", url]).stdout
    mm = re.search(r'<script type="application/json" id="qd-measure">(.*?)</script>', dom, re.S)
    if not mm:
        sys.exit("No measurements: did the page load? (one .qd-canvas, canvas.js)")
    unesc = lambda t: t.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
    meas = json.loads(unesc(mm.group(1)))
    pm = re.search(r'<script type="application/json" id="qd-print-measure">(.*?)</script>', dom, re.S)
    pinfo = json.loads(unesc(pm.group(1))) if pm else {"masks": 0, "canvases": 0, "patternFiles": [], "qr": []}
    meas.update(file=os.path.abspath(full_png), page=page, target={"w": W, "h": H, "shape": shape},
                print={"format": a.format, "trimMm": trim, "bleedMm": bleed, "safeMm": safe, "foldsPx": folds_px,
                       "hiddenBottomMm": hidden, "marginMm": margin, "marginPx": m_px, "uPx": u, "dpi": DPI, "type": type_pt})
    json.dump(meas, open(os.path.join(a.out, f"{name}-full.json"), "w"), indent=1)

    # 2. The PDF: trim + bleed + crop marks, at real size, text sharp at any size. A plain backdrop stays a flat
    #    color. Only when there's a pattern, a mask or an image fade does the backdrop go in as one image, painted
    #    at 300 dpi at the printed size, because Chrome's PDF export loses CSS masks.
    rgb_pdf = os.path.join(a.out, f"{name}-rgb.pdf")
    backdrop = Image.open(backdrop_png).convert("RGB")
    # Grain on image fades, print only, so large fades don't band in CMYK (guidelines/print/ section 3).
    for f in pinfo.get("fades", []):
        box = (max(0, int(f["x"])), max(0, int(f["y"])), min(W, int(f["x"] + f["w"])), min(H, int(f["y"] + f["h"])))
        if box[2] > box[0] and box[3] > box[1]:
            region = backdrop.crop(box)
            noise = Image.effect_noise(region.size, 4).convert("RGB")  # about ±4 levels around 128
            backdrop.paste(ImageChops.add(region, noise, 1.0, -128), box)
    backdrop.save(os.path.join(layer_dir, "backdrop-grain.png"))
    srv.extra = {"/qd-layer/": layer_dir}
    painted_backdrop = bool(pinfo["masks"] or pinfo["canvases"] or pinfo.get("fades"))
    render.chrome(["--no-pdf-header-footer", f"--print-to-pdf={rgb_pdf}",
                   url + "&qd-pdf=1" + ("&qd-backdrop=/qd-layer/backdrop-grain.png" if painted_backdrop else "")])
    if not os.path.exists(rgb_pdf):
        sys.exit("Chrome made no PDF")
    final_pdf = os.path.join(a.out, f"{name}.pdf")
    color_note = ""
    gs = shutil.which("gs")
    if rgb_only:
        shutil.copy(rgb_pdf, final_pdf)
        color_note = "Screen PDF: kept in RGB, as the preset says."
    elif not a.icc:
        color_note = ("Not for the printer: no printer's profile. This run made only the proof and an RGB PDF "
                      f"for review ({name}-rgb.pdf). Ask the printer for their profile (it's in their spec, e.g. "
                      "FOGRA39 in Europe, GRACoL in the US) and run this again with --icc. Never guess it.")
    elif not gs:
        color_note = GS_INSTALL
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
    defaults_used = [x for x in ("finished size", "bleed", "safe area", "file format") if x not in from_spec]
    if fmt.get("status") == "in-progress":  # large format (guidelines/print/, visual designer, 2026-11-20)
        row("Format", "look", f"{fmt['name']} is in progress: large-format rules aren't settled. Treat this as a test and have a designer check it")
    row("Printer's spec", True if not defaults_used else "look",
        "all from the spec" if not defaults_used else
        "from the preset, not the printer: " + ", ".join(defaults_used) + ". Confirm with the printer")
    texts = meas["texts"]
    full_rgb = Image.open(full_png).convert("RGB")
    bg_img = Image.open(full_png[:-4] + ".bg.png").convert("RGB")
    lum = lambda c: (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255

    # Margin: nothing closer to the trim than the format's margin.
    L, T = m_px["x"], m_px["top"]
    R, B = W - m_px["x"], H - m_px["bottom"]
    near = []
    boxes = [(f"\"{t['text'][:24]}\"", t["box"]) for t in texts if not t.get("nested")]
    boxes += [("the logo", l["rect"]) for l in meas["logos"]] + [("the button", b["rect"]) for b in meas["buttons"]]
    boxes += [("a QR code", q) for q in pinfo["qr"]]
    boxes += [("a card", b) for b in pinfo.get("boxes", [])]  # a card's edge stays inside the margins too
    for label, r in boxes:
        if r["x"] < L - 1 or r["y"] < T - 1 or r["x"] + r["w"] > R + 1 or r["y"] + r["h"] > B + 1:
            gap = min(r["x"] - bleed * PX_PER_MM, r["y"] - bleed * PX_PER_MM,
                      W - bleed * PX_PER_MM - r["x"] - r["w"], H - bleed * PX_PER_MM - r["y"] - r["h"]) / PX_PER_MM
            near.append(f"{label} {gap:.1f} mm from the trim")
    row("Margin", not near, f"{margin:g} mm from the trim (at least 1.5 × the {safe:g} mm safe area)" if not near else
        "; ".join(near[:4]) + f" (needs {margin:g} mm)")

    small = [f"\"{t['text'][:20]}\" {t['fontSize'] * PT_PER_PX:.1f} pt" for t in texts if t["fontSize"] * PT_PER_PX < 8]
    row("Text size", not small, "every text 8 pt or more" if not small else "; ".join(small[:4]))

    # Reversed text: light text on a dark background is at least 9 pt and Regular (400) or heavier.
    def rgb_of(css):
        n = re.findall(r"[\d.]+", css or "")
        return tuple(float(x) for x in n[:3]) if len(n) >= 3 else (0, 0, 0)
    rev = []
    for t in texts:
        if t.get("nested") or lum(rgb_of(t.get("color"))) < 0.5:
            continue
        b = t["box"]
        box = (max(0, int(b["x"])), max(0, int(b["y"])), min(W, int(b["x"] + b["w"])), min(H, int(b["y"] + b["h"])))
        if box[2] <= box[0] or box[3] <= box[1]:
            continue
        crop = bg_img.crop(box).resize((16, 16))
        behind = sorted(lum(px) for px in crop.getdata())[len(crop.getdata()) // 2]
        if behind >= 0.5:
            continue
        pt = t["fontSize"] * PT_PER_PX
        if pt < 10 or (t.get("weight") or 400) < 400:  # 10 pt out of rich black (visual designer, 2026-11-26)
            rev.append(f"\"{t['text'][:20]}\" {pt:.1f} pt, weight {t.get('weight')}")
    # Text on a busy background: detail (edge density) behind each text box, in the backdrop (canvas color
    # and images only, so cards and buttons don't count).
    from PIL import ImageFilter
    back_img = Image.open(backdrop_png).convert("RGB")
    busy = []
    from PIL import ImageStat
    for t in texts:
        if t.get("nested") or t.get("inBox"):
            continue  # text in a card or box sits on the card, not on the image
        b = t["box"]
        box = (max(0, int(b["x"])), max(0, int(b["y"])), min(W, int(b["x"] + b["w"])), min(H, int(b["y"] + b["h"])))
        if box[2] - box[0] < 8 or box[3] - box[1] < 8:
            continue
        g = back_img.crop(box).convert("L")
        spread = ImageStat.Stat(g).stddev[0]
        g = g.resize((max(8, g.width // 4), max(8, g.height // 4)))
        edges = g.filter(ImageFilter.FIND_EDGES)
        edges = edges.crop((1, 1, edges.width - 1, edges.height - 1))  # the filter marks the crop's own border
        vals = list(edges.getdata())
        density = sum(1 for v in vals if v > 24) / len(vals)
        if density > BUSY or spread > BUSY_STD:
            busy.append(f"\"{t['text'][:24]}\"")
    row("Text on a busy background", not busy, "text sits on calm areas" if not busy else
        "; ".join(busy[:4]) + ". Move it to calm sky: tighten gaps, then --print-scale small, then cut copy")
    row("Reversed text", not rev, "light text on dark is 10 pt or more and Regular or heavier" if not rev else
        "; ".join(rev[:4]) + " (needs 10 pt, Regular or heavier)")
    cross = []
    for fx in folds_px:
        lo, hi = fx - margin * PX_PER_MM, fx + margin * PX_PER_MM
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
    pat = []
    if pinfo["masks"]: pat.append(f"{pinfo['masks']} pattern mask")
    if pinfo["canvases"]: pat.append(f"{pinfo['canvases']} pattern canvas")
    if pinfo["patternFiles"] and not pat: pat.append("files from brand-assets/patterns/")
    row("Patterns", True if not pat else "look", "no pattern" if not pat else
        ", ".join(pat) + ": allowed in print (visual designer, 2026-11-26). Check the proof for fringing on fine lines and moiré on dithered patterns; ask before using the pattern mask (guidelines/print/ section 3)")
    row("No button", not meas["buttons"], "no button" if not meas["buttons"] else
        "a button on a print piece: a QR code replaces it (visual designer, 2026-11-26)")
    if pinfo["qr"]:
        bad = []
        for q in pinfo["qr"]:
            side = min(q["w"], q["h"]) / PX_PER_MM
            box = (int(q["x"]), int(q["y"]), int(q["x"] + q["w"]), int(q["y"] + q["h"]))
            px = sorted(lum(p) for p in full_rgb.crop(box).resize((64, 64)).getdata())
            edge = [lum(p) for p in full_rgb.crop((box[0], box[1], box[2], box[1] + 3)).resize((32, 1)).getdata()]
            dark_on_light = px[len(px) // 20] < 0.35 and min(edge) > 0.7
            if side < qr_min: bad.append(f"{side:.1f} mm (needs {qr_min:g} mm)")
            if not dark_on_light: bad.append("not dark on light")
        row("QR codes", not bad, f"{qr_min:g} mm or more, dark on light. Test-scan it from the proof" if not bad else "; ".join(bad))
    # Images: only what's in the brand kit (visual designer, 2026-11-26). Qbot is allowed, without its glow;
    # headshots get a 👀 while they're to decide; any other image fails. Patterns are painted at the printed size.
    is_qbot = lambda i: "qd-mascot" in (i.get("cls") or "") or "brand-assets/mascot/" in (i.get("src") or "")
    pics = [i for i in meas["images"] if i not in meas["logos"] and not (i.get("src") or "").lower().endswith(".svg")]
    img_bad, img_look = [], []
    for i in pics:
        nm = os.path.basename(i.get("src") or "image")
        if is_qbot(i):
            if "qd-mascot--glow" in (i.get("cls") or ""): img_bad.append(f"Qbot has its glow ({nm}): no glow in print")
        elif i.get("cls") == "headshot":
            img_look.append(f"a headshot ({nm}): whether headshots go on print is to decide")
        else:
            img_bad.append(f"an image that isn't from the brand kit ({nm})")
    if a.min_dpi and a.min_dpi > DPI and pinfo["canvases"]:
        img_look.append(f"the vendor asks {a.min_dpi:g} dpi; patterns are painted at {DPI} dpi")
    row("Images", False if img_bad else ("look" if img_look else True),
        "; ".join(img_bad + img_look) if img_bad or img_look else
        ("only Qbot, from the brand kit" if pics else "no images") + " (guidelines/print/ sections 3 and 5)")
    low = []
    for img in meas["images"]:
        if img in meas["logos"] or img.get("src", "").endswith(".svg") or not img.get("naturalWidth"):
            continue
        shown = img.get("shown") or img["rect"]
        src_w = img.get("sourceWidth") or img["naturalWidth"]  # the cropped part of the file, not the whole file
        dpi = src_w / (shown["w"] / PX_PER_MM / 25.4) if shown["w"] else 0
        if dpi < min_dpi:
            low.append(f"the image is {dpi:.0f} dpi ({os.path.basename(img['src'])})")
    row("Image resolution", not low, f"every image {min_dpi:g} dpi or more" if not low else
        "Not doable for now: " + "; ".join(low[:3]) + f", the piece needs {min_dpi:g}. No plain resize")
    # Fonts: Chrome can export variable fonts as Type 3, which some prepress workflows reject.
    pdf_for_fonts = final_pdf if os.path.exists(final_pdf) else rgb_pdf
    kinds = []
    if shutil.which("pdffonts"):
        out = subprocess.run(["pdffonts", pdf_for_fonts], capture_output=True, text=True).stdout.splitlines()[2:]
        kinds = ["Type 3" if "Type 3" in ln else "other" for ln in out]
    else:
        raw_pdf = open(pdf_for_fonts, "rb").read()
        kinds = ["Type 3" if k == b"Type3" else "other" for k in re.findall(rb"/Subtype\s*/(Type3|Type1C?|TrueType|Type0|CIDFontType[02]|OpenType)", raw_pdf)]
    t3 = kinds.count("Type 3")
    row("Fonts", True if not t3 else "look", "no Type 3 fonts" if not t3 else
        f"{t3} Type 3 fonts: some printers reject them; check with the printer or outline text")
    no_profile = not rgb_only and not a.icc
    # Color is always checked (visual designer, 2026-11-20): without the printer's profile the piece isn't deliverable.
    row("Color", True if (rgb_only or "Converted" in color_note) else False,
        color_note.split(". ")[0] if no_profile else color_note.split("\n")[0])
    md = [f"# Print checks: {name}", "", f"{fmt['name']}: {trim[0]} × {trim[1]} mm, bleed {bleed} mm, "
          f"safe area {safe} mm, margin {margin:g} mm"
          + (f", text {type_pt['titleUsed']:g} / {type_pt['supportingUsed']:g} pt" if type_pt else "") + (f", hidden bottom {hidden} mm" if hidden else "") +
          (f", panels {' / '.join(f'{p:g}' for p in panels)} mm" if panels else ""), "",
          "| Check | Result | Detail |", "| --- | --- | --- |"]
    md += [f"| {c} | {'✅' if r == 'pass' else ('❌' if r == 'fail' else '👀')} | {d} |" for c, r, d in rows]
    if low:
        md += ["", "**Not doable for now:** an image is under the format's resolution, so this piece can't be "
               "delivered (guidelines/print/ section 5). Never plain-resize it. " + TOPAZ]
    if color_note and "Converted" not in color_note and not rgb_only:
        md += ["", color_note]
    md += ["", "Brand checks: `python3 review/check.py " + os.path.join(a.out, f"{name}-full.json") + "`.",
           "Suggested: have a designer check the proof before it goes to the printer."]
    open(os.path.join(a.out, f"{name}-print.md"), "w").write("\n".join(md) + "\n")
    print("\n".join(md))
    srv.shutdown()
    shutil.rmtree(layer_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
