#!/usr/bin/env python3
"""Patches for SBI Clerk Prelims 22-Feb-2025 Shift-1 -> _final_s1.json.
DI table (Q41-45), bar graph (Q46-50) and the Q35 equation-image transcribed from the
rendered PDF. Ten questions had NO solution block (Q35/43/52/57/61/66/67/68/69/70);
answers derived independently (math, DI and the month/date 'born' puzzle reconstructed
from the clues). Other answers come from the by-printed-number key."""
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

# ---- Q35 equation image
setq(35, own="√625 + ?² = 13²", opts=['10', '16', '8', '12', '14'], ans='d',
     expl="25 + ?² = 169 → ?² = 144 → ? = 12.")

# ---- Q41-45 DI table (movie tickets sold by malls A/B/C)
TABLE = ("Directions (41-45): The table shows the number of movie tickets sold by three malls "
         "A, B and C in the months of January, February and March.\n\n"
         "Month | A | B | C\n"
         "January | 120 | 125 | 110\n"
         "February | 150 | 90 | 100\n"
         "March | 140 | 100 | 150")
for n in range(41, 46):
    setq(n, ctx=TABLE)
# Q43 (no solution block): A+B in Feb = 240; C in March = 150; 240/150 = 160%.
setq(43, ans='d', expl="A and B together in February = 150 + 90 = 240. C in March = 150. "
     "240/150 × 100 = 160%.")

# ---- Q46-50 DI bar graph (sweets sold by shopkeeper A, Mon-Fri)
GRAPH = ("Directions (46-50): The bar graph shows the number of sweets sold by shopkeeper A "
         "from Monday to Friday.\n\n"
         "Monday = 150, Tuesday = 90, Wednesday = 120, Thursday = 100, Friday = 80")
for n in range(46, 51):
    setq(n, ctx=GRAPH)

# ---- Text-math questions with no solution block
# Q52: 25% food -> 75% left; 20% rent -> 60% left; 20% edu -> 48% left = 19200 -> income 40000.
setq(52, ans='d', expl="After 25% on food, 75% remains; after 20% on rent, 60% remains; after "
     "20% on education, 48% remains = saved Rs. 19200 → income = 19200/0.48 = Rs. 40000.")
# Q57: Sunita:Mohit = 6:5; Vinita = Mohit+11 = 2(Sunita-5) -> 5x+11 = 12x-10 -> x=3; Vinita=26.
setq(57, ans='e', expl="Let Sunita = 6x, Mohit = 5x. Vinita = 5x + 11 = 2(6x − 5) → 5x + 11 = "
     "12x − 10 → x = 3. Vinita = 5×3 + 11 = 26 years.")
# Q61: (L+350)/45 = L/30 -> L = 700.
setq(61, ans='d', expl="Speed equal: (L + 350)/45 = L/30 → 30(L + 350) = 45L → 15L = 10500 → "
     "L = 700 m.")

# ---- 'Born' puzzle (Q66-70): chronological order
# A(Jan 8), F(Jan 27), D(May 8), C(May 27), H(Jun 8), E(Jun 27), B(Nov 8), G(Nov 27).
setq(66, ans='d', expl="Order: A-Jan8, F-Jan27, D-May8, C-May27, H-Jun8, E-Jun27, B-Nov8, "
     "G-Nov27. F was born on 27 January.")
setq(67, ans='e', expl="C was born on 27 May; persons after C are H, E, B and G = Four.")
setq(68, ans='d', expl="Born on 8 November is B.")
setq(69, ans='e', expl="A, D, H and B were all born on date 8; G (born on 27) is the odd one.")
setq(70, own="Which of the following statements is correct?\n"
     "I. D was born after A\nII. G and C were born in the same month\nIII. H was born on 8 June",
     ans='d', expl="I: D (May 8) after A (Jan 8) — true. II: G (Nov), C (May) — false. "
     "III: H born on 8 June — true. Hence Only I and III.")

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
