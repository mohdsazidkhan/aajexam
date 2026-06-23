#!/usr/bin/env python3
"""Paper-specific patches for SBI Clerk Prelims 28-Feb-2025 Shift-1 -> _final_s1.json.
The DI table (Q31-35), the line graph (Q36-40) and five simplification equations
(Q51, Q52, Q54, Q59, Q60) are images in the docx; they were transcribed from the
rendered PDF. Four questions had no solution block in the source (Q31, Q40, Q55, Q62);
their answers were independently re-derived from the (now transcribed) data and set here.
All other answers come from the by-printed-number key in the parser."""
import json, re

q = {x['n']: x for x in json.load(open('_questions_s1.json', encoding='utf-8'))}
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

# ---- Q31-35: DI table (number of students = Girls + Boys in classes A-D)
TABLE = ("Directions (31-35): The table given below shows the number of students "
         "(Girls + Boys) in four different classes (A, B, C & D).\n\n"
         "Class | Girls | Boys\n"
         "A | 24 | 45\n"
         "B | 60 | 90\n"
         "C | 12 | 36\n"
         "D | 84 | 72")
for n in range(31, 36):
    setq(n, ctx=TABLE)
# Q31 had no solution block: avg boys in C & B = (36+90)/2 = 63; girls in D = 84;
# 63 is (84-63)/84 = 25% less than 84.
setq(31, ans='a', expl="Average boys in C and B = (36 + 90)/2 = 63. Girls in D = 84. "
     "Required % less = (84 − 63)/84 × 100 = 25%.")

# ---- Q36-40: line graph (products sold Jan-Apr)
GRAPH = ("Directions (36-40): The line graph given below shows the number of products "
         "sold in the months of January, February, March and April.\n\n"
         "January = 120, February = 140, March = 150, April = 180")
for n in range(36, 41):
    setq(n, ctx=GRAPH)
# Q40 had no solution block: March(150) is 150/120 = 125% of January(120).
setq(40, ans='a', expl="Product sold in March = 150, in January = 120. "
     "Required % = 150/120 × 100 = 125%.")

# ---- Q51-60 simplification: five are equation-images (no question text in docx).
# Equations transcribed from rendered PDF; answers verified against the by-number key.
setq(51, own="140 × √(64 × ?) = 560",
     opts=['0.25', '6', '0.28', '25', '12'])
setq(52, own="(10 + 7)² ÷ 0.5 = ? − 12",
     opts=['520', '525', '590', '500', '490'])
# Q53 already text; tidy the exponent rendering ("2?" -> "2^?")
setq(53, own="544 ÷ 8.5 × 4 = 2^?")
setq(54, own="?² = (10 + 3)² − (3 × 2)² − 11 × 3",
     opts=['12', '10', '13', '14', '16'])
# Q55 had no solution block: ?^2 x (2^6 + 6^2) = 60^2 -> ?^2 x 100 = 3600 -> ? = 6.
setq(55, own="?² × (2⁶ + 6²) = 60²", ans='d',
     expl="?² × (64 + 36) = 3600 → ?² × 100 = 3600 → ?² = 36 → ? = 6.")
setq(59, own="1800 × (4/9) × (12/864) × (96/10) = ?",
     opts=['2', '0.10', '10', '0.01', '100'])
setq(60, own="(14/19) of 380 − (11/2) of 1440 = ?",
     opts=['7770', '-7640', '-7550', '7550', '7610'])

# ---- Q62 had no solution block: 80 L milk:water = 3:5 -> milk 30, water 50;
# (50 + X)/30 = 2/1 -> X = 10.
setq(62, ans='b', expl="Milk : Water = 3 : 5 in 80 L → milk = 30 L, water = 50 L. "
     "After adding X L water, water : milk = 2 : 1 → (50 + X)/30 = 2 → X = 10.")

out = [q[n] for n in range(1, 101)]
problems = []
for x in out:
    if len(x['options']) != 5: problems.append((x['n'], 'opts', len(x['options'])))
    if x['answerIndex'] is None: problems.append((x['n'], 'noans'))
    blob = x['questionText'] + ' ' + ' '.join(x['options'])
    if '�' in blob or re.search(r'[\U0001D400-\U0001D7FF]', blob):
        problems.append((x['n'], 'artifact'))
print('problems:', problems if problems else 'NONE')
json.dump(out, open('_final_s1.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote _final_s1.json', len(out), 'questions')
