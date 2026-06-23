#!/usr/bin/env python3
"""Paper-specific patches for SBI Clerk Prelims 2023 -> _final_sbi_2023.json.
The DI table (Q46-50) and the simplification equations (Q51-65) are images in the docx and
get scrambled by both PDF and docx text extraction; they were transcribed from the rendered
PDF and every QA answer was independently re-derived and matched against the by-number key."""
import json, re

q = {x['n']: x for x in json.load(open('_questions_sbi_2023.json', encoding='utf-8'))}

def setq(n, own=None, opts=None, ctx=None):
    x = q[n]
    if ctx is not None: x['context'] = ctx
    if own is not None: x['ownText'] = own
    if opts is not None: x['options'] = opts
    parts = [p for p in [x['context'].strip(), x['ownText'].strip()] if p]
    x['questionText'] = '\n\n'.join(parts)

# Q34: ratio "1 : 3" split across lines in the stem
setq(34, own=re.sub(r'\s+', ' ', q[34]['ownText']).strip())

# Q14-18 cloze: indicate the blank number
for n in range(14, 19):
    setq(n, own=f"Select the most appropriate word to fill blank ({n}) in the passage above.")

# Q46-50 DI table caselet
DI = ("The table below shows the yearly investment (in Rs.) done by Indumati and Chutki "
      "in three different schemes (LIC, ESIC and NPS).\n\n"
      "Scheme | Indumati | Chutki\n"
      "LIC | 24000 | 48000\n"
      "ESIC | 19500 | 12000\n"
      "NPS | 16000 | 18000")
for n in range(46, 51):
    setq(n, ctx=DI)
setq(48, ctx=DI,
     own="Yearly investment of Bholu in ESIC is 3/8th more than the yearly investment of "
         "Chutki in LIC. If Bholu invested an equal amount in installments, then find the "
         "monthly installment for Bholu in ESIC.")
setq(49, ctx=DI, opts=['66⅔%', '33⅓%', '60%', '40%', '25%'])

# Q51-65 simplification — transcribed from rendered PDF, answers matched to by-number key
SIMP_CTX = "What will come in place of the question mark (?) in the following question?"
SIMP = {
    51: ("1 2/5 + 4 3/10 = ? + 4 2/5",          ['1 3/10','2 3/5','4 3/5','5 3/5','3 3/5']),
    52: ("48% of ? + 45% of 600 = 19² + √841",  ['250','150','200','225','175']),
    53: ("? × (12 + 10% of 60) = 135",          ['5.5','6.5','4.5','5','7.5']),
    54: ("√? + 15 × 18 = 3600 ÷ 12",            ['900','950','850','800','750']),
    55: ("4.8 × 5 + 8 × 0.75 = ?",              ['40','20','30','50','60']),
    56: ("(46/7) × (350/9) = 10 × ?²",          ['5','8','10','-5','Both (a) and (d)']),
    57: ("2⁴ × 250 ÷ 5³ × 25 = 32 × 5^?",       ['3','2','5','1','0']),
    58: ("2691 ÷ 13 + 9 = ?³",                  ['4','11','6','15','7']),
    59: ("√75 × √300 = ?",                       ['100√3','120','75√3','140','150']),
    60: ("(10)² + (24)² = 276 + ?²",            ['34','6','28','12','20']),
    61: ("25% of (? + 360) = 15 × √100",        ['140','300','340','200','240']),
    62: ("(20% of 300 + 180) ÷ ? = 30",         ['12','4','6','8','10']),
    63: ("5600 ÷ 14 − ? = (42/6) × 50",         ['60','25','62','50','30']),
    64: ("2⁴ × 2^? = 32 × 64",                  ['6','9','5','7','3']),
    65: ("(32 × 3⁶) ÷ (81 × 4²) = √?",          ['441','324','144','529','400']),
}
for n, (own, opts) in SIMP.items():
    setq(n, own=own, opts=opts, ctx=SIMP_CTX)

out = [q[n] for n in range(1, 101)]
problems = []
for x in out:
    if len(x['options']) != 5: problems.append((x['n'], 'opts', len(x['options'])))
    if x['answerIndex'] is None: problems.append((x['n'], 'noans'))
    blob = x['questionText'] + ' ' + ' '.join(x['options'])
    if '�' in blob or re.search(r'[\U0001D400-\U0001D7FF]', blob): problems.append((x['n'], 'artifact'))
print('problems:', problems if problems else 'NONE')
json.dump(out, open('_final_sbi_2023.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote _final_sbi_2023.json', len(out), 'questions')
