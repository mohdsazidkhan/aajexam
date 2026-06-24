#!/usr/bin/env python3
"""Patches for SBI Clerk Prelims 20-Sep-2025 Shift-1 -> _final_a.json.
Source (2025 cycle) has a complete by-number answer key; only two questions had
image/merged options: Q57 (equation image) and Q88 (syllogism whose conclusion-options
were merged). Both answers already come from the key."""
import json, re

q = {x['n']: x for x in json.load(open('_questions_a.json', encoding='utf-8'))}

def setq(n, own=None, opts=None):
    x = q[n]
    if own is not None: x['ownText'] = own
    if opts is not None: x['options'] = opts
    parts = [p for p in [x['context'].strip(), x['ownText'].strip()] if p]
    x['questionText'] = '\n\n'.join(parts)

setq(57, own="11² + 338 ÷ 26 = ? − 3", opts=['137', '130', '115', '120', '149'])
setq(88, own="Statements: Only a few apples are sweet. Some sweet is sugar. All sugar is cherries.\n"
     "Conclusions:\nI. Some sugar being apples is a possibility\nII. Some sweet are not cherries",
     opts=['If only conclusion I follows', 'If only conclusion II follows',
           'If either conclusion I or II follows', 'If neither conclusion I nor II follows',
           'If both conclusions I and II follow'])

out = [q[n] for n in range(1, 101)]
problems = [(x['n'], len(x['options'])) for x in out
            if len(x['options']) != 5 or x['answerIndex'] is None]
print('problems:', problems if problems else 'NONE')
json.dump(out, open('_final_a.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote _final_a.json', len(out), 'questions')
