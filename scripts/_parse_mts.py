#!/usr/bin/env python3
"""Extract Oswaal SSC MTS answer key + per-question explanations from a _para_<slug>.txt.

The Oswaal "Answers with Explanations" block is a flat sequence of paragraphs:
    Option (X) is correct.
    <explanation paragraph(s)...>
    Option (Y) is correct.
    ...
repeated once per question in order Q1..Q150.

The "Answer Key" block (before it) is "<n>." / "(<ans>)" paragraph pairs.

Usage: python scripts/_parse_mts.py <slug> <num_questions>
Writes scripts/_mts_<slug>_data.json with {key:[...], expl:[...]}.
"""
import sys, re, json, os

slug = sys.argv[1]
N = int(sys.argv[2])
para_path = f"_para_{slug}.txt"
if not os.path.exists(para_path):
    para_path = os.path.join("..", f"_para_{slug}.txt")
lines = [l.rstrip("\n") for l in open(para_path, encoding="utf-8")]

# --- locate the Answer Key block: first line that is exactly "Answer Key" ---
ak_start = next(i for i, l in enumerate(lines) if l.strip() == "Answer Key")
# explanations start at the first "Option (n) is correct." line
expl_start = next(i for i, l in enumerate(lines)
                  if re.match(r"^Option \(\d\) is correct\.?$", l.strip()))

# --- parse answer key (n. / (a) pairs) between ak_start and expl_start ---
key = {}
i = ak_start + 1
ak_text = "\n".join(lines[ak_start:expl_start])
# tokens like "12." and "(3)" in order
toks = re.findall(r"(\d{1,3})\.|\((\d)\)", ak_text)
pending = None
for num, ans in toks:
    if num:
        pending = int(num)
    elif ans and pending is not None:
        key[pending] = int(ans)
        pending = None
key_list = [key.get(q, 0) for q in range(1, N + 1)]

# --- parse explanations ---
expl = [""] * N
idx = -1
buf = []
marker_ans = [0] * N
def flush():
    if idx >= 0:
        expl[idx] = " ".join(s.strip() for s in buf if s.strip()).strip()
for l in lines[expl_start:]:
    m = re.match(r"^Option \((\d)\) is correct\.?$", l.strip())
    if m:
        flush()
        idx += 1
        buf = []
        if idx < N:
            marker_ans[idx] = int(m.group(1))
        continue
    if idx >= 0:
        buf.append(l)
flush()

# --- cross-check marker answers vs answer key ---
mismatches = []
for q in range(N):
    if marker_ans[q] and key_list[q] and marker_ans[q] != key_list[q]:
        mismatches.append((q + 1, key_list[q], marker_ans[q]))

out = {"key": key_list, "marker_ans": marker_ans, "expl": expl}
op = f"_mts_{slug}_data.json"
json.dump(out, open(op, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"Wrote {op}")
print(f"Key parsed: {sum(1 for k in key_list if k)}/{N}")
print(f"Expl parsed (non-empty): {sum(1 for e in expl if e)}/{N}")
print(f"Explanation markers found: {idx+1}")
if mismatches:
    print(f"KEY vs MARKER mismatches ({len(mismatches)}): {mismatches}")
else:
    print("Key and explanation markers agree.")
