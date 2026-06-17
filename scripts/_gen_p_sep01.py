"""Merge Sep-01 2022 transcriptions with deterministic green-tick keys -> _p2022sX_sep01.js

For each shift: read _tr_rrcgdsep01sX.json + _key_rrcgdsep01sX.txt, drop flagged/invalid Qs,
emit a PART array file. Answer (a) comes from the decoded tick-bullet key (authoritative).
"""
import json, re

SEC_CONST = {
    'Mathematics': 'MATH',
    'General Intelligence & Reasoning': 'REA',
    'General Science': 'SCI',
    'General Awareness & Current Affairs': 'GA',
}

HEADER = """// RRB Group D — 01 Sep 2022 S{shift} (mixed sections). iON CBT response-sheet source.
// Answer = GREEN-TICK option (decoded from tick-bullets, authoritative). Kept {kept}/100.
// Dropped: figure/graph/table/diagram, garbled/inconsistent, non-linearizable.
const MATH = 'Mathematics';
const REA  = 'General Intelligence & Reasoning';
const SCI  = 'General Science';
const GA   = 'General Awareness & Current Affairs';

export const PART = [
"""

def jstr(s):
    return json.dumps(s, ensure_ascii=False)

def gen(shift):
    with open(f"_tr_rrcgdsep01s{shift}.json", encoding="utf-8") as f:
        items = json.load(f)
    key = {}
    with open(f"_key_rrcgdsep01s{shift}.txt") as f:
        for line in f:
            m = re.match(r"Q(\d+)=(\d+)", line.strip())
            if m:
                key[int(m.group(1))] = int(m.group(2))

    kept, dropped = [], []
    seen = set()
    for it in items:
        o = it['orig']
        if o in seen:
            print(f"  !! duplicate orig {o}"); continue
        seen.add(o)
        ans = key.get(o, 0)
        bad = (it.get('drop') or len(it.get('o', [])) != 4
               or not it.get('q', '').strip()
               or any(not str(x).strip() for x in it.get('o', []))
               or ans < 1 or ans > 4)
        if bad:
            dropped.append(o); continue
        kept.append({'orig': o, 's': SEC_CONST[it['section']], 'a': ans,
                     'q': it['q'], 'o': it['o']})

    missing = [n for n in range(1, 101) if n not in seen]
    if missing:
        print(f"  !! missing origs: {missing}")

    lines = [HEADER.format(shift=shift, kept=len(kept))]
    for k in kept:
        lines.append(
            "  { orig:%d, s:%s, a:%d, q:%s, o:%s }," % (
                k['orig'], k['s'], k['a'], jstr(k['q']), jstr(k['o'])))
    lines.append("];\n")
    out = f"_p2022s{shift}_sep01.js"
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    bysec = {}
    for k in kept:
        bysec[k['s']] = bysec.get(k['s'], 0) + 1
    print(f"Shift {shift}: kept {len(kept)}, dropped {len(dropped)} -> {out}")
    print(f"  sections: {bysec}")
    print(f"  dropped origs: {dropped}")

for s in (1, 2, 3):
    gen(s)
