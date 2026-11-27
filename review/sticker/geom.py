"""Mask geometry for stickers: masks in mm space at R px/mm, potrace to curves."""
import numpy as np, cv2, potrace

R = 20  # px per mm for geometry masks


def disk(mm):
    r = max(1, int(round(mm * R)))
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))


def dilate(m, mm):
    return cv2.dilate(m, disk(mm))


def close(m, mm):
    return cv2.morphologyEx(m, cv2.MORPH_CLOSE, disk(mm))


def open_(m, mm):
    return cv2.morphologyEx(m, cv2.MORPH_OPEN, disk(mm))


def fill_holes(m):
    cs, h = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    out = np.zeros_like(m)
    cv2.drawContours(out, cs, -1, 255, -1)
    return out


def largest(m, min_area_mm2=0):
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n <= 1:
        return m
    keep = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] >= min_area_mm2 * R * R]
    if not min_area_mm2:
        keep = [1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))]
    return np.isin(lab, keep).astype(np.uint8) * 255


def outline_points(m, step_mm=0.25):
    """Outer contour of a mask, resampled every step_mm. Returns Nx2 array in mm (x right, y down)."""
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea)[:, 0, :].astype(float) / R
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(np.vstack([c, c[:1]]), axis=0).T))]
    total = d[-1]
    s = np.arange(0, total, step_mm)
    cc = np.vstack([c, c[:1]])
    x = np.interp(s, d, cc[:, 0]); y = np.interp(s, d, cc[:, 1])
    return np.c_[x, y]


def trace(m, opttol=0.2, alphamax=1.0):
    """Potrace a mask; returns list of closed subpaths of ('m'|'l'|'c', ...) in mm (y down)."""
    bm = potrace.Bitmap(m <= 127)  # potracer traces False pixels
    pl = bm.trace(turdsize=int(0.5 * R * R), alphamax=alphamax, opticurve=True, opttolerance=opttol)
    subs = []
    for curve in pl:
        sp = curve.start_point
        ops = [('m', sp.x / R, sp.y / R)]
        for seg in curve.segments:
            if seg.is_corner:
                ops.append(('l', seg.c.x / R, seg.c.y / R))
                ops.append(('l', seg.end_point.x / R, seg.end_point.y / R))
            else:
                ops.append(('c', seg.c1.x / R, seg.c1.y / R, seg.c2.x / R, seg.c2.y / R,
                            seg.end_point.x / R, seg.end_point.y / R))
        ops.append(('h',))
        subs.append(ops)
    return subs


def min_inside_radius(m, mm=1.0):
    """Area (mm2) the die shape loses to an opening of radius mm: sharp outward spikes and thin necks.
    And area gained by closing: notches tighter than mm. Both should be ~0 for a clean cut."""
    o = open_(m, mm); c = close(m, mm)
    lost = np.count_nonzero((m > 0) & (o == 0)) / R / R
    gained = np.count_nonzero((c > 0) & (m == 0)) / R / R
    return lost, gained
