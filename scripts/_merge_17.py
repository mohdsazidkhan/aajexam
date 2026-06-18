"""Merge overlapping vision-transcription JSON for RRB Group D 17-Aug-2022 (S1/S2/S3),
dedupe by orig, cross-check visual tick vs deterministically-decoded green-tick key,
and emit _p2022s{1,2,3}_17.js parser files. Answer = decoded key (authoritative)."""
import json, re, sys

SEC_CONST = {
    "Mathematics": "MATH",
    "General Intelligence & Reasoning": "REA",
    "General Science": "SCI",
    "General Awareness & Current Affairs": "GA",
}

def load_key(slug):
    key = {}
    for line in open(f"_key_{slug}.txt"):
        m = re.match(r"Q(\d+)=(\d+)", line.strip())
        if m:
            key[int(m.group(1))] = int(m.group(2))
    return key

def jstr(s):
    return json.dumps(s, ensure_ascii=False)

for s in (1, 2, 3):
    slug = f"2022s{s}_17"
    chunks = []
    for part in ("a", "b", "c"):
        chunks.extend(json.load(open(f"_vis_s{s}_{part}.json", encoding="utf-8")))
    key = load_key(slug)

    # dedupe by orig: prefer a non-dropped version; remember if versions disagree
    by_orig = {}
    for it in chunks:
        o = it["orig"]
        if o not in by_orig:
            by_orig[o] = it
        else:
            prev = by_orig[o]
            # prefer the kept (non-drop) version
            if prev.get("drop") and not it.get("drop"):
                by_orig[o] = it

    kept, dropped, mism = [], [], []
    for o in sorted(by_orig):
        it = by_orig[o]
        if it.get("drop"):
            dropped.append((o, it.get("drop")))
            continue
        if o not in key:
            dropped.append((o, "no decoded key"))
            continue
        a = key[o]
        if it.get("tick") and it["tick"] != a:
            mism.append((o, it.get("tick"), a))
        if len(it.get("o", [])) != 4:
            dropped.append((o, f"opts={len(it.get('o',[]))}"))
            continue
        kept.append({"orig": o, "s": SEC_CONST[it["section"]], "a": a,
                     "q": it["q"], "o": it["o"]})

    # write parser JS
    fn = f"_p{slug}.js"
    with open(fn, "w", encoding="utf-8") as f:
        f.write(f"// RRB Group D — 17 Aug 2022 S{s} (mixed sections). iON CBT response-sheet source.\n")
        f.write("// Answer = GREEN-TICK option (decoded from tick-bullets, authoritative). "
                f"Kept {len(kept)}/100.\n")
        f.write("// Dropped: figure/graph/table/diagram, garbled/inconsistent, non-linearizable.\n")
        f.write("const MATH = 'Mathematics';\n")
        f.write("const REA  = 'General Intelligence & Reasoning';\n")
        f.write("const SCI  = 'General Science';\n")
        f.write("const GA   = 'General Awareness & Current Affairs';\n\n")
        f.write("export const PART = [\n\n")
        for it in kept:
            opts = ", ".join(jstr(x) for x in it["o"])
            f.write(f"  {{ orig:{it['orig']}, s:{it['s']}, a:{it['a']}, "
                    f"q:{jstr(it['q'])}, o:[{opts}] }},\n")
        f.write("\n];\n")

    bysec = {}
    for it in kept:
        bysec[it["s"]] = bysec.get(it["s"], 0) + 1
    print(f"=== S{s}: kept {len(kept)}, dropped {len(dropped)} -> {fn}")
    print(f"    sections: {bysec}")
    print(f"    dropped: {dropped}")
    print(f"    tick-vs-key mismatches ({len(mism)}): {mism}")
