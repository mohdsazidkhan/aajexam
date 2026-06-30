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
    tint = (maxc - minc) > 12            # any colour tint (markers + their halos)
    sat_red = (r - g > 40) & (r - b > 40)
    sat_green = (g - r > 40) & (g - b > 25)
    xs = np.arange(W)[None, :].repeat(H, axis=0)
    left = xs < xcut_px
    # left of cut holds only the tick/cross markers (figures there are pure b/w) ->
    # whiten ALL tinted pixels plus a dilated halo (catches the grey anti-alias
    # fringe, which has no tint). Dilation only grows around tinted marker seeds,
    # so b/w figure borders in this column are untouched.
    mk = tint & left
    halo = mk.copy()
    for sh in range(1, 6):
        halo[sh:, :] |= mk[:-sh, :]; halo[:-sh, :] |= mk[sh:, :]
        halo[:, sh:] |= mk[:, :-sh]; halo[:, :-sh] |= mk[:, sh:]
    a[halo] = 255
    # option-number labels (right of cut) are colour-coded -> blacken to neutralise.
    a[(sat_red | sat_green) & ~left] = 0
    # faint green watermark anywhere
    watermark = (g - r > 4) & (g - r < 40) & (g > 195) & (b > 175)
    a[watermark] = 255
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
