"""Build a print-ready sticker: CMYK PDF/X-4 with an Artwork layer and a CutContour layer, a proof and the checks.
Rules: guidelines/print/stickers.md. Settings: guidelines/print/stickers.tokens.json.

  python3 review/sticker/sticker.py contour IMAGE.png --out DIR --name SLUG [--width 80] [--region EU|US|both]
         [--avoid x0,y0,x1,y1 ...]     focal areas in image px the logo must stay off (face, hands, light)
  python3 review/sticker/sticker.py shape IMAGE.png --shape circle|oval|square|rectangle|rounded --size 70[x70]
         --out DIR --name SLUG [--subject MASK.png] [--region EU|US|both]

contour: IMAGE is the subject already cut out (RGBA). shape: IMAGE is the full image; MASK is the subject
(white on black). Without --subject the tool tries rembg (u2net). Work outside the repo: --out is a folder
outside it. Mechanics only: every size, step and limit comes from the tokens file."""
import argparse, json, math, os, sys, shutil, subprocess, urllib.request
import numpy as np, cv2
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import geom, logo as logolib, pdfx  # noqa: E402
from geom import R  # noqa: E402

TOK = json.load(open(os.path.join(REPO, 'guidelines/print/stickers.tokens.json')))
V = lambda d: d['$value'] if isinstance(d, dict) and '$value' in d else d
NEUTRAL_950 = (7, 11, 17)
RICH_BLACK = (0.40, 0.0, 0.0, 1.0)
CACHE = os.path.expanduser('~/.cache/qdrant-stickers')


# ---------- shared ----------
def profiles(region):
    regions = ['EU', 'US'] if region == 'both' else [region]
    out = {}
    os.makedirs(CACHE, exist_ok=True)
    for r in regions:
        c = TOK['color'][r]
        path = os.path.join(CACHE, os.path.basename(c['url']))
        if not os.path.exists(path):
            req = urllib.request.Request(c['url'], headers={'User-Agent': 'Mozilla/5.0 (qdrant-brand-kit)'})
            with urllib.request.urlopen(req, timeout=60) as resp, open(path, 'wb') as f:
                f.write(resp.read())
        out[r] = (path, c['profile'])
    return out


def lum(c):
    v = c / 255.0
    v = np.where(v <= 0.03928, v / 12.92, ((v + 0.055) / 1.055) ** 2.4)
    return 0.2126 * v[..., 0] + 0.7152 * v[..., 1] + 0.0722 * v[..., 2]


def contrast(fg, bg):
    lf = lum(np.array(fg, float)[None, :])[0]
    lb = lum(bg.astype(float))
    return (np.maximum(lf, lb) + 0.05) / (np.minimum(lf, lb) + 0.05)


def flatten(subpaths, tx, n=12):
    a, b, c, d, e, f = tx
    T = lambda x, y: (a * x + c * y + e, b * x + d * y + f)
    polys = []
    for sp in subpaths:
        pts, cur = [], None
        for op in sp:
            if op[0] == 'm':
                if len(pts) > 2: polys.append(pts)
                cur = (op[1], op[2]); pts = [T(*cur)]
            elif op[0] == 'l':
                cur = (op[1], op[2]); pts.append(T(*cur))
            elif op[0] == 'c':
                p0, p1, p2, p3 = cur, (op[1], op[2]), (op[3], op[4]), (op[5], op[6])
                for k in range(1, n + 1):
                    t = k / n; u = 1 - t
                    pts.append(T(u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
                                 u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]))
                cur = p3
        if len(pts) > 2: polys.append(pts)
    return polys


def is_mark(sp):
    return max(o[1] for o in sp if o[0] != 'h') < 75   # the brandmark: the left 70 of the logo's 300 units


def write_all(page_fn, out_dir, name, prof, trim, bleed, report):
    files = []
    cut = TOK['cut']
    for region, (icc, cond) in prof.items():
        page = page_fn(icc)
        out = os.path.join(out_dir, f'{name}_{region}.pdf')
        pdfx.write(page, out, icc, cond, f'{name} ({region})', trim=trim, bleed=bleed,
                   spot=V(cut['spotName']), spot_cmyk=tuple(cut['spotCmyk']))
        files.append(out)
    report['files'] = files
    report['pdf_checks'] = [verify(f) for f in files]
    proof(files[0], os.path.join(out_dir, f'{name}-proof.png'))
    json.dump(report, open(os.path.join(out_dir, f'{name}_report.json'), 'w'), indent=2, default=float)
    md = [f'# {name}', '', '| Check | Result |', '| --- | --- |']
    for k, v in report['checks'].items():
        md.append(f"| {k} | {'✅' if v else '❌'} |")
    for c in report['pdf_checks']:
        md.append(f"| {os.path.basename(c['file'])}: CMYK only, {V(cut['spotName'])} layer, PDF/X-4 | {'✅' if c['ok'] else '❌'} |")
    md += ['', '```json', json.dumps(report.get('info', {}), indent=2, default=float), '```']
    open(os.path.join(out_dir, f'{name}-sticker.md'), 'w').write('\n'.join(md) + '\n')
    return report


def verify(path):
    import pikepdf
    raw = open(path, 'rb').read()
    pdf = pikepdf.open(path)
    body = raw + b''.join(o.read_bytes()[:200000] for o in pdf.objects
                          if isinstance(o, pikepdf.Stream) and o.get('/Subtype') != '/Image')
    spot = V(TOK['cut']['spotName']).encode()
    r = dict(file=path, rgb=body.count(b'DeviceRGB'), spot=(b'/' + spot) in body, separation=b'/Separation' in body,
             pdfx=b'GTS_PDFX' in body and b'PDF/X-4' in body, fonts=b'/Font' in body)
    r['ok'] = r['rgb'] == 0 and r['spot'] and r['separation'] and r['pdfx'] and not r['fonts']
    return r


def proof(pdf, out_png):
    """Art at 200 dpi with the cut drawn thick; needs pdftoppm and Ghostscript, skipped if missing."""
    if not shutil.which('pdftoppm') or not shutil.which('gs'):
        return
    tmp = out_png[:-4]
    subprocess.run(['pdftoppm', '-r', '200', '-png', '-singlefile', pdf, tmp + '-art'], check=True)
    subprocess.run(['gs', '-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=tiffsep', '-r200', f'-sOutputFile={tmp}-sep.tif', pdf], check=True)
    art = Image.open(tmp + '-art.png').convert('RGB')
    spot = V(TOK['cut']['spotName'])
    plate = np.array(Image.open(f'{tmp}-sep({spot}).tif').convert('L').resize(art.size))
    ink = plate < 128 if plate.mean() > 128 else plate > 128
    thick = cv2.dilate(ink.astype(np.uint8) * 255, np.ones((7, 7), np.uint8)) > 0
    a = np.array(art); a[thick] = (236, 0, 140)
    Image.fromarray(a).save(out_png)
    Image.fromarray(np.where(cv2.dilate(ink.astype(np.uint8) * 255, np.ones((3, 3), np.uint8))[..., None] > 0,
                             np.array([236, 0, 140], np.uint8), np.array([255, 255, 255], np.uint8))).save(tmp + '-cut.png')
    for f in os.listdir(os.path.dirname(out_png) or '.'):
        if f.startswith(os.path.basename(tmp) + '-sep'):
            os.remove(os.path.join(os.path.dirname(out_png) or '.', f))


# ---------- contour ----------
def logo_tx(center, up, h, lw=300.0, lh=80.0):
    s = h / lh
    right = np.array([-up[1], up[0]]); down = -np.array(up)
    a, b = right * s; c, d = down * s
    return (a, b, c, d, center[0] - (lw / 2 * a + lh / 2 * c), center[1] - (lw / 2 * b + lh / 2 * d))


def raster(polys, shape):
    m = np.zeros(shape, np.uint8)
    for p in polys:
        cv2.fillPoly(m, [np.round(np.array(p) * R).astype(np.int32)], 255)
    return m


def contour(img_path, out_dir, name, width, prof, avoid_px):
    C = TOK['contour']
    b, bl = V(C['border']), V(TOK['defaults']['bleed'])
    rgba = Image.open(img_path).convert('RGBA')
    iw, ih = rgba.size
    mmpp = width / iw; art_h = ih * mmpp
    ppi = iw / (width / 25.4)
    pad = 12.0
    shape = (int(round((art_h + 2 * pad) * R)), int(round((width + 2 * pad) * R)))
    a = np.array(rgba.getchannel('A').resize((int(width * R), int(art_h * R)), Image.BICUBIC))
    S = np.zeros(shape, np.uint8); o = int(pad * R)
    S[o:o + a.shape[0], o:o + a.shape[1]] = (a > 128) * 255
    S = geom.fill_holes(geom.largest(S, min_area_mm2=4))
    D0 = geom.fill_holes(geom.close(geom.dilate(S, b), 1.0))
    pts = geom.outline_points(D0, 0.25)

    lpaths, (lw, lh) = logolib.load(os.path.join(REPO, C['logo']['file']))
    h = max(V(TOK['logo']['minHeightMm']), V(TOK['logo']['widthShare']) * width * lh / lw)
    W = h * lw / lh
    k = int(round((W / 2 + b) / 0.25))
    avoid = [tuple(v * mmpp + pad for v in box) for box in avoid_px]
    top, bot = pts[:, 1].min(), pts[:, 1].max()
    N = len(pts); cands = []
    inside = lambda p: 0 <= int(p[1] * R) < shape[0] and 0 <= int(p[0] * R) < shape[1] and D0[int(p[1] * R), int(p[0] * R)] > 0
    for i in range(0, N, 4):
        seg = pts[np.arange(i - k, i + k + 1) % N]
        mu = seg.mean(0)
        _, sv, vt = np.linalg.svd(seg - mu)
        t = vt[0]; nrm = np.array([-t[1], t[0]])
        resid = sv[1] / math.sqrt(len(seg))
        if np.ptp((seg - mu) @ t) < 0.85 * (W + 2 * b):
            continue
        if inside(mu + nrm * 2) and not inside(mu - nrm * 2):
            nrm = -nrm
        elif inside(mu + nrm * 2) or not inside(mu - nrm * 2):
            continue
        if nrm[1] > 0.05:
            continue                         # the text would be upside down
        center = mu + nrm * ((0.5 - C['logo']['overlap']) * h - b)
        tx = logo_tx(center, nrm, h, lw, lh)
        polys = flatten([p for _, p, _ in lpaths], tx, 6)
        Lb = geom.dilate(raster(polys, shape), b)
        hit = False
        for gx0, gy0, gx1, gy1 in avoid:
            box = np.zeros(shape, np.uint8)
            cv2.rectangle(box, (int(gx0 * R), int(gy0 * R)), (int(gx1 * R), int(gy1 * R)), 255, -1)
            if np.any((Lb > 0) & (box > 0)):
                hit = True; break
        if hit:
            continue
        upper = (center[1] - top) / (bot - top)
        cands.append((resid * 2 + upper * 4.0, center, nrm, tx, resid))
    if not cands:
        raise SystemExit('No stretch of the outline fits the logo')
    _, center, nrm, tx, resid = min(cands, key=lambda c: c[0])
    ang = -math.degrees(math.atan2(nrm[0], -nrm[1]))
    polys = flatten([p for _, p, _ in lpaths], tx, 12)
    L = raster(polys, shape)
    LB = geom.fill_holes(geom.dilate(L, b))
    D = geom.largest(geom.fill_holes(geom.close(cv2.bitwise_or(D0, LB), V(C['closeMm']))))

    dist = cv2.distanceTransform((D > 0).astype(np.uint8), cv2.DIST_L2, 5) / R
    edgeS = cv2.morphologyEx(S, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)) > 0
    lost, gained = geom.min_inside_radius(D, V(C['minDetailMm']))
    bms, bml = float(dist[edgeS].min()), float(dist[L > 0].min())
    checks = {
        'Image 300 ppi at the printed size': bool(ppi >= V(TOK['defaults']['minPpi'])),
        'Artwork inside the cut': bool(np.all(D[S > 0] > 0)),
        'Logo inside the cut': bool(np.all(D[L > 0] > 0)),
        f'Border at least {b - 0.1:.1f} mm around the subject': bool(bms >= b - 0.1),
        f'Border at least {b - 0.1:.1f} mm around the logo': bool(bml >= b - 0.1),
        'No inside corners or necks tighter than 1 mm': bool(lost < 0.5 and gained < 0.5),
        'One closed cut path': len(cv2.findContours(D, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0]) == 1,
        'Logo upright (never upside down)': bool(nrm[1] <= 0.05),
    }
    ys, xs = np.nonzero(D)
    x0, x1, y0, y1 = xs.min() / R, (xs.max() + 1) / R, ys.min() / R, ys.max() / R
    X0, Y0 = x0 - bl, y0 - bl
    pw, ph = (x1 - x0) + 2 * bl, (y1 - y0) + 2 * bl
    shift = lambda subs: [[(op[0],) + tuple(v - (X0 if j % 2 == 0 else Y0) for j, v in enumerate(op[1:])) for op in sp] for sp in subs]
    die, bleedp, lbp = shift(geom.trace(D)), shift(geom.trace(geom.dilate(D, bl))), shift(geom.trace(LB))
    ltx = list(tx); ltx[4] -= X0; ltx[5] -= Y0
    alpha = rgba.getchannel('A')

    def page(icc):
        p = pdfx.Page(pw, ph)
        p.fill(bleedp, (0, 0, 0, 0))
        p.fill(die, (0, 0, 0, 0))
        p.image(pdfx.to_cmyk_image(rgba.convert('RGB'), icc), alpha, pad - X0, pad - Y0, width, art_h)
        p.fill(lbp, (0, 0, 0, 0))
        for hexc, sp, _ in lpaths:
            p.fill([sp], (0, 0, 0, 1) if hexc.lower() == '#0b0f19' else pdfx.to_cmyk_color(hexc, icc), tuple(ltx))
        p.cutline(die, V(TOK['cut']['strokePt']))
        return p
    info = dict(kind='contour', cut_mm=[round(x1 - x0, 1), round(y1 - y0, 1)], ppi=round(ppi), logo_mm=[round(W, 1), round(h, 1)],
                logo_angle_deg=round(ang, 1), border_min_mm=[round(bms, 2), round(bml, 2)], outline_straightness_mm=round(resid, 2))
    return write_all(page, out_dir, name, prof, (bl, bl, bl + x1 - x0, bl + y1 - y0), (0, 0, pw, ph),
                     dict(checks=checks, info=info))


# ---------- predefined shapes ----------
K = 0.5523


def ellipse_path(cx, cy, rx, ry):
    kx, ky = K * rx, K * ry
    return [[('m', cx + rx, cy), ('c', cx + rx, cy + ky, cx + kx, cy + ry, cx, cy + ry),
             ('c', cx - kx, cy + ry, cx - rx, cy + ky, cx - rx, cy), ('c', cx - rx, cy - ky, cx - kx, cy - ry, cx, cy - ry),
             ('c', cx + kx, cy - ry, cx + rx, cy - ky, cx + rx, cy), ('h',)]]


def rect_path(x0, y0, x1, y1, r=0.0):
    if r <= 0:
        return [[('m', x0, y0), ('l', x1, y0), ('l', x1, y1), ('l', x0, y1), ('h',)]]
    k = K * r
    return [[('m', x0 + r, y0), ('l', x1 - r, y0), ('c', x1 - r + k, y0, x1, y0 + r - k, x1, y0 + r),
             ('l', x1, y1 - r), ('c', x1, y1 - r + k, x1 - r + k, y1, x1 - r, y1), ('l', x0 + r, y1),
             ('c', x0 + r - k, y1, x0, y1 - r + k, x0, y1 - r), ('l', x0, y0 + r),
             ('c', x0, y0 + r - k, x0 + r - k, y0, x0 + r, y0), ('h',)]]


def edge_field(shape_px, pxmm, side, low, reach_mm):
    """One long, very soft gradient from the sticker's edge nearest the logo: smootherstep, no visible start or end."""
    H, W = shape_px
    y = np.arange(H)[:, None] / pxmm
    t = np.clip((y if side == 'top' else H / pxmm - y) / reach_mm, 0, 1)
    return np.repeat(low + (1 - low) * (t * t * t * (t * (6 * t - 15) + 10)), W, 1)


def shape_mask(kind, fw, fh, bleed, w, h, pxmm, inset, corner_r):
    m = Image.new('L', (int(fw * pxmm), int(fh * pxmm)), 0); d = ImageDraw.Draw(m)
    box = [(bleed + inset) * pxmm, (bleed + inset) * pxmm, (bleed + w - inset) * pxmm, (bleed + h - inset) * pxmm]
    if kind in ('circle', 'oval'):
        d.ellipse(box, fill=255)
    elif kind == 'rounded':
        d.rounded_rectangle(box, radius=max(0, corner_r - inset) * pxmm, fill=255)
    else:
        d.rectangle(box, fill=255)
    return np.array(m) > 0


def subject_mask(img_path, subject_path):
    if subject_path:
        return Image.open(subject_path).convert('L')
    try:
        from rembg import remove, new_session
    except ImportError:
        raise SystemExit('Pass --subject MASK.png, or install rembg to find the subject (pip install "rembg[cpu]")')
    return remove(Image.open(img_path).convert('RGB'), session=new_session('u2net'), only_mask=True)


def shape(img_path, out_dir, name, kind, size, prof, subject_path):
    P = TOK['shape']['presets'][kind]
    M = TOK['mask']
    w, h = size
    bleed, safe = V(TOK['defaults']['shapeBleed']), V(TOK['defaults']['safe'])
    corner_r = P.get('cornerRadius', 0.0)
    fw, fh = w + 2 * bleed, h + 2 * bleed
    src = Image.open(img_path).convert('RGB')
    subj_src = subject_mask(img_path, subject_path).resize(src.size)
    sr = fw / fh
    base_w, base_h = (src.height * sr, src.height) if src.width / src.height > sr else (src.width, src.width / sr)
    zmax = (base_w / (fw / 25.4)) / V(TOK['defaults']['minPpi'])
    if zmax < 1:
        raise SystemExit(f'The image holds only {round(base_w / (fw / 25.4))} ppi at this size: not doable for now')
    margin = max(0.08 * min(w, h), 1.5 * safe)
    cx, cy = fw / 2, fh / 2
    x0, y0, x1, y1 = bleed, bleed, bleed + w, bleed + h

    lpaths, (lw, lhh) = logolib.load(os.path.join(REPO, TOK['shape']['logo']['file']))
    logo_h = max(V(TOK['logo']['minHeightMm']), V(TOK['logo']['widthShare']) * w * lhh / lw)
    LW = logo_h * lw / lhh; s = logo_h / lhh
    if P['round']:
        rx, ry = w / 2 - margin, h / 2 - margin
        dy = ry * math.sqrt(max(0.0, 1 - ((LW / 2) / rx) ** 2))
        cands = [('center top', cx - LW / 2, cy - dy, 'top'), ('center bottom', cx - LW / 2, cy + dy - logo_h, 'bottom')]
    else:
        cands = [(f'{v} {hz}', x0 + margin if hz == 'left' else x1 - margin - LW,
                  y0 + margin if v == 'top' else y1 - margin - logo_h, v) for v in ('top', 'bottom') for hz in ('left', 'right')]

    PX = 8
    Wp, Hp = int(fw * PX), int(fh * PX)
    inside = shape_mask(kind, fw, fh, bleed, w, h, PX, 1.0, corner_r)

    def glyph_masks(lx, ly):
        out = {}
        for which in ('word', 'mark'):
            m = Image.new('L', (Wp, Hp), 0); d = ImageDraw.Draw(m)
            for _, sp, _ in lpaths:
                if is_mark(sp) == (which == 'mark'):
                    for poly in flatten([sp], (s, 0, 0, s, lx, ly), 8):
                        d.polygon([(px * PX, py * PX) for px, py in poly], fill=255)
            out[which] = np.array(m) > 0
        return out

    def frame(z, fx, fy):
        cw, ch = base_w / z, base_h / z
        l, t = (src.width - cw) * fx, (src.height - ch) * fy
        return (l, t, l + cw, t + ch)

    focal_share, max_strength = V(M['subjectFocal']), V(M['max'])
    steps = [st for st in V(M['steps']) if 1 - st <= max_strength + 1e-6]
    results = []
    for label, lx, ly, side in cands:
        gm = glyph_masks(lx, ly); glyphs = gm['word'] | gm['mark']
        best = None
        for z in [1.0] + list(np.arange(1.05, zmax + 1e-6, 0.05)):
            grid = [0.5] if z == 1.0 and abs(src.width / src.height - sr) < 1e-3 else [0.0, 0.25, 0.5, 0.75, 1.0]
            for fx in grid:
                for fy in grid:
                    box = frame(z, fx, fy)
                    sub = np.array(subj_src.crop(tuple(int(round(v)) for v in box)).resize((Wp, Hp))) > 128
                    if np.any(sub & glyphs):
                        continue
                    if sub.any() and np.count_nonzero(sub & ~inside) / np.count_nonzero(sub) > 0.03:
                        continue
                    ys_, xs_ = np.nonzero(sub)
                    gx = np.clip(xs_ / PX, lx, lx + LW) - xs_ / PX; gy = np.clip(ys_ / PX, ly, ly + logo_h) - ys_ / PX
                    dist = float(np.sqrt(gx * gx + gy * gy).min()) if len(xs_) else 99.0
                    key = (z, -round(dist, 1), abs(fx - 0.5) + abs(fy - 0.5))
                    if best is None or key < best[0]:
                        best = (key, z, box, sub)
            if best is not None:
                break
        if best is None:
            results.append(dict(position=label, ok=False, why='no framing keeps the logo off the subject'))
            continue
        _, z, box, sub = best
        sim = np.array(src.crop(tuple(int(round(v)) for v in box)).resize((Wp, Hp), Image.LANCZOS)).astype(float)
        focal = sub.copy()
        ysr = np.nonzero(sub.any(1))[0]
        if len(ysr):
            focal[int(ysr.min() + focal_share * (ysr.max() - ysr.min())):, :] = False
        reach = None
        for rf in np.arange(V(M['reachMax']), 0.39, -0.05):
            vv = edge_field((Hp, Wp), PX, side, 0.0, rf * fh)
            if not focal.any() or float((1 - vv)[focal].mean()) <= 0.01:
                reach = rf * fh; break
        reach = reach or 0.4 * fh
        Lw = lum(sim) ** 0.5
        tried, chosen = [], None
        for low in steps:
            v = edge_field((Hp, Wp), PX, side, low, reach)
            comp = sim * v[..., None] + np.array(NEUTRAL_950) * (1 - v[..., None])
            cw_ = float(np.percentile(contrast((255, 255, 255), comp[gm['word']]), 5))
            cb_ = float(np.percentile(contrast((255, 255, 255), comp[gm['mark']]), 5))
            dim = float((1 - v)[focal].mean()) if focal.any() else 0.0
            hidden = float(((1 - v) * Lw).sum() / Lw.sum())
            ok = cw_ >= TOK['logo']['contrastWordmark'] and cb_ >= TOK['logo']['contrastBrandmark'] and dim <= 0.01
            tried.append(dict(strength=round(1 - low, 2), wordmark=round(cw_, 2), brandmark=round(cb_, 2),
                              head_torso_dimmed=round(dim, 3), picture_hidden=round(hidden, 3), ok=ok))
            if ok:
                chosen = low; break
        results.append(dict(position=label, side=side, x=lx, y=ly, ok=chosen is not None, low=chosen, reach=reach,
                            zoom=round(float(z), 2), box=[round(float(v)) for v in box],
                            ppi=round((box[2] - box[0]) / (fw / 25.4)), tried=tried,
                            hidden=tried[-1]['picture_hidden'] if chosen is not None else None))
    order = [r['position'] for r in results]
    ok = [r for r in results if r['ok']]
    if not ok:
        raise SystemExit('No logo position passes at up to 80% mask: generate the image again with calm space for the logo\n'
                         + json.dumps(results, indent=1, default=float))
    best = sorted(ok, key=lambda r: (round(r['hidden'], 3), r['zoom'], order.index(r['position'])))[0]

    img = src.crop(tuple(best['box']))
    pxmm_img = img.width / fw
    if kind in ('circle', 'oval'):
        cut, clip = ellipse_path(cx, cy, w / 2, h / 2), ellipse_path(cx, cy, w / 2 + bleed, h / 2 + bleed)
    elif kind == 'rounded':
        cut, clip = rect_path(x0, y0, x1, y1, corner_r), rect_path(0, 0, fw, fh, corner_r + bleed)
    else:
        cut, clip = rect_path(x0, y0, x1, y1), rect_path(0, 0, fw, fh)
    low = best['low']
    alpha = None
    if low < 1.0:
        alpha = Image.fromarray((edge_field((img.height, img.width), pxmm_img, best['side'], low, best['reach']) * 255)
                                .round().astype(np.uint8), 'L')

    def page(icc):
        p = pdfx.Page(fw, fh)
        if alpha is not None:
            p.fill(clip, RICH_BLACK)
        p.image(pdfx.to_cmyk_image(img, icc), alpha, 0, 0, fw, fh, clip=clip)
        for _, sp, _ in lpaths:
            p.fill([sp], (0, 0, 0, 0), (s, 0, 0, s, best['x'], best['y']))
        p.cutline(cut, V(TOK['cut']['strokePt']))
        return p
    t = best['tried'][-1]
    checks = {
        'Image 300 ppi at the printed size': best['ppi'] >= V(TOK['defaults']['minPpi']),
        'Logo off the subject; the subject inside the cut': True,
        'Logo contrast: wordmark 4.5:1, brandmark 3:1': bool(t['ok']),
        "Mask doesn't darken the subject's head, torso or hands": t['head_torso_dimmed'] <= 0.01,
        'Mask at most 80% at the edge': (1 - low) <= max_strength + 1e-6,
        'One closed cut path': True,
    }
    info = dict(kind=kind, size_mm=[w, h], logo_position=best['position'], zoom=best['zoom'], ppi=best['ppi'],
                mask='none' if low == 1.0 else f"{round((1 - low) * 100)}% at the {best['side']} edge, fading over {round(best['reach'])} mm",
                contrast=dict(wordmark=t['wordmark'], brandmark=t['brandmark']), positions=results)
    return write_all(page, out_dir, name, prof, (x0, y0, x1, y1), (0, 0, fw, fh), dict(checks=checks, info=info))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('kind', choices=['contour', 'shape'])
    ap.add_argument('image')
    ap.add_argument('--out', required=True)
    ap.add_argument('--name', required=True)
    ap.add_argument('--region', default='both', choices=['EU', 'US', 'both'])
    ap.add_argument('--width', type=float, default=80.0, help='contour: printed width of the subject image, mm')
    ap.add_argument('--avoid', action='append', default=[], help='contour: x0,y0,x1,y1 in image px, the logo stays off it')
    ap.add_argument('--shape', default='circle', choices=list(TOK['shape']['presets']))
    ap.add_argument('--size', default='70', help='shape: mm, 70 or 70x50')
    ap.add_argument('--subject', help='shape: subject mask (white on black), same size as the image')
    a = ap.parse_args()
    if os.path.abspath(a.out).startswith(REPO + os.sep):
        raise SystemExit('Write outside the repo (AGENTS.md, Never)')
    os.makedirs(a.out, exist_ok=True)
    prof = profiles(a.region)
    if a.kind == 'contour':
        rep = contour(a.image, a.out, a.name, a.width, prof, [tuple(float(v) for v in s.split(',')) for s in a.avoid])
    else:
        sz = [float(v) for v in a.size.lower().split('x')]
        rep = shape(a.image, a.out, a.name, a.shape, (sz[0], sz[-1]), prof, a.subject)
    bad = [k for k, v in rep['checks'].items() if not v] + [os.path.basename(c['file']) for c in rep['pdf_checks'] if not c['ok']]
    print(json.dumps(dict(checks=rep['checks'], files=rep['files'], failed=bad), indent=2, default=float))
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
