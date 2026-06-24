#!/usr/bin/env python3
"""Paper-specific patches for SBI Clerk Prelims 27-Feb-2025 Shift-2 -> _final_s2.json.
DI table (Q31-35), line graph (Q36-40) and equation/word-problem images (Q42/43/44/46/47
equations; Q49/54/55 word problems with image options) are transcribed from the rendered
PDF. Five questions had NO solution block in the source (Q19/28/57/89/97); answers derived
independently. Other answers come from the by-printed-number key."""
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

# ---- Q31-35: DI table (shoes sold by sellers A-E on Mon/Tue/Sun)
TABLE = ("Directions (31-35): The table shows the total number of shoes sold by five "
         "different sellers (A, B, C, D and E) on three different days.\n\n"
         "Seller | Monday | Tuesday | Sunday\n"
         "A | 20 | 50 | 40\n"
         "B | 60 | 35 | 45\n"
         "C | 30 | 75 | 35\n"
         "D | 80 | 40 | 70\n"
         "E | 95 | 60 | 90")
for n in range(31, 36):
    setq(n, ctx=TABLE)

# ---- Q36-40: DI line graph (articles sold by shops A-E)
GRAPH = ("Directions (36-40): The line graph shows the total number of articles sold by five "
         "different shops (A, B, C, D and E).\n\n"
         "A = 24, B = 18, C = 30, D = 42, E = 15")
for n in range(36, 41):
    setq(n, ctx=GRAPH)

# ---- Q42-47 equation-images
setq(42, own="(5425 + 575 + 100) ÷ 61 = 100 × ?",
     opts=['4', '2', '1', '5', '10'])
setq(43, own="(240/15) + 15 + ? = (42/7) × 8.5",
     opts=['14', '20', '11', '15', '10'])
setq(44, own="23 1/5 + 12 2/5 + ? = 53 1/15",
     opts=['213/15', '4/13', '411/15', '37/15', '262/15'])
setq(46, own="(45/7) × (350/9) ÷ (?/5) ÷ (1250/27) = ?²",
     opts=['3', '8', '10', '15', '4'])
setq(47, own="2⁵ × 250 ÷ 5³ × 25 ÷ 32 = ?",
     opts=['30', '50', '16', '10', '20'])

# ---- Q49/54/55 word problems whose options were images
setq(49, own="The quantity of a mixture is 108 litres and the ratio of milk to water is 5 : 4. "
     "If x litres of water is taken out, the ratio of milk to water becomes 10 : 3. Find x.",
     opts=['30', '20', '12', '15', '24'])
setq(54, own="A car travels 108 km in 2 hours and a bus travels the same distance in 3 hours. "
     "Find the difference between the speeds (in km/h) of the car and the bus.",
     opts=['18', '26', '12', '16', '10'])
setq(55, own="A man invested Rs. P at the rate of 5% p.a. for 2 years and the difference "
     "between the compound interest and simple interest is Rs. 20. Find P.",
     opts=['8000', '1200', '3600', '4800', '5000'])

# ---- Five questions had no solution block; answers derived independently.
# Q19: synonym of "thirst" (thirst for structure) = Desire.
setq(19, ans='b', expl="In the passage, 'thirst' (some individuals thirst for structure) means "
     "a strong craving — i.e. Desire.")
# Q28: Eiffel Tower is / a famous tourist destination / located in Paris / and attracts...
setq(28, ans='b', expl="Correct order: Q (the Eiffel Tower is) + P (a famous tourist "
     "destination) + R (located in Paris) + S (and attracts millions of visitors) = QPRS.")
# Q57: SI in X = 400×4×4/100 = 64; in B = 800×x×3/100 = 24x; 64 + 24x = 256 -> x = 8.
setq(57, ans='b', expl="SI (scheme X) = 400 × 4 × 4 / 100 = 64. SI (scheme B) = 800 × x × 3 / "
     "100 = 24x. 64 + 24x = 256 → 24x = 192 → x = 8.")
# Q89: coding -> drink = mn (green=hg, on=ty, juice=py, orange=eg, so the leftover in S4 is mn).
setq(89, ans='a', expl="From the codes: juice = py, on = ty, orange = eg. In 'Orange on juice "
     "drink' = 'eg ty mn py', the remaining code mn maps to Drink.")
# Q97: order (desc) E > A > B > D > C > F; with B=30, F=25, C lies between 25 and 30 -> 27kg.
setq(97, ans='e', expl="Weights in descending order: E > A > B > D > C > F. With B = 30 kg and "
     "F = 25 kg, C lies between F and D (25 < C < 30); the only such option is 27 kg.")

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
