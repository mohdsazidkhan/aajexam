"""Parse Adda247 Similar Paper.

Strategy: PDF gives clean Q.N structure + answers. DOCX para text gives clean
question text (no inter-column garbling). Merge: use PDF for ordering+answer,
match Q text from docx by looking for option-A as anchor.

Input: _pdf_<slug>.txt + _para_<slug>.txt
Output: _questions_<slug>.json
"""
import sys
import re
import json

if len(sys.argv) < 2:
    print("usage: _parse_similar.py <slug>")
    sys.exit(1)

slug = sys.argv[1]
pdf_file = f"_pdf_{slug}.txt"
para_file = f"_para_{slug}.txt"
out_file = f"_questions_{slug}.json"

# ---------- PDF parsing ----------
with open(pdf_file, encoding='cp1252', errors='replace') as f:
    pdf_raw = f.read()
pdf_raw = pdf_raw.replace('\x0c', '\n')
m = re.search(r'^Q\.1\b', pdf_raw, flags=re.MULTILINE)
if m:
    pdf_raw = pdf_raw[m.start():]

q_pattern = re.compile(r'(?m)^Q\.(\d+)\b\s*(.*?)(?=^Q\.\d+\b|\Z)', re.DOTALL)
pdf_blocks = q_pattern.findall(pdf_raw)

NOISE_PATTERNS = [
    r'Copyright.*Adda247',
    r'^Test series$',
    r'^Add New Test',
    r'^Test Title',
    r'^Difficulty Level',
    r'^Select ',
    r'^Created From Date',
    r'^mm/dd/yyyy',
    r'^Search\s+Clear',
    r'^MAPPING\s+EXAM',
    r'^\s*ID\s+ID\s+TITLE',
    r'FULL-',
    r'^LENGTH$',
    r'Similar Paper',
    r'\(Held on .*\)',
    r'\(Matriculation\)|\(Higher Secondary\)|\(Graduation\)',
    r'^Selection$',
    r'^Post$',
    r'^Hindi$|^English$',
    r'^\s*Tue,|^\s*Wed,|^\s*Mon,|^\s*Thu,|^\s*Fri,',
    r'^\s*17, 2026|^\s*27, 2026|^\s*28, 2026',
    r'^\s*\d{2}:\d{2}:\d{2}\s*$',
    r'^O V E R V I E W',
    r'^OSV?ES?RC?VI?ES?W',
    r'^L A N G U A G E',
    r'^Jul 2025',
    r'^895\d+',
    r'^\s*V$|^V Post$|^\s*P$',
]
NOISE_RE = re.compile('|'.join(f'({p})' for p in NOISE_PATTERNS))
INLINE_NOISE_RE = re.compile(r'Copyright\s*[©�\?]?\s*\d{4}\s*Adda247')
OPT_RE = re.compile(r'^\s*([A-D])\.\s+(.+)$')
ANS_RE = re.compile(r'^\s*Answer:\s*([A-D])\b')

def clean_line(s):
    s = s.strip()
    if not s:
        return ''
    s = INLINE_NOISE_RE.sub('', s).strip()
    if not s:
        return ''
    if NOISE_RE.search(s):
        if re.match(r'^[A-D]\.\s', s) or 'Answer:' in s or 'Sol:' in s or 'Q.' in s:
            return s
        return ''
    return s

def parse_pdf_block(num, block_text):
    lines = block_text.split('\n')
    cleaned = [clean_line(ln) for ln in lines]
    cleaned = [c for c in cleaned if c]

    ans_idx, answer = -1, None
    for i, ln in enumerate(cleaned):
        m = ANS_RE.match(ln)
        if m:
            ans_idx, answer = i, m.group(1)
            break

    opts = {}
    for i in range(ans_idx if ans_idx >= 0 else len(cleaned)):
        m = OPT_RE.match(cleaned[i])
        if m:
            letter, text = m.group(1), m.group(2).strip()
            text = re.sub(r'\s{2,}.*$', '', text)
            opts[letter] = text.strip()

    first_opt_idx = next((i for i in range(len(cleaned)) if OPT_RE.match(cleaned[i])), len(cleaned))
    q_lines = cleaned[:first_opt_idx]
    q_text = ' '.join(q_lines).strip()
    q_text = re.sub(r'\s{2,}', ' ', q_text).strip()

    sol_lines = cleaned[ans_idx + 1:] if ans_idx >= 0 else []
    sol_text = ' '.join(sol_lines).strip()
    sol_text = re.sub(r'^Sol:\s*', '', sol_text)
    sol_text = re.sub(r'\s{2,}', ' ', sol_text).strip()

    return {
        'n': num,
        'q': q_text,
        'opts': [opts.get(L, '') for L in 'ABCD'],
        'answer': answer,
        'sol': sol_text[:1500]
    }

questions = sorted([parse_pdf_block(int(n), b) for n, b in pdf_blocks], key=lambda x: x['n'])
print(f"PDF parse: {len(questions)} questions")

# ---------- DOCX para text (for cleaning garbled Q text + options) ----------
with open(para_file, encoding='utf-8') as f:
    para_raw = f.read()

# Concatenate all paras into a single normalized string (the docx para text has
# lots of duplication; we just need to find clean question text)
# Strip Copyright fragments
para_text = INLINE_NOISE_RE.sub(' ', para_raw)
para_text = re.sub(r'\s{2,}', ' ', para_text)

def find_docx_question(q, opts):
    """Find a clean version of the question text in docx by anchoring on option A text.
    Returns clean question if found, else None.
    """
    opt_a = opts[0]
    if not opt_a:
        return None
    # Find position of option A in docx
    # The Q text immediately precedes opt_a (with newline)
    pat = re.escape(opt_a)
    # Use 'A. <text>' or option A appearing at start of line in original para file
    matches = list(re.finditer(re.escape(opt_a), para_raw))
    if not matches:
        return None
    # For each match, walk back to find the question text (before opt_a appears)
    # Question text typically ends with '?' or '.' just before opt_a
    for m in matches:
        before = para_raw[:m.start()]
        # Last 500 chars before opt_a
        before_chunk = before[-800:]
        # Split into lines, walk back collecting non-noise lines until we find one ending with ? or :
        before_lines = before_chunk.split('\n')
        # Strip noise lines
        cleaned_back = []
        for ln in reversed(before_lines):
            ln_clean = INLINE_NOISE_RE.sub('', ln).strip()
            if not ln_clean:
                continue
            if NOISE_RE.search(ln_clean) and 'Q.' not in ln_clean:
                continue
            cleaned_back.append(ln_clean)
            if ln_clean.endswith('?') or (ln_clean.endswith(':') and len(ln_clean) > 30):
                break
            if len(cleaned_back) >= 6:
                break
        cleaned_back.reverse()
        if cleaned_back:
            candidate = ' '.join(cleaned_back).strip()
            if len(candidate) > 15 and '?' in candidate or ':' in candidate:
                return candidate
    return None

# Override garbled PDF question text from docx where possible
fixed_count = 0
for q in questions:
    q_text = q['q']
    has_garble = (
        not q_text or
        len(q_text) < 15 or
        re.search(r'[a-z][A-Z]{2,}|Sim[bs]|Cdoa|right ©', q_text)
    )
    if has_garble:
        docx_q = find_docx_question(q_text, q['opts'])
        if docx_q:
            q['q'] = docx_q
            fixed_count += 1
print(f"Fixed {fixed_count} garbled question texts from docx")

# Diagnostics
missing_ans = [q['n'] for q in questions if not q['answer']]
incomplete_opts = [q['n'] for q in questions if not all(q['opts'])]
short_q = [q['n'] for q in questions if len(q['q']) < 15]
print(f"Final: {len(questions)} Q, missing_ans={missing_ans}, incomplete_opts={incomplete_opts}, short_q={short_q}")

with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
print(f"Wrote {out_file}")
