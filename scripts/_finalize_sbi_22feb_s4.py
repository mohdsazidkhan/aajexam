#!/usr/bin/env python3
"""Patches for SBI Clerk Prelims 22-Feb-2025 Shift-4 -> _final_s4.json.
DI table (Q49-53), bar graph (Q54-58) and the Q38/Q40 equation-images transcribed from
the rendered PDF. Three questions had NO solution block (Q44/49/59); answers derived
independently (geometry, DI ratio, boat & stream). Other answers come from the
by-printed-number key."""
import json, re

q = {x['n']: x for x in json.load(open('_questions_s4.json', encoding='utf-8'))}
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

# ---- Q38 / Q40 equation images
setq(38, own="175/13 × 143/25 + 13² = ?", opts=['236', '256', '248', '242', '246'])
setq(40, own="38/9 + 41/18 − 3 1/27 = ?",
     opts=['2 25/54', '4 25/54', '3 25/54', '1 25/54', '3 23/54'])

# ---- Q44 (no solution block): rect length = 720/24 = 30 = triangle base; height:base = 6:5
# -> height = 36; area = 1/2 x 30 x 36 = 540.
setq(44, ans='d', expl="Rectangle length = 720/24 = 30 cm = base of the triangle. Height : base "
     "= 6 : 5 → height = 30 × 6/5 = 36 cm. Area of triangle = ½ × 30 × 36 = 540 sq. cm.")

# ---- Q49-53 DI table (pens & books sold by shops A-E)
TABLE = ("Directions (49-53): The table shows the total number of pens and books sold by five "
         "shops (A, B, C, D and E).\n\n"
         "Shop | Pens sold | Books sold\n"
         "A | 84 | 100\n"
         "B | 120 | 120\n"
         "C | 90 | 96\n"
         "D | 60 | 50\n"
         "E | 110 | 64")
for n in range(49, 54):
    setq(n, ctx=TABLE)
# Q49 (no solution block): pens A+D = 144; books B+E = 184; 144:184 = 18:23.
setq(49, ans='a', expl="Pens by A and D = 84 + 60 = 144. Books by B and E = 120 + 64 = 184. "
     "144 : 184 = 18 : 23.")

# ---- Q54-58 DI bar graph (males & females in factories A-D)
GRAPH = ("Directions (54-58): The bar graph shows the number of males and females working in "
         "four different factories (A, B, C and D).\n\n"
         "Males:   A = 120, B = 72, C = 96, D = 48\n"
         "Females: A = 108, B = 80, C = 60, D = 124")
for n in range(54, 59):
    setq(n, ctx=GRAPH)

# ---- Q59 (no solution block): downstream speed 15; still-water time 10h -> still speed 9;
# stream 6; upstream speed 3; 36 km upstream -> 12 hours.
setq(59, ans='b', expl="Downstream speed = 90/6 = 15 km/h. Still-water time = 6 + 4 = 10 h → "
     "still-water speed = 9 km/h → stream = 6 km/h → upstream speed = 3 km/h. "
     "Time for 36 km upstream = 36/3 = 12 hours.")

out = [q[n] for n in range(1, 101)]
problems = []
for x in out:
    if len(x['options']) != 5: problems.append((x['n'], 'opts', len(x['options'])))
    if x['answerIndex'] is None: problems.append((x['n'], 'noans'))
    blob = x['questionText'] + ' ' + ' '.join(x['options'])
    if '�' in blob or re.search(r'[\U0001D400-\U0001D7FF]', blob):
        problems.append((x['n'], 'artifact'))
print('problems:', problems if problems else 'NONE')
json.dump(out, open('_final_s4.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote _final_s4.json', len(out), 'questions')
