#!/usr/bin/env python3
"""Assemble a full 2020-era Delhi Police paper (100 Q) from:
  _questions_<slug>.json  -> Part A GK (n 1-50) + Part D Computer (n 91-100), docx text
  _vis_<slug>.json        -> Part B Reasoning (n 51-75) + Part C Numerical (n 76-90),
                             vision-transcribed: text questions in full, figural
                             questions flagged (image carries the content)
Figure crops for figural reasoning questions live in <imgdir> as <date>-q-<n>.png
and are attached by the seed generator by filename (n = 50 + Part-B Q.N).

Writes _final_<slug>.json (n, section, questionText, options, answerIndex, explanation).

Usage: python scripts/_assemble_dpc2020_v2.py <slug> <date-slug> <imgdir>
"""
import json, sys, os

slug, DATE, IMGDIR = sys.argv[1], sys.argv[2], sys.argv[3]
GK = 'General Knowledge / Current Affairs'
REA = 'Reasoning / Logical Ability'
NUM = 'Numerical Ability (Quantitative Aptitude)'
COMP = 'Computer Awareness / Fundamentals'
FIG_STEM = ('Study the figure(s) and the four options shown in the image below, '
            'and select the correct option.')

qdata = json.load(open(f'_questions_{slug}.json', encoding='utf-8'))
vis = json.load(open(f'_vis_{slug}.json', encoding='utf-8'))
by_n = {q['n']: q for q in qdata}

final = []

def add(n, section, stem, opts, ans, expl=''):
    final.append({'n': n, 'section': section, 'questionText': stem,
                  'options': opts, 'answerIndex': ans, 'explanation': expl})

# --- Part A GK 1-50 (docx) ---
for n in range(1, 51):
    q = by_n.get(n)
    if q is None:
        raise SystemExit(f'GK n={n} missing from docx parser')
    add(n, GK, q['questionText'], q['options'], q['answerIndex'])

# --- Part B Reasoning 51-75 (vision) ---
for e in vis['B']:
    n = 50 + e['qn']
    img = os.path.join(IMGDIR, f'{DATE}-q-{n}.png')
    has_img = os.path.exists(img)
    if e['type'] == 'figure' and 'stem' not in e:
        if not has_img:
            raise SystemExit(f'figure B q{e["qn"]} (n{n}) has no crop image')
        add(n, REA, FIG_STEM, ['1', '2', '3', '4'], e['answerIndex'])
    else:
        # text question, or figure-stem question that also has real text options
        add(n, REA, e['stem'], e['options'], e['answerIndex'])

# --- Part C Numerical 76-90 (vision, all text) ---
for e in vis['C']:
    n = 75 + e['qn']
    add(n, NUM, e['stem'], e['options'], e['answerIndex'])

# --- Part D Computer 91-100 (docx) ---
for n in range(91, 101):
    q = by_n.get(n)
    if q is None:
        raise SystemExit(f'Computer n={n} missing from docx parser')
    add(n, COMP, q['questionText'], q['options'], q['answerIndex'])

final.sort(key=lambda q: q['n'])

# validation
bad = [q['n'] for q in final if len(q['options']) != 4 or any(not str(o).strip() for o in q['options'])]
noans = [q['n'] for q in final if q['answerIndex'] is None or not (0 <= q['answerIndex'] <= 3)]
secs = {}
for q in final: secs[q['section']] = secs.get(q['section'], 0) + 1
imgs = sorted(int(f.split('-q-')[1].split('.')[0]) for f in os.listdir(IMGDIR)
              if f.startswith(DATE) and f.endswith('.png'))
print('total:', len(final), '| sections:', secs)
print('bad options:', bad if bad else 'none')
print('no/invalid answer:', noans if noans else 'none')
print('figure images present for n:', imgs)
assert len(final) == 100, 'expected 100 questions'
json.dump(final, open(f'_final_{slug}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'wrote _final_{slug}.json')
