#!/usr/bin/env python3
"""Render figure crops for a 2023 DPC paper from _dpc2023_<slug>.json.

For every question with a 'crop' field, render its page band and:
  - whiten saturated red/green pixels LEFT of XCUT  -> answer tick/cross markers gone
  - blacken saturated red/green pixels AT/AFTER XCUT -> option numbers stay visible
    but colour-neutral (no answer leak)
  - whiten faint green watermark
Then trim surrounding whitespace. Output: <date-slug>-q-<n>.png in <outdir>.

Usage: python scripts/_crop_dpc2023.py <slug> <date-slug> <outdir>
"""
import fitz, sys, os, json
import numpy as np
from PIL import Image

SLUG, DATE, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
DPI = 200
SC = DPI / 72.0
XCUT = 87.5
X0, X1 = 66, 412

data = json.load(open(f'_dpc2023_{SLUG}.json', encoding='utf-8'))
# locate the source pdf from the report
pdf_path = None
for line in open(f'_dpc2023_{SLUG}.report.txt', encoding='utf-8'):
    if line.startswith('PDF: '):
        pdf_path = line[5:].strip(); break
doc = fitz.open(pdf_path)


def clean(a, xcut_px):
    H, W = a.shape[0], a.shape[1]
    r = a[:, :, 0].astype(int); g = a[:, :, 1].astype(int); b = a[:, :, 2].astype(int)
    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)
    tint = maxc - minc
    xs = np.arange(W)[None, :].repeat(H, axis=0)
    left = xs < xcut_px
    # 1) Light tinted watermark (Adda247 logo is light PINK ~245,196,199; also any
    #    faint green/blue) -> whiten. Distinguished from real answer colours by a
    #    HIGH min channel; b/w figures/text have ~zero tint so are untouched.
    a[((minc > 90) & (tint > 8)) | (minc > 150)] = 255
    # 2) Strong colour = the green/red answer markers and option-number labels
    #    (0x40c64b -> minc 64, 0xf61818 -> minc 24). minc<150 separates from watermark.
    strong = (tint > 40) & (minc < 150)
    # markers (left of cut) -> whiten plus a dilated halo to kill the anti-alias
    # fringe. Dilation grows only around strong-colour marker seeds, so b/w figure
    # borders in this column are untouched.
    mk = strong & left
    halo = mk.copy()
    for sh in range(1, 6):
        halo[sh:, :] |= mk[:-sh, :]; halo[:-sh, :] |= mk[sh:, :]
        halo[:, sh:] |= mk[:, :-sh]; halo[:, :-sh] |= mk[:, sh:]
    a[halo] = 255
    # option-number labels (right of cut) -> blacken to neutralise the answer colour.
    a[strong & ~left] = 0
    return a


built = []
for q in data:
    cr = q.get('crop')
    if not cr:
        continue
    pg = doc[cr['page']]
    pm = pg.get_pixmap(matrix=fitz.Matrix(SC, SC))
    a = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.h, pm.w, pm.n)[:, :, :3].copy()
    a = clean(a, XCUT * SC)
    y0 = max(0, int(cr['y0'] * SC)); y1 = int(cr['y1'] * SC)
    x0 = int(X0 * SC); x1 = int(X1 * SC)
    crop = a[y0:y1, x0:x1]
    gray = crop.mean(axis=2)
    ys, xs = np.where(gray < 200)
    if len(ys):
        crop = crop[max(0, ys.min() - 8):ys.max() + 8, max(0, xs.min() - 8):xs.max() + 8]
    fn = f'{DATE}-q-{q["n"]}.png'
    Image.fromarray(crop).save(os.path.join(OUT, fn))
    built.append((q['n'], q['kind'], crop.shape[1], crop.shape[0]))

print(f'built {len(built)} crops in {OUT}:')
for b in built:
    print(f'  q{b[0]:3d} [{b[1]}] {b[2]}x{b[3]}')
