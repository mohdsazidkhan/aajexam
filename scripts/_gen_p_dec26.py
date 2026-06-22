"""Generate _p2025sX_dec26.js PART modules from _q_rrcgddec26sX.json.

The 2025 docx flow's _parse_rrcgd25.py already emits {orig,s,a,q,o,drop,reason}
with section pre-mapped and answer (a) from the decoded green-tick key. This just
filters out drops and emits a PART array file per shift (same shape as nov27/nov28).

Usage: python _gen_p_dec26.py
"""
import json

HEADER = """// RRB Group D — 26 Dec 2025 CBT-1 Shift-{shift} (4 sections). iON CBT response-sheet — docx with
// real text layer. Parsed by _parse_rrcgd25.py; answer = GREEN-TICK option decoded deterministically
// from docx tick-bullets (authoritative, NOT candidate "Chosen Option"). Kept {kept}/100.
// Dropped: image-stem/image-option figure Qs, unparseable-option Qs, no-marker Qs.
export const PART = [
"""

def jstr(s):
    return json.dumps(s, ensure_ascii=False)

def gen(shift):
    with open(f"_q_rrcgddec26s{shift}.json", encoding="utf-8") as f:
        items = json.load(f)
    kept, dropped = [], []
    for it in items:
        o = it["orig"]
        bad = (it.get("drop") or len(it.get("o", [])) != 4
               or not it.get("q", "").strip()
               or any(not str(x).strip() for x in it.get("o", []))
               or not it.get("s")
               or not it.get("a") or it["a"] < 1 or it["a"] > 4)
        if bad:
            dropped.append(o); continue
        kept.append(it)

    lines = [HEADER.format(shift=shift, kept=len(kept))]
    for k in kept:
        lines.append(
            "  { orig:%d, s:%s, a:%d, q:%s, o:%s }," % (
                k["orig"], jstr(k["s"]), k["a"], jstr(k["q"]), jstr(k["o"])))
    lines.append("];\n")
    out = f"_p2025s{shift}_dec26.js"
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    bysec = {}
    for k in kept:
        bysec[k["s"]] = bysec.get(k["s"], 0) + 1
    print(f"Shift {shift}: kept {len(kept)}, dropped {len(dropped)} -> {out}")
    print(f"  sections: {bysec}")
    print(f"  dropped origs: {dropped}")

for s in (1, 2, 3):
    gen(s)
