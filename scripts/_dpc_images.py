#!/usr/bin/env python3
"""Extract figure images for a Delhi Police Constable paper from its DOCX and build
per-question PNGs for the seed step.

For each parser-flagged figure question:
  * option-figure question (optionsAreImages) -> vertical LABELLED composite
    (Question Figure + Option 1..4) saved as <date-slug>-q-<n>.png; caller sets
    options to ['1','2','3','4'].
  * single-figure question (figure in stem, text options) -> first image saved as
    <date-slug>-q-<n>.png; text options kept.

Decorative images (page background / watermark / logo) are dropped by frequency.
Boundary fix: a content image mapped to a NON-figure question is reassigned to the
immediately following figure question (figures often sit in the para before the marker);
otherwise it is a decorative singleton and ignored.

Usage: python scripts/_dpc_images.py <docx> <questions_json> <date-slug> <out-img-dir>
"""
import sys, os, re, zipfile, collections
from PIL import Image, ImageDraw
import json

docx, qjson, DATE, OUT = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
os.makedirs(OUT, exist_ok=True)
RAW = os.path.join(OUT, 'raw')
os.makedirs(RAW, exist_ok=True)

qs = {q['n']: q for q in json.load(open(qjson, encoding='utf-8'))}
fig_qs = {n for n, q in qs.items() if q.get('isImageQ')}
opt_img_qs = {n for n, q in qs.items() if q.get('optionsAreImages')}

z = zipfile.ZipFile(docx)
for n in z.namelist():
    if n.startswith('word/media/'):
        open(os.path.join(RAW, n.split('/')[-1]), 'wb').write(z.read(n))
rels = z.read('word/_rels/document.xml.rels').decode('utf-8', 'replace')
relmap = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', rels))
xml = z.read('word/document.xml').decode('utf-8', 'replace')

# Walk paragraphs; record (current Que number, media file) for each embedded image.
seq = []
cur = 0
for p in re.split(r'</w:p>', xml):
    txt = ''.join(re.findall(r'<w:t(?:\s[^>]*)?>(.*?)</w:t>', p, re.DOTALL))
    qm = re.search(r'Que\.\s*(\d+)', txt)
    if qm:
        cur = int(qm.group(1))
    for rid in re.findall(r'r:embed="(rId\d+)"', p):
        seq.append((cur, relmap.get(rid, '?').replace('word/', '').replace('media/', '')))

# Decorative = files that repeat (page bg/watermark) -> appear >=4 times.
freq = collections.Counter(mf for _, mf in seq)
deco = {mf for mf, c in freq.items() if c >= 4}
# The very first image (before/at Q1 area) is the header logo when it's a lone singleton there.
content = [(q, mf) for q, mf in seq if mf not in deco]

# Group by question, then apply boundary fix.
byq = collections.OrderedDict()
for q, mf in content:
    byq.setdefault(q, []).append(mf)

assigned = collections.defaultdict(list)
sorted_qs = sorted(byq)
for q in sorted_qs:
    imgs = byq[q]
    if q in fig_qs:
        assigned[q] = imgs + assigned[q]
    else:
        # reassign to the next figure question if one exists shortly after
        nxt = next((f for f in sorted(fig_qs) if f > q), None)
        if nxt is not None and nxt - q <= 2:
            assigned[nxt] = imgs + assigned.get(nxt, [])
        # else: decorative singleton on a text question -> ignore

def load(nm):
    im = Image.open(os.path.join(RAW, nm)).convert('RGB')
    if im.width > 360:
        im.thumbnail((360, 360))
    return im

built = []
for n in sorted(assigned):
    files = assigned[n]
    if not files:
        continue
    if len(files) == 1:
        # single figure (question figure) -> use directly; keep/standardise options upstream
        load(files[0]).save(os.path.join(OUT, f'{DATE}-q-{n}.png'))
        built.append((n, 'single', 1))
    else:
        # current question's figures come first in document order; trailing items are
        # bleed from the next figure question -> cap at 5 (question figure + 4 options).
        files = files[:5]
        ims = [load(f) for f in files]
        m = len(ims)
        def label(i):
            if m >= 5:
                return 'Question Figure' if i == 0 else f'Option {i}'
            return f'Option {i+1}'      # m == 4 -> four option figures
        pad, lblh = 6, 20
        W = max(i.width for i in ims) + 12
        H = sum(i.height for i in ims) + (lblh + pad * 2) * m
        c = Image.new('RGB', (W, H), 'white')
        d = ImageDraw.Draw(c)
        y = 2
        for i, im in enumerate(ims):
            d.text((4, y), label(i), fill=(180, 0, 0)); y += lblh
            c.paste(im, (8, y)); y += im.height + pad * 2
        c.save(os.path.join(OUT, f'{DATE}-q-{n}.png'))
        built.append((n, 'composite', m))

print('decorative files (skipped):', sorted(deco), '| freqs:', {k: freq[k] for k in deco})
print('built images:', built)
print('figure Qs from parser:', sorted(fig_qs))
missing = sorted(fig_qs - {n for n, _, _ in built})
print('figure Qs with NO image built (check!):', missing if missing else 'none')
