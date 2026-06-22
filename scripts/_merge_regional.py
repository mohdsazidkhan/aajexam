"""Merge vision-transcribed chunks for a regional RRC-GD 2025 shift into the
standard _q_<slug>.json shape ({orig,s,a,q,o,drop?,reason?}).

Vision agents wrote _vis_<slug>_{a,b,c}.json = [{orig,q,o[4],fig}] (English,
translated). Section + answer come from the deterministic skeleton
_skel_<slug>.json ([{orig,s,a}]) built from fixed section ranges + decoded
green-tick key. We just dedup overlapping chunks and drop figure/malformed Qs.

Usage: python _merge_regional.py <slug>
"""
import sys, json
from collections import Counter

slug = sys.argv[1]
skel = {r["orig"]: r for r in json.load(open(f"_skel_{slug}.json", encoding="utf-8"))}

cand = {}
for ch in ("a", "b", "c", "d"):
    try:
        rows = json.load(open(f"_vis_{slug}_{ch}.json", encoding="utf-8"))
    except FileNotFoundError:
        continue
    for r in rows:
        cand.setdefault(int(r["orig"]), []).append(r)

# Known vision-garbled questions to force-drop (manually verified bad transcription)
EXCLUDE = {"rrcgddec10s3": {26}}

def valid(r):
    o = r.get("o") or []
    return (r.get("q", "").strip() and len(o) == 4
            and all(str(x).strip() for x in o)
            and len(set(str(x).strip() for x in o)) == 4   # no duplicate options
            and not r.get("fig"))

out = []
for qn in range(1, 101):
    sk = skel.get(qn, {})
    a = sk.get("a")
    cs = cand.get(qn, [])
    good = [c for c in cs if valid(c)]
    drop = None; q = None; o = None
    if qn in EXCLUDE.get(slug, set()):
        best = cs[0] if cs else {}
        q = best.get("q", "").strip(); o = [str(x).strip() for x in (best.get("o") or [])]
        drop = "garbled"
    elif not cs:
        drop = "no-vision"
    else:
        best = (max(good, key=lambda c: len(c["q"]))
                if good else max(cs, key=lambda c: len(c.get("q", ""))))
        q = best.get("q", "").strip()
        o = [str(x).strip() for x in (best.get("o") or [])]
        if best.get("fig"):
            drop = "has-figure"
        elif not valid(best):
            drop = "opts-unparsed"
        elif not a or a < 1 or a > 4:
            drop = "no-key"
    rec = {"orig": qn, "s": sk.get("s"), "a": a}
    if drop:
        rec.update({"q": q or "", "o": o or [], "drop": True, "reason": drop})
    else:
        rec.update({"q": q, "o": o})
    out.append(rec)

json.dump(out, open(f"_q_{slug}.json", "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
kept = [r for r in out if not r.get("drop")]
dropped = [r for r in out if r.get("drop")]
print(f"{slug}: kept={len(kept)} dropped={len(dropped)}")
print("  reasons:", dict(Counter(r["reason"] for r in dropped)))
print("  sections(kept):", dict(Counter(r["s"] for r in kept)))
print("  dropped:", [r["orig"] for r in dropped])
