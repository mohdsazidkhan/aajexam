#!/usr/bin/env python3
"""Parser for the 2020-era Delhi Police Constable response-sheet format.
Format: 'Q.N' markers that RESET per section ('Section : Part A/B/C/D'), options as
'Ans 1./2./3./4.', a 'Question ID : NNNN' per question, and 'Chosen Option' (candidate's
pick — IGNORED). The CORRECT answer is the option coloured GREEN (#40c64a) in the docx.

Strategy: take question text + 4 options from the PDF (clean, keyed by Question ID),
take the green option TEXT from the docx (keyed by Question ID), then match the green
text to one of the 4 PDF options to get the answer index. Section order A->B->C->D maps
to GK / Reasoning / Numerical / Computer; questions are numbered 1..100 in that order.

Usage: python scripts/_parse_dpc2020.py <pdftxt> <docx> <slug>
"""
import re, sys, json, zipfile

PDF, DOCX, SLUG = sys.argv[1], sys.argv[2], sys.argv[3]
SECNAME = {'A': 'General Knowledge / Current Affairs', 'B': 'Reasoning / Logical Ability',
           'C': 'Numerical Ability (Quantitative Aptitude)', 'D': 'Computer Awareness / Fundamentals'}

def norm(s):
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', (s or '').lower())).strip()

# ---- PDF: questions keyed by Question ID, with section ----
pdf = open(PDF, encoding='utf-8', errors='replace').read().replace('\x0c', '\n')
# tag current section as we scan; split into question chunks at 'Q.<n>'
chunks = re.split(r'(?=Q\.\s*\d+\b)|(?=Section\s*:\s*Part)', pdf)
pdf_q = {}      # qid -> {section, stem, options[4]}
cur_sec = 'A'
for ch in chunks:
    ms = re.match(r'Section\s*:\s*Part\s*([A-D])', ch)
    if ms:
        cur_sec = ms.group(1)
    mid = re.search(r'Question ID\s*:\s*(\d+)', ch)
    if not re.match(r'Q\.\s*\d+', ch) or not mid:
        continue
    qid = mid.group(1)
    if qid in pdf_q:
        continue
    body = ch[:mid.start()]
    # options: 'Ans 1.' then 2./3./4.
    om = list(re.finditer(r'(?m)(?:Ans\s*)?\b([1-4])\.\s', body))
    if len(om) < 4:
        # fallback: split on '\n   N.'
        om = list(re.finditer(r'(?m)^\s*([1-4])\.\s', body))
    stem = re.sub(r'^Q\.\s*\d+\s*', '', body[:om[0].start()]).strip() if om else body.strip()
    stem = re.sub(r'\bAns\b\s*$', '', stem).strip()
    opts = ['', '', '', '']
    for i, mk in enumerate(om[:4]):
        end = om[i+1].start() if i+1 < len(om) else len(body)
        seg = body[mk.end():end]
        opts[int(mk.group(1)) - 1] = re.sub(r'\s+', ' ', seg).strip()
    pdf_q[qid] = {'section': cur_sec, 'stem': re.sub(r'\s+', ' ', stem).strip(), 'options': opts}

# ---- DOCX: green option text keyed by Question ID ----
z = zipfile.ZipFile(DOCX)
xml = z.read('word/document.xml').decode('utf-8', 'replace')
paras = re.split(r'</w:p>', xml)
def ptext(p):
    return ''.join(re.findall(r'<w:t(?:\s[^>]*)?>(.*?)</w:t>', p, re.DOTALL))
def is_green(p):
    for run in re.split(r'</w:r>', p):
        t = ''.join(re.findall(r'<w:t(?:\s[^>]*)?>(.*?)</w:t>', run, re.DOTALL))
        if t.strip() and re.search(r'<w:color w:val="40[cC]64[aA]"', run):
            return True
    return False
green_for = {}      # qid -> green option text
pending = []
for p in paras:
    t = ptext(p).strip()
    if is_green(p) and t:
        pending.append(re.sub(r'^(Ans\s*)?[1-4]\.\s*', '', t))
    mid = re.search(r'Question ID\s*:\s*(\d+)', t)
    if mid:
        qid = mid.group(1)
        if pending and qid not in green_for:
            green_for[qid] = pending[-1]
        pending = []

# ---- Join: match green text to a PDF option index ----
def match_index(green, opts):
    g = norm(green)
    for i, o in enumerate(opts):
        if g and (norm(o) == g or norm(o).startswith(g) or g.startswith(norm(o)) and len(norm(o)) > 4):
            return i
    return None

# order questions by section A,B,C,D then PDF appearance
order = sorted(pdf_q.keys(), key=lambda q: ('ABCD'.index(pdf_q[q]['section']),))
# stable within section: keep PDF discovery order
sec_seen = {s: [] for s in 'ABCD'}
for qid in pdf_q:
    sec_seen[pdf_q[qid]['section']].append(qid)
ordered = [q for s in 'ABCD' for q in sec_seen[s]]

questions = []
n = 0
unmatched = []
for qid in ordered:
    n += 1
    info = pdf_q[qid]
    g = green_for.get(qid)
    ai = match_index(g, info['options']) if g else None
    if ai is None:
        unmatched.append((n, qid, g))
    opt_blank = sum(1 for o in info['options'] if o.strip()) < 4
    questions.append({
        'n': n, 'qid': qid, 'section': SECNAME[info['section']],
        'questionText': info['stem'], 'options': info['options'],
        'answerIndex': ai, 'greenText': g,
        'isImageQ': opt_blank or bool(re.search(r'\bfigure', info['stem'], re.I)),
        'optionsAreImages': opt_blank,
    })

print(f'PDF questions: {len(pdf_q)} | green answers: {len(green_for)}')
print(f'total ordered: {len(questions)}')
secs = {}
for q in questions: secs[q['section']] = secs.get(q['section'], 0) + 1
print('section sizes:', secs)
print('unmatched answers:', [(n, repr(g)[:30]) for n, qid, g in unmatched])
print('image questions:', [q['n'] for q in questions if q['isImageQ']])
json.dump(questions, open(f'_questions_{SLUG}.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print(f'wrote _questions_{SLUG}.json')
