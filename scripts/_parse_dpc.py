#!/usr/bin/env python3
"""Parser for Delhi Police Constable (SSC-DPC) PYQ papers.
Input: pdftotext -layout output of the question PDF. Format:
  Que. N <stem...>
    1. opt1
    2. opt2
    3. opt3
    4. opt4
  ...
  Que. N Correct Option - X      <- trailing answer key (one per question)

Emits _questions_<slug>.json: list of {n, section, questionText, options[4],
answerIndex, isImageQ, optionsAreImages}. Image-based (figure) questions are flagged
so the seed step can attach questionImage / optionImages.

Sections (this 2017 paper's content blocks; override via CLI LAYOUT):
  Reasoning 1-35, General Knowledge 36-85, Numerical 86-100.
Usage: python scripts/_parse_dpc.py _pdf_d1.txt d1 [REA:1-35,GK:36-85,NUM:86-100]
"""
import re, json, sys

SRC = sys.argv[1]
SLUG = sys.argv[2]
LAYOUT = sys.argv[3] if len(sys.argv) > 3 else 'REA:1-35,GK:36-85,NUM:86-100'

SECMAP = {'REA': 'Reasoning / Logical Ability',
          'GK': 'General Knowledge / Current Affairs',
          'NUM': 'Numerical Ability (Quantitative Aptitude)'}
ranges = []
for part in LAYOUT.split(','):
    key, rng = part.split(':')
    a, b = rng.split('-')
    ranges.append((int(a), int(b), SECMAP[key]))

def section_for(n):
    for a, b, name in ranges:
        if a <= n <= b:
            return name
    return SECMAP['GK']

raw = open(SRC, encoding='utf-8', errors='replace').read()
raw = raw.replace('\x0c', '\n')

# Split answer key (trailing "Que. N Correct Option - X") from the question portion.
KEY_RE = re.compile(r'Que\.\s*(\d+)\s*Correct Option\s*-\s*(\d)')
answers = {}
first_key = None
for m in KEY_RE.finditer(raw):
    n, opt = int(m.group(1)), int(m.group(2))
    answers[n] = opt - 1                       # 1-based -> 0-based
    if first_key is None:
        first_key = m.start()
qpart = raw[:first_key] if first_key is not None else raw

# Question blocks: "Que. N <body up to next 'Que. N'>"
blocks = re.findall(r'Que\.\s*(\d+)\s(.*?)(?=Que\.\s*\d+\s|\Z)', qpart, re.DOTALL)

OPT_RE = re.compile(r'(?m)^\s*([1-4])\.\s*(.*)$')

questions = {}
for num_s, body in blocks:
    n = int(num_s)
    if n in questions:                         # docx/pdf sometimes repeats a block; keep first
        continue
    opts_found = list(OPT_RE.finditer(body))
    if opts_found:
        stem = body[:opts_found[0].start()].strip()
    else:
        stem = body.strip()
    # collect text for each of the 4 option markers
    opts = ['', '', '', '']
    present = {}
    for i, mk in enumerate(opts_found):
        idx = int(mk.group(1)) - 1
        end = opts_found[i+1].start() if i+1 < len(opts_found) else len(body)
        seg = (mk.group(2) + ' ' + body[mk.end():end]).strip()
        seg = re.sub(r'\s+', ' ', seg).strip()
        if 0 <= idx <= 3 and idx not in present:
            opts[idx] = seg
            present[idx] = True
    stem = re.sub(r'\s+', ' ', stem).strip()
    n_text_opts = sum(1 for o in opts if o)
    options_are_images = n_text_opts < 4       # blank option slots -> figure options
    is_image_q = options_are_images or bool(re.search(r'\bfigure', stem, re.I))
    questions[n] = {
        'n': n,
        'section': section_for(n),
        'questionText': stem,
        'options': opts,
        'answerIndex': answers.get(n),
        'isImageQ': is_image_q,
        'optionsAreImages': options_are_images,
    }

out = [questions[n] for n in sorted(questions)]
img_qs = [q['n'] for q in out if q['isImageQ']]
opt_img_qs = [q['n'] for q in out if q['optionsAreImages']]
noans = [q['n'] for q in out if q['answerIndex'] is None]
print(f'questions parsed: {len(out)} (expected 100)')
print(f'answers found: {len(answers)}')
print(f'questions without answer: {noans}')
print(f'image questions (figure in stem or blank opts): {img_qs}')
print(f'  of which option-image questions: {opt_img_qs}')
json.dump(out, open(f'_questions_{SLUG}.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print(f'wrote _questions_{SLUG}.json')
