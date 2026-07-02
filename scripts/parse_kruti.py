# -*- coding: utf-8 -*-
"""Parse a 29-page KrutiDev Rajasthan Police 2020 shift PDF into questions JSON.
Deterministic: KrutiDev-decoded text + last-page AnsKey table. Flags figure Qs."""
import fitz, sys, re, json, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import krutidev2 as k2

def decode_span(sp):
    return k2.convert(sp['text']) if 'KrutiDev' in sp['font'] else sp['text']

def is_figure_img(b):
    x0, y0, x1, y1 = b['bbox']
    w, h = x1 - x0, y1 - y0
    if y0 < 70:                    # top logo
        return False
    if w > 180 and h > 180:        # big centred watermark (large in BOTH dims)
        return False
    if x0 > 460:                   # right-margin logo
        return False
    return w > 25 and h > 20

QOPT = re.compile(r'^\((A|B|C|D)\)\s*(.*)$', re.S)
QNUM = re.compile(r'^Q\.?\s*(\d{1,3})\b\s*(.*)$', re.S)

def parse(pdf):
    d = fitz.open(pdf)
    # answer key: last page Q#/AnsKey pairs
    key = {}
    kt = d[d.page_count - 1].get_text().split('\n')
    nums = [x for x in kt if re.fullmatch(r'\d{1,3}', x.strip())]
    lets = [x for x in kt if re.fullmatch(r'[A-D]', x.strip())]
    # pair by walking the token stream (alternating N, L)
    toks = [x.strip() for x in kt if re.fullmatch(r'\d{1,3}|[A-D]', x.strip())]
    i = 0
    while i < len(toks) - 1:
        if re.fullmatch(r'\d{1,3}', toks[i]) and re.fullmatch(r'[A-D]', toks[i+1]):
            key[int(toks[i])] = 'ABCD'.index(toks[i+1])
            i += 2
        else:
            i += 1
    # PASS A: text in natural reading order (no y-sort); track y-span per question
    questions = []
    cur = None
    figs = []  # (page, y0) of figure images
    for pi in range(d.page_count - 1):
        pg = d[pi]
        raw = pg.get_text('dict')
        for b in raw['blocks']:
            if b['type'] == 1:
                if is_figure_img(b):
                    figs.append((pi, b['bbox'][1]))
                continue
            for l in b['lines']:
                y0 = l['bbox'][1]
                txt = ''.join(k2.convert(sp['text']) if 'KrutiDev' in sp['font'] else sp['text']
                              for sp in l['spans']).strip()
                if not txt or txt.startswith('www.prepp'):
                    continue
                m = QNUM.match(txt)
                if m:
                    cur = {'qno': int(m.group(1)), 'question': '', 'options': [],
                           'figure': False, 'page': pi, 'ymin': y0, 'ymax': y0}
                    questions.append(cur)
                    rest = m.group(2).strip()
                    if rest:
                        _consume(cur, rest)
                    continue
                if cur is None:
                    continue
                cur['ymax'] = max(cur['ymax'], y0)
                _consume(cur, txt)
    # PASS B: map each figure image to the question owning its y on that page
    for (pi, fy) in figs:
        owner = None
        for q in questions:
            if q['page'] != pi:
                continue
            if q['ymin'] - 5 <= fy:
                owner = q  # last question starting at/above the figure
        if owner is not None:
            owner['figure'] = True
    # catch-all: any empty option = image option => figure (unseedable)
    for q in questions:
        if any(not o.strip() for o in q['options']):
            q['figure'] = True
    # attach answers + text-keyword figure safety net
    KW = ('आकृति', 'चित्र', 'दर्पण', 'दिखाई गई', 'दिखाया गया', 'वेन आरेख', 'पांसे',
          'पासे', 'घन ', 'छवि', 'पैटर्न', 'श्रृंखला में', 'शृंखला में', 'कागज',
          'मोड़े जाने', 'निम्न घन', 'दी गई छवि')
    for q in questions:
        q['answerIndex'] = key.get(q['qno'])
        if not q['figure']:
            q['kw_fig'] = any(w in q['question'] for w in KW)
        else:
            q['kw_fig'] = False
    return questions, key

def _consume(cur, t):
    """Add a text line to current question: option or stem/option continuation."""
    m = QOPT.match(t)
    if m:
        cur['options'].append(m.group(2).strip())
    else:
        if cur['options']:
            cur['options'][-1] = (cur['options'][-1] + ' ' + t).strip()
        else:
            cur['question'] = (cur['question'] + ' ' + t).strip()

if __name__ == '__main__':
    pdf = sys.argv[1]
    qs, key = parse(pdf)
    out = sys.argv[2] if len(sys.argv) > 2 else 'out.json'
    json.dump(qs, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    figs = [q['qno'] for q in qs if q['figure']]
    noans = [q['qno'] for q in qs if q['answerIndex'] is None]
    optdist = {}
    for q in qs:
        optdist[len(q['options'])] = optdist.get(len(q['options']), 0) + 1
    print(f'parsed={len(qs)} keys={len(key)} figs={len(figs)} noans={len(noans)} optdist={optdist}')
    print('qnos', qs[0]['qno'], '..', qs[-1]['qno'], 'distinct', len(set(q["qno"] for q in qs)))
    print('figs', figs)
    print('noans', noans)
    kw = [q['qno'] for q in qs if q.get('kw_fig')]
    print('kw-review', kw)
    suspect = [q['qno'] for q in qs if not q['figure'] and
               (len(q['question'].strip()) < 12 or any(len(o) > 45 for o in q['options']))]
    print('suspect', suspect)
