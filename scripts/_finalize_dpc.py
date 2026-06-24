#!/usr/bin/env python3
"""Generic finalize for a Delhi Police Constable paper -> _final_<slug>.json.
Option-figure questions (optionsAreImages) get numeric options 1-4 (the four choices are
pictures inside the question image). Everything else keeps its parsed text options.
Usage: python scripts/_finalize_dpc.py <slug> <date-slug> <img-dir>"""
import json, sys, os

slug, date, imgdir = sys.argv[1], sys.argv[2], sys.argv[3]
q = {x['n']: x for x in json.load(open(f'_questions_{slug}.json', encoding='utf-8'))}

for n, x in q.items():
    if x.get('optionsAreImages'):
        x['options'] = ['1', '2', '3', '4']

out = [q[n] for n in range(1, 101)]
bad = [x['n'] for x in out if sum(1 for o in x['options'] if str(o).strip()) != 4]
noans = [x['n'] for x in out if x['answerIndex'] is None]
have_img = sorted(n for n in range(1, 101)
                  if os.path.exists(os.path.join(imgdir, f'{date}-q-{n}.png')))
print('figure images:', have_img)
print('options != 4:', bad if bad else 'none')
print('without answer:', noans if noans else 'none')

for x in out:
    x.pop('isImageQ', None); x.pop('optionsAreImages', None)
    x.setdefault('explanation', '')
json.dump(out, open(f'_final_{slug}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'wrote _final_{slug}.json', len(out), 'questions')
