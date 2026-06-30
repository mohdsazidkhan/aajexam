#!/usr/bin/env python3
"""Parse an Adda247 'Memory Based' ESIC UDC Prelims paper from its PDF text layer
(question PDF + separate Solutions PDF). The PDF preserves the printed `(a)-(e)`
option labels, which give unambiguous option boundaries — far more robust than the
docx extraction (which strips labels and drops single-char options).

Pipeline:
  1. Dump both PDFs to _pdftext_<qslug>.txt / _pdftext_<sslug>.txt (caller or this
     script via --dump). This script reads those text files.
  2. Split the question text on `Q<N>.` markers (1-75). Within each block, split the
     5 options on leading `(a)`..`(e)` labels; everything before `(a)` is the stem.
  3. `Directions (N-M): ...` bodies (seating clues / DI table / RC passage) are
     prepended to every question in the range (apps render questions standalone).
  4. Answer key from the Solutions PDF: `S<N>. Ans.(<letter>)`.

Two question types print no `(a)-(e)` labels and get special handling:
  - Syllogism (statements + two conclusions): options are the STANDARD 5 choices
    (Only I / Only II / Either / Neither / Both) — supplied here.
  - Error-spotting (sentence split into `(a)/ (b)/ (c)/ (d)/ No Error (e)`): the 5
    sentence parts become the options.

Sections by Q-range: Reasoning 1-25, Quant 26-50, English 51-75. (The memory-based
source has NO General Awareness section; official Prelims does.)

Usage: python scripts/_parse_esic.py <qslug> <sslug> <out-slug>
  reads _pdftext_<qslug>.txt + _pdftext_<sslug>.txt
Outputs _esic_<out-slug>.json + _esic_<out-slug>.report.txt
"""
import sys, re, json, io

QSLUG, SSLUG, OUT = sys.argv[1], sys.argv[2], sys.argv[3]

SECTION_FOR = {}
for a, b, name in [(1, 25, 'General Intelligence & Reasoning'),
                   (26, 50, 'Quantitative Aptitude'),
                   (51, 75, 'English Comprehension')]:
    for q in range(a, b + 1):
        SECTION_FOR[q] = name

SYLLOGISM_OPTS = [
    'Only conclusion I follows',
    'Only conclusion II follows',
    'Either conclusion I or II follows',
    'Neither conclusion I nor II follows',
    'Both conclusions I and II follow',
]

qfull = io.open(f'_pdftext_{QSLUG}.txt', encoding='utf-8').read()
sfull = io.open(f'_pdftext_{SSLUG}.txt', encoding='utf-8').read()

# Strip the repeated bankersadda footer. The page number sits on its own line
# directly ABOVE that footer — remove ONLY there, so genuine lone numbers (DI-table
# values like 550/400, fraction denominators) are preserved.
def declutter(t):
    t = re.sub(r'(?m)^\s*\d{1,3}\s*\n(?=\s*www\.bankersadda)', '', t)
    t = re.sub(r'(?m)^\s*www\.bankersadda\.com.*$', '', t)
    t = re.sub(r'(?m)^\s*Adda247.*$', '', t)
    return t
qfull = declutter(qfull)

# ---- answer key ----
ans_map = {}
for m in re.finditer(r'S(\d+)\.\s*Ans\.?\s*\(?([a-eA-E])\)?', sfull):
    ans_map[int(m.group(1))] = m.group(2).lower()

# ---- per-question solution text ----
sol_text = {}
sm = list(re.finditer(r'S(\d+)\.\s*Ans\.?\s*\(?[a-eA-E]\)?', sfull))
for i, m in enumerate(sm):
    n = int(m.group(1))
    end = sm[i + 1].start() if i + 1 < len(sm) else len(sfull)
    blk = declutter(sfull[m.end():end])
    blk = re.sub(r'^\s*Sol\.?\s*:?\s*', '', blk.strip())
    blk = re.sub(r'\s+', ' ', blk).strip()
    sol_text[n] = blk[:1200]

# ---- direction bodies ----
DIR_RE = re.compile(r'Directions?\s*\(\s*(\d+)\s*[-–]\s*(\d+)\s*\)\s*[:.]?\s*', re.I)
QMARK = re.compile(r'(?m)^\s*Q(\d+)\.')
dir_for = {}
for m in DIR_RE.finditer(qfull):
    s, e = int(m.group(1)), int(m.group(2))
    nxt = QMARK.search(qfull, m.end())
    body = qfull[m.end():nxt.start()] if nxt else ''
    body = re.sub(r'\s*\n\s*', '\n', body).strip()
    body = re.sub(r'\n{2,}', '\n', body)
    for q in range(s, e + 1):
        dir_for[q] = body

# ---- question blocks ----
qpos = [(int(m.group(1)), m.start()) for m in QMARK.finditer(qfull)]
blocks = {}
for i, (n, s) in enumerate(qpos):
    e = qpos[i + 1][1] if i + 1 < len(qpos) else len(qfull)
    blk = qfull[s:e]
    # The last Q before a new section keeps the next `Directions (M-N)` header in its
    # block (it sits between this Q's options and the next Q) -> truncate it off so it
    # doesn't bleed into the last option.
    dm = DIR_RE.search(blk, len(f'Q{n}.'))
    if dm:
        blk = blk[:dm.start()]
    blocks[n] = blk

def fix_fractions(text):
    # 3-line mixed fraction "<whole>\n<num>\n<den><unit>" -> "<whole> <num>/<den> <unit>"
    # (Adda247 wraps each part of a mixed number onto its own line; the unit — % / Days /
    # hours / etc. — rides on the denominator line.)
    text = re.sub(r'(?m)^\s*(\d+)\s*\n\s*(\d)\s*\n\s*(\d{1,2})\s*(%|[A-Za-z]+)?\s*$',
                  lambda m: f'{m.group(1)} {m.group(2)}/{m.group(3)}' + (f' {m.group(4)}' if m.group(4) else ''),
                  text)
    # other observed wraps
    text = re.sub(r'(\d+)\s*\n\s*(\d)\s*%\s*\n\s*(\d{1,2})\b', r'\1 \2/\3 %', text)
    text = re.sub(r'(\d+)\s+(\d)\s*%\s*\n\s*(\d{1,2})\b', r'\1 \2/\3 %', text)
    # simple "<num>\n<den> %" -> "<num>/<den> %"
    text = re.sub(r'(?m)^\s*(\d+)\s*\n\s*(\d{1,2})\s*%(?!\d)', r'\1/\2 %', text)
    # plain "<n>\n%\n%\n<d>" -> "<n>/<d> %"
    text = re.sub(r'(\d+)\s*\n\s*%\s*\n\s*%\s*\n\s*(\d+)', r'\1/\2 %', text)
    return text

LABEL = re.compile(r'(?m)^\s*\(([a-e])\)\s*')

def parse_clean(blk, n):
    """Standard (a)-(e) labelled block."""
    blk = re.sub(r'^\s*Q\d+\.\s*', '', blk, count=1)
    labs = list(LABEL.finditer(blk))
    if len(labs) < 5:
        return None
    # take the first run a,b,c,d,e
    want = ['a', 'b', 'c', 'd', 'e']
    chosen = []
    for lab in labs:
        if lab.group(1) == want[len(chosen)]:
            chosen.append(lab)
        if len(chosen) == 5:
            break
    if len(chosen) < 5:
        return None
    stem = blk[:chosen[0].start()].strip()
    opts = []
    for j, lab in enumerate(chosen):
        end = chosen[j + 1].start() if j + 1 < len(chosen) else len(blk)
        o = blk[lab.end():end].strip('\n')
        o = fix_fractions(o)          # per-option: label no longer blocks the ^ anchor
        o = re.sub(r'\s+', ' ', o).strip()
        opts.append(o)
    stem = re.sub(r'\s+', ' ', stem).strip()
    return stem, opts

def parse_syllogism(blk, n):
    stem = re.sub(r'^\s*Q\d+\.\s*', '', blk, count=1).strip()
    stem = re.sub(r'\s+', ' ', stem).strip()
    return stem, list(SYLLOGISM_OPTS)

def parse_error_spot(blk, n):
    s = re.sub(r'^\s*Q\d+\.\s*', '', blk, count=1).strip()
    s = re.sub(r'\s+', ' ', s).strip()
    parts = re.split(r'\(([a-e])\)\s*[/.]', s)
    # parts = [segA, 'a', segB, 'b', segC, 'c', segD, 'd', segE, 'e', tail]
    segs = parts[0::2]  # text segments
    opts = [seg.strip(' ./') for seg in segs[:5]]
    while len(opts) < 5:
        opts.append('')
    if opts[4] == '' or re.match(r'(?i)no\s*error', opts[4]) is None:
        opts[4] = 'No error'
    stem = 'Find the part of the sentence that contains a grammatical error (mark (e) if there is no error): ' + s
    return stem, opts

out, problems = [], []
for n in range(1, 76):
    blk = blocks.get(n, '')
    if 11 <= n <= 15:
        stem, opts = parse_syllogism(blk, n)
    elif 66 <= n <= 70:
        stem, opts = parse_error_spot(blk, n)
    else:
        r = parse_clean(blk, n)
        if r is None:
            problems.append((n, 'clean-parse failed'))
            stem, opts = re.sub(r'^\s*Q\d+\.\s*', '', blk).strip(), ['', '', '', '', '']
        else:
            stem, opts = r
    dctx = dir_for.get(n, '')
    # The syllogism direction prints the 5 standard choices "(a) If only ... (e) If both";
    # we supply those as options, so trim them out of the prepended context to avoid dupes.
    if 11 <= n <= 15 and dctx:
        cut = re.search(r'\n\s*\(a\)', dctx)
        if cut:
            dctx = dctx[:cut.start()].strip()
    qtext = (dctx + '\n' + stem).strip() if dctx else stem
    a_letter = ans_map.get(n)
    a_idx = (ord(a_letter) - ord('a')) if a_letter else None
    if a_idx is None:
        problems.append((n, 'no answer'))
    nfilled = sum(1 for o in opts if o.strip())
    if nfilled < 5:
        problems.append((n, f'opts<5 ({nfilled})'))
    if not stem.strip():
        problems.append((n, 'empty stem'))
    out.append(dict(n=n, section=SECTION_FOR[n], q=qtext, options=opts,
                    ans=a_idx, ans_letter=a_letter, sol=sol_text.get(n, ''),
                    has_dir=bool(dctx)))

from collections import Counter
sc = Counter(r['section'] for r in out)
rep = io.open(f'_esic_{OUT}.report.txt', 'w', encoding='utf-8')
rep.write(f'Total: {len(out)}  Sections: {dict(sc)}  Answers: {len(ans_map)}  Problems: {len(problems)}\n')
for p in problems:
    rep.write(f'  Q{p[0]}: {p[1]}\n')
rep.write('\n--- all ---\n')
for r in out:
    al = r['options'][r['ans']] if (r['ans'] is not None and r['ans'] < 5) else '??'
    rep.write(f"\nQ{r['n']} [{r['section'][:4]}] ans={r['ans_letter']}:{str(al)[:60]}\n  Q: {r['q'][:240]}\n")
    for i, o in enumerate(r['options']):
        rep.write(f"   {'*' if i==r['ans'] else ' '}({chr(97+i)}) {o[:90]}\n")
rep.close()
json.dump(out, io.open(f'_esic_{OUT}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'{OUT}: {len(out)} Q, sections={dict(sc)}, answers={len(ans_map)}, problems={len(problems)}')
