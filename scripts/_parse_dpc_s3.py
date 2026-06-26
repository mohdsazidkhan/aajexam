#!/usr/bin/env python3
"""Parse a 'Prepp'-style typeset Delhi Police Constable PDF (e.g. 02-Dec-2020
Shift 3) into questions. UNLIKE the response-sheet shifts, this PDF has a clean
text layer: questions as `N. <stem>` + lowercase `a.`-`d.` options + a trailing
`(+1, -0.25)` marks marker, then an `Answers` section with `N. Answer: x` for all
100 (deterministic key) and explanations.

GK / Reasoning(verbal) / Computer parse cleanly from text. Numerical options with
fractions/superscripts extract garbled -> flagged needs_vision for a crop pass.

Writes _final_<slug>.json: [{n, section, questionText, options[4], answerIndex,
explanation, kind, qid:None}] with kind in {text, needs_vision}.

Usage: python scripts/_parse_dpc_s3.py <pdf> <slug>
"""
import fitz, sys, re, json

PDF, SLUG = sys.argv[1], sys.argv[2]
doc = fitz.open(PDF)
txt = '\n'.join(doc[i].get_text() for i in range(doc.page_count))

GK = 'General Knowledge / Current Affairs'
REA = 'Reasoning / Logical Ability'
NUM = 'Numerical Ability (Quantitative Aptitude)'
COMP = 'Computer Awareness / Fundamentals'
# section by global n
def section_of(n):
    if n <= 50: return GK
    if n <= 75: return REA
    if n <= 90: return NUM
    return COMP

# answer key
ans = {int(n): 'abcd'.index(a) for n, a in re.findall(r'(\d+)\.\s*Answer:\s*([abcd])', txt)}
assert len(ans) == 100, f'answer key {len(ans)} != 100'

# question region
start = txt.index('General Knowledge/Current Affairs', 900)
end = txt.index('\nAnswers\n')
region = txt[start:end]
lines = []
for l in region.split('\n'):
    s = l.strip()
    if not s: continue
    if s in ('Prepp', 'Download Prepp APP', 'GET IT ON', 'Google Play', '/'): continue
    if re.fullmatch(r'\d+', s): continue                       # page numbers
    if s in ('General Knowledge/Current Affairs', 'Reasoning',
             'Numerical Ability', 'Computer Awareness'): continue
    if re.fullmatch(r'\(\+1,?\s*-?0?\.?25\)', s): continue     # marks marker
    lines.append(s)

# locate the question-start line for each expected n (sequential)
qpos = {}
expected = 1
for i, l in enumerate(lines):
    m = re.match(r'^(\d+)\.\s', l)
    if m and int(m.group(1)) == expected:
        qpos[expected] = i
        expected += 1
assert expected == 101, f'only sequenced up to {expected-1}'

order = sorted(qpos)
final, vision = [], []
for idx, n in enumerate(order):
    i0 = qpos[n]
    i1 = qpos[order[idx + 1]] if idx + 1 < len(order) else len(lines)
    block = lines[i0:i1]
    # stem: from first line (strip 'N. ') until first 'a.' option
    block[0] = re.sub(r'^\d+\.\s*', '', block[0])
    opt_idx = {}
    for j, l in enumerate(block):
        mo = re.match(r'^([abcd])\.\s?(.*)$', l)
        if mo and mo.group(1) not in opt_idx:
            # only accept in order a,b,c,d
            letter = mo.group(1)
            want = 'abcd'[len(opt_idx)]
            if letter == want:
                opt_idx[letter] = j
    stem_end = opt_idx.get('a', len(block))
    stem = ' '.join(block[:stem_end]).strip()
    opts = []
    ok = True
    letters = ['a', 'b', 'c', 'd']
    for k, lt in enumerate(letters):
        if lt not in opt_idx:
            ok = False; break
        j0 = opt_idx[lt]
        j1 = opt_idx[letters[k + 1]] if k + 1 < 4 and letters[k + 1] in opt_idx else len(block)
        body = block[j0:j1]
        body[0] = re.sub(r'^[abcd]\.\s?', '', body[0])
        opts.append(' '.join(x for x in body).strip())
    rec = {'n': n, 'section': section_of(n), 'questionText': stem,
           'options': opts if ok else ['', '', '', ''], 'answerIndex': ans[n],
           'explanation': '', 'kind': '', 'qid': None}
    # quality: 4 non-empty options + non-empty stem, no obvious garble
    blob = stem + ' ' + ' '.join(opts)
    garbled = ('�' in blob) or ('​' in blob)
    bad = (not ok) or (not stem) or any(not o for o in opts) or garbled
    if bad:
        rec['kind'] = 'needs_vision'; vision.append(n)
    else:
        rec['kind'] = 'text'
    final.append(rec)

final.sort(key=lambda x: x['n'])
secs = {}
for q in final:
    secs[q['section']] = secs.get(q['section'], 0) + 1
print('sections:', secs)
print('clean text:', sum(1 for q in final if q['kind'] == 'text'))
print('needs_vision:', vision)
json.dump(final, open(f'_final_{SLUG}.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print(f'wrote _final_{SLUG}.json')
