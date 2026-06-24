#!/usr/bin/env python3
"""Finalize Delhi Police Constable 05-Dec-2017 Shift-1 -> _final_d1.json.
Answers/options come from the parser (PDF text + 'Correct Option' key). Figure questions
get a questionImage built from the docx media (single-figure questions keep their text
options; option-figure questions get a labelled composite image + numeric options)."""
import json, re, os

q = {x['n']: x for x in json.load(open('_questions_d1.json', encoding='utf-8'))}
IMGDIR = '_img_d1'
DATE = '05dec2017-s1'

# Option-figure questions: the four options are pictures -> numeric option labels.
OPTION_IMAGE_QS = [12, 13, 14, 16, 25, 26, 27, 30, 31, 32]
for n in OPTION_IMAGE_QS:
    q[n]['options'] = ['1', '2', '3', '4']

# Sanity: every question must have 4 non-empty options now.
out = [q[n] for n in range(1, 101)]
bad_opts = [x['n'] for x in out if sum(1 for o in x['options'] if str(o).strip()) != 4]
noans = [x['n'] for x in out if x['answerIndex'] is None]
# which questions have a built image file
have_img = sorted(n for n in range(1, 101)
                  if os.path.exists(os.path.join(IMGDIR, f'{DATE}-q-{n}.png')))
print('questions with figure image:', have_img)
print('options != 4:', bad_opts if bad_opts else 'none')
print('without answer:', noans if noans else 'none')

# strip helper fields the seed-gen doesn't need
for x in out:
    x.pop('isImageQ', None); x.pop('optionsAreImages', None)
    x.setdefault('explanation', '')

json.dump(out, open('_final_d1.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote _final_d1.json', len(out), 'questions')
