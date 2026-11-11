#!/usr/bin/env python3
"""Check rendered creatives against the repo's rules.

Usage:
  python3 review/check.py OUT_DIR/*.json [--md report.md]

Reads the measurements review/render.py wrote, and the PNG next to each. Every rule value comes from
the repo's own files (layout tokens, typography tokens, logo.css), never from this script. If a value
is missing in the repo, the check says so instead of guessing.

What it can't judge is listed at the end of the report as "Look at it yourself": hierarchy, calm,
crowding, crops, the logo version, one hero, made-up content. Those stay a person's (or agent's) review.
Needs Pillow.
"""
import argparse, glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
SMALL = {"a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "the", "to", "vs", "via", "with"}


def px(v):
    return float(str(v).replace("px", ""))


def icon_colors():
    """Allowed icon colors from the repo: every 400 for dark, every 500 for light (brand-assets/icons)."""
    css = open(os.path.join(REPO, "primitives/colors/colors.css")).read()
    found = re.findall(r"--qd-color-([a-z-]+)-(400|500):\s*#([0-9A-Fa-f]{6})", css)
    pick = lambda step: {f"{n}-{s}": tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) for n, s, h in found if s == step}
    # Only colors that keep 3:1 on the plain background (README "Colors"): drops green, cyan, orange, yellow on light.
    keep = lambda d, bg: {k: v for k, v in d.items() if contrast(v, bg) >= 3}
    return {"dark": keep(pick("400"), (11, 15, 25)), "light": keep(pick("500"), (255, 255, 255))}


def load_rules():
    lay = json.load(open(os.path.join(REPO, "primitives/layout/layout.tokens.json")))["canvas"]["shape"]
    shapes = {}
    for name, s in lay.items():
        if name.startswith("$"):
            continue
        g = lambda *k: s
        shapes[name] = {
            "ref": (px(s["reference"]["width"]["$value"]), px(s["reference"]["height"]["$value"])),
            "mx": px(s["margin"]["x"]["$value"]), "mt": px(s["margin"]["top"]["$value"]),
            "mb": px(s["margin"]["bottom"]["$value"]),
            "cols": int(s["grid"]["columns"]["$value"]), "col": px(s["grid"]["column"]["$value"]),
            "gut": px(s["grid"]["gutter"]["$value"]),
        }
    typo = json.load(open(os.path.join(REPO, "primitives/typography/typography.tokens.json")))
    cr = typo.get("semantic", {}).get("creative")
    logo_css = open(os.path.join(REPO, "brand-assets/logo/logo.css")).read()
    logo_h = {m.group(1): float(m.group(2)) for m in re.finditer(
        r'data-shape="(\w+)"\]\s*\{\s*--qd-canvas-logo-height:\s*([\d.]+)', logo_css)}
    return shapes, cr, logo_h


def lum(rgb):
    def c(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = rgb[:3]
    return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)


def contrast(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def rgb(css):
    n = [float(x) for x in re.findall(r"[\d.]+", css)[:3]]
    return tuple(int(round(x)) for x in n)


def overlap(a, b):
    """Overlap area as a share of the smaller box."""
    w = min(a["x"] + a["w"], b["x"] + b["w"]) - max(a["x"], b["x"])
    h = min(a["y"] + a["h"], b["y"] + b["h"]) - max(a["y"], b["y"])
    if w <= 0 or h <= 0:
        return 0
    return w * h / max(1, min(a["w"] * a["h"], b["w"] * b["h"]))


def inter(a, b, pad=0):
    return not (a["x"] + a["w"] + pad <= b["x"] or b["x"] + b["w"] + pad <= a["x"]
                or a["y"] + a["h"] + pad <= b["y"] or b["y"] + b["h"] + pad <= a["y"])


def title_case_ok(text):
    words = re.findall(r"[A-Za-z][A-Za-z'’-]*", text)
    bad = [w for i, w in enumerate(words) if w.lower() not in SMALL or i == 0
           if w[0].islower()]
    return not bad, bad


def check_one(m, rules):
    shapes, cr, logo_h = rules
    res = []

    def add(name, ok, detail, src):
        res.append({"check": name, "result": "pass" if ok is True else ("fail" if ok is False else ok),
                    "detail": detail, "rule": src})

    W, H, shape = m["target"]["w"], m["target"]["h"], m["target"]["shape"]
    S = shapes[shape]
    u = min(W / S["ref"][0], H / S["ref"][1])
    from PIL import Image
    im = Image.open(m["file"]).convert("RGB")
    bg = Image.open(m["file"].replace(".png", ".bg.png")).convert("RGB") if os.path.exists(m["file"].replace(".png", ".bg.png")) else None

    add("Size", im.size == (W, H), f"{im.size[0]}×{im.size[1]}, wanted {W}×{H}", "layout README, Shapes")
    cs = (m.get("canvas") or {}).get("shape")
    add("Shape", cs == shape, f"data-shape={cs}, ratio says {shape}", "layout README, Shapes")

    texts = [t for t in m["texts"]]
    main = [t for t in texts if t["role"] == "text"]
    L, T, R, B = S["mx"] * u, S["mt"] * u, W - S["mx"] * u, H - S["mb"] * u
    out = []
    for kind, items in (("text", [t["box"] for t in texts]), ("logo", [l["rect"] for l in m["logos"]]),
                        ("button", [b["rect"] for b in m["buttons"]])):
        for r in items:
            if r["x"] < L - 1 or r["y"] < T - 1 or r["x"] + r["w"] > R + 1 or r["y"] + r["h"] > B + 1:
                out.append(f"{kind} at {round(r['x'])},{round(r['y'])} {round(r['w'])}×{round(r['h'])}")
    add("Inside margins and safe zones", not out,
        "all inside" if not out else "; ".join(out[:4]) + f" (margins {round(L)}/{round(T)}/{round(W-R)}/{round(H-B)})",
        "checks.md, Inside margins")

    starts = [L + k * (S["col"] + S["gut"]) * u for k in range(S["cols"])]
    ends = [L + (k * (S["col"] + S["gut"]) + S["col"]) * u for k in range(S["cols"])]
    off = []
    lefts = [("text", t["box"]) for t in main] + [("logo", l["rect"]) for l in m["logos"] if not l.get("inBook")] + \
            [("card", c["rect"]) for c in m["cards"]]
    for kind, r in lefts:
        if min(abs(r["x"] - s) for s in starts) > 2:
            off.append(f"{kind} left edge {round(r['x'])}")
    for b in m["buttons"]:
        r = b["rect"]
        if b.get("inBook"):
            continue  # the light card's button is centered below the card, not on the grid
        if min(abs(r["x"] - s) for s in starts) > 2 and min(abs(r["x"] + r["w"] - e) for e in ends) > 2:
            off.append(f"button at {round(r['x'])}")
    add("On the grid", not off, "edges on column lines" if not off else "; ".join(off[:4]), "checks.md, On the grid")

    if not cr:
        add("Text sizes", "missing in repo", "no semantic.creative in typography.tokens.json", "typography README")
    else:
        ext = lambda k: cr[k].get("$extensions", {}).get("qdrant", {})
        val = lambda k: px(ext(k).get(shape, cr[k]["$value"]))
        sizes = sorted({round(t["fontSize"], 1) for t in main}, reverse=True)
        add("Two text sizes", len(sizes) <= 2, f"sizes used: {sizes} px (button and speaker parts not counted)",
            "guidelines §11 rule 6")
        if main:
            top = max(t["fontSize"] for t in main)
            titles = [t for t in main if abs(t["fontSize"] - top) < 0.5]
            words = len(" ".join(t["text"] for t in titles).split())
            want = "title-short" if words <= 6 else "title-medium" if words <= 10 else "title-long"
            exp = val(want) * u
            # Ultrawide beside Qbot (LinkedIn cover): the title steps down one size (typography README).
            step = {"title-short": "title-medium", "title-medium": "title-long"}.get(want)
            qbot = shape == "ultrawide" and any("/mascot/" in i.get("src", "") for i in m["images"])
            ok_size = abs(top - exp) <= 1.5 or (qbot and step and abs(top - val(step) * u) <= 1.5)
            add("Title size by length", ok_size,
                f"{words} words → {want} {val(want):g} at reference = {exp:.1f} px; used {top:.1f} px"
                + (f" (one step down to {step} {val(step):g} allowed beside Qbot)" if qbot and step else ""),
                "typography README, Text in creatives")
            sup = val("supporting") * u
            others = sorted({round(t["fontSize"], 1) for t in main if abs(t["fontSize"] - top) >= 0.5})
            add("Supporting size", all(abs(s - sup) <= 1.5 for s in others),
                f"wanted {sup:.1f} px; used {others or 'none'}", "typography README, Text in creatives")
            bad_case = []
            for t in titles:
                condensed = t["stretch"] not in ("100%", "normal")
                upper = t["transform"] == "uppercase" or t["text"] == t["text"].upper()
                if condensed and not upper:
                    bad_case.append("Mona Sans Condensed not in all caps")
                if not condensed:
                    ok, bad = title_case_ok(t["text"])
                    if upper:
                        bad_case.append("Mona Sans in all caps")
                    elif not ok:
                        bad_case.append("not Title Case: " + ", ".join(bad[:4]))
            add("Title case", not bad_case, "; ".join(bad_case) or "OK", "typography README, Text in creatives")
            add("Title weight", all(t["weight"] == 600 for t in titles),
                f"{sorted({t['weight'] for t in titles})}", "typography README, Weights")
    bold = [t["text"][:20] for t in texts if t["weight"] >= 700]
    add("No Bold", not bold, "none" if not bold else ", ".join(bold[:3]), "typography README, Weights")

    aligns = {t["align"] for t in main}
    right = [t["text"][:20] for t in texts if t["align"] in ("right", "end")]
    mixed = len({("center" if a == "center" else "left") for a in aligns}) > 1
    add("Alignment", not right and not mixed,
        ("right-aligned: " + ", ".join(right[:3]) if right else "") + (" mixed left and centered" if mixed else "") or
        f"{', '.join(sorted(aligns))}", "guidelines §11 rule 5")

    mono = [t["text"] for t in texts if "Geist Mono" in t["family"] and len(t["text"].split()) > 2]
    add("Geist Mono only for 1–2 words", not mono, "OK" if not mono else "; ".join(mono[:3]),
        "typography README, Text in creatives")

    if bg is None:
        add("Contrast", "not measured", "no background render", "checks.md, Contrast")
    else:
        lows = []
        for t in texts:
            r = t["rect"]
            box = (max(0, int(r["x"])), max(0, int(r["y"])), min(W, int(r["x"] + r["w"])), min(H, int(r["y"] + r["h"])))
            if box[2] <= box[0] or box[3] <= box[1]:
                continue
            fg = rgb(t["color"])
            px_ = list(bg.crop(box).getdata())[::7] or [(0, 0, 0)]
            cs_ = sorted(contrast(fg, p) for p in px_)
            c5 = cs_[int(len(cs_) * 0.05)]
            need = 3.0 if t["fontSize"] / u >= 24 else 4.5
            if c5 < need:
                lows.append(f"\"{t['text'][:24]}\" {c5:.2f} < {need:g}")
        add("Contrast", not lows, "all text passes at the 5th-percentile pixel behind it" if not lows else "; ".join(lows[:4]),
            "checks.md, Contrast")

    if m.get("books"):
        # The light card (book): its own sizes, from primitives/layout/README "Light card layout".
        bk = m["books"][0]["rect"]
        wide = shape == "wide"
        biss = []
        if shape == "ultrawide":
            biss.append("no light card on ultrawide")
        ratio = bk["w"] / bk["h"]
        want_ratio = 1.25 if wide else 794.4 / 979.2
        if abs(ratio - want_ratio) > 0.02:
            biss.append(f"card {bk['w']:.0f}×{bk['h']:.0f} ({ratio:.2f}), wanted {want_ratio:.2f}")
        Wb = bk["h"] * 794.4 / 979.2 if wide else bk["w"]
        k = 1.5 if wide else 1.0
        btexts = [t for t in texts if t["role"] == "book"]
        if btexts:
            top = max(t["fontSize"] for t in btexts)
            if abs(top - 0.0846 * k * Wb) > 1.5:
                biss.append(f"title {top:.0f} px, wanted {0.0846 * k * Wb:.0f}")
        blogo = [l for l in m["logos"] if l.get("inBook")]
        if blogo and abs(blogo[0]["rect"]["h"] - 0.0967 * Wb) > 1.5:
            biss.append(f"logo {blogo[0]['rect']['h']:.0f} px, wanted {0.0967 * Wb:.0f}")
        add("Light card", not biss, "; ".join(biss) or f"card {bk['w']:.0f}×{bk['h']:.0f}, sizes match W={Wb:.0f}",
            "layout README, Light card layout")
    if not m["logos"]:
        add("Logo", False, "no Qdrant logo found", "guidelines §8")
    else:
        lg = m["logos"][0]
        r = lg["rect"]
        want = max(24, logo_h.get(shape, 0) * u)
        if lg.get("inBook"):
            want = 24  # the light card has its own, smaller logo (checked under "Light card")
        issues = []
        if "brand-assets/logo/" not in lg["src"]:
            issues.append("not a file from brand-assets/logo/")
        if r["h"] < want - 1:
            issues.append(f"{r['h']:.0f} px tall, wanted {want:.0f}")
        clear = r["h"] * 0.375
        zone = {"x": r["x"] - clear, "y": r["y"] - clear, "w": r["w"] + 2 * clear, "h": r["h"] + 2 * clear}
        hit = [t["text"][:16] for t in texts if inter(zone, t["box"])] + \
              ["button" for b in m["buttons"] if inter(zone, b["rect"]) and abs(b["rect"]["y"] - r["y"]) > 2]
        if hit:
            issues.append("in clear space: " + ", ".join(hit[:3]))
        add("Logo", not issues, "; ".join(issues) or f"{r['w']:.0f}×{r['h']:.0f}, clear space {clear:.0f} px empty",
            "brand-assets/logo README")
    bissues = []
    content_w = R - L
    for b in m["buttons"]:
        r = b["rect"]
        if r["w"] > 0.9 * content_w:
            bissues.append("full width")
        for lg in m["logos"]:
            lr = lg["rect"]
            beside = r["y"] < lr["y"] + lr["h"] and lr["y"] < r["y"] + r["h"]
            if beside and abs(r["h"] - lr["h"]) > 1.5:
                bissues.append(f"beside the logo but {r['h']:.0f} px tall vs logo {lr['h']:.0f}")
    add("Button", not bissues, "; ".join(bissues) or (f"{len(m['buttons'])} button(s) OK" if m["buttons"] else "no button"),
        "guidelines §11 rule 10, button README")

    bad_cards = [f"{c['rect']['w']:.0f}×{c['rect']['h']:.0f}" for c in m["cards"]
                 if abs(c["rect"]["w"] / c["rect"]["h"] - 5 / 7) > 0.02]
    add("Headshot cards 5:7", not bad_cards, "; ".join(bad_cards) or (f"{len(m['cards'])} card(s)" if m["cards"] else "no cards"),
        "headshot-card README")
    roles = [t for t in texts if t["role"] == "speaker-role"]
    if roles and m["canvas"].get("theme") != "light":
        add("Speaker roles on a pattern", "look", "if the speakers sit on a pattern, qd-on-pattern must be set: "
            + ("set" if m["canvas"].get("onPattern") else "NOT set"), "headshot-card README")

    ov = []
    for i, a in enumerate(texts):
        for b in texts[i + 1:]:
            if overlap(a["box"], b["box"]) > 0.2:
                ov.append(f"\"{a['text'][:12]}\" × \"{b['text'][:12]}\"")
    big = W * H * 0.6
    fg_imgs = [i for i in m["images"] if i["rect"]["w"] * i["rect"]["h"] < big and i not in m["logos"]]
    for img in fg_imgs:
        if "headshot" in img["cls"]:
            continue
        for t in texts:
            if overlap(img["rect"], t["rect"]) > 0.05 and not t["role"].startswith("speaker"):
                ov.append(f"image {os.path.basename(img['src'])} × \"{t['text'][:12]}\"")
    add("No overlaps", not ov, "none" if not ov else "; ".join(ov[:4]), "checks.md, No overlaps")

    if m.get("icons"):
        palettes = icon_colors()
        probs = []
        for ic in m["icons"]:
            r = ic["rect"]
            light = ic.get("onLightCard") or (m["canvas"] or {}).get("theme") == "light"
            allowed = palettes["light" if light else "dark"]
            where = f"icon at {round(r['x'])},{round(r['y'])}"
            if not ic["isIcon"]:
                probs.append(f"{where}: an SVG without .qd-icon")
            if ic["inButton"]:
                probs.append(f"{where}: in a button")
            if abs(r["w"] - r["h"]) > 1:
                probs.append(f"{where}: stretched ({r['w']:.0f}×{r['h']:.0f})")
            if ic["viewBox"] != "0 0 24 24" or ic["filled"]:
                probs.append(f"{where}: not Lucide's outline (viewBox {ic['viewBox']}, filled={ic['filled']})")
            if ic["nonScaling"]:
                probs.append(f"{where}: stroke doesn't scale")
            if ic["transform"] not in ("none", "") or ic["filter"] not in ("none", "") or ic["boxShadow"] not in ("none", ""):
                probs.append(f"{where}: rotated or with effects")
            if ic["textSize"] and abs(r["h"] - ic["textSize"]) > 1.5:
                probs.append(f"{where}: {r['h']:.0f} px, its text is {ic['textSize']:.0f} px")
            col = rgb(ic["stroke"] if ic["stroke"].startswith("rgb") else ic["color"])
            name = next((k for k, v in allowed.items() if v == col), None)
            if not name:
                probs.append(f"{where}: color rgb{col} isn't an allowed {'500' if light else '400'}")
            if bg is not None:
                box = (max(0, int(r["x"])), max(0, int(r["y"])), min(W, int(r["x"] + r["w"])), min(H, int(r["y"] + r["h"])))
                if box[2] > box[0] and box[3] > box[1]:
                    cs_ = sorted(contrast(col, p) for p in list(bg.crop(box).getdata())[::5])
                    c5 = cs_[int(len(cs_) * 0.05)]
                    if c5 < 3:
                        probs.append(f"{where}: contrast {c5:.2f} < 3")
        add("Icons", not probs, "; ".join(probs[:4]) or f"{len(m['icons'])} icon(s) OK", "brand-assets/icons README")

    missing = [os.path.basename(i["src"]) for i in m["images"] if not i["loaded"]]
    fonts = [f for f in m.get("fontsUsed", []) if f in m["fonts"] and not m["fonts"][f]]
    add("Images and fonts load", not missing and not fonts,
        "all loaded" if not (missing or fonts) else "; ".join(missing + fonts), "checks.md, Images load")
    return res


LOOK = ["Hierarchy: one clear title, calm supporting text, nothing competing",
        "Spread: top block and bottom block, nothing crowded at the top with emptiness below",
        "Crops: heads and shoulders as in the headshot rules, nothing cut badly",
        "Text sits on a calm area of any pattern",
        "Right logo version for the background (Dark / White / Light)",
        "One hero; no eyebrow or series (until the badge); no made-up content",
        "Icons are real Lucide icons, not redrawn (no files in the repo to compare against)",
        "Pattern: the right one for the tone and layout (light card: Color-Sliced-Pattern-B only; Color-Sliced-A only with headshots)",
        "Pattern mask: used when the preset's textMask says so, soft and with no visible edge",
        "Qbot rules (guidelines section 6): placement, crop, glow, never before the text",
        "Button in a corner: beside the logo only with a full-width text block, otherwise last in the text block"]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="+")
    ap.add_argument("--md", default=None)
    a = ap.parse_args()
    rules = load_rules()
    files = sorted(f for p in a.files for f in glob.glob(p) if f.endswith(".json"))
    all_res, lines, fails = {}, [], 0
    for f in files:
        m = json.load(open(f))
        if not isinstance(m, dict) or "target" not in m:
            continue  # not a render.py measurement (e.g. an earlier report)
        res = check_one(m, rules)
        name = os.path.basename(f)[:-5]
        all_res[name] = res
    names = list(all_res)
    checks = [r["check"] for r in all_res[names[0]]] if names else []
    for n in names:
        for r in all_res[n]:
            if r["check"] not in checks:
                checks.append(r["check"])
    lines.append("| Check | " + " | ".join(names) + " |")
    lines.append("|---|" + "---|" * len(names))
    for c in checks:
        row = []
        for n in names:
            r = next((x for x in all_res[n] if x["check"] == c), None)
            if not r:
                row.append("–"); continue
            mark = {"pass": "✅", "fail": "❌"}.get(r["result"], "👀")
            fails += r["result"] == "fail"
            row.append(mark)
        lines.append(f"| {c} | " + " | ".join(row) + " |")
    lines.append("")
    lines.append("## Details")
    for n in names:
        lines.append(f"\n**{n}**")
        for r in all_res[n]:
            if r["result"] != "pass":
                lines.append(f"- {r['check']} ({r['result']}): {r['detail']}  _[{r['rule']}]_")
    lines.append("\n## Look at it yourself\n")
    lines += [f"- [ ] {x}" for x in LOOK]
    md = "\n".join(lines)
    print(md)
    if a.md:
        open(a.md, "w").write(md + "\n")
        json.dump(all_res, open(os.path.splitext(a.md)[0] + ".json", "w"), indent=1)
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
