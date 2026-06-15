"""Reconcile RRB Group D 07-10-2022 transcriptions vs decoded keys; emit PART files.

For each shift:
  - load decoded key (_key_rrcgd07sN.txt) -> authoritative correct option (1-based)
  - load raw transcription (_raw_07sN.json)
  - drop: drop=true, Bengali-script questions, malformed (o!=4 or empty option)
  - set answer = key[orig]  (override agent's visual read)
  - report where agent's visual read disagreed with the key (alignment sanity)
  - emit _p2022sN_07.js
"""
import json, re, os

SHIFTS = ['s1', 's2', 's3']
BENGALI = re.compile(r'[ঀ-৿]')
SEC_CONST = {
    'Mathematics': 'MATH',
    'General Intelligence & Reasoning': 'REA',
    'General Science': 'SCI',
    'General Awareness & Current Affairs': 'GA',
}

def load_key(shift):
    key = {}
    with open(f'_key_rrcgd07{shift}.txt', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line: continue
            q, a = line.split('=')
            key[int(q[1:])] = int(a)
    return key

def jsesc(s):
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')

for shift in SHIFTS:
    key = load_key(shift)
    raw = json.load(open(f'_raw_07{shift}.json', encoding='utf-8'))
    seen = {}
    for it in raw:
        seen.setdefault(it['orig'], it)  # first wins (already deduped)
    kept, dropped, mismatches = [], [], []
    for orig in sorted(seen):
        it = seen[orig]
        reason = None
        if it.get('drop'): reason = it.get('reason', 'drop')
        elif BENGALI.search(it['q']) or any(BENGALI.search(o) for o in it['o']): reason = 'bengali'
        elif len(it['o']) != 4 or any(not o.strip() for o in it['o']): reason = 'malformed-options'
        elif orig not in key: reason = 'no-key'
        if reason:
            dropped.append((orig, reason)); continue
        agent_a = it.get('a')
        true_a = key[orig]
        if agent_a != true_a:
            mismatches.append((orig, agent_a, true_a))
        kept.append({'orig': orig, 's': it['section'], 'a': true_a, 'q': it['q'], 'o': it['o']})

    # emit part file
    out = f'_p2022{shift}_07.js'
    with open(out, 'w', encoding='utf-8') as f:
        f.write(f"// RRB Group D — 7 Oct 2022 {shift.upper()} (English). iON CBT response-sheet source.\n")
        f.write(f"// Answer = GREEN-TICK option (decoded from tick-bullets, authoritative). Kept {len(kept)}/100.\n")
        f.write("// Dropped: figure/graph/table, garbled, Bengali-only, and unrendered leading Qs.\n")
        f.write("const MATH = 'Mathematics';\n")
        f.write("const REA  = 'General Intelligence & Reasoning';\n")
        f.write("const SCI  = 'General Science';\n")
        f.write("const GA   = 'General Awareness & Current Affairs';\n\n")
        f.write("export const PART = [\n")
        for it in kept:
            f.write('  { orig:%d, s:%s, a:%d, q:"%s", o:[%s] },\n' % (
                it['orig'], SEC_CONST[it['s']], it['a'], jsesc(it['q']),
                ', '.join('"%s"' % jsesc(o) for o in it['o'])))
        f.write("];\n")

    hist = {}
    for it in kept: hist[it['s']] = hist.get(it['s'], 0) + 1
    print(f"=== {shift.upper()}: kept {len(kept)}, dropped {len(dropped)} ===")
    print("  sections:", {SEC_CONST[k]: v for k, v in hist.items()})
    print("  dropped:", dropped)
    if mismatches:
        print(f"  ANSWER MISMATCH (agent visual vs key) [{len(mismatches)}]:", mismatches)
    else:
        print("  answer alignment: 100% (every kept Q's visual read matched the key)")
    print()
