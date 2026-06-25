#!/usr/bin/env python3
"""Extract clean per-question figure images for the FIGURAL reasoning questions of
a 2020-era Delhi Police paper, straight from the source PDF page renders.

Why not the docx image-decoder: the docx figure/marker token order is unreliable
for these papers (stems get mixed into option slots), so composites mis-map. The
PDF page render is unambiguous: each question's figures sit between its 'Q.N' label
and its 'Question ID' box. We render the page, recolour the green-tick / red-cross
answer markers (and the faint green 'Prepp' watermark) to white so the answer is
NOT leaked, then crop to the question's vertical band. Option numbers 1.-4. are
black and survive, so the crop is self-labelled.

Input figlist JSON: [{"qn": <Q.N within Part B>, "page": <1-indexed PDF page>}, ...]
Each reasoning Q.N k -> global question number 50+k -> file <date-slug>-q-<50+k>.png

Usage: python scripts/_dpc2020_figcrop.py <pdf> <date-slug> <figlist.json> <outdir>
"""
import sys, json, os
import fitz, numpy as np
from PIL import Image

PDF, DATE, FIGLIST, OUT = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
os.makedirs(OUT, exist_ok=True)
DPI = 200
SC = DPI / 72.0
figlist = json.load(open(FIGLIST, encoding='utf-8'))
doc = fitz.open(PDF)

# horizontal crop window (points): left margin .. just before the Question-ID box
X0, X1 = 30, 455

def recolor(a):
    r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
    # any pixel with a colour cast (not neutral grey/black line-art) is a marker
    # or watermark edge -> wipe it, including faint anti-aliased tints.
    red = (r - g > 12) & (r - b > 12)
    green = (g - r > 8) & (g - b > 4)
    mask = red | green
    a[mask] = 255
    return a

def qid_boxes(words):
    ys = []
    for i, w in enumerate(words):
        if w[4] == 'Question' and i + 1 < len(words) and words[i + 1][4] == 'ID':
            ys.append(w[1])
    return sorted(ys)

built = []
for item in figlist:
    qn, page = item['qn'], item['page']
    pg = doc[page - 1]
    words = pg.get_text('words')
    top = None
    for w in words:
        if w[4] == f'Q.{qn}':
            top = w[1]
            break
    if top is None:
        print(f'!! Q.{qn} not found on page {page}')
        continue
    qids = [y for y in qid_boxes(words) if y > top + 5]
    bot = (qids[0] - 6) if qids else (pg.rect.height - 40)
    pm = pg.get_pixmap(matrix=fitz.Matrix(SC, SC))
    a = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.h, pm.w, pm.n)[:, :, :3].copy()
    a = recolor(a)
    y0, y1 = int((top - 6) * SC), int(bot * SC)
    x0, x1 = int(X0 * SC), int(X1 * SC)
    crop = a[max(0, y0):y1, x0:x1]
    # trim surrounding white to tighten
    gray = crop.mean(axis=2)
    ys, xs = np.where(gray < 200)
    if len(ys):
        crop = crop[max(0, ys.min() - 8):ys.max() + 8, max(0, xs.min() - 8):xs.max() + 8]
    gnum = 50 + qn
    fn = f'{DATE}-q-{gnum}.png'
    Image.fromarray(crop).save(os.path.join(OUT, fn))
    built.append((qn, gnum, page, crop.shape[1], crop.shape[0]))

print(f'built {len(built)} figure crops:')
for b in built:
    print('  Q.B', b[0], '-> n', b[1], 'page', b[2], 'size', b[3], 'x', b[4])
