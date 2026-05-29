"""Parse IBPS PO Prelims 2016 paper PDF + answer key PDF.

The 2016 paper uses Adda247/CareerPower style:
  - Question numbered as `N. <text>`
  - 5 options labeled `A. ... B. ...` (sometimes 2-col layout)
  - Reading-comprehension passages precede Q1-7 (and similar block-direction prefaces).

Answer key has format `S?N. Ans. (X)` where X is A-E (any case).

Source: _pdf_<slug>.txt (full text extracted from paper PDF) + the answer-key PDF.
Output: _questions_<slug>.json with shape:
  {n, section, q, q_image, opts[5], opt_images[5], answer, sol}
"""
import sys, re, json, os
from pypdf import PdfReader
import warnings, logging
warnings.filterwarnings('ignore'); logging.disable(logging.CRITICAL)

if len(sys.argv) < 4:
    print("usage: _parse_ibps_po_2016.py <pdf_text_file> <answer_key_pdf> <slug>")
    sys.exit(1)

pdf_text_file, ak_pdf, slug = sys.argv[1], sys.argv[2], sys.argv[3]
out_file = f'_questions_{slug}.json'

with open(pdf_text_file, encoding='utf-8') as f:
    full = f.read()

# Normalize: collapse internal whitespace runs but keep newlines for boundary detection
def normalize_space(s):
    return re.sub(r'[ \t]+', ' ', s).strip()

# Strategy: find all positions of `\nN. ` markers where N is sequential 1..100
# We scan for any `N. ` and verify monotonic order.
def find_question_starts(text):
    """Return list of (qnum, start_index) for monotonic Q1..Q100."""
    candidates = [(int(m.group(1)), m.start(), m.end()) for m in re.finditer(r'(?:^|\n)\s*(\d{1,3})\.\s+', text)]
    # Walk candidates: accept next-expected qnum
    expected = 1
    out = []
    for n, s, e in candidates:
        if n == expected and expected <= 100:
            out.append((n, s, e))
            expected += 1
    return out

q_starts = find_question_starts(full)
print(f"Detected Q starts: {len(q_starts)} (expected 100)")
if len(q_starts) < 100:
    missing = set(range(1,101)) - set(n for n,_,_ in q_starts)
    print(f"  Missing: {sorted(missing)}")

# Build raw blocks: each Q's text is from its start to the next Q's start
blocks = []
for i, (n, s, e) in enumerate(q_starts):
    next_s = q_starts[i+1][1] if i+1 < len(q_starts) else len(full)
    raw = full[e:next_s].strip()
    blocks.append((n, raw))

# For passage-based questions (1-7, etc.), the passage appears BEFORE Q1.
# Capture pre-Q1 content (passages + direction text) so we can inline into Q1-7.
preamble = full[:q_starts[0][1]] if q_starts else ''

# Extract passages and direction prefaces from the document.
# A passage block is text that follows "Direction (N-M):" and precedes Q-N.
DIR_RE = re.compile(r'Direction[s]?\s*\(?(\d{1,3})\s*[-–]\s*(\d{1,3})\)?\s*:?\s*([^\n]*)\n((?:.|\n)*?)(?=\n\s*\d{1,3}\.\s+|Direction[s]?\s*\()', re.I)

# A simpler approach: find every Direction (N-M) and capture the text from the colon
# until the first numbered question in [N..M].
def extract_directions(text):
    """Return list of dicts: {start: N, end: M, preface_text: str}."""
    out = []
    for m in re.finditer(r'Direction[s]?\s*\(?(\d{1,3})\s*[-–]\s*(\d{1,3})\)?\s*:?\s*', text):
        s_n, e_n = int(m.group(1)), int(m.group(2))
        preface_start = m.end()
        # Find next Q-start at or after preface_start where qnum == s_n
        nxt = re.search(rf'(?:^|\n)\s*{s_n}\.\s+', text[preface_start:])
        preface_end = preface_start + (nxt.start() if nxt else 200)
        preface = text[preface_start:preface_end].strip()
        out.append({'start': s_n, 'end': e_n, 'preface': preface})
    return out

directions = extract_directions(full)
print(f"Direction blocks: {len(directions)}")

# Map Q number -> applicable preface text (just the most recent direction block that covers it)
preface_for = {}
for d in directions:
    for q in range(d['start'], d['end']+1):
        # Prefer the smallest range (most specific) if overlaps
        if q not in preface_for or (d['end'] - d['start']) < (preface_for[q][1] - preface_for[q][0]):
            preface_for[q] = (d['start'], d['end'], d['preface'])

# Split each block into question text + 5 options
# Strategy: locate A. / B. / C. / D. / E. markers in this block.
OPT_RE = re.compile(r'(?:^|\n|\t|\s)([A-E])\.\s+', re.M)

def split_options(block_text):
    """Return (q_text, [opt_a..opt_e]) or (block_text, None) if not parseable."""
    # Find all option label positions
    matches = []
    # Use a regex that matches "A. ", " A. ", "\tA. ", "\nA. " etc.
    for m in re.finditer(r'(?:(?<=\s)|^)([A-E])\.\s+', block_text):
        matches.append((m.group(1), m.start(), m.end()))
    # Keep only the first occurrence of each label in order A,B,C,D,E
    found = {}
    last_pos = -1
    for label, s, e in matches:
        expected = chr(ord('A') + len(found))
        if label == expected and s > last_pos:
            found[label] = (s, e)
            last_pos = e
        if len(found) == 5:
            break
    if 'A' not in found:
        return block_text.strip(), None
    q_text = block_text[:found['A'][0]].strip()
    opts = []
    labels = ['A','B','C','D','E']
    for i, lab in enumerate(labels):
        if lab not in found:
            opts.append('')
            continue
        start = found[lab][1]
        # End at next option's start or end of block
        end_lab = labels[i+1] if i+1 < 5 else None
        end = found[end_lab][0] if end_lab and end_lab in found else len(block_text)
        opts.append(block_text[start:end].strip())
    return q_text, opts

# --- Section detection ---
# 2016 IBPS PO Prelims layout: 1-30 English, 31-65 Quant, 66-100 Reasoning
def section_for(n):
    if n <= 30: return 'English Language'
    if n <= 65: return 'Quantitative Aptitude'
    return 'Reasoning Ability'

# --- Parse Answer Key ---
rk = PdfReader(ak_pdf)
ak_text = ''.join(p.extract_text() + '\n' for p in rk.pages)
AK_PAT = re.compile(r'^\s*S?0*(\d{1,3})\.\s*Ans\.?\s*\(?([A-Ea-e])\)?', re.M)
answers = {int(n): a.upper() for n, a in AK_PAT.findall(ak_text)}
print(f"Answer key entries: {len(answers)}")

# Extract solution text for each Q: from "N. Ans. X" line up to next "M. Ans. Y"
SOL_BOUND = list(AK_PAT.finditer(ak_text))
solutions = {}
for i, m in enumerate(SOL_BOUND):
    n = int(m.group(1))
    s = m.end()
    e = SOL_BOUND[i+1].start() if i+1 < len(SOL_BOUND) else len(ak_text)
    sol = ak_text[s:e]
    # Strip leading "Sol." or "Sol:"
    sol = re.sub(r'^\s*Sol\.?\s*:?\s*', '', sol).strip()
    # Collapse internal whitespace
    sol = re.sub(r'\s+', ' ', sol)
    solutions[n] = sol[:1500]

# --- Build per-question records ---
# Known image-question attachments for 2016 paper (table at Q31-35, graph at Q56-60).
# Image file names are sourced from PDF-extracted images (see _pdf_images_ibps_po_2016/).
Q_IMAGES = {
    31: 'Image43.jpg', 32: 'Image43.jpg', 33: 'Image43.jpg', 34: 'Image43.jpg', 35: 'Image43.jpg',
    56: 'Image53.png', 57: 'Image53.png', 58: 'Image53.png', 59: 'Image53.png', 60: 'Image53.png',
}

# Trailing-junk pattern at end of paper: pagebreak markers, asterisks, whitespace runs
TRAILING_JUNK_RE = re.compile(r'[\s\*]*(\[\[PAGEBREAK\]\][\s\*]*)+$|[\s\*]{5,}$')

questions = []
for n, raw in blocks:
    q_text, opts = split_options(raw)
    # Prepend passage/direction preface if applicable
    pref = preface_for.get(n)
    if pref:
        pref_text = pref[2].strip()
        if pref_text and pref_text not in q_text:
            q_text = pref_text + '\n\n' + q_text
    q_text = normalize_space(q_text)
    if opts:
        # Strip trailing "*** ..." garbage left over from end-of-paper
        opts = [TRAILING_JUNK_RE.sub('', o).strip() for o in opts]
        opts = [normalize_space(o) for o in opts]
    else:
        opts = ['', '', '', '', '']
    answer = answers.get(n, 'A')
    sol = solutions.get(n, '')
    questions.append({
        'n': n,
        'section': section_for(n),
        'q': q_text,
        'q_image': Q_IMAGES.get(n, ''),
        'opts': opts,
        'opt_images': ['', '', '', '', ''],
        'answer': answer,
        'sol': sol,
    })

with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

# Diagnostics
opt_complete = sum(1 for q in questions if all(q['opts']))
sec_counts = {}
for q in questions:
    sec_counts[q['section']] = sec_counts.get(q['section'], 0) + 1
print(f"\nWrote {out_file}: {len(questions)} questions")
print(f"  Q with all 5 options: {opt_complete}/{len(questions)}")
print(f"  Section distribution: {sec_counts}")
print(f"  Q missing answer:    {sum(1 for q in questions if not q['answer'])}")
print(f"  Q with passage prep: {sum(1 for q in questions if preface_for.get(q['n']))}")
