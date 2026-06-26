#!/usr/bin/env python3
"""Render per-question crops for selected questions of a 'Prepp'-style typeset
Delhi Police PDF (02-Dec-2020 Shift 3). No coordinate metadata exists, so we
locate each question by its `N.` line at the left margin (within the QUESTION
region, before the 'Answers' section) and crop from that line's top to the next
question's top (clamped to the marks marker / page bottom). Markers/figures are
typeset (no colour answer key here -> nothing to hide; the answer key is text).

Usage: python scripts/_dpc_s3_crop.py <pdf> <slug> <outdir> <n,n,...>
Files: <outdir>/q-<n>.png
"""
import fitz, sys, os, re

PDF, SLUG, OUT, NLIST = sys.argv[1:5]
os.makedirs(OUT, exist_ok=True)
want = [int(x) for x in NLIST.split(',')]
doc = fitz.open(PDF)
DPI = 170; SC = DPI / 72.0

# find the page where the 'Answers' section begins -> question region is before it
ans_page = doc.page_count
for p in range(doc.page_count):
    if re.search(r'^\s*Answers\s*$', doc[p].get_text(), re.M):
        ans_page = p; break

# collect, for every question number, the (page, y_top) of its 'N.' line, taking
# the FIRST occurrence in the question region.
qline = {}
marks_re = re.compile(r'^\(\+1')
for p in range(ans_page):
    d = doc[p].get_text('dict')
    rows = []
    for b in d['blocks']:
        if b.get('type') == 1: continue
        for l in b.get('lines', []):
            t = ''.join(s['text'] for s in l['spans'])
            y0 = min(s['bbox'][1] for s in l['spans'])
            y1 = max(s['bbox'][3] for s in l['spans'])
            rows.append((y0, y1, t.strip()))
    rows.sort()
    for y0, y1, t in rows:
        m = re.match(r'^(\d+)\.\s', t)
        if m:
            n = int(m.group(1))
            if 1 <= n <= 100 and n not in qline:
                qline[n] = (p, y0, rows)

for n in want:
    if n not in qline:
        print('  MISSING locate', n); continue
    p, y0, rows = qline[n]
    # find y1: the next question marker's y on same page, else marks marker, else page bottom
    nexts = [ry0 for ry0, ry1, t in rows if ry0 > y0 + 2 and re.match(r'^\d+\.\s', t)
             and int(re.match(r'^(\d+)\.', t).group(1)) == n + 1]
    marks = [ry1 for ry0, ry1, t in rows if ry0 > y0 + 2 and marks_re.match(t)]
    pg = doc[p]
    if nexts:
        y1 = min(nexts) - 2
    elif marks:
        y1 = min(marks) + 4
    else:
        y1 = pg.rect.height - 30
    clip = fitz.Rect(0, max(0, y0 - 6), pg.rect.width, y1)
    pm = pg.get_pixmap(matrix=fitz.Matrix(SC, SC), clip=clip)
    pm.save(os.path.join(OUT, f'q-{n}.png'))
print(f'rendered {len([n for n in want if n in qline])} crops to {OUT}')
