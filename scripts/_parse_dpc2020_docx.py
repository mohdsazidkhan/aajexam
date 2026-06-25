#!/usr/bin/env python3
"""Robust docx-order parser for the TEXT sections (Part A General Knowledge,
Part D Computer) of a 2020-era Delhi Police response-sheet docx.

Why docx (not the PDF): pdftotext -layout floats the right-aligned 'Question ID'
boxes into adjacent question chunks, silently dropping questions, and Devanagari
(Hindi-medium GK questions) does not extract from the PDF at all. The docx keeps
everything in reading order, Hindi included, with the correct option coloured
green (#40c64a) per run -- so we read text + answer straight from it.

Block model: paragraphs run in order; each question ends at a 'Question ID : N'
paragraph. Within a block the option-1 anchor is 'Ans 1.' (possibly 'Ans  1.'),
inline at the end of the stem or on its own line. opt1 = text after the anchor;
opt2-4 = the next three paragraphs (leading '2.'/'3.'/'4.' label stripped).
The correct option is the one whose run is green. Match-the-following stems span
several paragraphs before the anchor -- all kept as stem.

Only Part A and Part D are emitted (image sections B/C are handled by
_dpc2020_imgdecode.py). A -> n 1..50, D -> n 91..100.

Usage: python scripts/_parse_dpc2020_docx.py <docx> <slug>
"""
import re, sys, json, zipfile

DOCX, SLUG = sys.argv[1], sys.argv[2]
GK = 'General Knowledge / Current Affairs'
COMP = 'Computer Awareness / Fundamentals'
SECNAME = {'A': GK, 'D': COMP}

z = zipfile.ZipFile(DOCX)
xml = z.read('word/document.xml').decode('utf-8', 'replace')
paras_xml = re.split(r'</w:p>', xml)

def ptext(p):
    t = ''.join(re.findall(r'<w:t(?:\s[^>]*)?>(.*?)</w:t>', p, re.DOTALL))
    # un-escape the few XML entities that appear in these docs
    return (t.replace('&amp;', '&').replace('&apos;', "'").replace('&quot;', '"')
             .replace('&lt;', '<').replace('&gt;', '>'))

def is_green(p):
    for run in re.split(r'</w:r>', p):
        t = ''.join(re.findall(r'<w:t(?:\s[^>]*)?>(.*?)</w:t>', run, re.DOTALL))
        if t.strip() and re.search(r'<w:color w:val="40[cC]64[aA]"', run):
            return True
    return False

# ---- linear paragraph stream tagged with section + green flag ----
paras = []          # (section, text, green)
sec = None
for px in paras_xml:
    t = ptext(px).strip()
    ms = re.search(r'Section\s*:\s*Part\s*([A-D])', t)
    if ms:
        sec = ms.group(1)
    if t:
        paras.append((sec, t, is_green(px)))

# ---- split into blocks at 'Question ID' ----
blocks = []         # (section, qid, [(text, green), ...])
cur = []
for s, t, g in paras:
    mid = re.search(r'Question ID\s*:\s*(\d+)', t)
    if mid:
        blocks.append((s, mid.group(1), cur))
        cur = []
    else:
        cur.append((s, t, g))

ANCHOR = re.compile(r'Ans\s*1\s*[\.\)]\s*')
LABEL = re.compile(r'^(?:Ans\s*)?[2-4]\s*[\.\)]\s*')

def strip_leading_residue(items):
    # drop Status/Chosen-Option lines that bleed from the previous question
    out = []
    for s, t, g in items:
        if re.match(r'^(Status|Chosen Option)\b', t):
            continue
        # header noise that only appears in the very first block
        if re.match(r'^(DELHI POLICE|P\s*r\s*e\s*v\s*i\s*o\s*u\s*s)', t):
            continue
        if re.match(r'^Section\s*:\s*Part', t):
            continue
        out.append((s, t, g))
    return out

def parse_block(items):
    """Return (stem, [o1,o2,o3,o4], answerIndex) or None if not a clean text Q."""
    items = strip_leading_residue(items)
    # find anchor paragraph
    ai = None
    for i, (s, t, g) in enumerate(items):
        if ANCHOR.search(t):
            ai = i
            break
    if ai is None:
        return None
    s0, atext, agreen = items[ai]
    m = ANCHOR.search(atext)
    stem_parts = [t for _, t, _ in items[:ai]] + [atext[:m.start()]]
    stem = ' '.join(x.strip() for x in stem_parts if x.strip())
    stem = re.sub(r'^Q\.\s*\d+\s*', '', stem).strip()
    opt1 = atext[m.end():].strip()
    opts = [opt1]
    greens = [agreen]
    # next three non-empty paragraphs are options 2-4
    j = ai + 1
    while j < len(items) and len(opts) < 4:
        s, t, g = items[j]
        t2 = LABEL.sub('', t).strip()
        opts.append(t2)
        greens.append(g)
        j += 1
    if len(opts) != 4 or any(not o for o in opts):
        return None, opts, greens
    gi = [k for k, gg in enumerate(greens) if gg]
    ans = gi[0] if len(gi) == 1 else None
    return stem, opts, ans

questions = []
sec_count = {'A': 0, 'D': 0}
N_BASE = {'A': 0, 'D': 90}
problems = []
for s, qid, items in blocks:
    if s not in ('A', 'D'):
        continue
    sec_count[s] += 1
    n = N_BASE[s] + sec_count[s]
    res = parse_block(items)
    if res is None or res[0] is None:
        problems.append((n, qid, 'no-anchor-or-bad-options',
                         res[1] if res else None))
        stem, opts, ans = ('', ['', '', '', ''], None)
        if res and res[1]:
            opts = (res[1] + ['', '', '', ''])[:4]
    else:
        stem, opts, ans = res
        if ans is None:
            problems.append((n, qid, 'no/multi green', opts))
    questions.append({
        'n': n, 'qid': qid, 'section': SECNAME[s],
        'questionText': stem, 'options': opts,
        'answerIndex': ans, 'greenText': opts[ans] if ans is not None else None,
        'isImageQ': False, 'optionsAreImages': False,
    })

questions.sort(key=lambda q: q['n'])
print(f'Part A: {sec_count["A"]} | Part D: {sec_count["D"]}')
print('problems:', problems if problems else 'none')
json.dump(questions, open(f'_questions_{SLUG}.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print(f'wrote _questions_{SLUG}.json ({len(questions)} text questions)')
