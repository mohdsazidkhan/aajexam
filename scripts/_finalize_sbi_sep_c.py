#!/usr/bin/env python3
"""Patches for SBI Clerk Prelims 21-Sep-2025 Shift-1 -> _final_c.json.
Source (2025 cycle) has a complete by-number answer key. Q2 was dropped by the docx
parser (blank-fill whose marker merged) — re-inserted from the PDF (answer 'a' = How,
per key). Q63 and Q65 are equation-images; equations transcribed from the rendered PDF,
answers already from the key."""
import json, re

q = {x['n']: x for x in json.load(open('_questions_c.json', encoding='utf-8'))}
LET = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4}

def setq(n, own=None, opts=None):
    x = q[n]
    if own is not None: x['ownText'] = own
    if opts is not None: x['options'] = opts
    parts = [p for p in [x['context'].strip(), x['ownText'].strip()] if p]
    x['questionText'] = '\n\n'.join(parts)

# ---- Re-insert Q2 (Directions 1-2: fill the blank). Key: Q2 = (a) How.
q[2] = {
    'n': 2, 'section': 'English Language',
    'questionText': "_____ can policy makers strive to make education more accessible?",
    'context': '', 'ownText': "_____ can policy makers strive to make education more accessible?",
    'options': ['How', 'Now', 'What', 'When', 'Where'],
    'answerIndex': LET['a'], 'explanation': '',
}

# ---- Q63 / Q65 equation images
setq(63, own="(4560/15) ÷ (50/2450) = ? − 45% of 500",
     opts=['13345', '12323', '19093', '18118', '15121'])
setq(65, own="∛6859 × 4 + 25% of 240 = ?",
     opts=['184', '136', '58', '124', '256'])

out = [q[n] for n in range(1, 101)]
problems = [(x['n'], len(x['options']), x['answerIndex']) for x in out
            if len(x['options']) != 5 or x['answerIndex'] is None]
print('problems:', problems if problems else 'NONE')
json.dump(out, open('_final_c.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote _final_c.json', len(out), 'questions')
