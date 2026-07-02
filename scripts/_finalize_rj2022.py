# -*- coding: utf-8 -*-
"""Reconcile the two independent solver passes + tiebreak into a final answer per
question for a Rajasthan Police 2022 paper, and write rp22_<tag>_final.json.

pass1 = assembled OCR+solve (image-aware)   rp22_<tag>_assembled.json
pass2 = independent text-only solve         rp22_<tag>_vb*.json
pass3 = tiebreak (web-enabled) over conflicts rp22_<tag>_tie_out.json  (optional)

Rule: non-figure Q ->
  if not in tie set: pass1==pass2 (agreed) -> that answer.
  if in tie set: majority vote over [p1,p2,p3] ignoring None; on a tie prefer p3
  (tiebreak), else p1. If still None -> answer stays None (generator drops it).
Figure Qs kept with figure=True (generator drops them).
Output element: {qno, question, options, answerIndex(0-based or None), figure}.
"""
import json, glob, os, sys, collections

SP = r'C:\Users\USER\AppData\Local\Temp\claude\d--Sazid-Github\9f3429d8-364a-4377-9561-51a03f4e8f92\scratchpad'


def load(tag):
    a = json.load(open(os.path.join(SP, f'rp22_{tag}_assembled.json'), encoding='utf-8'))
    p1 = {q['qno']: q for q in a}
    p2 = {}
    for f in glob.glob(os.path.join(SP, f'rp22_{tag}_vb*.json')):
        for r in json.load(open(f, encoding='utf-8')):
            p2[r['qno']] = r.get('answerIndex')
    p3 = {}
    tp = os.path.join(SP, f'rp22_{tag}_tie_out.json')
    if os.path.exists(tp):
        for r in json.load(open(tp, encoding='utf-8')):
            p3[r['qno']] = r.get('answerIndex')
    return p1, p2, p3


def finalize(tag):
    p1, p2, p3 = load(tag)
    out = []
    stats = collections.Counter()
    unresolved = []
    for qno in sorted(p1):
        q = p1[qno]
        if q.get('isFigure'):
            out.append({'qno': qno, 'question': q['question'], 'options': [], 'figure': True, 'answerIndex': None})
            stats['figure'] += 1
            continue
        a1 = q.get('answerIndex'); a2 = p2.get(qno); a3 = p3.get(qno)
        in_tie = qno in p3
        if not in_tie and a1 is not None and a1 == a2:
            final = a1; stats['agreed'] += 1
        else:
            votes = [v for v in (a1, a2, a3) if v is not None]
            if votes:
                c = collections.Counter(votes)
                top, n = c.most_common(1)[0]
                # tie among distinct values -> prefer p3 then p1
                tied = [v for v, k in c.items() if k == n]
                if len(tied) > 1:
                    final = a3 if a3 is not None else (a1 if a1 is not None else votes[0])
                else:
                    final = top
                stats['resolved'] += 1
            else:
                final = None; stats['none'] += 1; unresolved.append(qno)
        out.append({'qno': qno, 'question': q['question'], 'options': q['options'],
                    'figure': False, 'answerIndex': final})
    json.dump(out, open(os.path.join(SP, f'rp22_{tag}_final.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    seedable = sum(1 for o in out if not o['figure'] and o['answerIndex'] is not None)
    print(f'{tag}: total={len(out)} {dict(stats)} seedable={seedable} unresolved={unresolved}')


if __name__ == '__main__':
    for tag in (sys.argv[1:] or ['13s1']):
        finalize(tag)
