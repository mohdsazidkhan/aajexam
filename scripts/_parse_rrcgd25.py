"""Parse RRB Group-D 2025 CBT response-sheet docx (text-extractable format).

27-Nov-2025 papers have a real text layer (stems+options as text), 4 sections,
and a green-tick key already decoded by _parse_docx.py (_key_<slug>.txt).

Robust GLOBAL approach (handles all 3 shifts' differing layouts):
  - Concatenate every paragraph (newline-joined). Insert [[IMG:f]] for REAL
    figure images only (decoration tick/bullet icons, freq>=5, excluded).
  - Split full text on Q.<n> (greedy digits, NO \b -> matches 'Q.2If...').
  - Each qnum may appear multiple times (packed + split duplicates) -> keep the
    segment that yields the cleanest 4-option parse / longest stem.
  - Options labeled 'A. B. C. D.' OR bare (4 trailing lines).
  - Figure-dependent (real image in segment) / malformed -> drop:true.

Usage: python _parse_rrcgd25.py <docx_path> <slug>
Output: _q_<slug>.json
"""
import sys, os, re, json, zipfile
from xml.etree import ElementTree as ET
from collections import Counter

W="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
A="http://schemas.openxmlformats.org/drawingml/2006/main"
R="http://schemas.openxmlformats.org/officeDocument/2006/relationships"

docx, slug = sys.argv[1], sys.argv[2]

SEC_MAP = {
    "General Science": "General Science",
    "Mathematics": "Mathematics",
    "General Intelligence and Reasoning": "General Intelligence & Reasoning",
    "General Awareness and Current Affairs": "General Awareness & Current Affairs",
}

z=zipfile.ZipFile(docx)
rels=ET.fromstring(z.read("word/_rels/document.xml.rels").decode())
rid2media={r.attrib["Id"]:r.attrib["Target"].split("/")[-1] for r in rels if "media/" in r.attrib.get("Target","")}

root=ET.fromstring(z.read("word/document.xml").decode())
body=root.find(f"{{{W}}}body")

# Decoration images = high frequency (tick / empty-bullet / checkbox icons)
freq=Counter()
for b in root.iter(f"{{{A}}}blip"):
    rid=b.attrib.get(f"{{{R}}}embed")
    if rid in rid2media: freq[rid2media[rid]]+=1
DECOR={f for f,n in freq.items() if n>=5}

def ptext(p): return "".join(t.text or "" for t in p.iter(f"{{{W}}}t"))
def real_imgs(p):
    out=[]
    for b in p.iter(f"{{{A}}}blip"):
        rid=b.attrib.get(f"{{{R}}}embed"); f=rid2media.get(rid)
        if f and f not in DECOR: out.append(f)
    for d in p.iter(f"{{{W}}}imagedata"):
        rid=d.attrib.get(f"{{{R}}}id"); f=rid2media.get(rid)
        if f and f not in DECOR: out.append(f)
    return out

# Build full text with section tags + inline image markers
chunks=[]
for p in body.iter(f"{{{W}}}p"):
    t=ptext(p)
    for f in real_imgs(p):
        t += f" [[IMG:{f}]]"
    if t.strip():
        chunks.append(t)
full="\n".join(chunks)

# Section spans: find 'Section : X' positions
SEC_RE=re.compile(r"Section\s*:\s*(.+)")
sec_marks=[(m.start(), m.group(1).strip()) for m in SEC_RE.finditer(full)]
def sec_at(pos):
    s=None
    for mp,nm in sec_marks:
        if mp<pos: s=SEC_MAP.get(nm, nm)
    return s

# Load decoded key
key={}
for line in open(f"_key_{slug}.txt"):
    m=re.match(r"Q(\d+)=(\d+)", line.strip())
    if m: key[int(m.group(1))]=int(m.group(2))

QMARK=re.compile(r"Q\.(\d+)")
IMG=re.compile(r"\[\[IMG:[^\]]+\]\]")
# Tolerant labeled-option matcher: handles run-together ('AnsA. x B. y') and
# newline-separated. Non-greedy A/B/C, greedy D to segment end.
ABCD=re.compile(r"A[\.\)]\s*(.*?)\s*B[\.\)]\s*(.*?)\s*C[\.\)]\s*(.*?)\s*D[\.\)]\s*(.*)", re.S)

def clean(x):
    return re.sub(r"\s+"," ", x).strip()

def parse_segment(seg):
    """Return (stem, [4 opts], fig) where fig=True if a real image is embedded
    INSIDE the stem or an option (figure-dependent). Trailing images (belonging
    to the next Q) are ignored. (None,...) if unparseable."""
    # strip a trailing 'Ans' with no following content noise; normalise Ans token
    s=seg
    # try labeled ABCD anchored after the first 'Ans' if present
    search_from=0
    am=re.search(r"Ans", s)
    if am: search_from=am.end()
    m=ABCD.search(s, search_from) or ABCD.search(s)
    if m:
        opts_raw=[m.group(i) for i in range(1,5)]
        stem_raw=s[:m.start()]
        # drop a trailing 'Ans' label from stem
        stem_raw=re.sub(r"\bAns\b\s*$","",stem_raw)
        stem_raw=re.sub(r"Ans$","",stem_raw)
        fig = bool(IMG.search(stem_raw)) or any(IMG.search(o) for o in opts_raw)
        stem=clean(IMG.sub("", stem_raw))
        opts=[clean(IMG.sub("", o)) for o in opts_raw]
        if stem and all(opts) and max(len(o) for o in opts)<300:
            return stem, opts, fig
    # bare: last 4 non-empty lines (no A-D labels)
    body=re.sub(r"(?m)^\s*Ans\s*$","", s)
    lines=[clean(l) for l in body.split("\n") if clean(l)]
    if len(lines)>=5:
        opt_lines=lines[-4:]; stem_lines=lines[:-4]
        fig = any(IMG.search(l) for l in opt_lines) or any(IMG.search(l) for l in stem_lines)
        opts=[clean(IMG.sub("", l)) for l in opt_lines]
        stem=clean(IMG.sub("", " ".join(stem_lines)))
        if stem and all(opts):
            return stem, opts, fig
    return None, None, False

# Collect all segments per qnum
marks=list(QMARK.finditer(full))
cand={}  # qnum -> list of (stem,opts,fig,pos)
for i,m in enumerate(marks):
    qn=int(m.group(1))
    start=m.end()
    end=marks[i+1].start() if i+1<len(marks) else len(full)
    seg=full[start:end]
    # Trailing image(s) belong to the NEXT question (figures render above their
    # question); strip so option D's greedy capture doesn't absorb them.
    seg=re.sub(r"(\s*\[\[IMG:[^\]]+\]\]\s*)+$","",seg)
    stem,opts,fig=parse_segment(seg)
    cand.setdefault(qn,[]).append((stem,opts,fig,m.start()))

out=[]
for qn in range(1,101):
    a=key.get(qn)
    cs=cand.get(qn,[])
    parsed=[c for c in cs if c[1]]
    clean_p=[c for c in parsed if not c[2]]   # parsed AND not figure-embedded
    drop=None; stem=None; opts=None; pos=None
    if not cs:
        drop="no-marker"; pos=None
    else:
        if clean_p:
            best=max(clean_p, key=lambda c: len(c[0]))
        elif parsed:
            best=max(parsed, key=lambda c: len(c[0]))
        else:
            best=cs[0]
        stem,opts,fig,pos=best
        if a is None: drop="no-key"
        elif opts is None: drop="opts-unparsed"
        elif fig: drop="has-figure"
        else:
            # regional-language (e.g. Telugu) questions extract garbled -> drop
            def na_ratio(x):
                if not x: return 0
                na=sum(1 for c in x if ord(c)>0x300 and not (0x2000<=ord(c)<=0x27ff))
                return na/len(x)
            if na_ratio(stem)>0.2 or any(na_ratio(o)>0.2 for o in opts):
                drop="regional"
    sec=sec_at(pos) if pos is not None else None
    rec={"orig":qn,"s":sec,"a":a}
    if drop:
        rec.update({"q":stem or "","o":opts or [],"drop":True,"reason":drop})
    else:
        rec.update({"q":stem,"o":opts})
    out.append(rec)

json.dump(out, open(f"_q_{slug}.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
kept=[r for r in out if not r.get("drop")]
dropped=[r for r in out if r.get("drop")]
print(f"{slug}: total=100 kept={len(kept)} dropped={len(dropped)}  decor_imgs={sorted(DECOR)}")
print("  drop reasons:", dict(Counter(r['reason'] for r in dropped)))
print("  sections(kept):", dict(Counter(r['s'] for r in kept)))
print("  dropped qnums:", [r['orig'] for r in dropped])
