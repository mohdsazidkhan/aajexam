#!/usr/bin/env python3
"""Render per-question PNG crops (markers intact) from a 09-Dec-2020 Delhi Police
PDF, for vision transcription/classification. Uses the per-question vertical band in
_pdfmeta_<slug>.json. Renders the questions whose global n is in the given list, or a
whole section letter (A/B/C/D).

Usage:
  python scripts/_dpc09_render.py <pdf> <slug> <outdir> <A|B|C|D|n,n,...>
Files: <outdir>/q-<n>.png
"""
import fitz, sys, os, json

PDF, SLUG, OUT, SEL = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)
meta = json.load(open(f'_pdfmeta_{SLUG}.json', encoding='utf-8'))
DPI = 170
SC = DPI / 72.0

if SEL in ('A', 'B', 'C', 'D'):
    sel = [m for m in meta if m['section'] == SEL]
else:
    want = set(int(x) for x in SEL.split(','))
    sel = [m for m in meta if m['n'] in want]

for m in sel:
    n, page = m['n'], m['page']
    pg = doc[page - 1]
    y0 = (m['y0'] or 30) - 6
    y1 = (m['y1'] or pg.rect.height - 30) - 2
    clip = fitz.Rect(0, y0, pg.rect.width, y1)
    pm = pg.get_pixmap(matrix=fitz.Matrix(SC, SC), clip=clip)
    pm.save(os.path.join(OUT, f'q-{n}.png'))
print(f'rendered {len(sel)} crops to {OUT}')
