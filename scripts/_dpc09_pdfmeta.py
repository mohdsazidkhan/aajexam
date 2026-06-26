#!/usr/bin/env python3
"""Extract per-question metadata from a 2020-era Delhi Police response-sheet PDF
(09-Dec-2020 style: Part B Reasoning + Part C Numerical are FULLY rasterised, only
the option-number labels '1.'..'4.' carry real text and are colour-coded green for
the correct option). The PDF is authoritative for: section, question number,
Question ID, the answer key (green option label), the page, and the vertical crop
band (Q.N label .. Question-ID box) used to render figure/image crops.

Sections are detected by the per-section Q-number reset (1..50, 1..25, 1..15, 1..10).

Green correct = 0x40c64x ; red wrong = 0xf61818. Option labels are 'N.' text spans;
standalone digits without a period are the 'Chosen Option' value and are ignored.

Writes _pdfmeta_<slug>.json: list of
  {section, qn, n, qid, answerIndex, page, y0, y1}
n = global 1..100. Sizes asserted 50/25/15/10.

Usage: python scripts/_dpc09_pdfmeta.py <pdf> <slug>
"""
import fitz, re, sys, json

PDF, SLUG = sys.argv[1], sys.argv[2]
doc = fitz.open(PDF)

def is_green(c): return 0x40c640 <= c <= 0x40c660
SECNAMES = ['A', 'B', 'C', 'D']
SIZES = [50, 25, 15, 10]

records = []
cur = None
for pno in range(1, doc.page_count + 1):
    d = doc[pno - 1].get_text('dict')
    # gather all spans, then group into visual rows by y-proximity -- 'Question ID :'
    # and its number sit on the same visual row but in different dict lines/blocks.
    allspans = []
    for b in d['blocks']:
        if b.get('type') == 1:
            continue
        for l in b.get('lines', []):
            for s in l['spans']:
                if s['text'].strip():
                    allspans.append(s)
    allspans.sort(key=lambda s: (s['bbox'][1], s['bbox'][0]))
    lines = []
    row = []
    rowy = None
    for s in allspans:
        y = s['bbox'][1]
        if rowy is None or abs(y - rowy) <= 4:
            row.append(s)
            rowy = y if rowy is None else rowy
        else:
            row.sort(key=lambda s: s['bbox'][0])
            lines.append((min(x['bbox'][1] for x in row), min(x['bbox'][0] for x in row),
                          ''.join(x['text'] for x in row), row))
            row = [s]
            rowy = y
    if row:
        row.sort(key=lambda s: s['bbox'][0])
        lines.append((min(x['bbox'][1] for x in row), min(x['bbox'][0] for x in row),
                      ''.join(x['text'] for x in row), row))
    for ly, lx, ltext, ss in lines:
        t = ltext.strip()
        mq = re.match(r'Q\.(\d+)', t)
        if mq:
            if cur:
                records.append(cur)
            cur = {'qn': int(mq.group(1)), 'page': pno,
                   'y0': ly, 'optcolors': {}, 'qid': None}
            continue
        if cur is None:
            continue
        mid = re.search(r'Question ID\s*:\s*(\d+)', re.sub(r'\s+', ' ', t))
        if mid:
            cur['qid'] = mid.group(1)
            cur['y1'] = ly
            records.append(cur)
            cur = None
            continue
        # option colours: B/C labels are a bare 'N.' span; A/D options are a
        # 'N. <text>' span. In both cases the span starts with the option number
        # and carries the answer colour (green correct / red wrong). First span per
        # option number wins (avoids stray '1.' inside a stem later in the block).
        for s in ss:
            mo = re.match(r'([1-4])\.(?:\s|$)', s['text'].strip())
            if mo and int(mo.group(1)) not in cur['optcolors']:
                cur['optcolors'][int(mo.group(1))] = s['color']
if cur:
    records.append(cur)

# sectionize by Q reset
sections = []
sec = []
prev = 0
for r in records:
    if r['qn'] <= prev:
        sections.append(sec)
        sec = []
    sec.append(r)
    prev = r['qn']
sections.append(sec)

assert len(sections) == 4, f'expected 4 sections, got {len(sections)}'
sizes = [len(s) for s in sections]
assert sizes == SIZES, f'section sizes {sizes} != {SIZES}'

out = []
glob = 0
base = [0, 50, 75, 90]
problems = []
for si, secq in enumerate(sections):
    for r in secq:
        glob = base[si] + r['qn']
        greens = [k for k, c in r['optcolors'].items() if is_green(c)]
        ans = (greens[0] - 1) if len(greens) == 1 else None
        if ans is None:
            problems.append((SECNAMES[si], r['qn'], glob, 'no/multi green', list(r['optcolors'].items())))
        out.append({'section': SECNAMES[si], 'qn': r['qn'], 'n': glob,
                    'qid': r['qid'], 'answerIndex': ans, 'page': r['page'],
                    'y0': r.get('y0'), 'y1': r.get('y1')})

out.sort(key=lambda x: x['n'])
print('sections:', sizes, 'total', len(out))
print('answer problems:', problems if problems else 'none')
json.dump(out, open(f'_pdfmeta_{SLUG}.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print(f'wrote _pdfmeta_{SLUG}.json')
