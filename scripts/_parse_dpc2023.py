#!/usr/bin/env python3
"""Parse a 2023 Delhi Police Constable TCS/iON 'Question Paper with Answers' PDF.

These PDFs have a CLEAN unicode text layer plus a deterministic colour answer key:
the correct option's number+text is rendered green (0x40c64b), wrong ones red
(0xf61818). Q-numbering RESTARTS per section (GK 1-50, Reasoning 1-25,
Numerical 1-15, Computer 1-10 = 100). We assign a global n 1..100.

Three question shapes are detected per question:
  - text      : pure text, options carry text          -> options = texts
  - qfigure   : a figure in the question area, options carry text
                -> options = texts, questionImage = crop of question figure band
  - figural   : option text is empty (option figures)  -> options = ['1','2','3','4'],
                questionImage = combined crop (figure + numbered options)

Output: _dpc2023_<slug>.json  (list of question dicts, with crop geometry for
images). A companion script renders the crops.

Usage: python scripts/_parse_dpc2023.py "<pdf>" <slug>
"""
import fitz, sys, re, json, io

PDF, SLUG = sys.argv[1], sys.argv[2]

SECMAP = {
    'General Knowledge': 'General Knowledge / Current Affairs',
    'Reasoning': 'Reasoning / Logical Ability',
    'Numerical Ability': 'Numerical Ability (Quantitative Aptitude)',
    'Computer Proficiency': 'Computer Awareness / Fundamentals',
}
SEC_ORDER = ['General Knowledge / Current Affairs', 'Reasoning / Logical Ability',
             'Numerical Ability (Quantitative Aptitude)', 'Computer Awareness / Fundamentals']
GREEN = 0x40c64b
RED = 0xf61818

doc = fitz.open(PDF)

# ---- gather ordered items (text lines + image blocks) across the document ----
# Each item: dict(kind, page, y0, x0, x1, y1, text, color, w, h)
def page_items(pg, pno):
    items = []
    dd = pg.get_text("dict")
    for b in dd["blocks"]:
        if "lines" not in b:  # image block
            x0, y0, x1, y1 = b["bbox"]
            items.append(dict(kind='img', page=pno, y0=y0, x0=x0, x1=x1, y1=y1,
                              w=x1 - x0, h=y1 - y0))
            continue
        for l in b["lines"]:
            spans = [s for s in l["spans"]]
            txt = "".join(s["text"] for s in spans)
            if not txt.strip():
                continue
            # colour of first non-space span
            col = None
            for s in spans:
                if s["text"].strip():
                    col = s["color"]; break
            x0, y0, x1, y1 = l["bbox"]
            items.append(dict(kind='txt', page=pno, y0=y0, x0=x0, x1=x1, y1=y1,
                              text=txt, color=col))
    # Reading order: cluster items into visual rows (y within 3pt), then order each
    # row left-to-right. Naive (round(y0), x0) flips items that share a visual line
    # but differ by <1pt in y0 — e.g. a 'Q.N' marker vs the first text line, or
    # option-1 vs the 'Ans' label (seen rendered 1pt above each other), which would
    # mis-route the line. Clustering makes same-line items group regardless.
    items.sort(key=lambda it: (it['y0'], it['x0']))
    ref = None
    row = -1
    for it in items:
        if ref is None or it['y0'] - ref > 3.0:
            row += 1; ref = it['y0']
        it['_row'] = row
    items.sort(key=lambda it: (it['_row'], it['x0']))
    return items

allitems = []
for pno in range(doc.page_count):
    allitems.extend(page_items(doc[pno], pno))

# ---- walk items, build questions ----
QRE = re.compile(r'^Q\.(\d+)\b\s*(.*)$', re.S)
OPTRE = re.compile(r'^([1-4])\.\s?(.*)$', re.S)

questions = []
all_imgs = []      # (page, x0, y0, x1, y1, w, h) — assigned to questions post-hoc
cur = None
cur_section_raw = None
sec_counter = {}   # canonical section -> count so far
global_n = 0

def flush(cur):
    if cur is not None:
        questions.append(cur)

for idx, it in enumerate(allitems):
    if it['kind'] == 'txt':
        t = it['text'].strip()
        # section header
        ms = re.match(r'^Section\s*:\s*\xa0?\s*(.+)$', t)
        if ms:
            raw = ms.group(1).strip()
            if raw in SECMAP:
                cur_section_raw = SECMAP[raw]
            continue
        mq = QRE.match(t)
        if mq:
            # start new question
            flush(cur)
            qn = int(mq.group(1))
            sec = cur_section_raw
            global_n += 1
            cur = dict(n=global_n, secn=qn, section=sec, page=it['page'],
                       qy0=it['y0'], qtext_lines=[], opts=[], optcols=[],
                       imgs=[], ans_y=None, qid_y=None, state='qtext')
            rest = mq.group(2).strip()
            if rest:
                cur['qtext_lines'].append(rest)
            continue
        if cur is None:
            continue
        # 'Ans' marker
        if t == 'Ans':
            cur['state'] = 'opts'
            cur['ans_y'] = it['y0']
            continue
        # metadata box -> end of question content
        if t.startswith('Question ID'):
            if cur['qid_y'] is None:
                cur['qid_y'] = it['y0']
            cur['state'] = 'meta'
            continue
        if t.startswith(('Option ', 'Status', 'Chosen Option', 'Marked For Review')):
            continue
        # header box lines to ignore
        if t.startswith(('Constable Executive', 'Roll Number', 'Candidate', 'Name',
                         'Venue Name', 'iON Digital', 'Exam Date', 'Exam Time',
                         'Subject', 'Examination 2023')) or re.match(r'^\d{2}/\d{2}/\d{4}$', t):
            continue
        # option line?
        if cur['state'] == 'opts':
            mo = OPTRE.match(t)
            if mo and len(cur['opts']) < 4 and it['x0'] < 200:
                cur['opts'].append(mo.group(2).strip())
                cur['optcols'].append(it['color'])
                continue
        if cur['state'] == 'qtext':
            cur['qtext_lines'].append(t)
            continue
        # stray text after options but before meta (rare wrap of option) -> append to last opt
        if cur['state'] == 'opts' and cur['opts'] and it['x0'] > 80 and it['x0'] < 360:
            cur['opts'][-1] = (cur['opts'][-1] + ' ' + t).strip()
            continue
    else:  # image block — collect globally, assign to a question afterwards
        all_imgs.append((it['page'], it['x0'], it['y0'], it['x1'], it['y1'], it['w'], it['h']))

flush(cur)

# assign each image to the owning question: same page, marker at/just-above the
# image (tol 4pt covers a question-figure that sits level with its 'Q.N' label),
# before the next question's marker on that page.
by_page = {}
for q in questions:
    by_page.setdefault(q['page'], []).append(q)
for lst in by_page.values():
    lst.sort(key=lambda q: q['qy0'])
for (pg, x0, y0, x1, y1, w, h) in all_imgs:
    cand = [q for q in by_page.get(pg, []) if q['qy0'] - 4 <= y0]
    if not cand:
        continue
    owner = max(cand, key=lambda q: q['qy0'])
    owner['imgs'].append((x0, y0, x1, y1, w, h))

# ---- post-process: classify + clean ----
def join_q(lines):
    s = " ".join(lines)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

GENERIC = "Select the correct option based on the image given below."

out = []
problems = []
for q in questions:
    qtext = join_q(q['qtext_lines'])
    opts = q['opts']
    optcols = q['optcols']
    # answer from green colour
    ans = None
    for i, c in enumerate(optcols):
        if c == GREEN:
            ans = i; break
    # question figures = WIDE image blocks (markers are narrow, w<=15) in the
    # question area (above 'Ans'), content column, excluding the right metadata box.
    ans_y = q['ans_y']
    qfigs = [im for im in q['imgs']
             if im[4] > 24 and im[5] > 12 and im[0] < 360
             and im[1] >= q['qy0'] - 2 and (ans_y is None or im[1] < ans_y - 2)]
    qfig_top = min((im[1] for im in qfigs), default=None)
    opt_has_text = any(o.strip() for o in opts)

    rec = dict(n=q['n'], secn=q['secn'], section=q['section'], page=q['page'],
               qtext=qtext, ans=ans, answer_from='green')

    if opt_has_text and not qfigs:
        rec['kind'] = 'text'
        rec['options'] = opts
    elif opt_has_text and qfigs:
        # question figure/table + text options: crop the question band only
        rec['kind'] = 'qfigure'
        rec['options'] = opts
        if not qtext:
            rec['qtext'] = GENERIC
        rec['crop'] = dict(page=q['page'], y0=qfig_top,
                           y1=(ans_y - 2) if ans_y else q['qid_y'] - 6, combined=False)
    else:
        # image options: combined crop. Start at the question figure if present,
        # else at 'Ans' (skip the real text prompt -> no duplication). Keep real
        # qtext when available; otherwise a generic prompt.
        rec['kind'] = 'figural'
        rec['options'] = ['1', '2', '3', '4']
        y0 = qfig_top if qfig_top is not None else (ans_y - 2)
        rec['crop'] = dict(page=q['page'], y0=y0, y1=q['qid_y'] - 9, combined=True)
        if not qtext:
            rec['qtext'] = GENERIC

    # validation
    if len(opts) != 4:
        problems.append((q['n'], q['section'], f"opts={len(opts)}"))
    if ans is None:
        problems.append((q['n'], q['section'], "no green answer"))
    if rec['kind'] in ('text',) and not qtext:
        problems.append((q['n'], q['section'], "empty qtext"))
    out.append(rec)

# section counts
from collections import Counter
sc = Counter(r['section'] for r in out)

rep = io.open(f'_dpc2023_{SLUG}.report.txt', 'w', encoding='utf-8')
rep.write(f"PDF: {PDF}\nslug: {SLUG}\nTotal questions: {len(out)}\n")
rep.write("Section counts:\n")
for s in SEC_ORDER:
    rep.write(f"  {s}: {sc.get(s,0)}\n")
kinds = Counter(r['kind'] for r in out)
rep.write(f"Kinds: {dict(kinds)}\n")
rep.write(f"Problems ({len(problems)}):\n")
for p in problems:
    rep.write(f"  n{p[0]} [{p[1]}] {p[2]}\n")
rep.write("\n--- all questions ---\n")
for r in out:
    a = r['ans']
    al = r['options'][a] if (a is not None and a < len(r['options'])) else '??'
    rep.write(f"\nn{r['n']} ({r['section']} #{r['secn']}) [{r['kind']}] ans={a}:{al}\n")
    rep.write(f"  Q: {r['qtext'][:160]}\n")
    if r['kind'] != 'figural':
        for i, o in enumerate(r['options']):
            mark = ' *' if i == a else '  '
            rep.write(f"   {mark}{i+1}. {o[:120]}\n")
rep.close()

json.dump(out, io.open(f'_dpc2023_{SLUG}.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print(f"{SLUG}: {len(out)} questions, kinds={dict(kinds)}, problems={len(problems)}")
print("sections:", dict(sc))
