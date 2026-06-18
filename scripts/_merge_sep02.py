import json, re, os

SECMAP = {
    'Mathematics': 'Mathematics',
    'General Intelligence & Reasoning': 'General Intelligence & Reasoning',
    'General Science': 'General Science',
    'General Awareness & Current Affairs': 'General Awareness & Current Affairs',
}

def load_key(s):
    key = {}
    with open(f'_key_2022s{s}_sep02.txt') as f:
        for line in f:
            m = re.match(r'Q(\d+)=(\d+)', line.strip())
            if m:
                key[int(m.group(1))] = int(m.group(2))
    return key

def jstr(s):
    return json.dumps(s, ensure_ascii=False)

for s in (1, 2, 3):
    key = load_key(s)
    items = {}
    for chunk in ('a', 'b', 'c', 'd'):
        path = f'_t_s{s}_{chunk}.json'
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        for it in data:
            o = it['orig']
            if o in items:
                print(f'  WARN S{s}: duplicate orig {o}')
            items[o] = it
    kept = []
    dropped = []
    seen = set()
    for o in range(1, 101):
        it = items.get(o)
        if it is None:
            print(f'  MISSING S{s} orig {o}')
            continue
        seen.add(o)
        if it.get('drop'):
            dropped.append(o)
            continue
        opts = it.get('options')
        if not opts or len(opts) != 4:
            print(f'  BAD S{s} orig {o}: options={opts}')
            continue
        sec = SECMAP.get(it['section'])
        if sec is None:
            print(f'  BAD SECTION S{s} orig {o}: {it["section"]!r}')
            continue
        a = key.get(o)
        if a not in (1, 2, 3, 4):
            print(f'  BAD KEY S{s} orig {o}: a={a}')
            continue
        kept.append({'orig': o, 's': sec, 'a': a, 'q': it['stem'], 'o': opts})
    missing = [o for o in range(1, 101) if o not in seen]
    if missing:
        print(f'  S{s} not-seen origs: {missing}')
    # section tally
    tally = {}
    for k in kept:
        tally[k['s']] = tally.get(k['s'], 0) + 1
    print(f'S{s}: kept={len(kept)} dropped={len(dropped)} -> {dropped}')
    print(f'   sections: {tally}')

    # write JS
    SHORT = {
        'Mathematics': 'MATH',
        'General Intelligence & Reasoning': 'REA',
        'General Science': 'SCI',
        'General Awareness & Current Affairs': 'GA',
    }
    lines = []
    lines.append(f"// RRB Group D — 02 Sep 2022 S{s} (mixed sections). iON CBT response-sheet source.")
    lines.append(f"// Answer = GREEN-TICK option (decoded from tick-bullets, authoritative). Kept {len(kept)}/100.")
    lines.append("// Dropped: figure/graph/table/diagram, garbled/inconsistent, non-linearizable.")
    lines.append("const MATH = 'Mathematics';")
    lines.append("const REA  = 'General Intelligence & Reasoning';")
    lines.append("const SCI  = 'General Science';")
    lines.append("const GA   = 'General Awareness & Current Affairs';")
    lines.append("")
    lines.append("export const PART = [")
    lines.append("")
    for k in kept:
        sv = SHORT[k['s']]
        ostr = '[' + ', '.join(jstr(x) for x in k['o']) + ']'
        lines.append(f"  {{ orig:{k['orig']}, s:{sv}, a:{k['a']}, q:{jstr(k['q'])}, o:{ostr} }},")
    lines.append("")
    lines.append("];")
    with open(f'_p2022s{s}_sep02.js', 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'   wrote _p2022s{s}_sep02.js')

print('TOTAL kept across shifts computed above.')
