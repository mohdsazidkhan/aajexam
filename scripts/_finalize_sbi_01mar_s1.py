#!/usr/bin/env python3
"""Patches for SBI Clerk Prelims 01-Mar-2025 Shift-1 -> _final_s1.json.
DI bar graph (Q31-35) transcribed from the rendered PDF and the Q48/49/50 equation-images
read from it. Seven questions had NO solution block (Q36/39/42/48/65/69/73); answers
derived independently (caselet maths validated against keyed Q37/Q38, partnership, ratio,
coding, syllogism). The simplification block (46-55) had the first question's equation
glued into the shared 'Directions' context — reset to a clean instruction.
Other answers come from the by-printed-number key."""
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

# ---- Q31-35 DI bar graph (people taking flights for Pune & Delhi from airlines A-E)
GRAPH = ("Directions (31-35): The bar graph shows the total number of people who take flights "
         "for Pune and Delhi from five different airlines (A, B, C, D and E).\n\n"
         "Pune:  A = 160, B = 260, C = 200, D = 140, E = 220\n"
         "Delhi: A = 300, B = 180, C = 280, D = 240, E = 120")
for n in range(31, 36):
    setq(n, ctx=GRAPH)

# ---- Q36-40 caselet (classes 8/9/10). Derived totals (validated vs keyed Q37=e, Q38=d):
# Boys8=24, Girls8=36; Boys9=63, Girls9=21 (total9=84); Girls10=24, Boys10=20.
setq(36, ans='a', expl="Boys in class 8 = 40% of 60 = 24; Girls in class 8 = 36. Boys in "
     "class 9 : Girls in class 8 = 7 : 4 → Boys9 = 63; total class 9 = 84 → Girls9 = 21. "
     "Difference between Boys8 (24) and Girls9 (21) = 3.")
setq(39, ans='a', expl="Boys in class 8 = 24. Girls in class 10 = Girls9 × (1 + 1/7) = 21 × "
     "8/7 = 24. Average = (24 + 24)/2 = 24.")

# ---- Q42 partnership (no solution block)
# Anita: 5000x6 + 6000x6 = 66000; Banita: 4000x6 = 24000; ratio 66:24 = 11:4; Anita share
# = 11/15 x 39000 = 28600.
setq(42, ans='a', expl="Anita = 5000×6 + 6000×6 = 66000. Banita = 4000×6 = 24000. Ratio = "
     "66000 : 24000 = 11 : 4. Anita's share = 11/15 × 39000 = Rs. 28600.")

# ---- Q46-55 simplification: clean the polluted shared context; fix Q48/49/50 equation images
SIMP_CTX = "What will come in place of the question mark (?) in the following question?"
for n in range(46, 56):
    setq(n, ctx=SIMP_CTX)
# Restore superscripts that the docx text layer flattened (display only; answers keyed).
setq(47, own="28² + 16 = ?% of 20")
setq(53, own="2⁴ ÷ 32 × 4² = 2^?")
setq(54, own="28% of 400 + 125% of 80 = ?³ − 4")
setq(48, own="128/4 + 450/9 = ? × 2", opts=['41', '43', '42', '45', '49'], ans='a',
     expl="32 + 50 = 82 = ? × 2 → ? = 41.")
setq(49, own="1/3 of 366 + 2/9 of 540 = ? ÷ 4", opts=['967', '987', '958', '978', '968'])
setq(50, own="√1521 + 11 = ? + 15", opts=['42', '40', '35', '43', '39'])

# ---- Q65 ratio (no solution block): new ratio 14:11 holds for any x -> Can't be determined.
setq(65, ans='e', expl="A : B = 8 : 11. After A increases 40% and B decreases 20%: "
     "(8×1.4) : (11×0.8) = 11.2 : 8.8 = 14 : 11 for every value of x, so the original value "
     "of A cannot be determined.")
# ---- Q69 coding (no solution block): reach=OZ, class=MN, store=BO, best=LO -> (b) & (c) true.
setq(69, ans='e', expl="Decoding: reach = OZ, class = MN, best = LO, store = BO. So 'Reach "
     "class' = OZ MN (b) and 'Best store' = LO BO (c) are both true → Both (b) and (c).")
# ---- Q73 syllogism (no solution block): H >= W > Q = I > X < B > V.
setq(73, ans='a', expl="H ≥ W > Q = I > X gives H > X, so X ≤ H is true (I). W and B are both "
     "greater than X but not directly comparable, so W > B is not established (II). "
     "Hence only conclusion I is true.")

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
