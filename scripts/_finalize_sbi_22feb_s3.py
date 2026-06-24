#!/usr/bin/env python3
"""Patches for SBI Clerk Prelims 22-Feb-2025 Shift-3 -> _final_s3.json.
DI line graph (Q31-35), DI table (Q42-46) and the simplification equation-images
(Q47-51) transcribed from the rendered PDF. Four questions had NO solution block
(Q48/54/72/87); answers derived independently (math, coding, direction puzzle).
Other answers come from the by-printed-number key."""
import json, re

q = {x['n']: x for x in json.load(open('_questions_s3.json', encoding='utf-8'))}
LET = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4}

def setq(n, own=None, opts=None, ctx=None, ans=None, expl=None):
    x = q[n]
    if ctx is not None: x['context'] = ctx
    if own is not None: x['ownText'] = own
    if opts is not None: x['options'] = opts
    if ans is not None: x['answerIndex'] = LET[ans]
    if expl is not None: x['explanation'] = expl
    parts = [p for p in [x['context'].strip(), x['ownText'].strip()] if p]
    x['questionText'] = '\n\n'.join(parts)

# ---- Q31-35 DI line graph (umbrellas Twofold + Threefold sold by shops A-E)
GRAPH = ("Directions (31-35): The line graph shows the total number of umbrellas "
         "(Twofold + Threefold) sold by five different shops (A, B, C, D and E).\n\n"
         "A = 110, B = 90, C = 75, D = 85, E = 65")
for n in range(31, 36):
    setq(n, ctx=GRAPH)

# ---- Q42-46 DI table (mobiles sold by A, B, C in March/April/May)
TABLE = ("Directions (42-46): The table shows the number of mobiles sold by A, B and C in "
         "three different months — March, April and May.\n\n"
         "Person | March | April | May\n"
         "A | 40 | 36 | 84\n"
         "B | 60 | 50 | 72\n"
         "C | 54 | 48 | 30")
for n in range(42, 47):
    setq(n, ctx=TABLE)

# ---- Q47-54 simplification (Q47-51 are equation-images)
setq(47, own="45% of 1800 + (14)² + ? ÷ ∛64 = 3 × ? + 16",
     opts=['360', '372', '291', '312', '289'])
setq(48, own="53/3 − 41/5 − 48/5 + ? = 1/3 + 1/5",
     opts=['2/3', '1/5', '3/5', '2/5', '1/3'], ans='a',
     expl="53/3 − 41/5 − 48/5 = −2/15. So ? = (1/3 + 1/5) + 2/15 = 8/15 + 2/15 = 10/15 = 2/3.")
setq(49, own="3/4 th of (3/7 of 35 ÷ 1/6 × √16) = ?",
     opts=['270', '170', '240', '27', '17'])
setq(50, own="√(?) = (1872 ÷ √144) ÷ (13/2)",
     opts=['484', '676', '576', '529', '625'])
setq(51, own="−28 + 5 1/3 + 8 4/5 − 6 3/5 + ? = 7 2/3",
     opts=['28 2/15', '28 4/15', '28 1/15', '28 1/5', '28 1/3'], ans='a',
     expl="Constant part = −28 + 16/3 + 44/5 − 33/5 = −307/15. ? = 23/3 + 307/15 = "
     "115/15 + 307/15 = 422/15 = 28 2/15.")
# Q54 (no solution block): 5/4 × 36 + 9/4 × 44 = 45 + 99 = 144 = ?² -> ? = 12.
setq(54, own="5/4 th of 36 + 9/4 th of 44 = ?²",
     opts=['12', '144', '14', '16', '8'], ans='a',
     expl="5/4 × 36 = 45 and 9/4 × 44 = 99. 45 + 99 = 144 = ?² → ? = 12.")

# ---- Q72 coding (no solution block): win = ih, hard = mn -> "Win Hard" = "ih mn".
setq(72, ans='a', expl="From the codes: fast = rm so (Win Fast = 'ih rm') gives win = ih; "
     "big = jn, study = vt, best = fg, so in 'Study hard big best' hard = mn. "
     "Hence 'Win Hard' = ih mn.")
# ---- Q87 direction (no solution block): D is 7m west and 4m north of A -> North-West.
setq(87, ans='d', expl="Taking D at origin: B is 4 m south of D, and A is 7 m east of B, so A "
     "is 7 m east and 4 m south of D. Thus D is 7 m west and 4 m north of A → North-West.")

out = [q[n] for n in range(1, 101)]
problems = []
for x in out:
    if len(x['options']) != 5: problems.append((x['n'], 'opts', len(x['options'])))
    if x['answerIndex'] is None: problems.append((x['n'], 'noans'))
    blob = x['questionText'] + ' ' + ' '.join(x['options'])
    if '�' in blob or re.search(r'[\U0001D400-\U0001D7FF]', blob):
        problems.append((x['n'], 'artifact'))
print('problems:', problems if problems else 'NONE')
json.dump(out, open('_final_s3.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote _final_s3.json', len(out), 'questions')
