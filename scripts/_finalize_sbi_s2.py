#!/usr/bin/env python3
"""Paper-specific patches for SBI Clerk Prelims 28-Feb-2025 Shift-2 -> _final_s2.json.
The DI table (Q31-35), the bar graph (Q36-40) and four simplification equations
(Q48, Q49, Q50, Q52) are images in the docx; transcribed from the rendered PDF.
Seven questions had no solution block in the source (Q59, Q64, Q68, Q71, Q76, Q82, Q85);
their answers were independently derived (see per-question notes) and set here.
All other answers come from the by-printed-number key in the parser."""
import json, re

q = {x['n']: x for x in json.load(open('_questions_s2.json', encoding='utf-8'))}
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

# ---- Q31-35: DI table (home loan & personal loan provided by banks A-E)
TABLE = ("Directions (31-35): The table given below shows the home loan and personal loan "
         "provided to the people from five different banks A, B, C, D and E.\n\n"
         "Bank | Home loan | Personal loan\n"
         "A | 20 | 45\n"
         "B | 34 | 56\n"
         "C | 84 | 21\n"
         "D | 42 | 20\n"
         "E | 12 | 13")
for n in range(31, 36):
    setq(n, ctx=TABLE)

# ---- Q36-40: bar graph (orders taken by P, Q, R, S, T)
GRAPH = ("Directions (36-40): The bar graph given below shows the number of orders taken by "
         "P, Q, R, S and T of a project.\n\n"
         "P = 72, Q = 108, R = 144, S = 120, T = 48")
for n in range(36, 41):
    setq(n, ctx=GRAPH)

# ---- Q48-57 simplification: four are equation-images (no question text in docx).
# Equations transcribed from rendered PDF; answers verified against the by-number key.
setq(48, own="4 4/6 + 3/2 − 12 2/3 = ?",
     opts=['0.25', '-6.5', '0.28', '25', '12'])
setq(49, own="133⅓% of 900 + 112½% of 640 = ?% of 500",
     opts=['370', '375', '365', '384', '380'])
setq(50, own="550/13 ÷ 11/65 + 153/17 ÷ 9/2 = ?",
     opts=['226', '299', '244', '258', '252'])
setq(52, own="(845% of 500) ÷ ?² = √625",
     opts=['13', '25', '6', '5', '9'])

# ---- Seven questions had no solution block in the source; answers derived independently.
# Q59: A = 40; B = 20% more = 48; avg(A,B) = 44 = C's age 10 yrs ago -> C = 54.
setq(59, ans='d', expl="B = 40 × 1.2 = 48. Average of A and B = (40 + 48)/2 = 44, which is "
     "C's age 10 years ago. So present age of C = 44 + 10 = 54.")
# Q64: 57.6 km/hr = 16 m/s; 16 × 40 = 640 m = 240 + X -> X = 400.
setq(64, ans='a', expl="Speed = 57.6 × 5/18 = 16 m/s. Distance in 40 s = 640 m = train + bridge "
     "= 240 + X. So X = 400 m.")
# Q68: writing=ab, books=xy, knowledge=no, monitor=ku, improve=vl; "xy vl" = books + improve.
setq(68, ans='e', expl="Decoding: books = xy, improve = vl (writing = ab, knowledge = no, "
     "monitor = ku). Hence 'xy vl' = Improve books.")
# Q71: DEALING pairs (word gap = alphabet gap), forward or backward: D-E, L-N, I-G = 3.
setq(71, ans='c', expl="Qualifying letter pairs in DEALING are D-E, L-N and I-G "
     "(letters between them in the word equal those in the alphabet). Total = Three.")
# Q76: removing first letter -> ORN, URN, IME, AND, ARN; meaningful: URN, AND = 2.
setq(76, ans='e', expl="Removing the first letter: BORN→ORN, TURN→URN, TIME→IME, HAND→AND, "
     "EARN→ARN. Meaningful words: URN and AND = Two.")
# Q82: M-(N7)->N, right(E5)->O, left(N8)->P; P=(5,15), N=(0,7); dist=√(5²+8²)=√89.
setq(82, ans='b', expl="N is 7 km north of M. From N: right (east) 5 km to O, then left (north) "
     "8 km to P. P is 5 km east and 8 km north of N → distance = √(5² + 8²) = √89 km.")
# Q85: A, C, D, G are female; H is male (brother-in-law) -> odd one out is H.
setq(85, ans='e', expl="A (daughter-in-law), C (paternal aunt), D (sister-in-law) and G "
     "(daughter) are all female; H is male (brother-in-law of E). So H does not belong.")

out = [q[n] for n in range(1, 101)]
problems = []
for x in out:
    if len(x['options']) != 5: problems.append((x['n'], 'opts', len(x['options'])))
    if x['answerIndex'] is None: problems.append((x['n'], 'noans'))
    blob = x['questionText'] + ' ' + ' '.join(x['options'])
    if '�' in blob or re.search(r'[\U0001D400-\U0001D7FF]', blob):
        problems.append((x['n'], 'artifact'))
print('problems:', problems if problems else 'NONE')
json.dump(out, open('_final_s2.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote _final_s2.json', len(out), 'questions')
