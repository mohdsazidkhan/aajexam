#!/usr/bin/env python3
"""Extract clean English text (stem + 4 options) for the Part A GK and Part D
Computer questions of a 09-Dec-2020 style Delhi Police PDF, using the per-question
vertical band recorded in _pdfmeta_<slug>.json. Devanagari does not extract from
this PDF (custom-font corruption), so Hindi questions are flagged 'needs_vision'
and left for manual transcription; English questions are emitted as text.

Updates _final_<slug>.json in place: fills questionText/options for clean English
A/D questions (kind='text'); leaves Hindi A/D as kind='needs_vision'. Answers come
from the colour-key already in _final (answerIndex), untouched.

Usage: python scripts/_dpc09_pdftext.py <pdf> <slug>
"""
import fitz, re, sys, json

PDF, SLUG = sys.argv[1], sys.argv[2]
doc = fitz.open(PDF)
meta = json.load(open(f'_pdfmeta_{SLUG}.json', encoding='utf-8'))
final = json.load(open(f'_final_{SLUG}.json', encoding='utf-8'))
fmap = {q['n']: q for q in final}
DEV = re.compile(r'[ऀ-ॿ]')

LIG = {'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi',
       'ﬄ': 'ffl', 'ﬅ': 'st', 'ﬆ': 'st'}
def deligature(s):
    for k, v in LIG.items():
        s = s.replace(k, v)
    return s

def region_text(page, y0, y1):
    pg = doc[page - 1]
    clip = fitz.Rect(0, y0 - 2, pg.rect.width, y1 - 2)
    return pg.get_text('text', clip=clip)

def parse_qtext(raw):
    # normalize, drop the right-column metadata that can leak in
    lines = [l.rstrip() for l in raw.splitlines()]
    lines = [l for l in lines if l.strip()]
    # find 'Ans' splitter
    ai = None
    for i, l in enumerate(lines):
        if l.strip() == 'Ans' or l.strip().startswith('Ans '):
            ai = i
            break
    if ai is None:
        return None
    stem_lines = lines[:ai]
    # strip leading 'Q.N'
    if stem_lines:
        stem_lines[0] = re.sub(r'^Q\.\s*\d+\s*', '', stem_lines[0])
    # the 'Ans' line may carry the first option inline: 'Ans 1. xxx'
    rest = []
    first = lines[ai].strip()
    m1 = re.match(r'Ans\s*(1\..*)$', first)
    if m1:
        rest.append(m1.group(1))
    rest += lines[ai + 1:]
    # stop at metadata
    cut = []
    for l in rest:
        if re.match(r'(Question ID|Status|Chosen Option)\b', l.strip()):
            break
        cut.append(l)
    body = '\n'.join(cut)
    # split into options by N. markers
    opts = re.split(r'(?m)^\s*([1-4])\.\s*', body)
    # opts = ['', '1', 'optA\n', '2', 'optB', ...]
    options = {}
    it = iter(opts[1:])
    for num, txt in zip(it, it):
        options[int(num)] = ' '.join(txt.split())
    if sorted(options.keys()) != [1, 2, 3, 4]:
        return None
    stem = ' '.join(' '.join(stem_lines).split())
    return stem, [options[1], options[2], options[3], options[4]]

filled, hindi, failed = [], [], []
for m in meta:
    if m['section'] not in ('A', 'D'):
        continue
    n = m['n']
    raw = region_text(m['page'], m['y0'], m['y1'])
    if DEV.search(raw):
        fmap[n]['kind'] = 'needs_vision'
        hindi.append(n)
        continue
    res = parse_qtext(raw)
    if res is None:
        fmap[n]['kind'] = 'needs_vision'
        failed.append(n)
        continue
    stem, options = res
    fmap[n]['questionText'] = deligature(stem)
    fmap[n]['options'] = [deligature(o) for o in options]
    fmap[n]['kind'] = 'text'
    filled.append(n)

print(f'filled text: {len(filled)}')
print('hindi (needs vision):', hindi)
print('parse-failed (needs vision):', failed)
out = sorted(fmap.values(), key=lambda q: q['n'])
json.dump(out, open(f'_final_{SLUG}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'updated _final_{SLUG}.json')
