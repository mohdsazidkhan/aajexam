#!/usr/bin/env python3
"""Paper-specific patches for SBI Clerk Prelims 2022 -> _final_sbi_2022.json.
The QA simplification section (Q57-70) is laid out in a multi-column table that both the PDF
and docx scramble; those questions were transcribed from the rendered PDF and verified against
the (by-number) answer key. Q31 was missing its 5th option; Direction(32-33) was fragmented."""
import json, re

q = {x['n']: x for x in json.load(open('_questions_sbi_2022.json', encoding='utf-8'))}

def setq(n, own=None, opts=None, ctx=None):
    x = q[n]
    if ctx is not None: x['context'] = ctx
    if own is not None: x['ownText'] = own
    if opts is not None: x['options'] = opts
    parts = [p for p in [x['context'].strip(), x['ownText'].strip()] if p]
    x['questionText'] = '\n\n'.join(parts)

# Q31: missing 5th option (e) F, B
setq(31, opts=['D, F', 'A, C', 'G, B', 'E, C', 'F, B'])

# Q36: mixed-fraction options split across lines -> transcribed from PDF
setq(36, opts=['10 4/7 days', '12 4/7 days', '14 4/7 days', '12 3/7 days', '12 2/7 days'])

# Q39: "66 2/3 %" fraction split in stem
setq(39, own="In a school total 360 students passed the exam, while 60% of total boys passed the "
              "exam and 40% of total girls passed the exam. If 66⅔% of total passed boys is 160, "
              "then find the total number of students in the school.")

# Q47-51: DI table caselet — reformat the patients table cleanly
DI_TBL = ("The table below shows the total number of patients admitted in three hospitals "
          "(A, B and C) in three different months.\n\n"
          "Hospital | March | April | May\n"
          "A | 1505 | 2800 | 2864\n"
          "B | 3676 | 1976 | 2228\n"
          "C | 2456 | 2804 | 2408")
for n in range(47, 52):
    setq(n, ctx=DI_TBL)
# Q48: "1/4 th" fraction split in stem
setq(48, ctx=DI_TBL,
     own="If 1/4th of total patients admitted in B in March are female and 60% of total "
         "patients admitted in A in April are female, then find the difference between the total "
         "male patients admitted in A in April and in B in March together, and the total patients "
         "admitted in C in May.")

# Q32-33: rebuild the fragmented family-relations direction
FAM = ("A family has three generations. F is the son-in-law of D, who has only one sibling. "
       "H is the brother-in-law of T and the spouse of D. H has no siblings. S is the niece of "
       "E, who is the brother of G. G is the daughter of T's sibling.")
setq(32, ctx=FAM)
setq(33, ctx=FAM)

# Q57-70: simplification — transcribed from rendered PDF (answers from by-number key)
QA_CTX = "What will come in place of the question mark (?) in the following question?"
QA = {
    57: ("25% of 256 + (⁴√256 ÷ 4) × 8 = ? + 10", ['64','62','60','56','82']),
    58: ("274 − 141 = ? + 98",                       ['39','31','37','33','35']),
    59: ("36% of 250 + 26 ÷ 2 × ? = 207",       ['8','5','6','9','7']),
    60: ("240 × 2.5 + 65 × (2/13) = ?² − √225", ['22','24','23','27','25']),
    61: ("4080 ÷ (? + 17) = 10² + 2",           ['23','42','51','15','16']),
    62: ("31.5 ÷ 3.5 × 12 − 8 = ?²",   ['10','25','75','100','50']),
    63: ("945 ÷ 35 × 20 = ?",                    ['540','550','560','570','580']),
    64: ("60% of 700 − 450 = ? − 85% of 120",    ['84','48','64','36','72']),
    65: ("30 ÷ (5/12) + √144 × 20 = ?",     ['118','156','208','256','312']),
    66: ("2 4/7 + 4 1/3 − 3 2/3 + 16/21 = ?",         ['4','5','3','7','6']),
    67: ("(0.9)² × 10 + 2.9 = ? + 132 ÷ 12", ['4','3','2','1','0']),
    68: ("26% of 50 of 5 ÷ 26 = ?",                   ['2.5','2.25','3.5','1.5','2']),
    69: ("(132 + 72) ÷ 12 × 17 = ? + 9²",   ['208','287','370','179','168']),
    70: ("0.26 × 50 + 13² = ?",                  ['182','181','180','189','188']),
}
for n, (own, opts) in QA.items():
    setq(n, own=own, opts=opts, ctx=QA_CTX)

out = [q[n] for n in range(1, 101)]
problems = []
for x in out:
    if len(x['options']) != 5: problems.append((x['n'], 'opts', len(x['options'])))
    if x['answerIndex'] is None: problems.append((x['n'], 'noans'))
    blob = x['questionText'] + ' ' + ' '.join(x['options'])
    if '�' in blob: problems.append((x['n'], 'replacement-char'))
print('problems:', problems if problems else 'NONE')
json.dump(out, open('_final_sbi_2022.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote _final_sbi_2022.json', len(out), 'questions')
