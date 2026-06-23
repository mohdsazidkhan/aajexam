#!/usr/bin/env python3
"""Paper-specific patches for SBI Clerk Prelims 2021 -> _final_sbi_2021.json.
Recovers symbol-laden / image-backed questions that pdftotext mangled
(verified against the official answer key by rendering the PDF pages)."""
import json, re

q = {x['n']: x for x in json.load(open('_questions_sbi_2021.json', encoding='utf-8'))}

def setq(n, own=None, opts=None, ctx=None, img=None):
    x = q[n]
    if ctx is not None: x['context'] = ctx
    if own is not None: x['ownText'] = own
    if opts is not None: x['options'] = opts
    if img is not None: x['imageKey'] = img
    parts = [p for p in [x['context'].strip(), x['ownText'].strip()] if p]
    x['questionText'] = '\n\n'.join(parts)

REARR = ['ACB', 'BAC', 'CAB', 'BCA', 'No rearrangement required']
SHARED94 = ['If only conclusion I follows.', 'If only conclusion II follows.',
            'If either conclusion I or II follows.', 'If neither conclusion I nor II follows.',
            'If both conclusions I and II follow.']

# ---- Q7 / Q10: an inline "(C)" fragment leaked as a 6th option; restore sentence + 5 opts
setq(7,  own="It was fairly (A) detrimental (B) that his prison stay, especially during the "
              "pandemic, was obvious (C) to his well-being.", opts=REARR)
setq(10, own="Aviation websites are infrastructure (A) with reports of a rapid abuzz (B) of "
              "aviation upgradation (C) in Tibet.", opts=REARR)

# ---- Q11-18 cloze: tell the candidate which blank
for n in range(11, 19):
    q[n]['ownText'] = f"Select the most appropriate word to fill blank ({n}) in the passage above."
    parts = [q[n]['context'].strip(), q[n]['ownText']]
    q[n]['questionText'] = '\n\n'.join(p for p in parts if p)

# ---- Q31-35 DI: replace mangled ASCII bar-graph context with clean text + attach image
DI_CTX = ("Study the bar graph and answer the question. The bar graph shows the total number of "
          "flats and the number of vacant flats in five buildings (A, B, C, D and E). "
          "[Note: Total Flats = Vacant Flats + Occupied Flats]")
for n in range(31, 36):
    setq(n, ctx=DI_CTX, img='bargraph')

# ---- Q56-65 simplification: reconstruct from solutions (operators verified)
SIMP_CTX = "What will come in place of the question mark (?) in the following question?"
SIMP = {
    56: "512 ÷ ? × 6 = 192",
    57: "(48% of 625) ÷ 0.75 = ?",
    58: "65% of 480 − ? + 175 = 350",
    59: "45 + (20% of ?) = 460 ÷ 4",
    60: "(4)^? × 2 = (16)² ÷ ⁴√16        [⁴√16 = fourth root of 16]",
    61: "4 × (? + 120) = (8)³",
    62: "(56 ÷ ?) + (8)³ = 13% of 4000",
    63: "4 3/12 + 1 3/4 − ? = ³√64        [³√64 = cube root of 64]",
    64: "756 ÷ 14 × 5 − √7921 = ?",
    65: "462 ÷ 5.25 + 24 × 12 = ?",
}
for n, expr in SIMP.items():
    setq(n, own=expr, ctx=SIMP_CTX)

# ---- Q75-79 symbol series: pdftotext dropped © ® φ; supply corrected arrangement + image
ARR_CTX = ("Study the following arrangement carefully and answer the question.\n\n"
           "@ E K & Y R © C A M ® U L $ V Q # P % S I W * O T φ G")
for n in range(75, 80):
    setq(n, ctx=ARR_CTX, img='arrangement')

# ---- Q94-96 inequalities: operators recovered from page render; shared options
INEQ_CTX = ("In each question, statements are followed by two conclusions. Taking the statements "
            "to be true, decide which of the conclusions logically follows.")
setq(94, ctx=INEQ_CTX, opts=SHARED94,
     own="Statements: M < N ≤ O < R = S < T\nConclusions:\nI. M = O\nII. N < S")
setq(95, ctx=INEQ_CTX, opts=SHARED94,
     own="Statements: C ≥ D = E ≤ F < G ≤ H\nConclusions:\nI. C ≥ F\nII. F > C")
setq(96, ctx=INEQ_CTX, opts=SHARED94,
     own="Statements: S > U ≥ V = W ≤ X; W ≤ Y ≤ Z\nConclusions:\nI. S > W\nII. U ≥ Y")

# ---- Validation
out = [q[n] for n in range(1, 101)]
problems = []
for x in out:
    if len(x['options']) != 5: problems.append((x['n'], 'opts', len(x['options'])))
    if x['answerIndex'] is None: problems.append((x['n'], 'noans'))
    blob = x['questionText'] + ' ' + ' '.join(x['options'])
    if '�' in blob: problems.append((x['n'], 'replacement-char'))
print('problems:', problems if problems else 'NONE')

json.dump(out, open('_final_sbi_2021.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote _final_sbi_2021.json', len(out), 'questions')
