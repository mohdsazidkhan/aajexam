import json

# ---- S1: insert Q1 (from cover page p001) ----
s1 = json.load(open("_tr_rrcgdsep01s1.json", encoding="utf-8"))
q1 = {"orig": 1, "section": "General Awareness & Current Affairs",
      "q": "The shaggy horn wild ibex is found in ______ in India.",
      "o": ["Thorn Forests", "Tropical Deciduous Forest", "Montane forests", "Mangrove Forests"],
      "drop": False}
s1 = [x for x in s1 if x["orig"] != 1] + [q1]
s1.sort(key=lambda x: x["orig"])
json.dump(s1, open("_tr_rrcgdsep01s1.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)

# ---- S2: replace 4,11,21,22 with corrected English fix ----
fix = {x["orig"]: x for x in json.load(open("_tr_s2_fix.json", encoding="utf-8"))}
# corrections to fix-agent errors
fix[21]["q"] = "In 1931, which revolutionary shot himself while fighting the police at Alfred Park, Allahabad?"
fix[22]["q"] = "Which of the following elements exhibits tetravalency similar to carbon?"
s2 = json.load(open("_tr_rrcgdsep01s2.json", encoding="utf-8"))
s2 = [fix.get(x["orig"], x) for x in s2]
json.dump(s2, open("_tr_rrcgdsep01s2.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)

# verify no Hindi residue remains anywhere
import re
for s in (1, 2, 3):
    d = json.load(open(f"_tr_rrcgdsep01s{s}.json", encoding="utf-8"))
    origs = sorted(x["orig"] for x in d)
    missing = [n for n in range(1, 101) if n not in origs]
    hindi = [x["orig"] for x in d if re.search(r"[ऀ-ॿ]", x["q"] + " ".join(x.get("o", [])))]
    kept = [x for x in d if not x.get("drop")]
    print(f"S{s}: total={len(d)} missing={missing} hindi={hindi} kept={len(kept)} dropped={len(d)-len(kept)}")
