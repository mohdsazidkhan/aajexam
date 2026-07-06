"""Parse a UPSC Prelims 'SOLVED PAPERS' PDF into questions.json.

The PDF has a clean two-column text layer:
  - Question numbers sit at the column-left margin (x0 ~ 54 or ~297); statement
    numbers are indented (x0 >= 72 / >= 326). We classify by x0.
  - Question region runs from page 0 up to (but excluding) the answer-key grid
    page ('Q.No.' table). Options are '(a)/(b)/(c)/(d)' markers (may wrap or sit
    two-per-line).
  - Answer region (after 'ANSWERS WITH EXPLANATION'): 'N. Option (x) is correct.'
    then 'Explanation: ...' paragraphs until the next 'N.'.

Usage: _parse_upsc_pdf.py <pdf-path> <n_questions> <out-json>
"""
import sys, re, json, fitz

pdf_path, n_expected, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
key_pdf = sys.argv[4] if len(sys.argv) > 4 else None  # external 'N (x)' answer key
doc = fitz.open(pdf_path)

# ---- page boundaries -------------------------------------------------------
grid_page = None      # answer-key grid ('Q.No.' table) -> end of question region
ans_start = None      # 'ANSWERS WITH EXPLANATION' region
for i in range(doc.page_count):
    t = doc[i].get_text()
    if grid_page is None and 'Q.No.' in t:
        grid_page = i
    if ans_start is None and re.search(r'Option\s*\([a-d]\)\s*is correct', t):
        ans_start = i
if key_pdf:                       # question paper has no internal answer section
    q_end = doc.page_count
else:
    q_end = grid_page if grid_page is not None else ans_start
    assert q_end and ans_start, f"boundaries not found grid={grid_page} ans={ans_start}"

CTRL_RE = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f]')
HEADER_RE = re.compile(
    r'^(General Studies Paper|UPSC \(CSE PRELIMS\)|CSAT|C-?SAT|Paper-|'
    r'ANSWERS WITH EXPLANATION|Q\.No\.|Response)', re.I)
PAGENUM_RE = re.compile(r'^\d{2,4}\s*$')
SPLIT_OPT_RE = re.compile(r'\s*(\([a-d]\))\s*')
NUM_RE = re.compile(r'^(\d+)\.\s*$')
OPT_RE = re.compile(r'^\(([a-d])\)\s*(.*)$')
# 'Passage' header — 'Passage' + up to 3 non-word chars (hyphen, en/em-dash,
# colon, mojibake separator, space) + a digit — or a 'Direction(s)' block. The
# digit requirement avoids matching a stray lowercase 'passage.' in option text.
PASSAGE_RE = re.compile(r'^Passage\W{0,3}\d', re.I)
CONTEXT_RE = re.compile(r'^(Passage\W{0,3}\d|Directions?\b)', re.I)

def norm(s):
    return CTRL_RE.sub(' ', s).replace('\t', ' ').strip()

def dict_lines(page, y_max=None):
    """Yield (x0, text) in reading order; split two-per-line option rows.
    y_max: if set, skip lines at/below this y (used to stop before the answer
    section when questions and answers share a page)."""
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            if not l.get('spans'):
                continue
            if y_max is not None and l['spans'][0]['bbox'][1] >= y_max:
                continue
            x0 = l['spans'][0]['bbox'][0]
            s = norm(''.join(sp['text'] for sp in l['spans']))
            if not s or HEADER_RE.match(s) or PAGENUM_RE.match(s):
                continue
            # split a leading question/statement number token from inline text
            # (CSAT puts 'N.\t<text>' on one line; GS-I keeps 'N.' on its own)
            lead = re.match(r'^(\d+)\.\s+(\S.*)$', s)
            if lead and not OPT_RE.match(s):
                yield (x0, lead.group(1) + '.')
                s = lead.group(2).strip()
            if re.search(r'\([a-d]\).*\([a-d]\)', s):
                pieces = SPLIT_OPT_RE.split(s)
                if pieces[0].strip():
                    yield (x0, pieces[0].strip())
                for i in range(1, len(pieces), 2):
                    yield (x0, (pieces[i] + ' ' + pieces[i + 1]).strip())
            else:
                yield (x0, s)

q_lines = []
for i in range(0, q_end):
    q_lines += list(dict_lines(doc[i]))
# when there is no grid page, the last questions can share the answer page: also
# scan that page down to the 'ANSWERS WITH EXPLANATION' / first answer marker.
if grid_page is None and ans_start is not None:
    ymark = None
    for b in doc[ans_start].get_text('dict')['blocks']:
        for l in b.get('lines', []):
            s = ''.join(sp['text'] for sp in l.get('spans', []))
            if re.search(r'ANSWERS WITH EXPLANATION', s, re.I) or \
               re.search(r'Option\s*\([a-d]\)\s*is correct', s):
                ymark = l['spans'][0]['bbox'][1]; break
        if ymark is not None:
            break
    if ymark is not None:
        q_lines += list(dict_lines(doc[ans_start], y_max=ymark))

# ---- auto-detect the two column-left margins where question numbers sit ----
# (question numbers are at the column left edge; statement numbers are indented)
from collections import Counter
numx = Counter()
for x0, ln in q_lines:
    if NUM_RE.match(ln):
        numx[round(x0)] += 1
thresh = max(8, int(n_expected * 0.15))
left = [x for x in numx if x < 200 and numx[x] >= thresh]
right = [x for x in numx if x >= 200 and numx[x] >= thresh]
q_left = min(left) if left else 54
q_right = min(right) if right else 297
TOL = 8

def is_question_x(x):
    return abs(x - q_left) <= TOL or abs(x - q_right) <= TOL

# ---- detect question starts ------------------------------------------------
# A number token is the next question when num == expected AND either it sits at
# a question column (is_question_x) OR a full (a)-(d) option set has been seen
# since the previous question (statement numbers reset BEFORE their options, so
# they fail this). The x0 test additionally rescues a question whose options
# overflow to the next page; the option-count test rescues papers with mixed or
# ambiguous margins. Q1 needs a look-ahead for options to skip the CSAT
# instruction preamble ('1.'-'4.' with no options).
starts = []
expected = 1
seen = set()
for idx, (x0, ln) in enumerate(q_lines):
    mo = OPT_RE.match(ln)
    if mo:
        seen.add(mo.group(1))
    m = NUM_RE.match(ln)
    if not m:
        continue
    num = int(m.group(1))
    if num == expected:
        if expected == 1:
            # skip the CSAT instruction preamble: real Q1 is the first '1.'
            # followed by options (instructions have none).
            accept = any(OPT_RE.match(l) for _, l in q_lines[idx + 1:idx + 40])
        else:
            accept = is_question_x(x0) or len(seen) >= 4
    elif num == expected + 1 and len(seen) >= 4:
        # the label for `expected` was dropped in the source but its options were
        # already consumed (seen>=4); skip it rather than stall the cascade.
        accept = True
    else:
        continue
    if accept:
        starts.append((num, idx))
        expected = num + 1
        seen = set()
        if expected > n_expected:
            break
starts.append((n_expected + 1, len(q_lines)))
first_start = starts[0][1] if starts and starts[0][0] == 1 else 0

def group_range_end(ctx_lines, start_n):
    """If a Directions block covers a range of items, return the last item number.
    Handles 'items (15-19)' and 'the following 5 items'."""
    t = ' '.join(ctx_lines)
    m = re.search(r'\((\d+)\s*[-–—]\s*(\d+)\)', t)
    if m:
        return int(m.group(2))
    m = re.search(r'following\s+(\d+)\s*(?:\([^)]*\))?\s*(?:items|questions)', t, re.I)
    if not m:
        m = re.search(r'(?:answer|for)\s+the\s+(\d+)\s+(?:items|questions)', t, re.I)
    if m:
        return start_n + int(m.group(1)) - 1
    return None

# leading context for the first question (its passage/directions sits before it,
# after the general instructions): keep from the last Passage/Directions marker.
carry = []            # one-shot context (passages reprinted per question)
group = None          # shared Directions block: {'text', 'start', 'end'}
pre = [ln for (_, ln) in q_lines[:first_start]]
for j in range(len(pre) - 1, -1, -1):
    if CONTEXT_RE.match(pre[j]):
        carry = pre[j:]
        break

questions = []
for k in range(len(starts) - 1):
    qnum, s = starts[k]
    _, e = starts[k + 1]
    block = [ln for (_, ln) in q_lines[s + 1:e]]
    opts = ['', '', '', '']
    # prefix = shared Directions header (if in range) + this item's own passage
    if group and group['start'] <= qnum <= group['end']:
        prefix = group['text'] + carry
    else:
        prefix = carry
    carry = []
    stem_lines = list(prefix)
    context = []
    ocount = 0          # assign options positionally (survives (c)/(c) label typos)
    in_context = False
    for ln in block:
        if in_context:
            context.append(ln); continue
        # a Passage/Directions header appearing after this question's options
        # belongs to the NEXT question -> divert to context.
        if ocount >= 1 and CONTEXT_RE.match(ln):
            in_context = True; context.append(ln); continue
        m = OPT_RE.match(ln)
        if m:
            if ocount < 4:
                opts[ocount] = m.group(2).strip()
            ocount += 1
        elif ocount == 0:
            stem_lines.append(ln)
        elif ocount <= 4:
            opts[ocount - 1] = (opts[ocount - 1] + ' ' + ln).strip()
    # trailing context belongs to the next question(s). If it declares an item
    # range it is a shared Directions block -> apply to the whole range.
    if context:
        has_passage = any(PASSAGE_RE.match(l) for l in context)
        end = group_range_end(context, qnum + 1)
        # A pure Directions block (no per-item passages, e.g. a logic/data puzzle)
        # applies to a whole item range -> share it. Multi-passage sets instead
        # reprint a passage before each item, so fall back to one-shot carry.
        if end and end > qnum + 1 and not has_passage:
            group = {'text': context, 'start': qnum + 1, 'end': end}
            carry = []
        else:
            carry = context
    stem = []
    for ln in stem_lines:
        if NUM_RE.match(ln):
            stem.append('\n' + ln + ' ')
        else:
            stem.append(ln)
    q_text = ' '.join(stem)
    q_text = re.sub(r'\s+(Select the correct Answer|'
                    r'Which of the (?:above|statements given above))', r'\n\1', q_text)
    q_text = re.sub(r'\s*\n\s*', '\n', q_text)
    q_text = re.sub(r'[ \t]{2,}', ' ', q_text).strip()
    questions.append({'n': qnum, 'q': q_text,
                      'opts': [re.sub(r'\s{2,}', ' ', o).strip() for o in opts]})

# ---- answers + explanations ------------------------------------------------
ans_map = {}
if key_pdf:
    # external key: grid of 'N (x)' entries, no explanations
    kdoc = fitz.open(key_pdf)
    ktext = '\n'.join(kdoc[i].get_text() for i in range(kdoc.page_count))
    for m in re.finditer(r'(?<!\d)(\d{1,3})\s*\(([a-d])\)', ktext):
        n = int(m.group(1))
        if 1 <= n <= n_expected:
            ans_map[n] = {'answer': ord(m.group(2)) - ord('a'), 'expl': ''}
    for q in questions:
        a = ans_map.get(q['n'], {'answer': 0, 'expl': ''})
        q['answer'] = a['answer']; q['expl'] = a['expl']
    _skip_internal_answers = True
else:
    _skip_internal_answers = False

a_lines = []
if not _skip_internal_answers:
  for i in range(ans_start, doc.page_count):
    for ln in doc[i].get_text().split('\n'):
        s = norm(ln)
        if s and not HEADER_RE.match(s) and not PAGENUM_RE.match(s):
            a_lines.append(s)
ans_text = '\n'.join(a_lines)
# Anchor each answer on "N. Option (x) is correct" (0/1 newline between), so that
# numbered sub-lists inside explanations are not mistaken for answer boundaries.
# answer letter, tolerating a combined '(c & d)' form (disputed/dropped items) —
# capture the first letter.
ANS_RE = re.compile(
    r'(?ms)^(\d+)\.\s*\n?\s*Option\s*\(([a-d])(?:\s*&\s*[a-d])?\)\s*is correct\.?\s*(.*?)'
    r'(?=^\d+\.\s*\n?\s*Option\s*\([a-d](?:\s*&\s*[a-d])?\)\s*is correct|\Z)')
if not _skip_internal_answers:
    for m in ANS_RE.finditer(ans_text):
        num = int(m.group(1))
        ans = ord(m.group(2)) - ord('a')
        body = m.group(3)
        # GS-I prefixes explanations with 'Explanation:'; CSAT gives prose directly.
        me = re.search(r'Explanation\s*:\s*(.*)', body, re.S)
        expl = (me.group(1) if me else body).strip()
        expl = re.sub(r'\s*\n\s*', ' ', expl)
        expl = re.sub(r'[ \t]{2,}', ' ', expl).strip()
        ans_map[num] = {'answer': ans, 'expl': expl}
    for q in questions:
        a = ans_map.get(q['n'], {'answer': 0, 'expl': ''})
        q['answer'] = a['answer']
        q['expl'] = a['expl']

# ---- diagnostics -----------------------------------------------------------
bad = [q['n'] for q in questions if sum(1 for o in q['opts'] if o) != 4]
print(f"questions parsed: {len(questions)} (expected {n_expected})")
print(f"answers matched:  {sum(1 for q in questions if q['n'] in ans_map)}")
print(f"without 4 opts:   {bad[:25]} (total {len(bad)})")
print(f"without expl:     {[q['n'] for q in questions if not q['expl']][:25]}")
with open(out, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=1)
print("wrote", out)
