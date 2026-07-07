"""Finalize NEET 2013: render question/figure crops and set image + option fields.

Two image modes (the rest of the paper stays as plain text):
  * BLOCK  — full question block (stem + options + any figure) is rendered; the
             options carry visual content (fractions, chem structures, overlines,
             table rows) that flattens in text, so option buttons become (A)-(D)
             labels and the image is authoritative. Covers all of Physics, the
             chem structure/fraction questions and the biology match-tables.
  * FIGURE — only the diagram is rendered; the stem and the (clean) text options
             are kept. Covers the biology anatomy/pathway diagrams.
Cross-column / cross-page figures get hand-verified crop rects (MANUAL).
Pages carry no watermark, so crops are rendered as-is (no channel whitening).

Usage: _finalize_neet2013.py <pdf> <in-json> <out-json> <extract-dir> [--qa]
"""
import sys, os, json, fitz
from PIL import Image

pdf, in_json, out_json, extract_dir = sys.argv[1:5]
QA = '--qa' in sys.argv
DPI = 200
os.makedirs(extract_dir, exist_ok=True)
doc = fitz.open(pdf)

BLOCK = set(range(1, 46)) - {4}                              # Physics (Q4 -> FIGURE)
BLOCK |= {52, 65, 74, 79, 81, 86, 87, 88, 89}               # Chemistry structures/fractions
BLOCK |= {136, 147, 154, 158}                               # Biology match-tables
FIGURE = {4, 108, 143, 146, 149, 150, 151, 152, 155, 156}   # diagrams (text kept)

MANUAL = {                                                   # cross-column / cross-page
    4:   (0,  [400, 300, 512, 402]),
    8:   (1,  [38, 53, 298, 193]),
    108: (7,  [66, 578, 314, 646]),
    136: (8,  [58, 556, 556, 660]),      # full-width match-table
    149: (10, [95, 60, 352, 222]),
    156: (11, [338, 60, 516, 200]),
    158: (11, [58, 397, 556, 510]),      # full-width match-table
}

def render(pno, rect):
    r = fitz.Rect(rect) & doc[pno].rect
    pm = doc[pno].get_pixmap(clip=r, dpi=DPI, alpha=False)
    return Image.frombytes('RGB', (pm.width, pm.height), pm.samples)

qs = json.load(open(in_json, encoding='utf-8'))
n_img = 0
for q in qs:
    n = q['n']
    mode = 'block' if n in BLOCK else ('figure' if n in FIGURE else None)
    if mode is None:
        continue
    if n in MANUAL:
        pno, rect = MANUAL[n]
    elif mode == 'figure' and q.get('fig'):
        pno, rect = q['page'], q['fig']
    elif q.get('crop'):
        pno, rect = q['page'], q['crop']
    else:
        print(f"  [warn] Q{n} ({mode}) has no crop rect"); continue
    img = render(pno, rect)
    fn = f"q-{n}.png"
    img.save(os.path.join(extract_dir, fn))
    q['qi'] = fn
    if mode == 'block':                                     # options shown in image
        q['opts'] = ['(A)', '(B)', '(C)', '(D)']
    n_img += 1

# strip helper geometry fields
for q in qs:
    for k in ('page', 'y', 'crop', 'fig', 'img'):
        q.pop(k, None)

json.dump(qs, open(out_json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f"rendered {n_img} images -> {extract_dir}; wrote {out_json}")

if QA:                                                      # contact sheets for review
    imgs = sorted((q['n'], os.path.join(extract_dir, q['qi']))
                  for q in qs if q.get('qi'))
    per = 6
    for pi in range(0, len(imgs), per * 4):
        chunk = imgs[pi:pi + per * 4]
        thumbs = []
        for n, p in chunk:
            im = Image.open(p); im.thumbnail((230, 230)); thumbs.append((n, im))
        cw, ch = 240, 250
        cols = per
        rows = (len(thumbs) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * cw, rows * ch), (255, 255, 255))
        from PIL import ImageDraw
        dr = ImageDraw.Draw(sheet)
        for i, (n, im) in enumerate(thumbs):
            x, y = (i % cols) * cw, (i // cols) * ch
            dr.text((x + 4, y + 2), f"Q{n}", fill=(200, 0, 0))
            sheet.paste(im, (x + 4, y + 16))
        sp = os.environ.get('SP', extract_dir)
        sheet.save(f"{sp}/qa_sheet_{pi}.png")
    print("QA sheets written")
