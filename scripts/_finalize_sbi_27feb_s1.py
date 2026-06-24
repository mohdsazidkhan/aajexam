#!/usr/bin/env python3
"""Paper-specific patches for SBI Clerk Prelims 27-Feb-2025 Shift-1 -> _final_s1.json.
DI table (Q31-35), line graph (Q61-65) and equation-image questions (Q42/43/46/47/48,
plus Q52's missing in-text values) are images in the docx; transcribed from the rendered
PDF. Twelve questions had NO solution block in the source
(Q31/40/47/53/57/61/64/69/70/77/78/79); answers derived independently (math, DI, and the
box-stack & square-table arrangements reconstructed from the clues). Other answers come
from the by-printed-number key."""
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

# ---- Q31-35: DI table (candidates appeared in exams A/B/C across 2020-2022)
TABLE = ("Directions (31-35): The table shows the number of candidates appeared in three "
         "different exams (A, B & C) in three different years 2020, 2021 and 2022.\n\n"
         "Exam | 2020 | 2021 | 2022\n"
         "A | 46 | 35 | 36\n"
         "B | 38 | 45 | 55\n"
         "C | 34 | 48 | 65")
for n in range(31, 36):
    setq(n, ctx=TABLE)
# Q31 (no solution block): A+B in 2020 = 84; 25% more = 105.
setq(31, ans='a', expl="Candidates in A and B together in 2020 = 46 + 38 = 84. "
     "25% more = 84 × 1.25 = 105.")

# ---- Q40-50 simplification: four are equation-images; Q40 is text but had no solution.
setq(40, own="225% of 200 = ? − 25% of 40", ans='a',
     expl="225% of 200 = 450; 25% of 40 = 10. So ? = 450 + 10 = 460.")
setq(42, own="(30% of 4200 + 10% of 1200) ÷ (1300 + 80) = ?",
     opts=['3', '2', '1', '4', '5'])
setq(43, own="(√6)⁶ × √4 = ?",
     opts=['400', '225', '236', '432', '480'])
setq(46, own="? + 35% of 224 = 99 − 156.8 ÷ 8",
     opts=['2', '3', '1', '4', '5'])
# Q47 equation-image AND no solution block: ?/150 = (1/?)×120×0.2 -> ?² = 3600 -> ? = 60.
setq(47, own="? × (1/150) = (1/?) × 120 × 0.2",
     opts=['80', '10', '16', '60', '20'], ans='d',
     expl="?/150 = 24/? → ?² = 150 × 24 = 3600 → ? = 60.")
setq(48, own="? = (60% of 600) ÷ 720",
     opts=['40', '20', '36', '0.5', '50'])

# Q52: in-text values were images (Divya+Priya = 7½ days, Priya+Riya = 7⅕ days).
setq(52, own="Divya alone can do a work in 12 days, while Divya and Priya together can do "
     "the same work in 7½ days. If Priya and Riya together can do the same work in 7⅕ days, "
     "then find in how many days Riya alone can do the same work?",
     opts=['9¾', '11¼', '11½', '13¾', '11⅛'],
     expl="Divya = 1/12. Divya+Priya = 1/7.5 = 2/15 → Priya = 1/20. Priya+Riya = 1/7.2 = "
     "5/36 → Riya = 5/36 − 1/20 = 4/45 → Riya alone = 45/4 = 11¼ days.")

# Q53 (no solution block): 6000 at 20% loss = 4800; 4800 at 40% profit = 6720; profit = 720.
setq(53, ans='d', expl="SP after 20% loss = 6000 × 0.8 = 4800. Selling at 40% profit = "
     "4800 × 1.4 = 6720. Overall profit = 6720 − 6000 = 720.")
# Q57 (no solution block): milk 140, water 100; 140 + X = 1.8 × 100 -> X = 40.
setq(57, ans='a', expl="240 L in ratio 7:5 → milk = 140 L, water = 100 L. After adding X L "
     "milk: 140 + X = 1.8 × 100 = 180 → X = 40.")

# ---- Q61-65: DI line graph (total students & Visual Art students in colleges A-D)
GRAPH = ("Directions (61-65): The line graph shows the total number of students in four "
         "colleges (A, B, C and D) and the number of students in the Visual Art department. "
         "(Fine Art students = Total students − Visual Art students.)\n\n"
         "Total Students: A = 500, B = 400, C = 240, D = 440\n"
         "Visual Art Students: A = 200, B = 220, C = 160, D = 340")
for n in range(61, 66):
    setq(n, ctx=GRAPH)
# Q61 (no solution block): Fine Art A+B = 300 + 180 = 480; total B = 400 -> 480:400 = 6:5.
setq(61, ans='b', expl="Fine Art = Total − Visual Art. A = 500 − 200 = 300, B = 400 − 220 = "
     "180. (300 + 180) : 400 = 480 : 400 = 6 : 5.")
# Q64 (no solution block): average total = (500+400+240+440)/4 = 395.
setq(64, ans='b', expl="Average total students = (500 + 400 + 240 + 440)/4 = 1580/4 = 395.")

# ---- Box-stack puzzle (Q66-70): unique arrangement, top -> bottom: Q, K, P, L, J, O, M, N.
# Q69 (no solution block): relation Q->P and K->L is 'second box below'; for N (bottom)
# the mirror gives the box two above N = O.
setq(69, ans='c', expl="Arrangement (top→bottom): Q, K, P, L, J, O, M, N. Q is related to P "
     "and K to L (each the second box below). The box correspondingly related to N is Box O.")
# Q70 (no solution block): boxes between K(2nd from top) and N(bottom) = P, L, J, O, M = 5.
setq(70, ans='a', expl="In Q, K, P, L, J, O, M, N (top→bottom), the boxes between K and N are "
     "P, L, J, O and M = Five.")

# ---- Square-table puzzle (Q71-79): clockwise arrangement
# U(corner), X(mid), T(corner), R(mid), Y(corner), W(mid), S(corner), V(mid).
# Q77 (no solution block): U, S, Y, T are corner persons (face centre); W is a mid (faces
# outward) -> W is the odd one out.
setq(77, ans='e', expl="Corners (facing centre): U, T, Y, S. Mids (facing outward): X, R, W, "
     "V. Among U, S, Y, T, W — only W faces outward, so W does not belong to the group.")
# Q78 had a blank: persons between Y and S from left of Y = 1 (W); the person with 1 between
# from the right of Y is T (R between) -> blank = T.
setq(78, own="The number of persons sitting between Y and S when counting from the left of Y "
     "is the same as the number of persons sitting between Y and ___ when counting from the "
     "right of Y. Who sits at the blank?",
     ans='a', expl="From Y's left, S has one person (W) between them. From Y's right, the "
     "person with exactly one person (R) between is T.")
# Q79 (no solution block): from right of T (anticlockwise) to W: X, U, V, S = 4 persons.
setq(79, ans='e', expl="Counting from the right of T up to W, the persons in between are X, U, "
     "V and S = Four.")

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
