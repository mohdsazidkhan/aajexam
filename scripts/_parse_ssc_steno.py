"""Parse SSC Stenographer Grade C & D Tier-I papers (2017+ Testbook format).

Source format (per `11th Sep 2017-Shift 1.docx`):
  - Sections separated by plain-text headers:
      "General Intelligence & Reasoning"  (50 Qs)
      "General Awareness"                  (50 Qs)
      "English Comprehension"              (100 Qs)
  - No question numbering in the docx — questions are sequential paragraphs.
  - Each Q is: <question text paragraphs> + <option paragraph(s) containing 1./2./3./4.>
  - After all questions, a compact "Answer Key" section: `<N>.\\n(<X>)\\n` per Q.
  - Then "Answers with Explanations" detailed solutions block.

Output: _questions_<slug>.json with {n, section, q, q_image, opts[4], opt_images[4], answer, sol}

Usage: _parse_ssc_steno.py <stream_file> <slug>
"""
import sys, re, json, os

NUM_QS = 200
NUM_OPTS = 4

if len(sys.argv) < 3:
    print(__doc__); sys.exit(1)

stream_file, slug = sys.argv[1], sys.argv[2]

with open(stream_file, encoding='utf-8') as f:
    stream = f.read()

# --- Find section boundaries ---
SEC_HDRS = [
    ('General Intelligence and Reasoning', re.compile(r'General Intelligence\s*&?\s*Reasoning', re.I)),
    ('General Awareness',                  re.compile(r'General Awareness', re.I)),
    ('English Language',                   re.compile(r'English\s*(?:Language|Comprehension)', re.I)),
]
sec_positions = []
for name, pat in SEC_HDRS:
    m = pat.search(stream)
    if m:
        sec_positions.append((m.start(), m.end(), name))
sec_positions.sort()
print(f'Section headers found: {[(n, s) for s, _, n in sec_positions]}')

# --- Find end-of-questions boundary (Answer Key or Solutions header) ---
ans_key_m = re.search(r'\bAnswer\s*Key\b', stream, re.I)
sol_m = re.search(r'Answers?\s*with\s*Explanations?|^\s*Solutions?\s*$', stream, re.I | re.M)
q_end = min(p for p in [ans_key_m.start() if ans_key_m else float('inf'),
                        sol_m.start() if sol_m else float('inf')] if p < float('inf'))
print(f'Questions end at: {q_end} (Answer Key starts here)')

# Question section: from first section header to q_end
if not sec_positions:
    print('ERROR: no section headers found'); sys.exit(1)
q_section_start = sec_positions[0][1]  # end of first header
q_section = stream[q_section_start:q_end]

# --- Parse compact Answer Key ---
ans_map = {}
if ans_key_m:
    ak_text = stream[ans_key_m.end():sol_m.start() if sol_m else len(stream)]
    for m in re.finditer(r'(\d{1,3})\.\s*\(?\s*([1-4])\s*\)?', ak_text):
        n = int(m.group(1))
        if 1 <= n <= NUM_QS:
            ans_map[n] = int(m.group(2))
print(f'Answer key entries: {len(ans_map)}')

# --- Parse questions ---
# Walk paragraphs in q_section. Detect option groups via "1.\s ... 4.\s" pattern
# (either on one line or across multiple lines). Each Q = preceding text + options group.
paras = [p.strip() for p in q_section.split('\n')]
# Compute "is_option_paragraph": contains tab-or-space separated "1./2./3./4." OR is part of a multi-line option group
OPT_INLINE_RE = re.compile(r'(?:^|\s)1\.\s+\S.*\s2\.\s+\S.*\s3\.\s+\S.*\s4\.\s+\S')
OPT_LINE_RE   = re.compile(r'^\s*([1-4])\.\s*\S')  # single line starting with N.

def parse_option_block(para_idx):
    """Try to extract 4 options starting at para_idx. Returns (option_list[4], end_idx) or (None, para_idx).
    Tries Path A → C → B in order (most-specific first, single-line-per-option last).
    """
    p = paras[para_idx]
    # Path A: all 4 inline on one paragraph
    if OPT_INLINE_RE.search(p):
        parts = re.split(r'(?:^|\s)([1-4])\.\s+', p)
        opt_dict = {}
        i = 1
        while i + 1 < len(parts):
            num = int(parts[i])
            txt = parts[i+1].strip()
            opt_dict[num] = txt
            i += 2
        if len(opt_dict) == 4:
            return [opt_dict[k] for k in [1,2,3,4]], para_idx + 1
    # Must start with "1." to be a valid option block
    if not OPT_LINE_RE.match(p) or not re.match(r'^\s*1\.\s', p):
        return None, para_idx
    # Path C: two-line "1.X 2.Y" / "3.W 4.Z"
    m1 = re.match(r'^\s*1\.\s*(.+?)\s+2\.\s*(.+)$', p)
    if m1 and para_idx + 1 < len(paras):
        p2 = paras[para_idx + 1]
        m2 = re.match(r'^\s*3\.\s*(.+?)\s+4\.\s*(.+)$', p2)
        if m2:
            return [m1.group(1).strip(), m1.group(2).strip(),
                    m2.group(1).strip(), m2.group(2).strip()], para_idx + 2
    # Path B: 4 separate paragraphs each starting with N.
    opts = []
    cur = para_idx
    for expected in [1, 2, 3, 4]:
        if cur >= len(paras): return None, para_idx
        line = paras[cur]
        m = re.match(rf'^\s*{expected}\.\s*(.*)$', line)
        if not m: return None, para_idx
        opts.append(m.group(1).strip())
        cur += 1
    return opts, cur

# --- Section detection per Q-num ---
# Section positions in stream → convert to Q ranges via parsing order
# We'll classify each detected question by its position in the stream.
sec_ranges = []
for i, (start, end, name) in enumerate(sec_positions):
    sec_end = sec_positions[i+1][0] if i+1 < len(sec_positions) else q_end
    sec_ranges.append((start, sec_end, name))
def section_for_pos(pos):
    for s, e, n in sec_ranges:
        if s <= pos < e:
            return n
    return 'General Knowledge'

# --- Detect "direction paragraphs" (the long instruction text repeated per Q-block) ---
# These signal the start of a new question even when option labels are missing.
DIRECTION_KEYWORDS = re.compile(
    r'in the following question|a sentence has been given|out of the four|'
    r'in the following passage|out of the given|select the |find out which |'
    r'choose the |arrange the given|read the passage|read the following|'
    r'a series is given|in a certain code|some part of the sentence|'
    r'four alternative|with one term missing|some words may',
    re.I
)
def is_direction(p):
    return bool(DIRECTION_KEYWORDS.search(p)) and len(p) >= 40

# --- Walk paragraphs, group into questions ---
img_re = re.compile(r'\[\[IMG:([^\]]+)\]\]')

def normalize(s):
    return re.sub(r'\s+', ' ', s).strip()

def commit_question(q_lines, opts, opt_imgs, pos_para_idx):
    q_text = normalize('\n'.join([l for l in q_lines if l]))
    q_imgs = img_re.findall(q_text)
    q_text_clean = img_re.sub('', q_text).strip()
    opts_clean = [img_re.sub('', o).strip() for o in opts]
    if not opt_imgs:
        opt_imgs = [''] * NUM_OPTS
    # Position in stream for section detection
    pos_approx = sum(len(paras[j])+1 for j in range(pos_para_idx))
    sec = section_for_pos(q_section_start + pos_approx)
    questions.append({
        'n': len(questions) + 1,
        'section': sec,
        'q': q_text_clean,
        'q_image': q_imgs[0] if q_imgs else '',
        'opts': opts_clean,
        'opt_images': opt_imgs,
        'answer': '',
        'sol': '',
    })

questions = []
i = 0
last_end = 0
N_paras = len(paras)
while i < N_paras and len(questions) < NUM_QS:
    p = paras[i]
    if not p:
        i += 1; continue

    # Try labeled option detection first
    opts, next_i = parse_option_block(i)
    if opts is not None:
        q_lines = [paras[j] for j in range(last_end, i) if paras[j]]
        commit_question(q_lines, opts, [], i)
        last_end = next_i
        i = next_i
        continue

    # Fallback: if this paragraph is a "direction" line, look for the NEXT direction
    # or option block. Everything between them = 1 question = N paragraphs.
    # Heuristic: a Q block typically is direction + (0-2 q-text) + 4 bare options = ~5-7 paras.
    if is_direction(p):
        # Find next direction or labeled-option boundary (search up to 12 paras ahead)
        end_j = None
        for j in range(i+1, min(i+12, N_paras)):
            pj = paras[j]
            if not pj: continue
            if is_direction(pj):
                end_j = j; break
            opts_j, _ = parse_option_block(j)
            if opts_j is not None:
                end_j = j; break
        if end_j is None:
            end_j = min(i+6, N_paras)
        # Block paragraphs: i to end_j-1. Last 4 non-empty are bare options.
        block_paras = [paras[k] for k in range(i, end_j) if paras[k]]
        if len(block_paras) >= 5:  # need at least 1 q text + 4 options
            opts = block_paras[-NUM_OPTS:]
            q_lines = block_paras[:-NUM_OPTS]
            commit_question(q_lines, opts, [], i)
            last_end = end_j
            i = end_j
            continue
    i += 1

def section_by_n(n):
    if n <= 50: return 'General Intelligence and Reasoning'
    if n <= 100: return 'General Awareness'
    return 'English Language'

# --- Fill in answers from compact AK ---
for q in questions:
    a = ans_map.get(q['n'])
    if a:
        q['answer'] = chr(ord('A') + a - 1)
    else:
        q['answer'] = 'A'

# --- Extract per-Q solution text from "Answers with Explanations" section ---
if sol_m:
    sol_text = stream[sol_m.end():]
    # Each solution starts with `Option (X) is correct.`
    SOL_PAT = re.compile(r'Option\s*\(\s*(\d)\s*\)\s*is\s*correct\.?', re.I)
    sol_matches = list(SOL_PAT.finditer(sol_text))
    for idx, m in enumerate(sol_matches):
        end = sol_matches[idx+1].start() if idx+1 < len(sol_matches) else len(sol_text)
        block = sol_text[m.end():end]
        block = re.sub(r'\[\[IMG:[^\]]+\]\]', '', block)
        block = re.sub(r'\s+', ' ', block).strip()
        if idx < len(questions):
            questions[idx]['sol'] = block[:1500]

# --- Pad/truncate to exactly 200 ---
while len(questions) < NUM_QS:
    n = len(questions) + 1
    sec = section_for_pos(0)
    questions.append({
        'n': n, 'section': sec, 'q': '', 'q_image': '',
        'opts': [''] * NUM_OPTS, 'opt_images': [''] * NUM_OPTS,
        'answer': chr(ord('A') + ans_map.get(n, 1) - 1),
        'sol': ''
    })
questions = questions[:NUM_QS]

out_file = f'_questions_{slug}.json'
with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

# Diagnostics
opt_complete = sum(1 for q in questions if all(q['opts']))
from collections import Counter
sec_counts = Counter(q['section'] for q in questions)
print(f'\nWrote {out_file}: {len(questions)} questions')
print(f'  Q with all 4 options: {opt_complete}/{len(questions)}')
print(f'  Section distribution: {dict(sec_counts)}')
print(f'  Q missing answer:    {sum(1 for q in questions if not q["answer"])}')
print(f'  Q with image:        {sum(1 for q in questions if q["q_image"])}')
