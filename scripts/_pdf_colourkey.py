"""Extract the green-tick answer key for ALL 100 questions from a text-layer PDF
response sheet — language-independent (works for regional shifts where
_parse_rrcgd25_pdf.py drops the text). Reuses the same green-colour detection.

Outputs _key_<slug>.txt (Q<n>=<1-4>) so a regional PDF shift can be vision-
recovered: vision supplies translated text, this supplies the authoritative
answer, fixed Q-ranges supply the section.

Usage: python _pdf_colourkey.py <pdf_path> <slug>
"""
import sys, re
import fitz
import numpy as np
from collections import defaultdict

pdf_path, slug = sys.argv[1], sys.argv[2]
ZOOM=2.0; GREEN_MIN=120; RIGHT_FRAC=0.66

doc=fitz.open(pdf_path)

def green_mask(page):
    pix=page.get_pixmap(matrix=fitz.Matrix(ZOOM,ZOOM))
    img=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,pix.n)[:,:,:3].astype(int)
    R,Gc,B=img[:,:,0],img[:,:,1],img[:,:,2]
    return (Gc>90)&(Gc-R>40)&(Gc-B>40)

def page_lines(page):
    W=page.rect.width; cut=W*RIGHT_FRAC
    words=[w for w in page.get_text("words") if w[0]<cut]
    lines=defaultdict(list)
    for w in words: lines[(w[5],w[6])].append(w)
    out=[]
    for ws in lines.values():
        ws.sort(key=lambda w:w[0]); txt=" ".join(w[4] for w in ws).strip()
        if not txt: continue
        out.append((min(w[1] for w in ws),min(w[0] for w in ws),
                    max(w[2] for w in ws),max(w[3] for w in ws),txt))
    out.sort(key=lambda r:(round(r[0]),r[1])); return out

OPT_RE=re.compile(r'^(?:Ans\s+)?([A-D])\.\s?(.*)$', re.S)
Q_RE=re.compile(r'^Q\.(\d+)\b\s*(.*)$', re.S)

def gcount(mask,y0,y1,x0,x1):
    a,b=int(y0*ZOOM),int(y1*ZOOM); c,d=int(x0*ZOOM),int(x1*ZOOM)
    if b<=a or d<=c: return 0
    return int(mask[a:b,c:d].sum())

questions={}; cur=None; mode=None
for pno in range(doc.page_count):
    page=doc[pno]; mask=green_mask(page)
    for (y0,x0,x1,y1,txt) in page_lines(page):
        mq=Q_RE.match(txt)
        if mq:
            qn=int(mq.group(1)); cur={"green":{}}; questions[qn]=cur; mode="opts"; continue
        if cur is None: continue
        mo=OPT_RE.match(txt)
        if mo:
            L=mo.group(1); g=gcount(mask,y0,y1,0,x1)
            cur["green"][L]=cur["green"].get(L,0)+g; mode="opts"; continue
        if mode=="opts" and cur["green"]:
            last=list(cur["green"])[-1]; cur["green"][last]+=gcount(mask,y0,y1,0,x1)

with open(f"_key_{slug}.txt","w") as f:
    found=0
    for qn in range(1,101):
        q=questions.get(qn)
        if not q or not q["green"]: continue
        greens=[q["green"].get(L,0) for L in "ABCD"]
        best=max(range(4), key=lambda i:greens[i])
        if greens[best]>=GREEN_MIN:
            f.write(f"Q{qn}={best+1}\n"); found+=1
print(f"{slug}: wrote _key (green answers for {found}/100 Qs)")
