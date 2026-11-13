#!/usr/bin/env python3
"""Render a creative at exact sizes and measure it.

Usage:
  python3 review/render.py page.html --sizes 1080x1080,1080x1350,1080x1920 --out OUT_DIR [--name alt-1]

For each size it writes OUT_DIR/<name>-<shape>.png (exactly W x H) and OUT_DIR/<name>-<shape>.json
(what review/measure.js found on the page), plus <name>-<shape>.bg.png (the same render with the text
hidden, for the contrast check). Then run review/check.py on the JSON files.

How it serves the page (no files are copied anywhere):
  /          -> the folder that holds page.html (or --root)
  /repo/...  -> this repo, so pages load  /repo/guidelines/layout/layout.css  etc.
               (a page one folder deeper can also use ../repo/...)
  /review/... -> this folder; /review/measure.js is added to every page automatically

The page gets ?w=W&h=H. guidelines/layout/canvas.js reads them, so the shape is always right,
whatever size Chrome gives the window. Mechanics only: no brand values live in this script.
Needs Google Chrome and Pillow (pip install pillow).
"""
import urllib.parse
import argparse, functools, http.server, json, os, re, socketserver, subprocess, sys, tempfile, threading

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TOOLS = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(TOOLS)
SHAPES = [(3, "ultrawide"), (1.4, "wide"), (0.85, "square"), (0.65, "portrait"), (0, "story")]  # same as canvas.js
EXTRA_H = 300  # headless Chrome lays pages out shorter than the window: open it taller, then crop


def shape_for(w, h):
    r = w / h
    if r > 3:
        return "ultrawide"
    for lim, name in SHAPES[1:]:
        if r >= lim:
            return name
    return "story"


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def translate_path(self, path):
        p = urllib.parse.unquote(path.split("?", 1)[0].split("#", 1)[0])  # e.g. MonaSansVF%5Bwdth...%5D.ttf
        for prefix, root in (("/repo/", REPO), ("/review/", TOOLS)):
            if p.startswith(prefix):
                return os.path.join(root, p[len(prefix):])
        return os.path.join(self.server.page_root, p.lstrip("/"))

    def send_head(self):
        path = self.translate_path(self.path)
        if path.endswith(".html") and os.path.isfile(path):
            html = open(path, encoding="utf-8").read()
            tag = '<script src="/review/measure.js"></script>'
            html = html.replace("</body>", tag + "</body>") if "</body>" in html else html + tag
            data = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            import io
            return io.BytesIO(data)
        return super().send_head()


def serve(page_root):
    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), Handler)
    srv.daemon_threads = True
    srv.page_root = page_root
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def chrome(args):
    return subprocess.run([CHROME, "--headless=new", "--hide-scrollbars", "--disable-gpu",
                           "--virtual-time-budget=6000", *args],
                          capture_output=True, text=True, timeout=120)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("page")
    ap.add_argument("--sizes", default="1080x1080,1080x1350,1080x1920")
    ap.add_argument("--out", required=True)
    ap.add_argument("--name", default=None)
    ap.add_argument("--params", default="", help="extra query parameters for the page, e.g. 'alt=2&photo=b'")
    ap.add_argument("--root", default=None, help="folder served at / (default: the page's folder). "
                    "Use it when the page loads files from a parent folder, e.g. ../inputs/photo.png")
    a = ap.parse_args()
    try:
        from PIL import Image
    except ImportError:
        sys.exit("Needs Pillow: pip install pillow")
    if not os.path.exists(CHROME):
        sys.exit("Google Chrome not found at " + CHROME)
    page = os.path.abspath(a.page)
    if not os.path.isfile(page):
        sys.exit("Page not found: " + page)
    name = a.name or os.path.splitext(os.path.basename(page))[0]
    os.makedirs(a.out, exist_ok=True)
    root = os.path.abspath(a.root) if a.root else os.path.dirname(page)
    if not page.startswith(root + os.sep):
        sys.exit("--root must contain the page")
    srv = serve(root)
    rel = os.path.relpath(page, root).replace(os.sep, "/")
    port = srv.server_address[1]
    ok = True
    for size in a.sizes.split(","):
        w, h = (int(x) for x in size.lower().split("x"))
        shape = shape_for(w, h)
        url = f"http://127.0.0.1:{port}/{rel}?w={w}&h={h}" + ("&" + a.params.lstrip("&?") if a.params else "")
        png = os.path.join(a.out, f"{name}-{shape}.png")
        with tempfile.TemporaryDirectory() as tmp:
            raw = os.path.join(tmp, "raw.png")
            chrome([f"--window-size={w},{h + EXTRA_H}", f"--screenshot={raw}", url])
            if not os.path.exists(raw):
                print(f"{size}: Chrome made no screenshot", file=sys.stderr); ok = False; continue
            im = Image.open(raw)
            if im.width < w or im.height < h:
                print(f"{size}: screenshot too small ({im.size})", file=sys.stderr); ok = False; continue
            im.crop((0, 0, w, h)).save(png)
            # Second shot with all text made transparent: what sits behind the text, for the contrast check.
            chrome([f"--window-size={w},{h + EXTRA_H}", f"--screenshot={raw}", url + "&qd-bg=1"])
            Image.open(raw).crop((0, 0, w, h)).save(png[:-4] + ".bg.png")
        dom = chrome([f"--window-size={w},{h + EXTRA_H}", "--dump-dom", url]).stdout
        m = re.search(r'<script type="application/json" id="qd-measure">(.*?)</script>', dom, re.S)
        if not m:
            print(f"{size}: no measurements (did the page load measure.js?)", file=sys.stderr); ok = False; continue
        data = json.loads(m.group(1).replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&"))
        data.update(file=os.path.abspath(png), page=page, target={"w": w, "h": h, "shape": shape})
        with open(os.path.join(a.out, f"{name}-{shape}.json"), "w") as f:
            json.dump(data, f, indent=1)
        print(f"{png}  {w}x{h}  {shape}")
    srv.shutdown()
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
