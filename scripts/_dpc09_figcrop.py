#!/usr/bin/env python3
"""Render clean per-question figure images for the FIGURAL questions of a
09-Dec-2020 Delhi Police paper, from the source PDF page renders, with the answer
NOT leaked. Uses the per-question vertical band (Q.N .. Question-ID line) from
_pdfmeta_<slug>.json.

Answer markers (green tick / red cross) sit in a fixed column to the LEFT of the
option-number labels; the option numbers themselves are colour-coded (green=correct).
So we:
  - whiten saturated red/green pixels in the marker column (x < XCUT) -> markers gone
  - blacken saturated red/green pixels at/after XCUT -> option numbers stay visible but
    colour-neutral (no leak)
  - whiten the faint green 'Prepp' watermark everywhere
The metadata box (Question ID / Status / Chosen Option) is below the band and excluded.

Input: a comma list of global question numbers (figural ones) for this slug.
Each n -> file <date-slug>-q-<n>.png in <outdir>.

Usage: python scripts/_dpc09_figcrop.py <pdf> <slug> <date-slug> <outdir> <n,n,...>
"""
import fitz, sys, os, json
import numpy as np
from PIL import Image

PDF, SLUG, DATE, OUT, NLIST = sys.argv[1:6]
os.makedirs(OUT, exist_ok=True)
DPI = 200
SC = DPI / 72.0
XCUT = 94.0          # points: marker column / option-number boundary
X0, X1 = 24, 540     # crop horizontal window (points) — excludes right metadata box
meta = {m['n']: m for m in json.load(open(f'_pdfmeta_{SLUG}.json', encoding='utf-8'))}
ns = [int(x) for x in NLIST.split(',')]
doc = fitz.open(PDF)

def clean(a, xcut_px):
    H, W = a.shape[0], a.shape[1]
    r = a[:, :, 0].astype(int); g = a[:, :, 1].astype(int); b = a[:, :, 2].astype(int)
    sat_red = (r - g > 40) & (r - b > 40)
    sat_green = (g - r > 40) & (g - b > 25)
    sat = sat_red | sat_green
    xs = np.arange(W)[None, :].repeat(H, axis=0)
    left = xs < xcut_px
    # markers (left of cut): whiten ; numbers (at/after cut): blacken
    a[sat & left] = 255
    a[sat & ~left] = 0
    # faint green watermark: light pixels with a slight green tint
    watermark = (g - r > 4) & (g - r < 40) & (g > 195) & (b > 175)
    a[watermark] = 255
    # wipe the tick/cross anti-aliased halo: dilate the saturated marker mask
    # (left-of-cut pixels only) by ~5px and whiten — confined to the marker glyphs,
    # so stem text passing through this column is untouched.
    mk = sat_red | sat_green
    mk = mk & left
    d = mk.copy()
    for sh in range(1, 6):
        d[sh:, :] |= mk[:-sh, :]; d[:-sh, :] |= mk[sh:, :]
        d[:, sh:] |= mk[:, :-sh]; d[:, :-sh] |= mk[:, sh:]
    a[d] = 255
    return a

built = []
for n in ns:
    m = meta[n]
    pg = doc[m['page'] - 1]
    pm = pg.get_pixmap(matrix=fitz.Matrix(SC, SC))
    a = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.h, pm.w, pm.n)[:, :, :3].copy()
    a = clean(a, XCUT * SC)
    y0 = int((m['y0'] - 6) * SC)
    y1 = int((m['y1'] - 5) * SC)
    x0, x1 = int(X0 * SC), int(X1 * SC)
    crop = a[max(0, y0):y1, x0:x1]
    # trim surrounding white
    gray = crop.mean(axis=2)
    ys, xs = np.where(gray < 200)
    if len(ys):
        crop = crop[max(0, ys.min() - 8):ys.max() + 8, max(0, xs.min() - 8):xs.max() + 8]
    fn = f'{DATE}-q-{n}.png'
    Image.fromarray(crop).save(os.path.join(OUT, fn))
    built.append((n, m['page'], crop.shape[1], crop.shape[0]))

print(f'built {len(built)} figure crops in {OUT}:')
for b in built:
    print('  n', b[0], 'page', b[1], 'size', b[2], 'x', b[3])
