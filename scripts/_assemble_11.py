"""Assemble RRB Group D 11-Oct vision JSON + decoded keys -> _p2022sX_11.js PART files."""
import json, os

SEC = {"MATH":"MATH","REA":"REA","SCI":"SCI","GA":"GA"}
HEADER = """// RRB Group D — 11 Oct 2022 S{S} (English). iON CBT response-sheet source.
// Answer = GREEN-TICK option (decoded from tick-bullets, authoritative). Kept {K}/100.
// Dropped: figure/graph/table, garbled, Bengali-only, non-linearizable.
const MATH = 'Mathematics';
const REA  = 'General Intelligence & Reasoning';
const SCI  = 'General Science';
const GA   = 'General Awareness & Current Affairs';

export const PART = [
"""

def load_key(slug):
    key = {}
    with open(f"_key_{slug}.txt") as f:
        for line in f:
            line=line.strip()
            if not line: continue
            k,v=line.split("=")
            key[int(k[1:])]=int(v)
    return key

def jsstr(s):
    return json.dumps(s, ensure_ascii=False)

for s in (1,2,3):
    slug=f"rrcgd11s{s}"
    key=load_key(slug)
    items={}
    dropped={}
    for p in (1,2,3):
        fn=f"_vis_{slug}_p{p}.json"
        with open(fn,encoding="utf-8") as f:
            data=json.load(f)
        for it in data.get("kept",[]):
            o=int(it["orig"])
            if o in items:
                print(f"  [S{s}] DUP orig {o} (p{p}) — keeping first")
                continue
            items[o]=it
        for d in data.get("dropped",[]):
            dropped[int(d["orig"])]=d.get("reason","")
    # validate + build
    rows=[]
    issues=[]
    for o in sorted(items):
        it=items[o]
        opts=it["o"]
        if len(opts)!=4:
            issues.append(f"orig {o}: {len(opts)} options"); continue
        a=key.get(o,0)
        if a<1 or a>4:
            issues.append(f"orig {o}: key answer={a} (no tick / out of range)"); continue
        sec=SEC.get(it["s"])
        if not sec:
            issues.append(f"orig {o}: bad section {it['s']!r}"); continue
        q=it["q"].strip()
        if not q:
            issues.append(f"orig {o}: empty stem"); continue
        rows.append((o,sec,a,q,opts))
    # coverage check
    covered=set(items)|set(dropped)
    missing=[i for i in range(1,101) if i not in covered]
    # write
    out=f"_p2022s{s}_11.js"
    with open(out,"w",encoding="utf-8") as f:
        f.write(HEADER.format(S=s,K=len(rows)))
        for o,sec,a,q,opts in rows:
            optstr=", ".join(jsstr(x) for x in opts)
            f.write(f"  {{ orig:{o}, s:{sec}, a:{a}, q:{jsstr(q)}, o:[{optstr}] }},\n")
        f.write("];\n")
    print(f"S{s}: wrote {out} — {len(rows)} kept, {len(dropped)} dropped, missing(not seen)={missing}")
    if issues:
        print("   ISSUES:")
        for x in issues: print("    -",x)
