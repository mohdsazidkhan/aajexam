#!/usr/bin/env python3
"""Merge PDF meta (authoritative section/n/qid/answerIndex/page/crop-band) with
QID-keyed docx text into a working _final_<slug>.json skeleton for a 09-Dec-2020
style Delhi Police paper.

 - Part A GK (n1-50)   : text + answer from docx (Hindi native), keyed by qid.
 - Part D Computer (n91-100): text + answer from docx, keyed by qid.
   For A/D, the PDF colour-key does not isolate option spans, so docx green is the
   answer source. Any A/D question missing from docx (rasterised first page etc.) is
   emitted with a 'NEEDS_VISION' marker for manual fill.
 - Part B Reasoning (n51-75) + Part C Numerical (n76-90): answer from PDF colour-key;
   content left as placeholder ('NEEDS_CONTENT') to be filled by figure crops
   (figural) or vision transcription (text/numerical).

Writes _final_<slug>.json with per-question:
  {n, section, questionText, options[4], answerIndex, explanation, kind, qid, page,
   y0, y1}
kind in {'text', 'needs_vision', 'needs_content'}.

Usage: python scripts/_dpc09_merge.py <slug>
"""
import json, sys

SLUG = sys.argv[1]
meta = json.load(open(f'_pdfmeta_{SLUG}.json', encoding='utf-8'))
# docx is unreliable for this paper (garbled Hindi + broken block boundaries), so
# it is NOT used: A/D text comes from PDF English extraction (_dpc09_pdftext.py) or
# vision; all answers come from the PDF colour-key in _pdfmeta.

GK = 'General Knowledge / Current Affairs'
REA = 'Reasoning / Logical Ability'
NUM = 'Numerical Ability (Quantitative Aptitude)'
COMP = 'Computer Awareness / Fundamentals'
SECNAME = {'A': GK, 'B': REA, 'C': NUM, 'D': COMP}

final = []
need_vision = []
need_content = []
for m in meta:
    n, sec, qid = m['n'], m['section'], m['qid']
    rec = {'n': n, 'section': SECNAME[sec], 'questionText': '', 'options': ['', '', '', ''],
           'answerIndex': m['answerIndex'], 'explanation': '', 'kind': '', 'qid': qid,
           'page': m['page'], 'y0': m['y0'], 'y1': m['y1']}
    if sec in ('A', 'D'):
        rec['kind'] = 'needs_vision'   # refined by _dpc09_pdftext.py (text vs vision)
        need_vision.append(n)
    else:
        rec['kind'] = 'needs_content'
        need_content.append(n)
    final.append(rec)

final.sort(key=lambda x: x['n'])
secs = {}
for q in final:
    secs[q['section']] = secs.get(q['section'], 0) + 1
print('sections:', secs)
print('A/D needing vision (missing from docx):', need_vision)
print('B/C needing content (crop/vision):', f'{len(need_content)} questions n{need_content[0]}-{need_content[-1]}')
noans = [q['n'] for q in final if q['answerIndex'] is None]
print('questions with NO answer yet:', noans if noans else 'none')
json.dump(final, open(f'_final_{SLUG}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'wrote _final_{SLUG}.json')
