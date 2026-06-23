#!/usr/bin/env python3
"""
Parser for SBI Clerk Prelims PYQ papers (Adda247 self-contained PDF with inline Solutions).
Input: pdftotext -layout output of the question-paper PDF (questions + a trailing
"Solutions" section with `S<N>. Ans.(x)` answer key and explanations).

Emits _questions_<slug>.json: list of {n, section, questionText, options[5], answerIndex, explanation}.
Direction/passage context (the text between a `Directions (X-Y):` header and the first
Q-marker in its range) is prepended to every question in that range so each DB question is
self-contained.

Section layout is the SBI Clerk Prelims order in this paper:
  ENG 1-30, Numerical Ability 31-65, Reasoning Ability 66-100  (override via CLI if needed).

Usage: python scripts/_parse_sbi_clerk.py _sbiq.txt sbi_2021 [ENG:1-30,NA:31-65,REA:66-100]
"""
import re, json, sys

SRC  = sys.argv[1]
SLUG = sys.argv[2]
LAYOUT = sys.argv[3] if len(sys.argv) > 3 else 'ENG:1-30,NA:31-65,REA:66-100'

SECMAP = {'ENG': 'English Language', 'NA': 'Numerical Ability', 'REA': 'Reasoning Ability'}
ranges = []
for part in LAYOUT.split(','):
    key, rng = part.split(':')
    a, b = rng.split('-')
    ranges.append((int(a), int(b), SECMAP[key]))

def section_for(n):
    for a, b, name in ranges:
        if a <= n <= b:
            return name
    return 'English Language'

raw = open(SRC, encoding='utf-8', errors='replace').read()
raw = raw.replace('\x0c', '\n')   # form-feeds glue page-top Q-markers to prior line

def strip_noise(s):
    # remove footer/header text INLINE (some answer keys share a line with the footer)
    s = re.sub(r'\d*\s*Adda247 \| No\. 1 APP for Banking & SSC Preparation', '', s)
    s = re.sub(r'Website:\s*bankersadda\.com.*', '', s)
    s = re.sub(r'SBI Clerk Prelims Previous Year Question Paper 2021', '', s)
    return s

# Split question portion from the trailing Solutions section (the standalone "Solutions" line)
m = re.search(r'\n\s*Solutions\s*\n', raw)
qpart = strip_noise(raw[:m.start()])
spart = strip_noise(raw[m.end():])

# ---- Answer key. Prefer mapping by PRINTED S-number (robust to scrambled solution order,
# as in the 2022/2023 multi-column papers). Fall back to positional mapping only when the
# printed numbers are NOT a clean 1..100 permutation (e.g. 2021's S60-misprinted-as-S50 dup).
LET = {'a':0,'b':1,'c':2,'d':3,'e':4}
ans_iter = list(re.finditer(r'S\s*(\d+)\.\s*Ans\.?\s*\(\s*([a-eA-E])\s*\)', spart))
nums = [int(m.group(1)) for m in ans_iter]
# Map by printed S-number whenever the numbers are unique and in 1..100 (robust to a few
# MISSING markers, e.g. equation-image Qs whose solution line is absent). Only fall back to
# positional mapping when printed numbers collide (e.g. 2021's S60-misprinted-as-S50 dup),
# which would make by-number mapping ambiguous.
by_number = len(nums) == len(set(nums)) and all(1 <= x <= 100 for x in nums)
if by_number:
    answers = [None] * 100
    for m in ans_iter:
        answers[int(m.group(1)) - 1] = LET[m.group(2).lower()]
    missing = [n for n in range(1, 101) if answers[n-1] is None]
    print(f'answer matches: {len(ans_iter)} (mapped by printed number); missing S-nums: {missing}')
else:
    answers = [LET[m.group(2).lower()] for m in ans_iter]
    print(f'answer matches: {len(ans_iter)} (mapped by order - fallback)')

# ---- Explanations: text after each S<n>.Ans marker until the next marker
explanations = [''] * 100
exp_by_order = []
for i, m in enumerate(ans_iter):
    end = ans_iter[i+1].start() if i+1 < len(ans_iter) else len(spart)
    exp_by_order.append((int(m.group(1)), spart[m.end():end]))
expl_chunks = [c for _, c in exp_by_order]
def clean_expl(t):
    t = re.sub(r'^\s*Sol\.?\s*', '', t.strip())
    t = re.sub(r'\n{2,}', '\n', t)
    t = re.sub(r'[ \t]+', ' ', t)
    # drop trailing "Solutions (x-y):" header that bleeds in from next block
    t = re.split(r'Solutions?\s*\(\d+-\d+\)\s*:', t)[0]
    return t.strip()
if by_number:
    explanations = [''] * 100
    for num, chunk in exp_by_order:
        if 1 <= num <= 100:
            explanations[num-1] = clean_expl(chunk)
else:
    explanations = [clean_expl(c) for c in expl_chunks]

# ---- Direction/passage context per range
contexts = {}  # (start,end) -> text
for dm in re.finditer(r'Directions?\s*\(\s*(\d+)\s*-\s*(\d+)\s*\)\s*:?(.*?)(?=\nQ\s*\d+\.)',
                      qpart, re.DOTALL):
    a, b = int(dm.group(1)), int(dm.group(2))
    ctx = re.sub(r'\n{2,}', '\n', dm.group(3)).strip()
    contexts[(a, b)] = ctx

def context_for(n):
    for (a, b), ctx in contexts.items():
        if a <= n <= b:
            return ctx
    return ''

# ---- Questions
qblocks = re.findall(
    r'Q\s*(\d+)\.\s*(.*?)(?=(?:\nQ\s*\d+\.)|(?:\nDirections?\s*\()|(?:\nDirection\s*\()|\Z)',
    qpart, re.DOTALL)
print(f'question blocks: {len(qblocks)}')

OPT_RE = re.compile(r'(?m)^[ \t]*\(\s*([a-eA-E])\s*\)\s*(.*)$')
LABEL_RE = re.compile(r'^\s*\(?\s*[a-eA-E]\s*[\).]\s*')  # strip leading "(a)"/"a)"/"a." label

def strip_label(s):
    return LABEL_RE.sub('', s).strip()

questions = []
for num_s, body in qblocks:
    n = int(num_s)
    # PDF format: option markers anchored to line start "(a) ..."
    markers = list(OPT_RE.finditer(body))
    if len(markers) == 5:
        qtext = body[:markers[0].start()].strip()
        opts = []
        for i, mk in enumerate(markers):
            end = markers[i+1].start() if i+1 < len(markers) else len(body)
            seg = (mk.group(2) + ' ' + body[mk.end():end]).strip()
            opts.append(re.sub(r'\s+', ' ', seg).strip())
    else:
        # docx format: options are the last 5 bare paragraphs (labels are list-formatting)
        paras = [p.strip() for p in body.split('\n') if p.strip()]
        if len(paras) >= 6:
            opts = [strip_label(p) for p in paras[-5:]]
            qtext = '\n'.join(paras[:-5]).strip()
        else:
            qtext, opts = body.strip(), []
    qtext = re.sub(r'\n{2,}', '\n', qtext).strip()
    ctx = context_for(n)
    full = (ctx + '\n\n' + qtext).strip() if ctx else qtext
    questions.append({
        'n': n,
        'section': section_for(n),
        'questionText': full,
        'context': ctx,
        'ownText': qtext,
        'options': opts,
        'answerIndex': answers[n-1] if n-1 < len(answers) else None,
        'explanation': explanations[n-1] if n-1 < len(explanations) else '',
    })

# ---- Validation report
bad = [q['n'] for q in questions if len(q['options']) != 5]
noans = [q['n'] for q in questions if q['answerIndex'] is None]
print(f'questions parsed: {len(questions)}')
print(f'questions WITHOUT exactly 5 options: {bad}')
print(f'questions without answer: {noans}')

json.dump(questions, open(f'_questions_{SLUG}.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print(f'wrote _questions_{SLUG}.json')
