import json, glob, re, os

for s in (1, 2, 3):
    files = sorted(glob.glob(f"_tr_s{s}_c*.json"))
    items = []
    for fn in files:
        with open(fn, encoding="utf-8") as f:
            items.extend(json.load(f))
    # dedup by orig (keep first)
    seen = {}
    for it in items:
        o = it["orig"]
        if o in seen:
            print(f"S{s}: DUP orig {o}")
            continue
        seen[o] = it
    merged = [seen[o] for o in sorted(seen)]
    out = f"_tr_rrcgdsep01s{s}.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=0)
    origs = set(seen)
    missing = [n for n in range(1, 101) if n not in origs]
    drops = [o for o in sorted(seen) if seen[o].get("drop")]
    # flag entries containing Devanagari (Hindi) chars left in q/o
    hindi = []
    for o in sorted(seen):
        blob = seen[o]["q"] + " ".join(seen[o].get("o", []))
        if re.search(r"[ऀ-ॿ]", blob):
            hindi.append(o)
    print(f"S{s}: {len(merged)} Qs, missing={missing}, drops({len(drops)})={drops}")
    print(f"     Hindi-residue origs: {hindi}")
