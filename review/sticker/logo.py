"""Load a brand logo SVG as filled paths: list of (rgb hex, [subpaths of PDF ops in logo units])."""
from svgelements import SVG, Path, Shape, Move, Line, CubicBezier, QuadraticBezier, Arc, Close, Group
def load(svg_file):
    svg = SVG.parse(svg_file, reify=True)
    out = []
    for el in svg.elements():
        if not isinstance(el, Shape): continue
        # skip clipPath/defs geometry
        p = el
        skip = False
        while p is not None:
            if getattr(p, 'values', {}).get('tag') in ('clipPath', 'defs'): skip = True
            p = getattr(p, 'parent', None) if hasattr(p, 'parent') else None
        if skip: continue
        fill = el.fill
        if fill is None or fill.value is None: continue
        path = Path(el)
        path.reify()
        segs = []
        for s in path.segments():
            if isinstance(s, Move): segs.append(('m', s.end.x, s.end.y))
            elif isinstance(s, Line): segs.append(('l', s.end.x, s.end.y))
            elif isinstance(s, Close): segs.append(('h',))
            elif isinstance(s, CubicBezier): segs.append(('c', s.control1.x, s.control1.y, s.control2.x, s.control2.y, s.end.x, s.end.y))
            elif isinstance(s, QuadraticBezier):
                p0 = s.start; c = s.control; e = s.end
                c1 = (p0.x + 2/3*(c.x-p0.x), p0.y + 2/3*(c.y-p0.y)); c2 = (e.x + 2/3*(c.x-e.x), e.y + 2/3*(c.y-e.y))
                segs.append(('c', c1[0], c1[1], c2[0], c2[1], e.x, e.y))
            elif isinstance(s, Arc):
                for cb in s.as_cubic_curves():
                    segs.append(('c', cb.control1.x, cb.control1.y, cb.control2.x, cb.control2.y, cb.end.x, cb.end.y))
        out.append((fill.hex[:7], segs, el.values.get('id')))
    return out, (svg.width, svg.height)
if __name__ == '__main__':
    import sys
    paths, size = load(sys.argv[1]); print(size)
    for h, s, i in paths: print(h, len(s), i)
