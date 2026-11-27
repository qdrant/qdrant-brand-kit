"""Write a CMYK PDF/X-4 sticker with two layers: Artwork and the cut (a spot color, stroke only, overprint).
Everything is drawn in mm with y down and converted to PDF points here (guidelines/print/stickers.md section 6)."""
import zlib, datetime, uuid
import numpy as np
import pikepdf
from pikepdf import Name, Dictionary, Array, String
from PIL import Image, ImageCms

PT = 72 / 25.4


class Page:
    def __init__(self, w_mm, h_mm):
        self.w, self.h = w_mm, h_mm
        self.art = []      # content ops for Artwork layer
        self.cut = []      # content ops for CutContour layer
        self.images = []   # (name, pil_cmyk, pil_alpha or None)

    def _p(self, x, y):
        return f"{x * PT:.3f} {(self.h - y) * PT:.3f}"

    def path(self, subpaths, ops_list, tx=None):
        for sp in subpaths:
            for op in sp:
                if op[0] == 'm':
                    ops_list.append(f"{self._p(*self._t(tx, op[1], op[2]))} m")
                elif op[0] == 'l':
                    ops_list.append(f"{self._p(*self._t(tx, op[1], op[2]))} l")
                elif op[0] == 'c':
                    a = self._t(tx, op[1], op[2]); b = self._t(tx, op[3], op[4]); c = self._t(tx, op[5], op[6])
                    ops_list.append(f"{self._p(*a)} {self._p(*b)} {self._p(*c)} c")
                elif op[0] == 'h':
                    ops_list.append("h")

    @staticmethod
    def _t(tx, x, y):
        if tx is None:
            return x, y
        a, b, c, d, e, f = tx  # x' = a x + c y + e ; y' = b x + d y + f  (mm, y down)
        return a * x + c * y + e, b * x + d * y + f

    def fill(self, subpaths, cmyk, tx=None):
        self.art.append(f"{cmyk[0]:.4f} {cmyk[1]:.4f} {cmyk[2]:.4f} {cmyk[3]:.4f} k")
        self.path(subpaths, self.art, tx)
        self.art.append("f")

    def image(self, pil_cmyk, alpha, x, y, w, h, clip=None):
        name = f"Im{len(self.images)}"
        self.images.append((name, pil_cmyk, alpha))
        self.art.append("q")
        if clip:
            self.path(clip, self.art)
            self.art.append("W n")
        self.art.append(f"{w * PT:.3f} 0 0 {h * PT:.3f} {x * PT:.3f} {(self.h - y - h) * PT:.3f} cm /{name} Do")
        self.art.append("Q")

    def cutline(self, subpaths, stroke_pt=0.25):
        self.cut.append(f"/GSop gs /CSCut CS 1 SCN {stroke_pt} w 1 J 1 j")
        self.path(subpaths, self.cut)
        self.cut.append("S")


def write(page, out, icc_path, condition, title, trim=None, bleed=None, spot='CutContour', spot_cmyk=(0, 1, 0, 0)):
    pdf = pikepdf.new()
    W, H = round(float(page.w * PT), 3), round(float(page.h * PT), 3)
    trim = trim or (0, 0, page.w, page.h)
    bleed = bleed or trim
    def box(b):
        x0, y0, x1, y1 = b
        return Array([round(float(v), 3) for v in (x0 * PT, (page.h - y1) * PT, x1 * PT, (page.h - y0) * PT)])

    # spot colour CutContour: tint -> C0 M100 Y0 K0
    tint = Dictionary(FunctionType=2, Domain=[0, 1], C0=[0, 0, 0, 0], C1=list(spot_cmyk), N=1)
    cs_cut = Array([Name.Separation, Name('/' + spot), Name.DeviceCMYK, pdf.make_indirect(tint)])
    gs_op = Dictionary(Type=Name.ExtGState, OP=True, op=True, OPM=1)

    ocg_art = pdf.make_indirect(Dictionary(Type=Name.OCG, Name=String('Artwork')))
    ocg_cut = pdf.make_indirect(Dictionary(Type=Name.OCG, Name=String(spot)))

    xobjs = Dictionary()
    for name, im, alpha in page.images:
        raw = im.tobytes()
        d = Dictionary(Type=Name.XObject, Subtype=Name.Image, Width=im.width, Height=im.height,
                       ColorSpace=Name.DeviceCMYK, BitsPerComponent=8)
        st = pikepdf.Stream(pdf, zlib.compress(raw, 9))
        st.Filter = Name.FlateDecode
        for k, v in d.items():
            st[k] = v
        if alpha is not None:
            sm = pikepdf.Stream(pdf, zlib.compress(alpha.tobytes(), 9))
            sm.Filter = Name.FlateDecode
            for k, v in Dictionary(Type=Name.XObject, Subtype=Name.Image, Width=alpha.width, Height=alpha.height,
                                   ColorSpace=Name.DeviceGray, BitsPerComponent=8).items():
                sm[k] = v
            st.SMask = sm
        xobjs[Name('/' + name)] = pdf.make_indirect(st)

    content = ("/OC /ocArt BDC\n" + "\n".join(page.art) + "\nEMC\n"
               "/OC /ocCut BDC\nq\n" + "\n".join(page.cut) + "\nQ\nEMC\n")
    res = Dictionary(XObject=xobjs, ColorSpace=Dictionary(CSCut=cs_cut), ExtGState=Dictionary(GSop=gs_op),
                     Properties=Dictionary(ocArt=ocg_art, ocCut=ocg_cut))
    pg = pikepdf.Page(Dictionary(Type=Name.Page, MediaBox=Array([0, 0, W, H]), TrimBox=box(trim),
                                 BleedBox=box(bleed), Resources=res,
                                 Contents=pikepdf.Stream(pdf, content.encode())))
    pdf.pages.append(pg)

    pdf.Root.OCProperties = Dictionary(OCGs=[ocg_art, ocg_cut],
                                       D=Dictionary(Name=String('Default'), Order=[ocg_art, ocg_cut], ON=[ocg_art, ocg_cut]))
    icc = open(icc_path, 'rb').read()
    icc_st = pikepdf.Stream(pdf, icc); icc_st.N = 4
    pdf.Root.OutputIntents = [Dictionary(Type=Name.OutputIntent, S=Name.GTS_PDFX,
                                         OutputConditionIdentifier=String(condition), Info=String(condition),
                                         RegistryName=String('http://www.color.org'),
                                         DestOutputProfile=pdf.make_indirect(icc_st))]
    now = datetime.datetime.now(datetime.timezone.utc)
    with pdf.open_metadata(set_pikepdf_as_editor=False) as meta:
        meta['dc:title'] = title
        meta['pdfxid:GTS_PDFXVersion'] = 'PDF/X-4'
        meta['xmp:CreateDate'] = now.isoformat()
        meta['xmp:ModifyDate'] = now.isoformat()
        meta['xmp:MetadataDate'] = now.isoformat()
        meta['xmpMM:DocumentID'] = 'uuid:' + str(uuid.uuid4())
        meta['xmpMM:InstanceID'] = 'uuid:' + str(uuid.uuid4())
        meta['xmpMM:VersionID'] = '1'
        meta['xmpMM:RenditionClass'] = 'default'
        meta['pdf:Trapped'] = 'False'
        meta['pdf:Producer'] = 'qdrant-brand-kit review/sticker'
    ds = now.strftime("D:%Y%m%d%H%M%SZ")
    pdf.docinfo['/Title'] = title
    pdf.docinfo['/GTS_PDFXVersion'] = 'PDF/X-4'
    pdf.docinfo['/Trapped'] = Name('/False')
    pdf.docinfo['/CreationDate'] = ds
    pdf.docinfo['/ModDate'] = ds
    pdf.docinfo['/Producer'] = 'qdrant-brand-kit review/sticker'
    pdf.save(out, min_version='1.6', fix_metadata_version=False)


# ---------- colour ----------
_SRGB = ImageCms.createProfile('sRGB')


def to_cmyk_image(rgb_img, icc_path):
    prof = ImageCms.getOpenProfile(icc_path)
    tr = ImageCms.buildTransform(_SRGB, prof, 'RGB', 'CMYK', renderingIntent=ImageCms.Intent.PERCEPTUAL,
                                 flags=ImageCms.Flags.BLACKPOINTCOMPENSATION)
    return ImageCms.applyTransform(rgb_img.convert('RGB'), tr)


def to_cmyk_color(hexrgb, icc_path):
    """Spot colours of the logo: relative colorimetric through the printer profile, 0..1."""
    h = hexrgb.lstrip('#')
    im = Image.new('RGB', (1, 1), tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)))
    prof = ImageCms.getOpenProfile(icc_path)
    tr = ImageCms.buildTransform(_SRGB, prof, 'RGB', 'CMYK', renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC,
                                 flags=ImageCms.Flags.BLACKPOINTCOMPENSATION)
    c = ImageCms.applyTransform(im, tr).getpixel((0, 0))
    return tuple(round(v / 255, 3) for v in c)
