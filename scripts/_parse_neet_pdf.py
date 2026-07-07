"""Parse an Oswaal 'NEET (UG) Year-wise Solved Papers' PDF into questions.json.

Same two-column clean text layer as the UPSC Oswaal parser:
  - Question numbers sit at the two column-left margins (x0 ~ 72 / ~312); options
    are '(a)/(b)/(c)/(d)' markers that may wrap or sit two-per-line.
  - Question region runs from page 0 up to (excluding) the 'ANSWER KEY' grid page.
  - Answer key is an in-PDF grid of 'N (x)' entries on the last page(s).

Usage: _parse_neet_pdf.py <pdf-path> <n_questions> <out-json>
"""
import sys, re, json, fitz
from collections import Counter

pdf_path, n_expected, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
doc = fitz.open(pdf_path)

# ---- page boundaries -------------------------------------------------------
def _is_expl(i):
    return 'ANSWERS WITH EXPLANATION' in doc[i].get_text().upper()
def _is_qpage(i):
    return bool(re.search(r'Q\.\s*\d+\.', doc[i].get_text()))

key_page = next((i for i in range(doc.page_count)
                 if 'ANSWER KEY' in doc[i].get_text()), None)
TABLE_KEY = False
if key_page is None:
    # Newer Oswaal layout (2022+): a 'Q. No. | Answer Key | Topic | Chapter'
    # table with NUMERIC answers (1-4) instead of the compact 'N (x)' grid.
    key_page = next((i for i in range(doc.page_count)
                     if re.search(r'Q\.\s*No\.', doc[i].get_text())
                     and 'Answer' in doc[i].get_text()
                     and "Topic" in doc[i].get_text()), None)
    TABLE_KEY = key_page is not None

# 2025+ 'booklet' layout: three interleaved sections, each = questions +
# 'Answer Key' table + explanations. Detect via multiple 'Answer Key' headers.
KEY_HDR = [i for i in range(doc.page_count)
           if re.search(r'Answer\s*Key', doc[i].get_text(), re.I)]
# booklet layout is signalled by 'Q. N.' markers AND multiple key sections
MULTI = len(KEY_HDR) > 1 and any(_is_qpage(i) for i in range(doc.page_count))
KEY_REGION = set()
Q_PAGES = None
if MULTI:
    TABLE_KEY = True
    key_page = KEY_HDR[0]
    for hp in KEY_HDR:                      # key table = header page + its non-Q,
        KEY_REGION.add(hp)                  # non-explanation continuation pages
        j = hp + 1
        while j < doc.page_count and not _is_expl(j) and not _is_qpage(j):
            KEY_REGION.add(j); j += 1
    Q_PAGES = [i for i in range(doc.page_count)
               if _is_qpage(i) and i not in KEY_REGION and not _is_expl(i)]

assert key_page is not None, "ANSWER KEY page not found"
q_end = key_page

CTRL_RE = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f]')
HEADER_RE = re.compile(
    r'^(Oswaal NEET|Oswaal|NEET\s*\(UG\)|NEET$|\(UG\)$|CBSE\b|AIPMT\b|'
    r'.{0,40}SOLVED PAPER|ANSWER KEY|.{0,30}Year-wise Solved|'
    r'Time\s*:|Max\.|'
    r'Important Instructions|The OMR|Avoid Improper|Partially Filled|'
    r'Lightly Filled|Test Cent|Certified that|Invigilator|Student.s Sign|'
    r'Roll\s*Number|Booklet|Batch|Out of Syllabus|Section\s*[AB]\s*$)', re.I)
SECTION_RE = re.compile(r'^(PHYSICS|CHEMISTRY|BIOLOGY|BOTANY|ZOOLOGY)\s*$')
PAGENUM_RE = re.compile(r'^\d{2,4}\s*$')
# Options are '(a)-(d)' (<=2021) or NUMERIC '(1)-(4)' (2022+); accept both.
# Question markers are 'N.' or (2025+) 'Q. N.' — the optional 'Q.' prefix.
SPLIT_OPT_RE = re.compile(r'\s*(\([a-d1-4]\))\s*')
NUM_RE = re.compile(r'^(?:Q\.\s*)?(\d+)\.\s*$')
OPT_RE = re.compile(r'^\(([a-d1-4])\)\s*(.*)$')

def norm(s):
    return CTRL_RE.sub(' ', s).replace('\t', ' ').strip()

SUP = str.maketrans('0123456789+-=()n', '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ')
SUB = str.maketrans('0123456789+-=()', '₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎')

def line_text(l):
    """Assemble a line's text, rebuilding super/subscripts from span geometry."""
    spans = l['spans']
    sizes = [sp['size'] for sp in spans]
    body = max(sizes)
    # dominant baseline = origin-y of the largest spans
    bys = [sp['origin'][1] for sp in spans if sp['size'] >= 0.85 * body]
    base = sorted(bys)[len(bys) // 2] if bys else spans[0]['origin'][1]
    parts = []
    for sp in spans:
        t = sp['text']
        if sp['size'] < 0.82 * body and t.strip():
            oy = sp['origin'][1]
            if oy < base - 0.4:          # raised -> superscript
                parts.append(_script(t, SUP, '^'))
                continue
            if oy > base + 0.4:          # lowered -> subscript
                parts.append(_script(t, SUB, '_'))
                continue
        parts.append(t)
    return ''.join(parts)

def _script(txt, table, caret):
    txt = txt.replace('–', '-').replace('—', '-').replace('−', '-')
    mapped = txt.translate(table)
    if all((c.translate(table) != c or c == ' ') for c in txt if c.strip()):
        return mapped                     # fully mappable -> clean unicode
    return caret + '(' + txt.strip() + ')' # has letters -> caret notation

def dict_lines(page, pno):
    """Yield (x0, text, page, y0, y1) in reading order; split option rows."""
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            if not l.get('spans'):
                continue
            x0 = l['spans'][0]['bbox'][0]
            y0, y1 = l['bbox'][1], l['bbox'][3]
            s = norm(line_text(l))
            if not s or HEADER_RE.match(s) or PAGENUM_RE.match(s):
                continue
            lead = re.match(r'^(?:Q\.\s*)?(\d+)\.\s+(\S.*)$', s)
            if lead and not OPT_RE.match(s):
                yield (x0, lead.group(1) + '.', pno, y0, y1)
                s = lead.group(2).strip()
            if re.search(r'\([a-d1-4]\).*\([a-d1-4]\)', s):
                pieces = SPLIT_OPT_RE.split(s)
                if pieces[0].strip():
                    yield (x0, pieces[0].strip(), pno, y0, y1)
                for i in range(1, len(pieces), 2):
                    yield (x0, (pieces[i] + ' ' + pieces[i + 1]).strip(), pno, y0, y1)
            else:
                yield (x0, s, pno, y0, y1)

q_lines = []
q_page_range = Q_PAGES if MULTI else range(0, q_end)
for i in q_page_range:
    if 'OMR' in doc[i].get_text():   # skip the OMR bubble-sheet page
        continue
    q_lines += list(dict_lines(doc[i], i))

# ---- auto-detect the two column-left margins where question numbers sit ----
numx = Counter()
for x0, ln, *_ in q_lines:
    if NUM_RE.match(ln):
        numx[round(x0)] += 1
thresh = max(8, int(n_expected * 0.10))
left = [x for x in numx if x < 200 and numx[x] >= thresh]
right = [x for x in numx if x >= 200 and numx[x] >= thresh]
q_left = min(left) if left else 72
q_right = min(right) if right else 312
TOL = 10

def is_question_x(x):
    return abs(x - q_left) <= TOL or abs(x - q_right) <= TOL

# drop the instruction preamble: cut everything before the first 'PHYSICS'
# section header, then strip the remaining section headers.
for idx, row in enumerate(q_lines):
    if SECTION_RE.match(row[1]):
        q_lines = q_lines[idx + 1:]
        break
q_lines = [r for r in q_lines if not SECTION_RE.match(r[1])]

# ---- detect question starts ------------------------------------------------
starts = []
expected = 1
seen = set()
for idx, (x0, ln, *_g) in enumerate(q_lines):
    mo = OPT_RE.match(ln)
    if mo:
        seen.add(mo.group(1))
    m = NUM_RE.match(ln)
    if not m:
        continue
    num = int(m.group(1))
    if num == expected:
        if expected == 1:
            accept = any(OPT_RE.match(r[1]) for r in q_lines[idx + 1:idx + 40])
        else:
            accept = is_question_x(x0) or len(seen) >= 4
    elif num == expected + 1 and len(seen) >= 4:
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

# recover questions missed when PyMuPDF returns blocks out of numeric order
# (e.g. a section boundary page where the next section's column precedes the
# prior section's tail). Add any un-accepted question-margin 'N.' line, then
# re-order all starts by q_lines position so slices stay contiguous.
accepted = {n for n, _ in starts}
for idx, (x0, ln, *_g) in enumerate(q_lines):
    m = NUM_RE.match(ln)
    if not m:
        continue
    num = int(m.group(1))
    if 1 <= num <= n_expected and num not in accepted and is_question_x(x0):
        starts.append((num, idx))
        accepted.add(num)
starts.sort(key=lambda s: s[1])

questions = []
for k in range(len(starts) - 1):
    qnum, s = starts[k]
    _, e = starts[k + 1]
    rows = q_lines[s:e]                      # includes the number line at [0]
    p0, x0q, y0q = rows[0][2], rows[0][0], rows[0][3]
    block = [r[1] for r in q_lines[s + 1:e]]
    opts = ['', '', '', '']
    stem_lines = []
    ocount = 0
    for ln in block:
        m = OPT_RE.match(ln)
        if m:
            if ocount < 4:
                opts[ocount] = m.group(2).strip()
            ocount += 1
        elif ocount == 0:
            stem_lines.append(ln)
        elif ocount <= 4:
            opts[ocount - 1] = (opts[ocount - 1] + ' ' + ln).strip()
    q_text = ' '.join(stem_lines)
    q_text = re.sub(r'\s*\n\s*', '\n', q_text)
    q_text = re.sub(r'[ \t]{2,}', ' ', q_text).strip()
    questions.append({'n': qnum, 'q': q_text,
                      'opts': [re.sub(r'\s{2,}', ' ', o).strip() for o in opts],
                      'page': p0, 'col_x': x0q, 'y': y0q})

# ---- figure / table / fraction detection + per-question crop rect ----------
# Image a question only when it carries visual content that flattens in text:
#   * a diagram (raster image or a sizable vector-drawing cluster / table grid)
#   * a fraction (a thin, non-full-width horizontal rule = fraction bar)
# Its crop rect = the question's text-block bbox in its column, unioned with any
# figure it owns (a figure may overflow to the top of the adjacent column).
PW = doc[0].rect.width
MID = PW / 2
COL = {0: (38, MID - 5), 1: (MID + 2, PW - 28)}   # left / right column x-bounds

def clusters(rects, gap=6):
    rects = [fitz.Rect(r) for r in rects if r]
    merged = True
    while merged:
        merged = False
        out = []
        for r in rects:
            hit = next((o for o in out if fitz.Rect(
                r.x0 - gap, r.y0 - gap, r.x1 + gap, r.y1 + gap).intersects(o)), None)
            if hit:
                hit |= r; merged = True
            else:
                out.append(+r)
        rects = out
    return rects

# precompute per-page figure rects and fraction-bar rects
pg_figs, pg_fracs = {}, {}
for pno in {q['page'] for q in questions}:
    page = doc[pno]
    PH = page.rect.height
    figs = []
    for im in page.get_image_info():
        r = fitz.Rect(im['bbox'])
        # skip full-page background rasters (2025+) and header/corner logos
        if r.width > 0.8 * PW and r.height > 0.5 * PH:
            continue
        if r.y1 < 66:
            continue
        figs.append(r)
    dr = [d['rect'] for d in page.get_drawings()]
    for c in clusters(dr):
        # a real diagram / table grid is tall; short wide clusters are inline math
        if c.width > 34 and c.height > 45:
            figs.append(c)
    # page spans, for validating fraction bars have a stacked numerator/denominator
    spans = []
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            for sp in l.get('spans', []):
                if sp['text'].strip():
                    spans.append((fitz.Rect(sp['bbox']), sp['text'].strip()))
    fracs = []                                       # validated fraction-bar centres
    for r in (fitz.Rect(x) for x in dr):
        if not (r.height <= 2.5 and 5 <= r.width <= 60):
            continue
        cx, cy = (r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2
        above = any(sb.x0 < cx < sb.x1 + 4 and cy - 15 < sb.y1 <= cy + 1 for sb, _ in spans)
        below = any(sb.x0 < cx < sb.x1 + 4 and cy - 1 <= sb.y0 < cy + 15 for sb, _ in spans)
        if above and below:                          # real fraction (num over den)
            fracs.append((cx, cy))
    pg_figs[pno], pg_fracs[pno] = figs, fracs

by_page = {}
for q in questions:
    q['col'] = 0 if q['col_x'] < MID else 1
    by_page.setdefault(q['page'], []).append(q)

for pno, qs in by_page.items():
    qs.sort(key=lambda q: (q['col'], q['y']))
    # text bottom per column on this page (from all q_lines on the page)
    colbot = {0: 0, 1: 0}
    for x0, ln, p, y0, y1 in q_lines:
        if p == pno:
            colbot[0 if x0 < MID else 1] = max(colbot[0 if x0 < MID else 1], y1)
    for i, q in enumerate(qs):
        nxt = next((qq for qq in qs[i + 1:] if qq['col'] == q['col']), None)
        y_end = (nxt['y'] - 3) if nxt else colbot[q['col']] + 3
        cx0, cx1 = COL[q['col']]
        rect = fitz.Rect(cx0, q['y'] - 3, cx1, y_end)
        # own a figure: overlaps this rect, OR sits atop the OTHER column with no
        # question above it there (overflow of this bottom-of-column question).
        owned = None
        for fig in pg_figs[pno]:            # only in-column figures (cross-column
            if fig.intersects(rect):        # ones are handled by MANUAL crops)
                owned = fig if owned is None else (owned | fig)
        has_frac = any(rect.x0 <= cx <= rect.x1 and rect.y0 <= cy <= rect.y1
                       for (cx, cy) in pg_fracs[pno])
        if owned is not None:
            f = owned + (-4, -4, 4, 4)
            q['fig'] = [round(f.x0, 1), round(f.y0, 1), round(f.x1, 1), round(f.y1, 1)]
            rect |= owned
        q['crop'] = [round(rect.x0, 1), round(rect.y0, 1),      # block (∪ figure)
                     round(rect.x1, 1), round(rect.y1, 1)]
        if owned is not None or has_frac:
            q['img'] = True
for q in questions:
    q.pop('col_x', None); q.pop('col', None)

# ---- answer key: in-PDF 'N (x)' grid on the last page(s) -------------------
# Stop before any 'ANSWERS WITH EXPLANATIONS' section (2016+ papers append full
# solutions after the grid; their option labels must not pollute the answer map).
ans_map = {}
ans_end = next((i for i in range(key_page, doc.page_count)
                if 'ANSWERS WITH EXPLANATION' in doc[i].get_text()), doc.page_count)
if TABLE_KEY:
    # Positional table: each row = [Q.No, Answer(1-4), Topic..., Chapter...].
    # Cluster words per row by y; the two leftmost numeric words are Q.No + Answer.
    key_pages = sorted(KEY_REGION) if MULTI else range(key_page, ans_end)
    for i in key_pages:
        words = doc[i].get_text('words')
        rows = []
        for w in sorted(words, key=lambda w: (w[1], w[0])):
            if rows and abs(w[1] - rows[-1][0]) <= 6:
                rows[-1][1].append(w)
            else:
                rows.append((w[1], [w]))
        for _, row in rows:
            row = sorted(row, key=lambda w: w[0])
            if len(row) < 2:
                continue
            a, b = row[0][4].strip().rstrip('.'), row[1][4].strip()
            if a.isdigit() and b.isdigit():
                n, v = int(a), int(b)
                if 1 <= n <= n_expected and 1 <= v <= 4:
                    ans_map[n] = v - 1
else:
    ktext = '\n'.join(doc[i].get_text() for i in range(key_page, ans_end))
    # tolerate disputed/dropped cells printed as '(b, d)' / '(b & d)' — take first letter
    for m in re.finditer(r'(?<!\d)(\d{1,3})\s*\n?\s*\(([a-d])(?:\s*[,&]\s*[a-d])?\)', ktext):
        n = int(m.group(1))
        if 1 <= n <= n_expected:
            ans_map[n] = ord(m.group(2)) - ord('a')
for q in questions:
    q['answer'] = ans_map.get(q['n'], 0)
    q['expl'] = ''

# ---- diagnostics -----------------------------------------------------------
bad = [q['n'] for q in questions if sum(1 for o in q['opts'] if o) != 4]
imgq = [q['n'] for q in questions if q.get('img')]
print(f"questions parsed: {len(questions)} (expected {n_expected})")
print(f"answers matched:  {len(ans_map)}")
print(f"without 4 opts:   {bad[:30]} (total {len(bad)})")
print(f"image questions:  {imgq} (total {len(imgq)})")
questions.sort(key=lambda q: q['n'])
with open(out, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=1)
print("wrote", out)
