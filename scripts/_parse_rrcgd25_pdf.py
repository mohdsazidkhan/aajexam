"""Parse RRB Group-D 2025 CBT response-sheet PDF (NO docx — text-layer PDF).

Same provider/format as the 27-Nov docx papers, but only the PDF is supplied, so
the green-tick answer key cannot be decoded from docx tick-bullets. Instead we
render each page and read the answer from COLOUR: the correct option's tick + text
are GREEN, wrong options are RED. pymupdf gives both text-with-bbox and the render.

Per option: sum green pixels over its line bbox(es); the option with green >> others
is the answer (deterministic; verified Q1->A, Q2->B on page 1).

Drops: figure questions (image stem / empty options), regional-garbled (Tamil/Telugu,
>20% non-ASCII), questions with no detectable green option.

Usage: python _parse_rrcgd25_pdf.py <pdf_path> <slug>
Output: _q_<slug>.json   (orig,s,a,q,o,drop,reason)  -- same shape as _parse_rrcgd25.py
"""
import sys, re, json
import fitz
import numpy as np
from collections import defaultdict, Counter

pdf_path, slug = sys.argv[1], sys.argv[2]
ZOOM=2.0
GREEN_MIN=120          # min green px to call an option correct
RIGHT_FRAC=0.66        # drop right-side "Chosen Option" panel beyond this x-fraction

SEC_MAP={
    "General Science":"General Science",
    "Mathematics":"Mathematics",
    "General Intelligence and Reasoning":"General Intelligence & Reasoning",
    "General Awareness and Current Affairs":"General Awareness & Current Affairs",
}

doc=fitz.open(pdf_path)

def green_mask(page):
    pix=page.get_pixmap(matrix=fitz.Matrix(ZOOM,ZOOM))
    img=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,pix.n)[:,:,:3].astype(int)
    R,Gc,B=img[:,:,0],img[:,:,1],img[:,:,2]
    return (Gc>90)&(Gc-R>40)&(Gc-B>40)

def page_lines(page):
    """Return content lines [(y0,x0,x1,y1,text)] sorted by y, right-panel removed."""
    W=page.rect.width
    cut=W*RIGHT_FRAC
    words=[w for w in page.get_text("words") if w[0]<cut]
    lines=defaultdict(list)
    for w in words: lines[(w[5],w[6])].append(w)
    out=[]
    for ws in lines.values():
        ws.sort(key=lambda w:w[0])
        txt=" ".join(w[4] for w in ws).strip()
        if not txt: continue
        out.append((min(w[1] for w in ws),min(w[0] for w in ws),
                    max(w[2] for w in ws),max(w[3] for w in ws),txt))
    out.sort(key=lambda r:(round(r[0]),r[1]))
    return out

OPT_RE=re.compile(r'^(?:Ans\s+)?([A-D])\.\s?(.*)$', re.S)
Q_RE=re.compile(r'^Q\.(\d+)\b\s*(.*)$', re.S)
SEC_RE=re.compile(r'^Section\s*:\s*(.+)$')

def gcount(mask, y0,y1,x0,x1):
    a,b=int(y0*ZOOM),int(y1*ZOOM)
    c,d=int(x0*ZOOM),int(x1*ZOOM)
    if b<=a or d<=c: return 0
    return int(mask[a:b, c:d].sum())

# Walk all pages, build questions
questions={}   # qnum -> dict
order=[]
cur=None       # current question dict being filled
cur_sec=None
mode=None      # 'stem' or 'opts'

for pno in range(doc.page_count):
    page=doc[pno]
    mask=green_mask(page)
    Wpt=page.rect.width
    for (y0,x0,x1,y1,txt) in page_lines(page):
        ms=SEC_RE.match(txt)
        if ms:
            cur_sec=SEC_MAP.get(ms.group(1).strip(), ms.group(1).strip()); continue
        mq=Q_RE.match(txt)
        if mq:
            qn=int(mq.group(1))
            cur={"orig":qn,"s":cur_sec,"stem":[],"opts":[],"green":[]}
            if qn not in questions:
                questions[qn]=cur; order.append(qn)
            else:
                questions[qn]=cur  # later/cleaner copy wins
            rest=mq.group(2).strip()
            if rest: cur["stem"].append(rest)
            mode="stem"; continue
        if cur is None: continue
        mo=OPT_RE.match(txt)
        if mo:
            letter=mo.group(1); body=mo.group(2).strip()
            g=gcount(mask,y0,y1,0,x1)   # green over icon+text, left of line end
            cur["opts"].append([letter,body]); cur["green"].append(g)
            mode="opts"; continue
        # continuation line
        if mode=="opts" and cur["opts"]:
            cur["opts"][-1][1]=(cur["opts"][-1][1]+" "+txt).strip()
            cur["green"][-1]+=gcount(mask,y0,y1,0,x1)
        elif mode=="stem":
            cur["stem"].append(txt)

def na_ratio(x):
    if not x: return 0
    na=sum(1 for c in x if ord(c)>0x300 and not (0x2000<=ord(c)<=0x27ff))
    return na/len(x)

out=[]
for qn in range(1,101):
    q=questions.get(qn)
    rec={"orig":qn,"s":None,"a":None}
    if not q:
        rec.update({"q":"","o":[],"drop":True,"reason":"no-marker"}); out.append(rec); continue
    rec["s"]=q["s"]
    stem=re.sub(r"\s+"," "," ".join(q["stem"])).strip()
    stem=re.sub(r"\s*\bAns\s*$","",stem).strip()   # drop trailing answer-column label
    # keep options in A,B,C,D order
    om={L:b for L,b in q["opts"]}
    gm={}
    for (L,_),g in zip(q["opts"],q["green"]): gm[L]=gm.get(L,0)+g
    opts=[om.get(L,"").strip() for L in "ABCD"]
    greens=[gm.get(L,0) for L in "ABCD"]
    drop=None
    if len([o for o in opts if o])<4: drop="opts-incomplete"
    elif not stem or stem=="?": drop="no-stem"
    elif na_ratio(stem)>0.2 or any(na_ratio(o)>0.2 for o in opts): drop="regional"
    else:
        best=max(range(4), key=lambda i:greens[i])
        if greens[best]<GREEN_MIN: drop="no-green-key"
        else:
            # ensure unambiguous: best clearly beats 2nd
            srt=sorted(greens,reverse=True)
            rec["a"]=best+1
            if srt[1]>0.5*srt[0]: rec["ambig"]=greens
    if drop:
        rec.update({"q":stem,"o":opts,"drop":True,"reason":drop})
    else:
        rec.update({"q":stem,"o":opts})
    out.append(rec)

json.dump(out, open(f"_q_{slug}.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
kept=[r for r in out if not r.get("drop")]
dropped=[r for r in out if r.get("drop")]
print(f"{slug}: kept={len(kept)} dropped={len(dropped)}")
print("  drop:", dict(Counter(r['reason'] for r in dropped)))
print("  sections(kept):", dict(Counter(r['s'] for r in kept)))
print("  dropped qnums:", [r['orig'] for r in dropped])
amb=[r['orig'] for r in kept if r.get('ambig')]
if amb: print("  AMBIGUOUS green (review):", amb)
