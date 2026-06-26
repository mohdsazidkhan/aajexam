#!/usr/bin/env python3
"""Assemble the final 100-question JSON for a 09-Dec-2020 Delhi Police shift from:
  _final_<slug>.json  : skeleton with PDF colour-key answerIndex + English A/D text
  <hindi patch>       : {n: {observedAns, questionText, options[4]}} for Hindi GK
  <bc json>           : [{n, type:'text'|'figural', stem, options}] for Part B/C
  <imgdir>            : holds <date-slug>-q-<n>.png for figural questions

Answers always come from the colour-key already in _final (answerIndex). The Hindi
patch's observedAns and each figural/text item are cross-checked; figural images must
exist. Writes _final2_<slug>.json with clean question records.

Usage: python scripts/_dpc09_assemble.py <slug> <date-slug> <imgdir> <hindi.json> <bc.json>
"""
import json, sys, os

SLUG, DATE, IMGDIR, HPATCH, BCJSON = sys.argv[1:6]
FIG_STEM = ('Study the figure(s) and the four options shown in the image below, '
            'and select the correct option.')
base = {q['n']: q for q in json.load(open(f'_final_{SLUG}.json', encoding='utf-8'))}
hindi = {int(k): v for k, v in json.load(open(HPATCH, encoding='utf-8')).items()}
bc = {e['n']: e for e in json.load(open(BCJSON, encoding='utf-8'))}

problems = []
out = []
fig_imgs = []
for n in range(1, 101):
    q = base[n]
    ans = q['answerIndex']
    rec = {'n': n, 'section': q['section'], 'questionText': '', 'questionImage': '',
           'options': ['', '', '', ''], 'answerIndex': ans, 'explanation': ''}
    if 1 <= n <= 50 or 91 <= n <= 100:        # Part A GK / Part D Computer
        if n in hindi:
            h = hindi[n]
            if h['observedAns'] != ans:
                problems.append((n, 'hindi observedAns!=colourkey', h['observedAns'], ans))
            rec['questionText'] = h['questionText']
            rec['options'] = h['options']
        else:
            if q['kind'] != 'text' or not q['questionText']:
                problems.append((n, 'A/D not filled', q['kind']))
            rec['questionText'] = q['questionText']
            rec['options'] = q['options']
    else:                                      # Part B / Part C
        e = bc.get(n)
        if e is None:
            problems.append((n, 'missing from bc'))
        elif e['type'] == 'figural':
            img = f'{DATE}-q-{n}.png'
            if not os.path.exists(os.path.join(IMGDIR, img)):
                problems.append((n, 'figural image missing', img))
            rec['questionText'] = FIG_STEM
            rec['questionImage'] = img
            rec['options'] = ['1', '2', '3', '4']
            fig_imgs.append(n)
        else:
            if len(e['options']) != 4 or not e['stem'] or any(not o for o in e['options']):
                problems.append((n, 'bc text bad', e.get('options')))
            rec['questionText'] = e['stem']
            rec['options'] = e['options']
    out.append(rec)

# final validation
for r in out:
    if r['answerIndex'] is None or not (0 <= r['answerIndex'] <= 3):
        problems.append((r['n'], 'bad answerIndex', r['answerIndex']))
    if not r['questionImage'] and (len(r['options']) != 4 or any(not str(o).strip() for o in r['options'])):
        problems.append((r['n'], 'bad options', r['options']))
    if not r['questionText'].strip():
        problems.append((r['n'], 'empty stem'))

secs = {}
for r in out:
    secs[r['section']] = secs.get(r['section'], 0) + 1
print('total:', len(out), '| sections:', secs)
print('figural image questions:', fig_imgs)
print('PROBLEMS:', problems if problems else 'none')
assert len(out) == 100
json.dump(out, open(f'_final2_{SLUG}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'wrote _final2_{SLUG}.json')
