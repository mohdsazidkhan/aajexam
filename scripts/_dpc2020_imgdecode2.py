#!/usr/bin/env python3
"""Like _dpc2020_imgdecode.py but tags every decoded question group with the
Question ID that follows it in document order, so composites can be mapped to a
specific question. Used for the FIGURAL reasoning questions of a 2020-era Delhi
Police paper (the numerical/text questions are recovered separately via vision).

Outputs _img2020_<slug>/sec<S>-<k>.png and _img2020_<slug>.json with
{section, k, qid, answerIndex, image, nStem, nOpt}.

Usage: python scripts/_dpc2020_imgdecode2.py <docx> <slug>
"""
import zipfile, re, sys, os, json
from PIL import Image, ImageDraw

DOCX, SLUG = sys.argv[1], sys.argv[2]
OUT = f'_img2020_{SLUG}'
os.makedirs(OUT, exist_ok=True)
RAW = os.path.join(OUT, 'raw'); os.makedirs(RAW, exist_ok=True)

z = zipfile.ZipFile(DOCX)
for n in z.namelist():
    if n.startswith('word/media/'):
        open(os.path.join(RAW, n.split('/')[-1]), 'wb').write(z.read(n))
rels = z.read('word/_rels/document.xml.rels').decode('utf-8', 'replace')
relmap = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', rels))
xml = z.read('word/document.xml').decode('utf-8', 'replace')
paras = re.split(r'</w:p>', xml)
def ptext(p): return ''.join(re.findall(r'<w:t(?:\s[^>]*)?>(.*?)</w:t>', p, re.DOTALL))

TICK, CROSS = 'image7.png', 'image6.png'
DECO = {'image5.png', 'image2.jpeg', 'image3.png', 'image4.png', TICK, CROSS}

# Linear token stream with section + Question-ID markers.
toks = []
sec = None
for p in paras:
    t = ptext(p)
    ms = re.search(r'Section\s*:\s*Part\s*([A-D])', t)
    if ms:
        sec = ms.group(1); toks.append(('SEC', sec))
    # figures/marks come before the QID within a question block; emit in order
    for rid in re.findall(r'r:embed="(rId\d+)"', p):
        mf = relmap.get(rid, '').split('/')[-1]
        if mf == TICK: toks.append(('MARK', 'T'))
        elif mf == CROSS: toks.append(('MARK', 'x'))
        elif mf in DECO: pass
        else: toks.append(('FIG', mf))
    mq = re.search(r'Question ID\s*:\s*(\d+)', t)
    if mq:
        toks.append(('QID', mq.group(1)))

questions = []
cur_sec = None
opts = []; stem = []
def next_qid(i):
    # the Question-ID box follows a question's options in document order; search
    # forward to the first QID, stopping at a section boundary.
    for j in range(i, len(toks)):
        if toks[j][0] == 'SEC':
            break
        if toks[j][0] == 'QID':
            return toks[j][1]
    return None

def flush(i):
    global opts, stem
    if len(opts) == 4 and sum(1 for _, m in opts if m == 'T') == 1:
        ans = [m for _, m in opts].index('T')
        figs = [f for f, _ in opts]
        questions.append({'section': cur_sec, 'optionFigs': figs,
                          'stemFigs': stem[:], 'answerIndex': ans,
                          'qid': next_qid(i)})
    opts = []; stem = []

i = 0
while i < len(toks):
    k, v = toks[i]
    if k == 'SEC':
        flush(i); cur_sec = v; i += 1; continue
    if cur_sec not in ('B', 'C'):
        i += 1; continue
    if k == 'FIG':
        nxt = toks[i+1] if i+1 < len(toks) else ('', '')
        if nxt[0] == 'MARK':
            opts.append((v, nxt[1])); i += 2
            if len(opts) == 4:
                if i < len(toks) and toks[i][0] == 'FIG':
                    nn = toks[i+1] if i+1 < len(toks) else ('', '')
                    if nn[0] != 'MARK':
                        stem.append(toks[i][1]); i += 1
                flush(i)
            continue
        else:
            stem.append(v); i += 1; continue
    i += 1
flush(i)

def load(nm):
    im = Image.open(os.path.join(RAW, nm)).convert('RGB')
    if im.width > 340: im.thumbnail((340, 340))
    return im

built = []
counters = {'B': 0, 'C': 0}
for q in questions:
    counters[q['section']] += 1
    k = counters[q['section']]
    name = f'sec{q["section"]}-{k}.png'
    ims = [('Question Figure', load(f)) for f in q['stemFigs']] + \
          [(f'Option {j+1}', load(f)) for j, f in enumerate(q['optionFigs'])]
    pad, lblh = 6, 20
    W = max(i.width for _, i in ims) + 12
    H = sum(i.height for _, i in ims) + (lblh + pad*2) * len(ims)
    c = Image.new('RGB', (W, H), 'white'); d = ImageDraw.Draw(c); y = 2
    for lbl, im in ims:
        d.text((4, y), lbl, fill=(180, 0, 0)); y += lblh
        c.paste(im, (8, y)); y += im.height + pad*2
    c.save(os.path.join(OUT, name))
    q['image'] = name; q['k'] = k
    built.append((q['section'], k, q['qid'], q['answerIndex'],
                  len(q['stemFigs']), len(q['optionFigs'])))

from collections import Counter
print('image questions decoded:', Counter(s for s, *_ in built))
print('built (sec,k,qid,ans,#stem,#opt):')
for b in built: print('  ', b)
json.dump([{'section': q['section'], 'k': q['k'], 'qid': q['qid'],
            'answerIndex': q['answerIndex'], 'image': q['image'],
            'nStem': len(q['stemFigs']), 'nOpt': len(q['optionFigs'])}
           for q in questions], open(f'_img2020_{SLUG}.json', 'w'),
          ensure_ascii=False, indent=1)
print(f'wrote _img2020_{SLUG}.json')
